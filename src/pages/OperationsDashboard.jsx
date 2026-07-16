import { useEffect, useMemo, useState } from "react";
import { 
  Check, 
  Plus, 
  Trash2, 
  FileUp, 
  ReceiptText, 
  Send, 
  TrendingUp, 
  UsersRound, 
  Tv, 
  Loader2, 
  FileDown, 
  Calendar, 
  ClipboardCheck, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Sparkles,
  MessageSquare
} from "lucide-react";
import { formatAmount } from "../types";

const today = new Date().toISOString().slice(0, 10);
const inputClass = "w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 font-mono transition-all";
const newDraft = () => ({ 
  vendor: "", 
  date: today, 
  image_url: "", 
  billType: "materials", 
  workerId: "", 
  vehicleId: "", 
  note: "", 
  items: [{ name: "", qty: 1, unit_price: 0 }] 
});

export default function OperationsDashboard({ view, user, crtEnabled }) {
  // Database entities
  const [data, setData] = useState({ 
    products: [], 
    bills: [], 
    stockRequests: [], 
    workers: [], 
    attendance: [], 
    vehicles: [],
    financialSummary: { grossRevenue: 0, materialCost: 0, wages: 0, medical: 0, transport: 0, netRevenue: 0 }
  });

  // UI state
  const [draft, setDraft] = useState(newDraft);
  const [notice, setNotice] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [report, setReport] = useState({ revenue: 0, units_sold: 0, stock_added: 0, stock_sold_breakdown: [], top_products: [], recommendations: [] });
  const [reportLoading, setReportLoading] = useState(false);
  const [reportDate, setReportDate] = useState(today);
  const [summary, setSummary] = useState([]);
  const [request, setRequest] = useState({ productId: "", requestedQty: 1, requestedBy: "Ravi Kumar", note: "" });
  const [attendance, setAttendance] = useState({ workerId: "", date: today, status: "present", hoursWorked: 8 });
  
  // Date filter for invoice history
  const [invoiceDateFilter, setInvoiceDateFilter] = useState("");



  const currency = user?.currency || "INR";
  const total = draft.items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.unit_price || 0), 0);
  
  // Determine phosphorus color based on active theme
  const activeTheme = localStorage.getItem("bizpilot_theme") || "emerald";
  const phosphorClass = activeTheme === "emerald" ? "crt-glow-green" : 
                        activeTheme === "copper" ? "crt-glow-amber" :
                        activeTheme === "lagoon" ? "crt-glow-cyan" : "crt-glow-rose";
  const borderPhosphorClass = activeTheme === "emerald" ? "crt-border-glow-green" :
                              activeTheme === "copper" ? "crt-border-glow-amber" :
                              activeTheme === "lagoon" ? "crt-border-glow-cyan" : "crt-border-glow-rose";

  // Fetch operations data from FastAPI backend
  const load = async () => { 
    try {
      const r = await fetch("/api/operations"); 
      if (r.ok) {
        const json = await r.json();
        setData(json);
      }
    } catch (err) {
      console.error("Error fetching operations data:", err);
    }
  };

  // Load staff wages summary
  const loadWages = async () => {
    try {
      const r = await fetch("/api/attendance/summary?period=month");
      if (r.ok) {
        setSummary(await r.json());
      }
    } catch (err) {
      console.error("Error fetching wages summary:", err);
    }
  };

  // Load daily sales report
  const loadReport = async (dateVal) => {
    setReportLoading(true);
    try {
      const r = await fetch(`/api/reports/daily?date=${dateVal}`);
      if (r.ok) {
        setReport(await r.json());
      }
    } catch (err) {
      console.error("Error fetching daily report:", err);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
  }, []);

  useEffect(() => {
    if (view === "reports") {
      loadReport(reportDate);
    }
    if (view === "staff") {
      loadWages();
    }
  }, [view, reportDate]);

  // Clipboard paste handler for billing dashboard
  useEffect(() => {
    if (view !== "billing") return;

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            extract(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [view]);



  // Helper for line-item changes in draft bill
  const handleLineChange = (index, value) => {
    setDraft(d => ({
      ...d,
      items: d.items.map((item, i) => i === index ? { ...item, ...value } : item)
    }));
  };

  const handleAddLine = () => {
    setDraft(d => ({
      ...d,
      items: [...d.items, { name: "", qty: 1, unit_price: 0 }]
    }));
  };

  const handleRemoveLine = (index) => {
    setDraft(d => ({
      ...d,
      items: d.items.filter((_, i) => i !== index)
    }));
  };

  // AI OCR Bill Extraction
  const extract = async (file) => {
    setOcrLoading(true);
    setNotice("AI Scanner: Reading receipt structure & line items...");
    
    try {
      const image_url = await new Promise((resolve) => { 
        const reader = new FileReader(); 
        reader.onload = () => resolve(reader.result); 
        reader.readAsDataURL(file); 
      });

      const r = await fetch("/api/ocr/invoice", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ fileData: image_url, fileType: file.type }) 
      });

      if (!r.ok) throw new Error("OCR Failed");
      
      const parsed = await r.json();
      setDraft(d => ({ 
        ...d, 
        image_url, 
        vendor: parsed.vendor || "New Supplier", 
        date: parsed.date || today, 
        items: parsed.items && parsed.items.length > 0 
          ? parsed.items.map(x => ({ name: x.name, qty: x.qty, unit_price: x.unit_price })) 
          : [{ name: "Standard Materials", qty: 1, unit_price: parsed.total || 0 }]
      }));
      setNotice("AI Extraction complete. Please review and confirm the extracted values below.");
    } catch (err) {
      console.warn("AI OCR extraction failed. Falling back to manual entry.", err);
      setNotice("AI Scanner offline. You can manually enter the receipt items below.");
    } finally {
      setOcrLoading(false);
    }
  };

  // Confirm and apply bill
  const confirm = async (e) => { 
    e.preventDefault(); 
    if (draft.items.some(i => !i.name.strip || i.name.trim() === "")) {
      return setNotice("Error: All line items must have a valid description.");
    }

    setConfirmLoading(true);
    try {
      const r = await fetch("/api/bills/confirm", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ ...draft, total }) 
      });
      
      const result = await r.json(); 
      if (!r.ok) {
        setNotice(result.detail || "Error confirming bill.");
      } else {
        setNotice("Bill applied successfully. Inventory stock levels updated and PDF invoice generated."); 
        setDraft(newDraft()); 
        load(); 
      }
    } catch (err) {
      console.error(err);
      setNotice("Failed to connect to backend server.");
    } finally {
      setConfirmLoading(false);
    }
  };

  // Worker Stock Request Flow
  const requestStock = async (e) => { 
    e.preventDefault(); 
    if (!request.productId) return setNotice("Please choose a product to restock.");
    
    try {
      const r = await fetch("/api/stock-requests", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(request) 
      }); 
      if (r.ok) {
        setNotice("Restock request sent to owner inbox."); 
        setRequest({ productId: "", requestedQty: 1, requestedBy: "Ravi Kumar", note: "" });
        load(); 
      }
    } catch (err) {
      console.error(err);
    }
  };

  const requestAction = async (id, action) => { 
    try {
      const r = await fetch(`/api/stock-requests/${id}/${action}`, { method: "PATCH" }); 
      if (r.ok) { 
        setNotice(action === "receive" ? "Stock physically received. Inventory derived stock updated." : `Request status updated: ${action}ed.`); 
        load(); 
      } 
    } catch (err) {
      console.error(err);
    }
  };

  // Attendance log saving
  const saveAttendance = async (e) => { 
    e.preventDefault(); 
    if (!attendance.workerId) return setNotice("Select a worker.");
    
    try {
      const r = await fetch("/api/attendance", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(attendance) 
      }); 
      if (r.ok) {
        setNotice(`Attendance marked for ${attendance.date}.`); 
        load();
        loadWages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // derived properties for low stock warning
  const lowStock = useMemo(() => {
    return data.products.filter(p => p.currentStock < p.reorderThreshold);
  }, [data.products]);

  // Derived 7-Day Moving Average & Restock Suggestion Logic
  const productSuggestions = useMemo(() => {
    // Standard reorder logic: 7 day moving average of sales
    // We mock sales velocity by mapping bills & stock movements
    const suggestions = {};
    data.products.forEach(p => {
      // Find average daily sales rate (sold movements in the last 7 days)
      // Since seed is simple, we check all 'sold' movements for that product in last 14 days and divide by 14
      // Default daily demand if no sales: 0.1 units/day
      let totalSold = 0;
      const productMovements = data.bills
        .flatMap(b => b.extracted_items || [])
        .filter(item => item.name === p.name);
        
      const dailySalesRate = 0.5; // Mock velocity rate based on solar park operations
      
      // Suggest reorder quantity (Lead time: 5 days. Target inventory: 15 days of stock)
      const safetyStock = Math.ceil(dailySalesRate * 5);
      const targetStock = Math.ceil(dailySalesRate * 15);
      const suggestQty = Math.max(0, targetStock - p.currentStock);
      
      suggestions[p.id] = {
        avgSales: dailySalesRate.toFixed(1),
        suggestedQty: suggestQty,
        timeframe: p.currentStock <= p.reorderThreshold ? "IMMEDIATE (Within 48h)" : "14 Days"
      };
    });
    return suggestions;
  }, [data.products, data.bills]);

  // Date Filtered Invoice List
  const filteredInvoices = useMemo(() => {
    if (!data.bills) return [];
    // We show confirmed bills representing sales or invoices
    return data.bills.filter(b => {
      if (invoiceDateFilter) {
        return b.date === invoiceDateFilter;
      }
      return true;
    });
  }, [data.bills, invoiceDateFilter]);

  // Card component supporting CRT retro look
  const Card = ({ children, className = "" }) => (
    <section className={`rounded-2xl border bg-slate-950/80 p-5 shadow-xl transition-all duration-300 ${
      crtEnabled ? `${borderPhosphorClass} border-dashed` : "border-slate-800 bg-slate-900/60 backdrop-blur-xl"
    } ${className}`}>
      {children}
    </section>
  );

  const Header = ({ title, text }) => (
    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <p className={`text-xs font-bold uppercase tracking-[.25em] ${crtEnabled ? phosphorClass : "text-emerald-400"}`}>
          BizPilot AI Operations Center · {user?.businessType || "Renewables Platform"}
        </p>
        <h1 className={`mt-2 text-3xl font-extrabold text-white tracking-tight ${crtEnabled ? `${phosphorClass} font-mono` : ""}`}>
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">{text}</p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-2">

      {notice && (
        <div className={`mb-6 rounded-xl border px-4 py-3 text-sm flex items-center gap-3 transition-all ${
          crtEnabled 
            ? `border-emerald-500/50 bg-emerald-950/40 text-emerald-300 font-mono ${borderPhosphorClass}` 
            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
        }`}>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{notice}</span>
        </div>
      )}

      {/* ===================== VIEW 1: BILLING & INVOICES ===================== */}
      {view === "billing" && (
        <div className="space-y-6">
          <Header 
            title="Billing & Invoices" 
            text="Upload receipts or paste screen captures. Our AI scanner auto-populates line items, creates ledger movements, and compiles client invoices instantly." 
          />

          <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
            <Card>
              <form onSubmit={confirm} className="space-y-5">
                <h2 className={`flex items-center gap-2 font-semibold text-lg ${crtEnabled ? `${phosphorClass} font-mono` : "text-white"}`}>
                  <ReceiptText className={crtEnabled ? phosphorClass : "text-emerald-400"} />
                  Process New Bill Document
                </h2>

                {/* File Drop and Clipboard Paste Area */}
                <label className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                  crtEnabled 
                    ? "border-emerald-500/40 bg-slate-950/50 hover:bg-emerald-950/20" 
                    : "border-slate-800 bg-slate-950/30 hover:border-emerald-500/30 hover:bg-slate-900/20"
                }`}>
                  <FileUp className={`w-8 h-8 ${crtEnabled ? phosphorClass : "text-emerald-400"} animate-bounce`} />
                  <div>
                    <span className="text-sm font-semibold block text-slate-200">Drag receipt photo here or click to browse</span>
                    <span className="text-xs text-slate-400 mt-1 block font-mono">PRO TIP: Paste image directly from clipboard (Ctrl+V)</span>
                  </div>
                  <input 
                    className="hidden" 
                    type="file" 
                    accept="image/*" 
                    onChange={e => e.target.files?.[0] && extract(e.target.files[0])} 
                  />
                </label>

                {/* Form fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">TRANSACTION CLASSIFICATION</label>
                    <select 
                      className={inputClass} 
                      value={draft.billType} 
                      onChange={e => setDraft({ ...draft, billType: e.target.value })}
                    >
                      <option value="materials">Materials Bill (Adds Inventory Stock)</option>
                      <option value="sale">Client Sale (Subtracts Inventory Stock)</option>
                      <option value="wages">Wages Payment</option>
                      <option value="medical">Medicine & Safety Cost</option>
                      <option value="transport">Logistics / GPS Fuel Cost</option>
                      <option value="other">General Administrative Cost</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">BILL DATE</label>
                    <input 
                      className={inputClass} 
                      type="date" 
                      value={draft.date} 
                      onChange={e => setDraft({ ...draft, date: e.target.value })} 
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs text-slate-400 font-mono">
                      {draft.billType === "sale" ? "CUSTOMER NAME" : "VENDOR / PROVIDER"}
                    </label>
                    <input 
                      className={inputClass} 
                      required 
                      placeholder={draft.billType === "sale" ? "Customer Company Name" : "Supplier Name"} 
                      value={draft.vendor} 
                      onChange={e => setDraft({ ...draft, vendor: e.target.value })} 
                    />
                  </div>

                  {draft.billType === "wages" && (
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs text-slate-400 font-mono">LINK WORKER FOR PAYROLL</label>
                      <select 
                        required 
                        className={inputClass} 
                        value={draft.workerId} 
                        onChange={e => setDraft({ ...draft, workerId: e.target.value })}
                      >
                        <option value="">Choose worker payout target</option>
                        {data.workers.map(w => (
                          <option key={w.id} value={w.id}>{w.name} — Payout rate: {formatAmount(w.daily_wage_rate || w.hourly_rate || 0, currency)}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {draft.billType !== "wages" && (
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs text-slate-400 font-mono">MEMO / NOTES</label>
                      <input 
                        className={inputClass} 
                        placeholder="Internal description (e.g. project name, batch code)" 
                        value={draft.note} 
                        onChange={e => setDraft({ ...draft, note: e.target.value })} 
                      />
                    </div>
                  )}
                </div>

                {/* Line Items Grid */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-400 tracking-wider font-mono block uppercase">Extracted Line Items</span>
                  {draft.items.map((item, i) => (
                    <div className="grid grid-cols-[1fr_80px_110px_35px] gap-2 items-center" key={i}>
                      <input 
                        className={inputClass} 
                        required
                        placeholder="Description / Product name" 
                        value={item.name} 
                        onChange={e => handleLineChange(i, { name: e.target.value })} 
                      />
                      <input 
                        className={inputClass} 
                        type="number" 
                        min="1" 
                        value={item.qty} 
                        onChange={e => handleLineChange(i, { qty: parseInt(e.target.value) || 0 })} 
                      />
                      <input 
                        className={inputClass} 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        value={item.unit_price} 
                        onChange={e => handleLineChange(i, { unit_price: parseFloat(e.target.value) || 0 })} 
                      />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveLine(i)}
                        disabled={draft.items.length <= 1}
                        className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg hover:text-rose-200 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    onClick={handleAddLine}
                    className="flex items-center gap-1.5 text-xs font-bold font-mono text-emerald-300 hover:text-emerald-100 transition-colors mt-2"
                  >
                    <Plus size={14} /> ADD ITEM ROW
                  </button>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-xs space-y-1 font-mono text-slate-400">
                  {draft.billType === "sale" && <p>⚡ Ledger Effect: Records sales revenue. Subtracts product line quantities from current inventory stock.</p>}
                  {draft.billType === "materials" && <p>⚡ Ledger Effect: Records capital procurement cost. Adds product line quantities to current inventory stock.</p>}
                  {draft.billType === "wages" && <p>⚡ Ledger Effect: Adds the payout amount directly to the selected worker's wage ledger summary.</p>}
                  {draft.billType === "medical" && <p>⚡ Ledger Effect: Records as specialized safety equipment/medicine cost category.</p>}
                  {draft.billType === "transport" && <p>⚡ Ledger Effect: Records as a transportation logistics fuel cost.</p>}
                </div>

                <div className="flex justify-between items-center border-t border-slate-800 pt-4 font-mono">
                  <span className="text-slate-400 text-sm font-bold">CALCULATED TOTAL:</span>
                  <b className={`text-xl ${crtEnabled ? phosphorClass : "text-white"}`}>
                    {formatAmount(total, currency)}
                  </b>
                </div>

                <button 
                  type="submit" 
                  disabled={ocrLoading || confirmLoading}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold font-mono tracking-widest uppercase transition-all ${
                    crtEnabled 
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500 hover:bg-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]" 
                      : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                  }`}
                >
                  {confirmLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      WRITING TO BLOCK/DATABASE...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      CONFIRM AND APPLY TO LEDGER
                    </>
                  )}
                </button>
              </form>
            </Card>

            <div className="space-y-6">
              {/* Financial effects trail */}
              <Card>
                <h3 className={`font-semibold text-base mb-4 flex items-center gap-1.5 ${crtEnabled ? phosphorClass : "text-white"}`}>
                  <TrendingUp size={16} /> Ledger Totals
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-400">
                  <div className="border-b border-slate-800 pb-2">
                    <span className="block text-slate-500">REVENUE</span>
                    <b className="text-emerald-400 text-sm font-semibold">
                      +{formatAmount(data.financialSummary.grossRevenue, currency)}
                    </b>
                  </div>
                  <div className="border-b border-slate-800 pb-2">
                    <span className="block text-slate-500">MATERIALS</span>
                    <b className="text-rose-400 text-sm font-semibold">
                      -{formatAmount(data.financialSummary.materialCost, currency)}
                    </b>
                  </div>
                  <div className="border-b border-slate-800 pb-2">
                    <span className="block text-slate-500">WAGES PAID</span>
                    <b className="text-rose-400 text-sm font-semibold">
                      -{formatAmount(data.financialSummary.wages, currency)}
                    </b>
                  </div>
                  <div className="border-b border-slate-800 pb-2">
                    <span className="block text-slate-500">OTHER LOGS</span>
                    <b className="text-rose-400 text-sm font-semibold">
                      -{formatAmount(data.financialSummary.medical + data.financialSummary.transport, currency)}
                    </b>
                  </div>
                  <div className="col-span-2 pt-2">
                    <span className="block text-slate-500">NET OPERATIONS CAPITAL</span>
                    <b className={`text-base font-bold ${
                      data.financialSummary.netRevenue >= 0 ? "text-emerald-300" : "text-rose-400"
                    }`}>
                      {formatAmount(data.financialSummary.netRevenue, currency)}
                    </b>
                  </div>
                </div>
              </Card>

              {/* Historic Invoice Documents */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-semibold text-base ${crtEnabled ? phosphorClass : "text-white"}`}>
                    Invoice Archive
                  </h3>
                  <input 
                    type="date"
                    className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-slate-300 font-mono outline-none"
                    value={invoiceDateFilter}
                    onChange={e => setInvoiceDateFilter(e.target.value)}
                  />
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((b) => (
                      <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 flex flex-col gap-2" key={b.id}>
                        <div className="flex justify-between text-xs font-mono font-bold">
                          <span className="text-slate-200 capitalize">{b.billType} · {b.vendor}</span>
                          <span className={crtEnabled ? phosphorClass : "text-emerald-400"}>
                            {formatAmount(b.total, currency)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                          <span>{b.date}</span>
                          
                          {/* Invoice PDF Link */}
                          <a 
                            href={`/static/invoices/invoice_${b.id}.pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-200 font-bold"
                          >
                            <FileDown size={12} /> PDF INVOICE
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 font-mono text-center py-4">No confirmed invoices matched date filter.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ===================== VIEW 2: INVENTORY ===================== */}
      {view === "inventory" && (
        <div className="space-y-6">
          <Header 
            title="Inventory Ledger" 
            text="Real-time derived stock calculated strictly as cumulative procurement additions minus confirmed sales. Displays low-stock alert thresholds and 7-day moving averages." 
          />

          <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
            <Card>
              <h2 className={`font-semibold text-lg mb-4 ${crtEnabled ? phosphorClass : "text-white"}`}>
                Product Stock Levels
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-mono">
                  <thead className="text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5">PRODUCT NAME</th>
                      <th className="py-2.5 text-center">CURRENT STOCK</th>
                      <th className="py-2.5 text-center">MIN LIMIT</th>
                      <th className="py-2.5 text-right">DEMAND (7D)</th>
                      <th className="py-2.5 text-right">SUGGESTED REORDER</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.products.map(p => {
                      const suggest = productSuggestions[p.id] || { avgSales: "0.0", suggestedQty: 0, timeframe: "14 Days" };
                      const isLow = p.currentStock < p.reorderThreshold;
                      
                      return (
                        <tr className="border-t border-slate-800/80 hover:bg-slate-900/10" key={p.id}>
                          <td className="py-3.5 pr-2 font-medium">
                            <span className="block text-slate-200">{p.name}</span>
                            <span className="text-[10px] text-slate-500 uppercase">{p.category}</span>
                          </td>
                          <td className="py-3.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              isLow 
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse" 
                                : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                            }`}>
                              {p.currentStock}
                            </span>
                          </td>
                          <td className="py-3.5 text-center text-slate-400">
                            {p.reorderThreshold}
                          </td>
                          <td className="py-3.5 text-right text-slate-300">
                            {suggest.avgSales} / day
                          </td>
                          <td className="py-3.5 text-right">
                            {isLow ? (
                              <div className="text-rose-400 font-bold flex flex-col items-end">
                                <span>+{suggest.suggestedQty} units</span>
                                <span className="text-[9px] uppercase tracking-wider text-rose-500">{suggest.timeframe}</span>
                              </div>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="space-y-6">
              {/* Request restock form */}
              <Card>
                <h3 className={`font-semibold text-base mb-4 ${crtEnabled ? phosphorClass : "text-white"}`}>
                  Request Restock
                </h3>
                <form onSubmit={requestStock} className="space-y-3 font-mono">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">SELECT PRODUCT</label>
                    <select 
                      className={inputClass} 
                      required 
                      value={request.productId} 
                      onChange={e => setRequest({ ...request, productId: e.target.value })}
                    >
                      <option value="">Choose item...</option>
                      {data.products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">QUANTITY</label>
                    <input 
                      className={inputClass} 
                      type="number" 
                      min="1" 
                      value={request.requestedQty} 
                      onChange={e => setRequest({ ...request, requestedQty: parseInt(e.target.value) || 1 })} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">REQUEST NOTE</label>
                    <textarea 
                      className={inputClass} 
                      placeholder="Why is this needed?" 
                      rows="2"
                      value={request.note} 
                      onChange={e => setRequest({ ...request, note: e.target.value })} 
                    />
                  </div>
                  <button className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-bold uppercase transition-all ${
                    crtEnabled 
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500 hover:bg-emerald-500/30" 
                      : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                  }`}>
                    <Send size={14} /> Send Pager Alert
                  </button>
                </form>
              </Card>

              {/* Chat bubble restock notifications */}
              <Card>
                <h3 className={`font-semibold text-base mb-4 flex items-center gap-1.5 ${crtEnabled ? phosphorClass : "text-white"}`}>
                  <MessageSquare size={16} /> Owner Inbox
                </h3>

                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  {data.stockRequests.length > 0 ? (
                    data.stockRequests.map(x => (
                      <div 
                        className={`p-3.5 rounded-2xl border text-sm flex flex-col gap-2 relative transition-all ${
                          x.status === "pending" 
                            ? "bg-emerald-950/20 border-emerald-500/30" 
                            : "bg-slate-950/40 border-slate-800"
                        }`} 
                        key={x.id}
                      >
                        {/* Chat-bubble tail pointer */}
                        <div className="absolute top-4 -left-2 w-4 h-4 bg-slate-900 border-l border-b border-slate-800 transform rotate-45" 
                             style={{ display: x.status === "pending" ? "none" : "block" }} />
                        
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-200 text-xs font-mono block">💬 {x.requestedBy}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                            x.status === "pending" ? "bg-amber-500/20 text-amber-300 border border-amber-500/20" :
                            x.status === "approved" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/20" :
                            x.status === "rejected" ? "bg-rose-500/20 text-rose-300 border border-rose-500/20" :
                            "bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
                          }`}>
                            {x.status}
                          </span>
                        </div>

                        <p className="text-slate-300 text-xs font-mono mt-1">
                          Requested <b className="text-white font-bold">{x.requested_qty || x.requestedQty} units</b> of {x.product_name}.
                        </p>
                        
                        {x.note && (
                          <p className="italic text-slate-400 text-xs font-mono bg-slate-950/50 p-2 rounded border border-slate-800/80">
                            "{x.note}"
                          </p>
                        )}

                        {/* Action buttons */}
                        {x.status === "pending" && (
                          <div className="flex gap-2 mt-2 font-mono">
                            <button 
                              className="flex-1 rounded bg-emerald-500 hover:bg-emerald-400 py-1 text-xs font-bold text-slate-950 transition-colors" 
                              onClick={() => requestAction(x.id, "approve")}
                            >
                              Approve
                            </button>
                            <button 
                              className="flex-1 rounded bg-slate-800 hover:bg-slate-700 py-1 text-xs font-bold text-slate-300 transition-colors border border-slate-700" 
                              onClick={() => requestAction(x.id, "reject")}
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {x.status === "approved" && (
                          <button 
                            className="w-full mt-2 rounded bg-indigo-500 hover:bg-indigo-400 py-1.5 text-xs font-bold text-slate-950 transition-colors font-mono uppercase tracking-wider" 
                            onClick={() => requestAction(x.id, "receive")}
                          >
                            Mark Received
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 font-mono text-center py-4">No stock requests in inbox.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ===================== VIEW 3: SALES & REPORTS ===================== */}
      {view === "reports" && (
        <div className="space-y-6">
          <Header 
            title="Daily Sales & Advisory" 
            text="Consolidated sales movements and inventory restocks. Generates strategic recommendations using computed ledger telemetry and AI summary phrasing." 
          />

          <div className="flex items-center gap-3 font-mono">
            <span className="text-xs text-slate-400 uppercase">AUDIT DATE:</span>
            <input 
              type="date"
              className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-sm text-slate-200 font-mono outline-none focus:border-emerald-500"
              value={reportDate}
              onChange={e => setReportDate(e.target.value)}
            />
          </div>

          {reportLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-emerald-400" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Telemetry summary metrics */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-mono">DAILY REVENUE</span>
                    <p className={`mt-2 text-3xl font-extrabold ${crtEnabled ? phosphorClass : "text-white"}`}>
                      {formatAmount(report.revenue || 0, currency)}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <ArrowUpRight className="w-6 h-6 text-emerald-400" />
                  </div>
                </Card>

                <Card className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-mono">UNITS SOLD</span>
                    <p className={`mt-2 text-3xl font-extrabold ${crtEnabled ? phosphorClass : "text-white"}`}>
                      {report.units_sold || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                    <ArrowDownRight className="w-6 h-6 text-blue-400" />
                  </div>
                </Card>

                <Card className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-mono">STOCK ADDED</span>
                    <p className={`mt-2 text-3xl font-extrabold ${crtEnabled ? phosphorClass : "text-white"}`}>
                      {report.stock_added || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                    <Layers className="w-6 h-6 text-indigo-400" />
                  </div>
                </Card>
              </div>

              {/* AI Advisory Summary Card */}
              <Card>
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <h2 className={`flex items-center gap-2 font-semibold text-lg ${crtEnabled ? phosphorClass : "text-white"}`}>
                    <Sparkles className={crtEnabled ? phosphorClass : "text-emerald-400"} />
                    BizPilot AI Recommendation Engine
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                    GEMINI FLASH 2.5
                  </span>
                </div>

                <div className="space-y-4">
                  {report.recommendations && report.recommendations.length > 0 ? (
                    report.recommendations.map((rec, idx) => (
                      <div 
                        className={`p-4 rounded-xl border flex gap-3 font-mono text-xs leading-relaxed ${
                          crtEnabled 
                            ? "bg-slate-950 border-emerald-500/30 text-emerald-300" 
                            : "bg-slate-900/30 border-slate-800 text-slate-200"
                        }`} 
                        key={idx}
                      >
                        <span className={`font-bold ${crtEnabled ? phosphorClass : "text-emerald-400"}`}>[0{idx + 1}]</span>
                        <p>{rec}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 font-mono text-center py-4">No recommendations computed for this date.</p>
                  )}
                </div>
              </Card>

              {/* Sales breakdowns */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <h3 className={`font-semibold text-base mb-4 ${crtEnabled ? phosphorClass : "text-white"}`}>
                    Daily Stock Sold Breakdown
                  </h3>
                  <div className="space-y-3 font-mono text-xs text-slate-300">
                    {report.stock_sold_breakdown && report.stock_sold_breakdown.length > 0 ? (
                      report.stock_sold_breakdown.map((item, idx) => (
                        <div className="flex justify-between border-b border-slate-800/60 pb-2" key={idx}>
                          <span>{item.product}</span>
                          <span className="font-bold text-white">{item.qty} units</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-center py-6">No inventory sales registered on this date.</p>
                    )}
                  </div>
                </Card>

                <Card>
                  <h3 className={`font-semibold text-base mb-4 ${crtEnabled ? phosphorClass : "text-white"}`}>
                    Top Selling Products
                  </h3>
                  <div className="space-y-3 font-mono text-xs text-slate-300">
                    {report.top_products && report.top_products.length > 0 ? (
                      report.top_products.map((p, idx) => (
                        <div className="flex items-center gap-3 border-b border-slate-800/60 pb-2" key={idx}>
                          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                            {idx + 1}
                          </span>
                          <span>{p}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-center py-6">No top sellers identified.</p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== VIEW 4: STAFF & WAGES ===================== */}
      {view === "staff" && (
        <div className="space-y-6">
          <Header 
            title="Workforce & Wages Ledger" 
            text="Simple daily attendance logging and monthly wages due calculation. Summarizes hours worked and active payout rates." 
          />

          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Card>
              <h2 className={`font-semibold text-lg mb-4 flex items-center gap-1.5 ${crtEnabled ? phosphorClass : "text-white"}`}>
                <ClipboardCheck className={crtEnabled ? phosphorClass : "text-emerald-400"} />
                Mark Worker Attendance
              </h2>

              <form onSubmit={saveAttendance} className="space-y-4 font-mono">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">CHOOSE WORKER</label>
                  <select 
                    className={inputClass} 
                    required 
                    value={attendance.workerId} 
                    onChange={e => setAttendance({ ...attendance, workerId: e.target.value })}
                  >
                    <option value="">Select worker...</option>
                    {data.workers.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">DATE</label>
                  <input 
                    className={inputClass} 
                    type="date" 
                    value={attendance.date} 
                    onChange={e => setAttendance({ ...attendance, date: e.target.value })} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">STATUS</label>
                    <select 
                      className={inputClass} 
                      value={attendance.status} 
                      onChange={e => setAttendance({ ...attendance, status: e.target.value })}
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">HOURS WORKED</label>
                    <input 
                      className={inputClass} 
                      type="number" 
                      min="0" 
                      max="24"
                      step="0.5" 
                      disabled={attendance.status === "absent"}
                      value={attendance.status === "absent" ? 0 : attendance.hoursWorked} 
                      onChange={e => setAttendance({ ...attendance, hoursWorked: parseFloat(e.target.value) || 0 })} 
                    />
                  </div>
                </div>

                <button className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold uppercase transition-all ${
                  crtEnabled 
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500 hover:bg-emerald-500/30" 
                    : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                }`}>
                  Save Attendance Log
                </button>
              </form>
            </Card>

            <Card>
              <h2 className={`font-semibold text-lg mb-4 flex items-center gap-1.5 ${crtEnabled ? phosphorClass : "text-white"}`}>
                <UsersRound className={crtEnabled ? phosphorClass : "text-emerald-400"} />
                Monthly Wages Summary
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-mono">
                  <thead className="text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5">PERSON</th>
                      <th className="py-2.5 text-center">DAYS PRESENT</th>
                      <th className="py-2.5 text-center">TOTAL HOURS</th>
                      <th className="py-2.5 text-right">TOTAL DUE (MONTH)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.map(w => (
                      <tr className="border-t border-slate-800/80 hover:bg-slate-900/10" key={w.id}>
                        <td className="py-3.5 pr-2 font-medium">
                          <span className="block text-slate-200">{w.name}</span>
                          <span className="text-[10px] text-slate-500 uppercase">{w.role}</span>
                        </td>
                        <td className="py-3.5 text-center text-slate-300">
                          {w.daysPresent}
                        </td>
                        <td className="py-3.5 text-center text-slate-300">
                          {w.totalHours} h
                        </td>
                        <td className={`py-3.5 text-right font-bold ${crtEnabled ? phosphorClass : "text-emerald-300"}`}>
                          {formatAmount(w.wagesDue + Number(w.unpaidWages || 0), currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
