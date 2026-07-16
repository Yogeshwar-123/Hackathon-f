import { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Loader,
  FileText,
  Plus,
  BookOpen,
  Calendar
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { formatAmount, getCurrencySymbol } from "../types";
export default function Reports({ user, reports, transactions, onAddTransaction, onCompileReport, compileLoading }) {
  const [activeTab, setActiveTab] = useState("ledger");
  const [selectedReport, setSelectedReport] = useState(null);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txDescription, setTxDescription] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState("revenue");
  const [txCategory, setTxCategory] = useState("Sales Inflow");
  const [txDate, setTxDate] = useState((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  const handleSaveTransaction = (e) => {
    e.preventDefault();
    if (!txDescription || !txAmount) {
      alert("Please fill out description and amount.");
      return;
    }
    onAddTransaction({
      description: txDescription,
      amount: Number(txAmount) || 0,
      type: txType,
      category: txCategory,
      date: txDate
    });
    setTxModalOpen(false);
    setTxDescription("");
    setTxAmount("");
    setTxType("revenue");
    setTxCategory("Sales Inflow");
  };
  const handleTriggerCompileReport = async () => {
    try {
      await onCompileReport();
      if (reports.length > 0) {
        setSelectedReport(reports[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };
  return <div className="space-y-8 animate-fade-in relative">
      
      {
    /* Page Header */
  }
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400 font-mono">Ledger Reconcile & Advisory</span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">Audit Ledger & Reports</h1>
          <p className="text-xs text-slate-400 mt-1">Synthesize strategic trade summaries and ledger reconciliations instantly.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
    id="btn-add-tx"
    onClick={() => setTxModalOpen(true)}
    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
  >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Cash Flow</span>
          </button>
          
          <button
    id="btn-trigger-compile"
    onClick={handleTriggerCompileReport}
    disabled={compileLoading}
    className="vibrant-btn text-xs font-bold text-white px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
  >
            {compileLoading ? <>
                <Loader className="w-4 h-4 animate-spin text-emerald-200" />
                <span>Generating Report...</span>
              </> : <>
                <Sparkles className="w-4 h-4" />
                <span>Compile New Advisory Report</span>
              </>}
          </button>
        </div>
      </div>

      {
    /* Tabs navigation */
  }
      <div className="flex gap-4 border-b border-slate-900">
        <button
    onClick={() => setActiveTab("ledger")}
    className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative ${activeTab === "ledger" ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"}`}
  >
          Transaction Ledger Book
          {activeTab === "ledger" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />}
        </button>
        <button
    onClick={() => {
      setActiveTab("reports");
      if (reports.length > 0 && !selectedReport) {
        setSelectedReport(reports[0]);
      }
    }}
    className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative ${activeTab === "reports" ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"}`}
  >
          AI Executive Advisory Summaries ({reports.length})
          {activeTab === "reports" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />}
        </button>
      </div>

      {activeTab === "ledger" && <div className="glass-card rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Double-Entry Cash Books</h3>
              <p className="text-[11px] text-slate-500">Live operational inflows and procurement expenses.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/20 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-4 px-6">Reconciled Date</th>
                  <th className="py-4 px-4">Ledger description</th>
                  <th className="py-4 px-4">Operational Category</th>
                  <th className="py-4 px-4 text-right">Inflow ({getCurrencySymbol(user?.currency)})</th>
                  <th className="py-4 px-4 text-right">Outflow ({getCurrencySymbol(user?.currency)})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-mono text-[11px]">
                {transactions.map((tx) => <tr key={tx.id} className="hover:bg-slate-900/10">
                    <td className="py-3.5 px-6 text-slate-400">{tx.date}</td>
                    <td className="py-3.5 px-4 font-sans text-xs text-slate-200 font-medium">{tx.description}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-1.5 py-0.5 bg-slate-900 text-slate-400 border border-slate-800 rounded text-[10px] font-medium uppercase tracking-wider">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                      {tx.type === "revenue" ? formatAmount(tx.amount, user?.currency) : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-rose-400">
                      {tx.type === "expense" ? formatAmount(tx.amount, user?.currency) : "-"}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>}

      {activeTab === "reports" && <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {
    /* Historical reports checklist sidebar */
  }
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider">Historical Summaries Archive</h3>
            
            <div className="space-y-3">
              {reports.length > 0 ? reports.map((rep) => {
    const isActive = selectedReport?.id === rep.id;
    return <div
      key={rep.id}
      onClick={() => setSelectedReport(rep)}
      className={`p-4 border rounded-xl cursor-pointer transition-all space-y-2 ${isActive ? "bg-slate-900 border-emerald-500/50 shadow-md shadow-emerald-600/5" : "bg-slate-900/30 border-slate-850 hover:bg-slate-900/50"}`}
    >
                      <div className="flex items-center gap-2 text-emerald-400">
                        <FileText className="w-4 h-4" />
                        <h4 className="text-xs font-bold truncate">{rep.title}</h4>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Compiled {rep.date}</span>
                      </div>
                    </div>;
  }) : <div className="p-6 text-center border border-slate-900 bg-slate-950/20 rounded-xl">
                  <BookOpen className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">No Advisory Reports Compiled</p>
                  <p className="text-[10px] text-slate-600 mt-1">Generate your first strategic brief with the top-right CTA.</p>
                </div>}
            </div>
          </div>

          {
    /* Detailed view of currently selected report */
  }
          <div className="lg:col-span-2 space-y-4">
            {selectedReport ? <div className="glass-card rounded-2xl p-8 relative space-y-6 shadow-2xl">
                <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                
                <div className="flex justify-between items-start gap-4 border-b border-slate-800/60 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono">Operations Audit brief</span>
                    <h2 className="text-xl font-display font-bold text-slate-100 mt-1">{selectedReport.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Parameters: All live ledger entries as of {selectedReport.date}.</p>
                  </div>
                </div>

                {
    /* Render report markdown content */
  }
                <div className="markdown-body leading-relaxed text-slate-300 text-xs sm:text-sm space-y-2">
                  <ReactMarkdown>{selectedReport.content}</ReactMarkdown>
                </div>
              </div> : <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-16 text-center">
                <FileText className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-500">No report selected</p>
                <p className="text-xs text-slate-600 mt-1">Select an advisory summary brief from the archives panel.</p>
              </div>}
          </div>

        </div>}

      {
    /* Manual Cash Flow Transaction Entry Modal Overlay */
  }
      {txModalOpen && <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
            
            <div className="p-6 border-b border-slate-850 flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-base text-slate-200 font-semibold">Record Manual Cash Flow</h3>
                <p className="text-[11px] text-slate-500 font-medium">Direct double-entry ledger update.</p>
              </div>
              <button
    onClick={() => setTxModalOpen(false)}
    className="text-slate-500 hover:text-slate-300 transition-colors font-bold text-sm"
  >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-6 space-y-4">
              {
    /* Type toggle */
  }
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Transaction Type</label>
                <div className="grid grid-cols-2 gap-3 bg-slate-950 p-1 rounded-xl border border-slate-850">
                  <button
    type="button"
    onClick={() => {
      setTxType("revenue");
      setTxCategory("Sales Inflow");
    }}
    className={`py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${txType === "revenue" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-slate-400"}`}
  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Revenue Inflow</span>
                  </button>
                  <button
    type="button"
    onClick={() => {
      setTxType("expense");
      setTxCategory("Procurement Expense");
    }}
    className={`py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${txType === "expense" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "text-slate-400"}`}
  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Expense Outflow</span>
                  </button>
                </div>
              </div>

              {
    /* Description */
  }
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Ledger Description</label>
                <input
    type="text"
    required
    placeholder="e.g. Counter rental payment"
    value={txDescription}
    onChange={(e) => setTxDescription(e.target.value)}
    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs focus:border-purple-500 focus:outline-none text-slate-200"
  />
              </div>

              {
    /* Amount & Category */
  }
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Cash Value ({getCurrencySymbol(user?.currency)})</label>
                  <input
    type="number"
    step="0.01"
    required
    placeholder="450.00"
    value={txAmount}
    onChange={(e) => setTxAmount(e.target.value)}
    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs focus:border-purple-500 focus:outline-none text-slate-200"
  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Ledger Category</label>
                  <input
    type="text"
    placeholder="e.g. Sales Inflow"
    value={txCategory}
    onChange={(e) => setTxCategory(e.target.value)}
    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs focus:border-purple-500 focus:outline-none text-slate-200"
  />
                </div>
              </div>

              {
    /* Date */
  }
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Transaction Date</label>
                <input
    type="date"
    required
    value={txDate}
    onChange={(e) => setTxDate(e.target.value)}
    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs focus:border-purple-500 focus:outline-none text-slate-300"
  />
              </div>

              {
    /* Submit */
  }
              <button
    type="submit"
    className="w-full vibrant-btn py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
  >
                <span>Commit Ledger Record</span>
              </button>
            </form>
          </div>
        </div>}

    </div>;
}
