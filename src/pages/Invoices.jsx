import { useState, useMemo, useRef } from "react";
import {
  Plus,
  Search,
  Trash2,
  CheckCircle,
  Loader,
  FileText,
  Sparkles,
  Printer,
  UploadCloud,
  ArrowLeft
} from "lucide-react";
import { formatAmount, getCurrencySymbol } from "../types";
export default function Invoices({ user, invoices, products, onAddInvoice, onEditInvoice, onDeleteInvoice }) {
  const [view, setView] = useState("list");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState([]);
  const [taxRate, setTaxRate] = useState(10);
  const [notes, setNotes] = useState("");
  const [quickProduct, setQuickProduct] = useState("");
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }, [items]);
  const taxAmount = useMemo(() => {
    return subtotal * taxRate / 100;
  }, [subtotal, taxRate]);
  const total = useMemo(() => {
    return subtotal + taxAmount;
  }, [subtotal, taxAmount]);
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch = inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || inv.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);
  const handleOcrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrLoading(true);
    setOcrSuccess(false);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result;
        const response = await fetch("/api/ocr/invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileData: base64Data,
            fileType: file.type
          })
        });
        if (!response.ok) {
          throw new Error("Gemini parser failed");
        }
        const data = await response.json();
        setInvoiceNumber(data.invoiceNumber || "");
        setClientName(data.clientName || "");
        setClientEmail(data.clientEmail || "");
        setIssueDate(data.issueDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
        setDueDate(data.dueDate || new Date(Date.now() + 30 * 24 * 3600 * 1e3).toISOString().split("T")[0]);
        if (data.items && Array.isArray(data.items)) {
          setItems(data.items.map((it, index) => ({
            id: "ocr_item_" + index,
            name: it.name,
            quantity: Number(it.quantity) || 1,
            price: Number(it.price) || 0,
            total: Number(it.total) || Number(it.quantity) * Number(it.price)
          })));
        } else {
          setItems([]);
        }
        setTaxRate(data.taxRate || 10);
        setNotes(data.notes || "Auto-extracted via BizPilot AI OCR.");
        setOcrSuccess(true);
      };
    } catch (err) {
      console.error("OCR parse error:", err);
      alert("Failed to extract invoice parameters. Please fill out details manually.");
    } finally {
      setOcrLoading(false);
    }
  };
  const handleOpenCreateForm = () => {
    setInvoiceNumber("INV-2026-" + Math.floor(100 + Math.random() * 900));
    setClientName("");
    setClientEmail("");
    setIssueDate((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
    setDueDate(new Date(Date.now() + 14 * 24 * 3600 * 1e3).toISOString().split("T")[0]);
    setItems([]);
    setTaxRate(10);
    setNotes("Standard net-14 payment parameters. Thank you.");
    setOcrSuccess(false);
    setView("create");
  };
  const handleAddRow = () => {
    const newItem = {
      id: "row_" + Date.now(),
      name: "",
      quantity: 1,
      price: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };
  const handleAddQuickProduct = (productId) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const newItem = {
      id: "row_" + Date.now(),
      name: prod.name,
      quantity: 1,
      price: prod.price,
      total: prod.price
    };
    setItems([...items, newItem]);
    setQuickProduct("");
  };
  const handleUpdateRow = (id, field, value) => {
    setItems(items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "price") {
          updated.total = Number(updated.quantity) * Number(updated.price);
        }
        return updated;
      }
      return item;
    }));
  };
  const handleRemoveRow = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };
  const handleSaveInvoice = (status) => {
    if (!clientName || items.length === 0) {
      alert("Please configure client name and add at least one line item.");
      return;
    }
    const payload = {
      invoiceNumber,
      clientName,
      clientEmail,
      issueDate,
      dueDate,
      items,
      subtotal,
      taxRate,
      taxAmount,
      total,
      status,
      notes
    };
    onAddInvoice(payload);
    setView("list");
  };
  const handlePrintPreview = () => {
    window.print();
  };
  return <div className="space-y-8 animate-fade-in relative">
      
      {
    /* Printable Invoice view custom styling override */
  }
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background: transparent !important;
            color: black !important;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 40px !important;
          }
          #print-area * {
            color: black !important;
          }
        }
      `}</style>

      {view === "list" && <>
          {
    /* Header block */
  }
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-teal-700 font-mono">Billing & Collection</span>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mt-1">Smart Invoice Hub</h1>
              <p className="text-xs text-gray-500 mt-1">Harness AI Vision OCR receipt parsing to generate high-fidelity digital invoices instantly.</p>
            </div>
            
            <button
              id="btn-create-invoice-nav"
              onClick={handleOpenCreateForm}
              className="bg-teal-700 hover:bg-teal-850 text-xs font-semibold text-white px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Smart Invoice</span>
            </button>
          </div>

          {
    /* Quick Filter actions */
  }
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by client name, invoice number, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border border-gray-250 rounded-lg py-2 pl-10 pr-4 text-xs focus:border-teal-500 focus:outline-none transition-colors text-gray-800 placeholder-gray-400"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
              <span className="text-[11px] font-bold text-gray-450 uppercase tracking-widest shrink-0">Filter Status:</span>
              {["all", "paid", "unpaid"].map((f) => <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer capitalize ${statusFilter === f ? "bg-teal-700 text-white shadow-sm" : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
              >
                  {f}
                </button>)}
            </div>
          </div>

          {
    /* Invoices List Table */
  }
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700 border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50 text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-4 px-6">Invoice Number</th>
                    <th className="py-4 px-4">Client Name</th>
                    <th className="py-4 px-4">Issue Date</th>
                    <th className="py-4 px-4">Due Date</th>
                    <th className="py-4 px-4 text-right">Total Amount</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => <tr key={inv.id} className="hover:bg-gray-50 group">
                        <td className="py-4 px-6 font-mono text-[11px] font-semibold text-teal-700">{inv.invoiceNumber}</td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-gray-900">{inv.clientName}</p>
                            <p className="text-[10px] text-gray-450 mt-0.5">{inv.clientEmail || "No email logs"}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-500">{inv.issueDate}</td>
                        <td className="py-4 px-4 text-gray-500">{inv.dueDate}</td>
                        <td className="py-4 px-4 text-right font-bold text-gray-900">{formatAmount(inv.total, user?.currency)}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${inv.status === "paid" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setView("preview");
                              }}
                              className="px-2.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-250 text-[10px] font-semibold text-gray-700 rounded-md transition-colors cursor-pointer shadow-sm"
                            >
                              Open Invoice
                            </button>
                            {inv.status === "unpaid" && <button
                              onClick={() => onEditInvoice(inv.id, { status: "paid" })}
                              className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-md transition-colors cursor-pointer border border-green-200"
                              title="Mark Paid"
                            >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>}
                            <button
                              onClick={() => onDeleteInvoice(inv.id)}
                              className="p-1.5 bg-white hover:bg-red-50 border border-gray-250 hover:border-red-200 text-gray-400 hover:text-red-650 rounded-md transition-colors cursor-pointer shadow-sm"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>) : <tr>
                      <td colSpan={7} className="text-center py-16">
                        <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-gray-400">No invoices generated</p>
                        <p className="text-xs text-gray-550 mt-1">Generate a manual invoice or use AI OCR scanning above.</p>
                      </td>
                    </tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>}

      {view === "create" && <div className="space-y-6">
          {
    /* Create Layout Back Button */
  }
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Invoices Hub</span>
          </button>

          {
    /* AI Scanner Dropzone Card */
  }
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm border-l-4 border-l-teal-650 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-teal-850 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-650" />
                  Smart AI Vision Receipt Extraction
                </h3>
                <p className="text-xs text-gray-500 max-w-lg">Drag & drop or upload an existing supplier invoice photo. BizPilot's multimodal OCR will auto-populate the table, item names, cost estimates, and client codes instantly.</p>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleOcrUpload}
                  accept="image/*,application/pdf"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={ocrLoading}
                  className="px-5 py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-gray-100 disabled:text-gray-400 text-xs font-semibold text-white rounded-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  {ocrLoading ? <>
                      <Loader className="w-4 h-4 animate-spin text-teal-200" />
                      <span>Parsing with Gemini OCR...</span>
                    </> : <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload Invoice Snapshot</span>
                    </>}
                </button>
              </div>
            </div>

            {ocrSuccess && <div className="mt-4 p-2.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Gemini OCR successfully extracted parameters! Verify the populated fields below before committing.</span>
              </div>}
          </div>

          {
    /* Form Layout Grid */
  }
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900">Invoice General Parameters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {
    /* Invoice ID and client name */
  }
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-transparent border border-gray-250 rounded-lg py-2 px-3 text-xs focus:border-teal-500 focus:outline-none text-gray-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">Client Business Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cornerstone Energy Ltd"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-transparent border border-gray-250 rounded-lg py-2 px-3 text-xs focus:border-teal-500 focus:outline-none text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">Client Contact Email</label>
                  <input
                    type="email"
                    placeholder="e.g. billing@cornerstone.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-transparent border border-gray-250 rounded-lg py-2 px-3 text-xs focus:border-teal-500 focus:outline-none text-gray-800"
                  />
                </div>
              </div>

              {
    /* Dates and terms */
  }
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-transparent border border-gray-250 rounded-lg py-2 px-3 text-xs focus:border-teal-500 focus:outline-none text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-transparent border border-gray-250 rounded-lg py-2 px-3 text-xs focus:border-teal-500 focus:outline-none text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">Tax Percentage (%)</label>
                  <input
                    type="number"
                    required
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                    className="w-full bg-transparent border border-gray-250 rounded-lg py-2 px-3 text-xs focus:border-teal-500 focus:outline-none text-gray-850"
                  />
                </div>
              </div>
            </div>

            {
    /* Invoice items array editor */
  }
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Billing Line Items</h4>
                  <p className="text-[10px] text-gray-400">Pick products or add manual lines.</p>
                </div>

                <div className="flex items-center gap-3">
                  {
    /* Quick select item dropdown */
  }
                  <select
                    value={quickProduct}
                    onChange={(e) => handleAddQuickProduct(e.target.value)}
                    className="bg-transparent border border-gray-250 rounded-lg text-[10px] py-1.5 px-3 text-gray-700 focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Quick Add SKU...</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({formatAmount(p.price, user?.currency)})</option>)}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[10px] font-semibold text-gray-650 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Row</span>
                  </button>
                </div>
              </div>

              {
    /* Items Table Form */
  }
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/50">
                <table className="w-full text-left text-xs text-gray-700 border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-100/50 text-gray-400 uppercase tracking-wider text-[9px] font-bold">
                      <th className="py-2.5 px-4">Item description</th>
                      <th className="py-2.5 px-4 text-center w-24">Quantity</th>
                      <th className="py-2.5 px-4 text-right w-32">Unit Price ({getCurrencySymbol(user?.currency)})</th>
                      <th className="py-2.5 px-4 text-right w-32">Total ({getCurrencySymbol(user?.currency)})</th>
                      <th className="py-2.5 px-4 text-center w-16">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.length > 0 ? items.map((item) => <tr key={item.id} className="hover:bg-gray-50">
                          <td className="py-2.5 px-4">
                            <input
                              type="text"
                              required
                              placeholder="e.g. 450W Monocrystalline Solar Panel"
                              value={item.name}
                              onChange={(e) => handleUpdateRow(item.id, "name", e.target.value)}
                              className="w-full bg-white border border-gray-250 rounded-lg py-1 px-2.5 text-xs text-gray-800 focus:outline-none focus:border-teal-500"
                            />
                          </td>
                          <td className="py-2.5 px-4">
                            <input
                              type="number"
                              required
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateRow(item.id, "quantity", Number(e.target.value) || 1)}
                              className="w-full bg-white border border-gray-250 rounded-lg py-1 px-2.5 text-xs text-center text-gray-800 focus:outline-none focus:border-teal-500"
                            />
                          </td>
                          <td className="py-2.5 px-4">
                            <input
                              type="number"
                              step="0.01"
                              required
                              value={item.price}
                              onChange={(e) => handleUpdateRow(item.id, "price", Number(e.target.value) || 0)}
                              className="w-full bg-white border border-gray-250 rounded-lg py-1 px-2.5 text-xs text-right text-gray-800 focus:outline-none focus:border-teal-500"
                            />
                          </td>
                          <td className="py-2.5 px-4 text-right font-semibold text-gray-800">{formatAmount(item.total, user?.currency)}</td>
                          <td className="py-2.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(item.id)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>) : <tr>
                        <td colSpan={5} className="text-center py-8 text-[11px] text-gray-400">
                          No items added. Use 'Quick Add SKU' or click 'Add Custom Row' to populate line items.
                        </td>
                      </tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {
    /* Notes */
  }
            <div className="border-t border-gray-200 pt-6">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">Invoice Notes / Terms</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-transparent border border-gray-250 rounded-lg py-2 px-3 text-xs focus:border-teal-500 focus:outline-none text-gray-800 resize-none"
              />
            </div>

            {
    /* Dynamic totals summary bar */
  }
            <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1 text-gray-500 text-xs">
                <p>Subtotal: <span className="font-semibold text-gray-800">{formatAmount(subtotal, user?.currency)}</span></p>
                <p>Tax ({taxRate}%): <span className="font-semibold text-gray-800">{formatAmount(taxAmount, user?.currency)}</span></p>
                <p className="text-sm font-bold text-teal-700">Total Invoice Valuation: {formatAmount(total, user?.currency)}</p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => handleSaveInvoice("unpaid")}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-255 text-xs font-semibold text-gray-700 rounded-lg transition-colors cursor-pointer text-center shadow-sm"
                >
                  Save as Unpaid Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveInvoice("paid")}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-teal-700 hover:bg-teal-850 text-xs font-semibold text-white rounded-lg transition-all shadow-sm cursor-pointer text-center"
                >
                  Record Paid Invoice
                </button>
              </div>
            </div>
          </div>
        </div>}

      {view === "preview" && selectedInvoice && <div className="space-y-6">
          <div className="flex items-center justify-between no-print">
            <button
              onClick={() => setView("list")}
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Invoices Hub</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                id="btn-print-preview"
                onClick={handlePrintPreview}
                className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-250 text-xs font-semibold text-gray-700 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5 text-gray-500" />
                <span>Print Invoice</span>
              </button>
              {selectedInvoice.status === "unpaid" && <button
                onClick={() => {
                  onEditInvoice(selectedInvoice.id, { status: "paid" });
                  setSelectedInvoice({ ...selectedInvoice, status: "paid" });
                }}
                className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-850 text-xs font-semibold text-white rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark as Settled</span>
                </button>}
            </div>
          </div>

          {
    /* Renderable Print Area Panel */
  }
          <div id="print-area" className="bg-white border border-gray-200 rounded-lg p-8 max-w-3xl mx-auto shadow-sm relative space-y-8 text-gray-800">
            <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-teal-700 to-transparent no-print" />
            
            {
    /* Invoice Top Header logo and details */
  }
            <div className="flex justify-between items-start gap-6 border-b border-gray-200 pb-8">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-700 font-mono block">Invoice Document</span>
                <h3 className="text-xl font-display font-bold text-gray-900">{user.businessName}</h3>
                <p className="text-xs text-gray-500">{user.businessType}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>

              <div className="text-right space-y-1 font-mono text-xs">
                <p className="text-sm font-bold text-teal-850">{selectedInvoice.invoiceNumber}</p>
                <p className="text-gray-500">Issue Date: {selectedInvoice.issueDate}</p>
                <p className="text-gray-500">Due Date: {selectedInvoice.dueDate}</p>
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${selectedInvoice.status === "paid" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                  {selectedInvoice.status}
                </span>
              </div>
            </div>

            {
    /* Billing addresses */
  }
            <div className="grid grid-cols-2 gap-6 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-2">Billed From:</span>
                <p className="font-semibold text-gray-900">{user.businessName}</p>
                <p className="text-gray-550 mt-0.5">Account executive: {user.name}</p>
                <p className="text-gray-450">{user.email}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-2">Billed To:</span>
                <p className="font-semibold text-gray-900">{selectedInvoice.clientName}</p>
                <p className="text-gray-550 mt-0.5">Billing: {selectedInvoice.clientEmail || "Contact not provided"}</p>
              </div>
            </div>

            {
    /* Line items details table */
  }
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Line item breakdown:</span>
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/50">
                <table className="w-full text-left text-xs text-gray-700 border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-100/50 text-gray-400 uppercase tracking-wider text-[9px] font-bold">
                      <th className="py-2.5 px-4">Item Name</th>
                      <th className="py-2.5 px-4 text-center w-24">Qty</th>
                      <th className="py-2.5 px-4 text-right w-32">Unit Price</th>
                      <th className="py-2.5 px-4 text-right w-32">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                    {selectedInvoice.items.map((item, index) => <tr key={index}>
                        <td className="py-3 px-4 font-sans text-xs text-gray-800 font-medium">{item.name}</td>
                        <td className="py-3 px-4 text-center text-gray-600">{item.quantity}</td>
                        <td className="py-3 px-4 text-right text-gray-600">{formatAmount(item.price, user?.currency)}</td>
                        <td className="py-3 px-4 text-right font-bold text-gray-900">{formatAmount(item.total, user?.currency)}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </div>

            {
    /* Summaries & footer terms */
  }
            <div className="pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-t border-gray-200">
              <div className="space-y-1.5 text-xs max-w-sm">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Declaration / Notes:</span>
                <p className="text-gray-500 italic leading-relaxed text-[11px]">{selectedInvoice.notes || "Standard Net payment terms. Thank you."}</p>
              </div>

              <div className="space-y-2 text-right text-xs shrink-0 w-full sm:w-64 font-mono">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-400 font-sans">Subtotal:</span>
                  <span className="text-gray-700">{formatAmount(selectedInvoice.subtotal, user?.currency)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-400 font-sans">Tax ({selectedInvoice.taxRate}%):</span>
                  <span className="text-gray-700">{formatAmount(selectedInvoice.taxAmount, user?.currency)}</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-sm">
                  <span className="text-gray-500 font-sans text-xs">Grand Total:</span>
                  <span className="text-teal-700 font-sans text-sm">{formatAmount(selectedInvoice.total, user?.currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>}

    </div>;
}
