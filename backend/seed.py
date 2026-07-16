import os
import json
from datetime import datetime, timedelta
from db import get_collection

def seed_db():
    print("Starting database seeding...")

    # Clear existing collections to ensure fresh start
    products_col = get_collection("products")
    workers_col = get_collection("workers")
    attendance_col = get_collection("attendance")
    movements_col = get_collection("stock_movements")
    bills_col = get_collection("bills")
    invoices_col = get_collection("invoices")
    requests_col = get_collection("stock_requests")

    products_col.delete_many({})
    workers_col.delete_many({})
    attendance_col.delete_many({})
    movements_col.delete_many({})
    bills_col.delete_many({})
    invoices_col.delete_many({})
    requests_col.delete_many({})

    # 1. Seed Products
    # current_stock will be derived, but we store reorder_threshold and unit_cost
    products = [
        {"id": "p1", "name": "Tier-1 Monocrystalline Solar Panel Pallet (40x 550W)", "category": "Solar Panels", "reorder_threshold": 5, "unit_cost": 2800.0},
        {"id": "p2", "name": "Premium Hybrid Solar Inverter (15kW Three-Phase)", "category": "Inverters", "reorder_threshold": 5, "unit_cost": 1100.0},
        {"id": "p3", "name": "High-Density Lithium Iron Phosphate (LiFePO4) Battery Pack (10kWh)", "category": "Energy Storage", "reorder_threshold": 10, "unit_cost": 1600.0},
        {"id": "p4", "name": "Heavy-Duty Aluminum Roof Mounting Racks (Set of 10 arrays)", "category": "Mounting Systems", "reorder_threshold": 15, "unit_cost": 220.0},
        {"id": "p5", "name": "Smart Net-Metering Power Gateway Controller", "category": "Controllers", "reorder_threshold": 10, "unit_cost": 180.0}
    ]
    for p in products:
        products_col.insert_one(p)
    print(f"Seeded {len(products)} products.")

    # 2. Seed Workers
    workers = [
        {"id": "w1", "name": "Ravi Kumar", "role": "Solar Technician", "daily_wage_rate": 1200.0},
        {"id": "w2", "name": "Priya Sharma", "role": "Junior Installer", "hourly_rate": 150.0},
        {"id": "w3", "name": "Amit Patel", "role": "Warehouse Handler", "daily_wage_rate": 1000.0},
        {"id": "w4", "name": "Vikram Singh", "role": "Safety Supervisor", "hourly_rate": 200.0}
    ]
    for w in workers:
        workers_col.insert_one(w)
    print(f"Seeded {len(workers)} workers.")

    # 3. Seed Attendance (July 1 to July 10, 2026)
    # Target date: 2026-07-15
    attendance_records = []
    base_date = datetime(2026, 7, 1)
    
    # Ravi Kumar (w1) - Present 8 days
    for day in range(10):
        date_str = (base_date + timedelta(days=day)).strftime("%Y-%m-%d")
        status = "present" if day != 2 and day != 6 else "absent"
        attendance_records.append({
            "id": f"att_w1_{day}",
            "worker_id": "w1",
            "date": date_str,
            "status": status,
            "hours_worked": 8.0 if status == "present" else 0.0
        })

    # Priya Sharma (w2) - Present 8 days, 8 hours each
    for day in range(10):
        date_str = (base_date + timedelta(days=day)).strftime("%Y-%m-%d")
        status = "present" if day != 1 and day != 7 else "absent"
        attendance_records.append({
            "id": f"att_w2_{day}",
            "worker_id": "w2",
            "date": date_str,
            "status": status,
            "hours_worked": 8.0 if status == "present" else 0.0
        })

    # Amit Patel (w3) - Present 9 days
    for day in range(10):
        date_str = (base_date + timedelta(days=day)).strftime("%Y-%m-%d")
        status = "present" if day != 4 else "absent"
        attendance_records.append({
            "id": f"att_w3_{day}",
            "worker_id": "w3",
            "date": date_str,
            "status": status,
            "hours_worked": 8.0 if status == "present" else 0.0
        })

    # Vikram Singh (w4) - Present 7 days, 6 hours worked
    for day in range(10):
        date_str = (base_date + timedelta(days=day)).strftime("%Y-%m-%d")
        status = "present" if day in [0, 2, 3, 5, 6, 8, 9] else "absent"
        attendance_records.append({
            "id": f"att_w4_{day}",
            "worker_id": "w4",
            "date": date_str,
            "status": status,
            "hours_worked": 6.0 if status == "present" else 0.0
        })

    for att in attendance_records:
        attendance_col.insert_one(att)
    print(f"Seeded {len(attendance_records)} attendance logs.")

    # 4. Seed Stock Movements (Initial stock + some sales)
    # p1 initial: 15, sold: 2, net: 13 (threshold: 5)
    # p2 initial: 28, sold: 3, net: 25 (threshold: 5)
    # p3 initial: 45, sold: 5, net: 40 (threshold: 10)
    # p4 initial: 65, sold: 0, net: 65 (threshold: 15)
    # p5 initial: 3, sold: 0, net: 3 (threshold: 10) -> LOW STOCK!
    movements = [
        # Initial Stock Additions
        {"id": "sm_init_p1", "product_id": "p1", "type": "added", "quantity": 15, "date": "2026-07-01", "source": "manual"},
        {"id": "sm_init_p2", "product_id": "p2", "type": "added", "quantity": 28, "date": "2026-07-01", "source": "manual"},
        {"id": "sm_init_p3", "product_id": "p3", "type": "added", "quantity": 45, "date": "2026-07-01", "source": "manual"},
        {"id": "sm_init_p4", "product_id": "p4", "type": "added", "quantity": 65, "date": "2026-07-01", "source": "manual"},
        {"id": "sm_init_p5", "product_id": "p5", "type": "added", "quantity": 3, "date": "2026-07-01", "source": "manual"},
        # Sales Movements
        {"id": "sm_sale_p1", "product_id": "p1", "type": "sold", "quantity": 2, "date": "2026-07-10", "source": "sale_1"},
        {"id": "sm_sale_p2", "product_id": "p2", "type": "sold", "quantity": 3, "date": "2026-07-12", "source": "sale_2"},
        {"id": "sm_sale_p3", "product_id": "p3", "type": "sold", "quantity": 5, "date": "2026-07-14", "source": "sale_3"}
    ]
    for sm in movements:
        movements_col.insert_one(sm)
    print(f"Seeded {len(movements)} stock movements.")

    # 5. Seed Bills and Invoices
    # Seed Bills (confirmed)
    bills = [
        {
            "id": "bill_1",
            "date": "2026-07-01",
            "image_url": "/static/sample_receipt.png",
            "vendor": "Waaree Energies India",
            "extracted_items": [{"name": "Tier-1 Monocrystalline Solar Panel Pallet (40x 550W)", "qty": 15, "unit_price": 2800.0}],
            "total": 42000.0,
            "status": "confirmed"
        },
        {
            "id": "bill_2",
            "date": "2026-07-01",
            "image_url": "/static/sample_receipt.png",
            "vendor": "Growatt New Energy",
            "extracted_items": [{"name": "Premium Hybrid Solar Inverter (15kW Three-Phase)", "qty": 28, "unit_price": 1100.0}],
            "total": 30800.0,
            "status": "confirmed"
        }
    ]
    for b in bills:
        bills_col.insert_one(b)
    print(f"Seeded {len(bills)} bills.")

    # Seed Invoices
    invoices = [
        {
            "id": "inv_1",
            "bill_id": None,
            "date": "2026-07-10",
            "customer_name": "Apex Power Solutions",
            "items": [{"name": "Tier-1 Monocrystalline Solar Panel Pallet (40x 550W)", "qty": 2, "price": 4500.0}],
            "total": 9000.0,
            "pdf_url": "/static/invoices/invoice_seed_1.pdf"
        },
        {
            "id": "inv_2",
            "bill_id": None,
            "date": "2026-07-12",
            "customer_name": "Greenfield Housing Society",
            "items": [{"name": "Premium Hybrid Solar Inverter (15kW Three-Phase)", "qty": 3, "price": 1850.0}],
            "total": 5550.0,
            "pdf_url": "/static/invoices/invoice_seed_2.pdf"
        }
    ]
    for inv in invoices:
        invoices_col.insert_one(inv)
    print(f"Seeded {len(invoices)} invoices.")

    # 6. Seed Stock Requests
    requests = [
        {
            "id": "sr_1",
            "product_id": "p5",
            "requested_qty": 20,
            "requested_by": "Ravi Kumar",
            "status": "pending",
            "date": "2026-07-14",
            "note": "running low, customers asking"
        }
    ]
    for r in requests:
        requests_col.insert_one(r)
    print(f"Seeded {len(requests)} stock requests.")
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_db()
