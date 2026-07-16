import os
import base64
import random
import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException, UploadFile, File, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional

from db import get_collection
from pdf import generate_invoice_pdf
from ai import extract_bill_from_image, generate_report_recommendations

# Configure logging
logger = logging.getLogger("bizpilot_backend")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="BizPilot AI Backend")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static folders exist and mount them
static_invoices_dir = os.path.join(os.path.dirname(__file__), "static", "invoices")
os.makedirs(static_invoices_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "static")), name="static")

# Helper to format numbers as currency in logs
def format_currency(val):
    return f"INR {val:,.2f}"

# Pydantic schemas for request validation
class OCRRequest(BaseModel):
    fileData: str  # Base64 data URI
    fileType: str

class BillItem(BaseModel):
    name: str
    qty: int
    unit_price: float

class BillConfirmRequest(BaseModel):
    vendor: str
    date: str
    billType: str  # "sale", "materials", "wages", "medical", "transport", "other"
    workerId: Optional[str] = ""
    vehicleId: Optional[str] = ""
    note: Optional[str] = ""
    items: List[BillItem]
    total: float

class StockRequestPayload(BaseModel):
    productId: str
    requestedQty: int
    requestedBy: str
    note: Optional[str] = ""

class AttendancePayload(BaseModel):
    workerId: str
    date: str
    status: str  # "present", "absent"
    hoursWorked: float

# Helper to derive derived stock for all products
def get_derived_products():
    products_col = get_collection("products")
    movements_col = get_collection("stock_movements")
    
    products = products_col.find({})
    movements = movements_col.find({})
    
    # Aggregate stock changes by product_id
    stock_map = {}
    for m in movements:
        pid = m.get("product_id")
        m_type = m.get("type")
        qty = int(m.get("quantity", 0))
        
        if pid not in stock_map:
            stock_map[pid] = 0
            
        if m_type == "added" or m_type == "restocked":
            stock_map[pid] += qty
        elif m_type == "sold":
            stock_map[pid] -= qty
            
    # Map to products list
    result = []
    for p in products:
        p_id = p.get("id")
        current_stock = stock_map.get(p_id, 0)
        
        # Build derived product representation with frontend compatibility
        result.append({
            "id": p_id,
            "name": p.get("name"),
            "category": p.get("category", "General"),
            "currentStock": current_stock,
            "quantity": current_stock,
            "reorderThreshold": p.get("reorder_threshold", 5),
            "minStock": int(p.get("reorder_threshold", p.get("minStock", 5))),
            "unitCost": p.get("unit_cost", 0.0),
            "cost": float(p.get("unit_cost", p.get("cost", 0.0))),
            "price": float(p.get("price", p.get("unit_cost", 0.0) * 1.5)),
            "sku": p.get("sku", f"SKU-{p_id}"),
            "description": p.get("description", ""),
            "supplier": p.get("supplier", "Local supplier")
        })
    return result

class LoginPayload(BaseModel):
    email: str
    password: str
    name: Optional[str] = ""
    businessName: Optional[str] = ""
    businessType: Optional[str] = ""
    currency: Optional[str] = ""

# ----------------- REST ENDPOINTS -----------------

@app.post("/api/auth/login")
def login(payload: LoginPayload, response: Response = None):
    from fastapi import Response as FAResponse
    # Handle response parameter
    response = response or FAResponse()
    email = payload.email.lower().strip()
    
    # Store profile in db
    name = payload.name or "Siddu"
    businessName = payload.businessName or "BizPilot"
    businessType = payload.businessType or "Clean Energy Systems & Green Technology"
    currency = payload.currency or "INR"
    
    profile = {
        "id": "profile_active",
        "email": email,
        "name": name,
        "businessName": businessName,
        "businessType": businessType,
        "currency": currency
    }
    
    get_collection("profile").delete_many({})
    get_collection("profile").insert_one(profile)
    
    return {"success": True, "profile": profile}

@app.post("/api/auth/register")
def register(payload: LoginPayload):
    return login(payload)

@app.get("/api/profile")
def get_profile(request: Request):
    p_doc = get_collection("profile").find_one({})
    if p_doc:
        if "_id" in p_doc:
            del p_doc["_id"]
        return p_doc
    return {
        "email": "gamigrrider18@gmail.com",
        "name": "Siddu",
        "businessName": "BizPilot",
        "businessType": "Clean Energy Systems & Green Technology",
        "currency": "INR"
    }

@app.post("/api/auth/logout")
def logout():
    get_collection("profile").delete_many({})
    return {"status": "ok"}

@app.get("/api/operations")
def get_operations():
    # 1. Derived products stock
    products = get_derived_products()
    
    # 2. Bills
    bills = get_collection("bills").find({})
    
    # 3. Stock requests joined with product names
    stock_requests = get_collection("stock_requests").find({})
    products_col = get_collection("products")
    for sr in stock_requests:
        p = products_col.find_one({"id": sr.get("product_id")})
        sr["product_name"] = p.get("name", "Unknown Product") if p else "Unknown Product"
        
    # 4. Workers
    workers = get_collection("workers").find({})
    
    # 5. Attendance
    attendance = get_collection("attendance").find({})
    
    # 6. Vehicles (optional empty array to prevent dashboard warnings)
    vehicles = []
    
    # 7. Financial Summary
    # Revenue is sum of confirmed invoice totals
    invoices = get_collection("invoices").find({})
    gross_revenue = sum(float(inv.get("total", 0)) for inv in invoices)
    
    # Material cost is sum of confirmed bills where type is "materials" or "added"
    material_cost = sum(float(b.get("total", 0)) for b in bills if b.get("billType") in ["materials", "added"])
    
    # Wages: Calculate total wages due from attendance summary
    wages = 0.0
    for w in workers:
        w_id = w.get("id")
        w_att = [a for a in attendance if a.get("worker_id") == w_id]
        
        days_present = sum(1 for a in w_att if a.get("status") == "present")
        hours_worked = sum(float(a.get("hours_worked", 0)) for a in w_att)
        
        if "daily_wage_rate" in w:
            wages += days_present * float(w.get("daily_wage_rate", 0))
        elif "hourly_rate" in w:
            wages += hours_worked * float(w.get("hourly_rate", 0))
            
    # Other expense categories
    medical = sum(float(b.get("total", 0)) for b in bills if b.get("billType") == "medical")
    transport = sum(float(b.get("total", 0)) for b in bills if b.get("billType") == "transport")
    other_cost = sum(float(b.get("total", 0)) for b in bills if b.get("billType") == "other")
    
    net_revenue = gross_revenue - material_cost - wages - medical - transport - other_cost
    
    financial_summary = {
        "grossRevenue": gross_revenue,
        "materialCost": material_cost,
        "wages": wages,
        "medical": medical,
        "transport": transport,
        "netRevenue": net_revenue
    }
    
    return {
        "products": products,
        "bills": bills,
        "stockRequests": stock_requests,
        "workers": workers,
        "attendance": attendance,
        "vehicles": vehicles,
        "financialSummary": financial_summary
    }

@app.post("/api/ocr/invoice")
def ocr_invoice(payload: OCRRequest):
    """
    Decodes base64 image data and sends to Gemini Flash for receipt OCR
    """
    try:
        data_uri = payload.fileData
        if "," not in data_uri:
            raise HTTPException(status_code=400, detail="Invalid data URI format")
        
        header, encoded = data_uri.split(",", 1)
        mime_type = header.split(";")[0].split(":")[1]
        image_bytes = base64.b64decode(encoded)
        
        extracted = extract_bill_from_image(image_bytes, mime_type)
        return extracted
    except Exception as e:
        logger.error(f"Failed to process OCR request: {e}")
        return {
            "vendor": "",
            "date": "",
            "items": [{"name": "", "qty": 1, "unit_price": 0}],
            "total": 0
        }

@app.post("/api/bills/confirm")
def confirm_bill(payload: BillConfirmRequest):
    bills_col = get_collection("bills")
    invoices_col = get_collection("invoices")
    movements_col = get_collection("stock_movements")
    products_col = get_collection("products")
    
    # Generate unique ID for this bill
    bill_id = f"bill_{int(datetime.now().timestamp())}_{random.randint(100, 999)}"
    
    # 1. Save Bill record
    bill_doc = {
        "id": bill_id,
        "date": payload.date,
        "image_url": "/static/sample_receipt.png",  # fallback placeholder
        "vendor": payload.vendor,
        "extracted_items": [{"name": i.name, "qty": i.qty, "unit_price": i.unit_price} for i in payload.items],
        "total": payload.total,
        "billType": payload.billType,
        "workerId": payload.workerId,
        "vehicleId": payload.vehicleId,
        "note": payload.note,
        "status": "confirmed"
    }
    bills_col.insert_one(bill_doc)
    
    # 2. Add Stock Movements if bill type adds/removes stock
    # "materials" / "added" type -> adds stock (type: added)
    # "sale" type -> subtracts stock (type: sold)
    if payload.billType in ["materials", "added", "sale"]:
        movement_type = "sold" if payload.billType == "sale" else "added"
        
        for item in payload.items:
            # Find matching product by name (case-insensitive)
            # If not found, create a new product dynamically
            product = products_col.find_one({"name": item.name})
            if not product:
                # Try finding case insensitively
                all_products = products_col.find({})
                for ap in all_products:
                    if ap.get("name", "").lower() == item.name.lower():
                        product = ap
                        break
            
            if not product:
                pid = f"p_{int(datetime.now().timestamp())}_{random.randint(10, 99)}"
                product = {
                    "id": pid,
                    "name": item.name,
                    "category": "Raw Materials" if movement_type == "added" else "Sales Products",
                    "reorder_threshold": 5,
                    "unit_cost": item.unit_price if movement_type == "added" else 0.0
                }
                products_col.insert_one(product)
            
            # Record StockMovement
            sm_id = f"sm_{int(datetime.now().timestamp())}_{random.randint(100, 999)}"
            movement_doc = {
                "id": sm_id,
                "product_id": product.get("id"),
                "type": movement_type,
                "quantity": item.qty,
                "date": payload.date,
                "source": bill_id
            }
            movements_col.insert_one(movement_doc)
            
    # 3. Generate Invoice PDF if bill confirmation represents a transaction
    invoice_num = f"INV-{payload.date.replace('-', '')}-{random.randint(100, 999)}"
    invoice_id = f"inv_{int(datetime.now().timestamp())}"
    
    # Standard 18% tax calculation
    subtotal = payload.total / 1.18
    tax_amount = payload.total - subtotal
    
    invoice_data = {
        "id": invoice_id,
        "invoiceNumber": invoice_num,
        "clientName": payload.vendor,
        "issueDate": payload.date,
        "items": [{"name": i.name, "qty": i.qty, "price": i.unit_price} for i in payload.items],
        "subtotal": subtotal,
        "taxRate": 18,
        "taxAmount": tax_amount,
        "total": payload.total
    }
    
    pdf_url = generate_invoice_pdf(invoice_data, business_name="BizPilot")
    
    # Save Invoice record
    invoice_doc = {
        "id": invoice_id,
        "bill_id": bill_id,
        "date": payload.date,
        "customer_name": payload.vendor,
        "items": [{"name": i.name, "qty": i.qty, "price": i.unit_price} for i in payload.items],
        "total": payload.total,
        "pdf_url": pdf_url
    }
    invoices_col.insert_one(invoice_doc)
    
    return {"status": "success", "bill_id": bill_id, "invoice_id": invoice_id, "pdf_url": pdf_url}

@app.post("/api/stock-requests")
def create_stock_request(payload: StockRequestPayload):
    requests_col = get_collection("stock_requests")
    req_id = f"sr_{int(datetime.now().timestamp())}"
    request_doc = {
        "id": req_id,
        "product_id": payload.productId,
        "requested_qty": payload.requestedQty,
        "requested_by": payload.requestedBy,
        "status": "pending",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "note": payload.note
    }
    requests_col.insert_one(request_doc)
    return {"status": "success", "request_id": req_id}

@app.patch("/api/stock-requests/{id}/{action}")
def update_stock_request(id: str, action: str):
    requests_col = get_collection("stock_requests")
    movements_col = get_collection("stock_movements")
    
    req = requests_col.find_one({"id": id})
    if not req:
        raise HTTPException(status_code=404, detail="Stock request not found")
        
    if action == "approve":
        requests_col.update_one({"id": id}, {"$set": {"status": "approved"}})
    elif action == "reject":
        requests_col.update_one({"id": id}, {"$set": {"status": "rejected"}})
    elif action == "receive":
        # Mark received AND write StockMovement (type: restocked)
        requests_col.update_one({"id": id}, {"$set": {"status": "received"}})
        
        sm_id = f"sm_{int(datetime.now().timestamp())}"
        movement_doc = {
            "id": sm_id,
            "product_id": req.get("product_id"),
            "type": "restocked",
            "quantity": req.get("requested_qty"),
            "date": datetime.now().strftime("%Y-%m-%d"),
            "source": id
        }
        movements_col.insert_one(movement_doc)
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
        
    return {"status": "success"}

@app.post("/api/attendance")
def save_attendance(payload: AttendancePayload):
    attendance_col = get_collection("attendance")
    
    # Check if attendance already marked for this worker on this date
    existing = attendance_col.find_one({"worker_id": payload.workerId, "date": payload.date})
    
    if existing:
        attendance_col.update_one(
            {"id": existing.get("id")},
            {"$set": {"status": payload.status, "hours_worked": payload.hoursWorked}}
        )
        return {"status": "updated"}
    else:
        att_id = f"att_{payload.workerId}_{payload.date.replace('-', '')}"
        attendance_doc = {
            "id": att_id,
            "worker_id": payload.workerId,
            "date": payload.date,
            "status": payload.status,
            "hours_worked": payload.hoursWorked
        }
        attendance_col.insert_one(attendance_doc)
        return {"status": "saved"}

@app.get("/api/attendance/summary")
def get_attendance_summary(period: str = "month"):
    workers = get_collection("workers").find({})
    attendance = get_collection("attendance").find({})
    
    summary = []
    for w in workers:
        w_id = w.get("id")
        w_att = [a for a in attendance if a.get("worker_id") == w_id]
        
        days_present = sum(1 for a in w_att if a.get("status") == "present")
        total_hours = sum(float(a.get("hours_worked", 0)) for a in w_att if a.get("status") == "present")
        
        if "daily_wage_rate" in w:
            wages_due = days_present * float(w.get("daily_wage_rate", 0))
        elif "hourly_rate" in w:
            wages_due = total_hours * float(w.get("hourly_rate", 0))
        else:
            wages_due = 0.0
            
        summary.append({
            "id": w_id,
            "name": w.get("name"),
            "daysPresent": days_present,
            "totalHours": total_hours,
            "wagesDue": wages_due,
            "unpaidWages": float(w.get("unpaidWages", 0.0))
        })
    return summary

@app.get("/api/reports/daily")
def get_daily_report(date: str):
    movements_col = get_collection("stock_movements")
    products_col = get_collection("products")
    invoices_col = get_collection("invoices")
    
    # 1. Total revenue on this date (sum of confirmed invoices on this date)
    date_invoices = invoices_col.find({"date": date})
    revenue = sum(float(inv.get("total", 0)) for inv in date_invoices)
    
    # 2. Units sold on this date
    sold_movements = movements_col.find({"date": date, "type": "sold"})
    units_sold = sum(int(m.get("quantity", 0)) for m in sold_movements)
    
    # 3. Stock added on this date (added + restocked)
    added_movements = movements_col.find({"date": date, "type": "added"})
    restocked_movements = movements_col.find({"date": date, "type": "restocked"})
    stock_added = sum(int(m.get("quantity", 0)) for m in added_movements) + sum(int(m.get("quantity", 0)) for m in restocked_movements)
    
    # 4. Stock sold breakdown
    sold_breakdown = {}
    for m in sold_movements:
        pid = m.get("product_id")
        p = products_col.find_one({"id": pid})
        pname = p.get("name", "Unknown Product") if p else "Unknown Product"
        sold_breakdown[pname] = sold_breakdown.get(pname, 0) + int(m.get("quantity", 0))
        
    stock_sold_breakdown = [{"product": k, "qty": v} for k, v in sold_breakdown.items()]
    
    # 5. Top products
    sorted_sold = sorted(stock_sold_breakdown, key=lambda x: x["qty"], reverse=True)
    top_products = [x["product"] for x in sorted_sold[:3]]
    
    # 6. Low stock items (derived products)
    derived = get_derived_products()
    low_stock_items = [p["name"] for p in derived if p["currentStock"] < p["reorderThreshold"]]
    
    # 7. Generate recommendations
    sales_summary = {
        "revenue": revenue,
        "units_sold": units_sold,
        "stock_added": stock_added,
        "top_products": top_products,
        "low_stock_items": low_stock_items
    }
    
    recommendations = generate_report_recommendations(sales_summary)
    
    return {
        "revenue": revenue,
        "units_sold": units_sold,
        "stock_added": stock_added,
        "stock_sold_breakdown": stock_sold_breakdown,
        "top_products": top_products,
        "recommendations": recommendations
    }

# Workforce Endpoints Pydantic Schemas
class WorkerPayload(BaseModel):
    name: str
    role: str
    sector: str
    phone: Optional[str] = "+91 98765 00000"
    hourlyRate: float

class WorkforceActionPayload(BaseModel):
    workerId: str
    action: str
    workUnits: float
    unitType: str

class PayWagePayload(BaseModel):
    workerId: str

@app.get("/api/workforce")
def get_workforce():
    workers_col = get_collection("workers")
    workers = workers_col.find({})
    
    formatted = []
    for w in workers:
        hourly_rate = float(w.get("hourlyRate", w.get("hourly_rate", w.get("daily_wage_rate", 1200.0) / 8.0)))
        formatted.append({
            "id": w.get("id"),
            "name": w.get("name"),
            "role": w.get("role"),
            "sector": w.get("sector", "Assembly & Mounting"),
            "phone": w.get("phone", "+91 98765 00000"),
            "status": w.get("status", "active"),
            "hourlyRate": hourly_rate,
            "completedTasks": int(w.get("completedTasks", 0)),
            "totalWagesPaid": float(w.get("totalWagesPaid", 0.0)),
            "unpaidWages": float(w.get("unpaidWages", 0.0))
        })
    return formatted

@app.post("/api/workforce")
def add_worker(payload: WorkerPayload):
    workers_col = get_collection("workers")
    wid = f"w_{int(datetime.now().timestamp())}_{random.randint(10, 99)}"
    worker_doc = {
        "id": wid,
        "name": payload.name,
        "role": payload.role,
        "sector": payload.sector,
        "phone": payload.phone or "+91 98765 00000",
        "status": "active",
        "hourlyRate": payload.hourlyRate,
        "completedTasks": 0,
        "totalWagesPaid": 0.0,
        "unpaidWages": 0.0
    }
    workers_col.insert_one(worker_doc)
    return worker_doc

@app.get("/api/workforce/actions")
def get_workforce_actions():
    actions_col = get_collection("workforce_actions")
    actions = actions_col.find({})
    formatted = []
    for a in actions:
        formatted.append({
            "id": a.get("id"),
            "workerId": a.get("workerId"),
            "workerName": a.get("workerName"),
            "workUnits": a.get("workUnits"),
            "unitType": a.get("unitType"),
            "action": a.get("action"),
            "timestamp": a.get("timestamp"),
            "calculatedWage": a.get("calculatedWage"),
            "status": a.get("status")
        })
    return formatted

@app.post("/api/workforce/actions")
def log_workforce_action(payload: WorkforceActionPayload):
    workers_col = get_collection("workers")
    actions_col = get_collection("workforce_actions")
    
    worker = workers_col.find_one({"id": payload.workerId})
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
        
    hourly_rate = float(worker.get("hourlyRate", worker.get("hourly_rate", worker.get("daily_wage_rate", 1200.0) / 8.0)))
    calculated_wage = hourly_rate * payload.workUnits
    
    action_id = f"act_{int(datetime.now().timestamp())}"
    action_doc = {
        "id": action_id,
        "workerId": payload.workerId,
        "workerName": worker.get("name"),
        "workUnits": payload.workUnits,
        "unitType": payload.unitType,
        "action": payload.action,
        "timestamp": datetime.now().strftime("%Y-%m-%d %I:%M %p"),
        "calculatedWage": calculated_wage,
        "status": "unpaid"
    }
    actions_col.insert_one(action_doc)
    
    workers_col.update_one(
        {"id": payload.workerId},
        {"$set": {
            "unpaidWages": float(worker.get("unpaidWages", 0.0)) + calculated_wage,
            "completedTasks": int(worker.get("completedTasks", 0)) + 1
        }}
    )
    
    attendance_col = get_collection("attendance")
    att_id = f"att_{payload.workerId}_{datetime.now().strftime('%Y%m%d')}"
    attendance_col.insert_one({
        "id": att_id,
        "worker_id": payload.workerId,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "status": "present",
        "hours_worked": payload.workUnits if payload.unitType == "hours" else 8.0
    })
    
    return {"status": "success", "action": action_doc}

@app.post("/api/workforce/pay-wage")
def pay_worker_wages(payload: PayWagePayload):
    workers_col = get_collection("workers")
    actions_col = get_collection("workforce_actions")
    
    worker = workers_col.find_one({"id": payload.workerId})
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
        
    unpaid = float(worker.get("unpaidWages", 0.0))
    if unpaid <= 0:
        return {"status": "no_wage_due"}
        
    workers_col.update_one(
        {"id": payload.workerId},
        {"$set": {
            "unpaidWages": 0.0,
            "totalWagesPaid": float(worker.get("totalWagesPaid", 0.0)) + unpaid
        }}
    )
    
    actions_col.update_one(
        {"workerId": payload.workerId, "status": "unpaid"},
        {"$set": {"status": "paid"}}
    )
    
    bills_col = get_collection("bills")
    bill_id = f"bill_{int(datetime.now().timestamp())}_{random.randint(100, 999)}"
    bill_doc = {
        "id": bill_id,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "image_url": "/static/sample_receipt.png",
        "vendor": worker.get("name"),
        "extracted_items": [{"name": f"Wages Payout - {worker.get('role')}", "qty": 1, "unit_price": unpaid}],
        "total": unpaid,
        "billType": "wages",
        "workerId": payload.workerId,
        "note": f"Wage settlement for period ending {datetime.now().strftime('%Y-%m-%d')}",
        "status": "confirmed"
    }
    bills_col.insert_one(bill_doc)
    
    return {"status": "success", "paid_amount": unpaid}

@app.post("/api/reports/daily/generate")
def generate_report_with_ai(request_data: dict):
    return {"status": "ok"}

# Sync endpoints for old app.jsx compatibility
@app.get("/api/inventory")
def get_inventory_fallback():
    return get_derived_products()

@app.get("/api/invoices")
def get_invoices_fallback():
    return get_collection("invoices").find({})

@app.get("/api/transactions")
def get_transactions_fallback():
    # Construct transactions from invoices and bills
    invoices = get_collection("invoices").find({})
    bills = get_collection("bills").find({})
    
    txs = []
    for inv in invoices:
        txs.append({
            "id": f"tx_inv_{inv.get('id')}",
            "date": inv.get("date"),
            "type": "revenue",
            "category": "Sales",
            "amount": inv.get("total"),
            "description": f"Invoice Payment: {inv.get('customer_name')}"
        })
        
    for b in bills:
        txs.append({
            "id": f"tx_bill_{b.get('id')}",
            "date": b.get("date"),
            "type": "expense",
            "category": b.get("billType", "materials").capitalize(),
            "amount": b.get("total"),
            "description": f"Bill Confirmed: {b.get('vendor')}"
        })
    return sorted(txs, key=lambda x: x["date"], reverse=True)

@app.get("/api/reports")
def get_reports_fallback():
    # Returns history of daily reports
    bills = get_collection("bills").find({})
    dates = sorted(list(set(b.get("date") for b in bills if b.get("date"))), reverse=True)
    
    reports = []
    for d in dates[:5]:
        rep = get_daily_report(d)
        reports.append({
            "id": f"rep_{d.replace('-', '')}",
            "title": f"Strategic Report ({d})",
            "date": d,
            "summary": f"Business overview for {d}.",
            "revenue": rep.get("revenue"),
            "expense": 0.0,
            "profit": rep.get("revenue"),
            "lowStockItemsCount": 0,
            "topProducts": rep.get("top_products"),
            "recommendations": rep.get("recommendations"),
            "content": f"### Executive Summary for {d}\n* **Revenue**: INR {rep.get('revenue'):,.2f}\n* **Units Sold**: {rep.get('units_sold')}\n* **Stock Added**: {rep.get('stock_added')}"
        })
    return reports

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
