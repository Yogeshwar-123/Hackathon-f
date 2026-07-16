import { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  AlertTriangle,
  Activity,
  CheckCircle,
  Calendar,
  ChevronRight,
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Cpu,
  Percent,
  Briefcase,
  Loader,
  Bell,
  BarChart as BarIcon,
  HelpCircle
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { formatAmount, getCurrencySymbol } from "../types";

const copilotThemeStyles = {
  cosmic: {
    accentText: "text-purple-400",
    accentBg: "bg-purple-500/10 border-purple-500/20",
    btnAccent: "bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 text-white shadow-purple-600/20 hover:from-purple-500 hover:to-cyan-400",
    textGradient: "from-purple-400 via-indigo-400 to-cyan-400",
    chartColor: "#a855f7",
    chartSecondary: "#06b6d4"
  },
  emerald: {
    accentText: "text-emerald-400",
    accentBg: "bg-emerald-500/10 border-emerald-500/20",
    btnAccent: "bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 text-white shadow-emerald-600/20 hover:from-emerald-500 hover:to-amber-400",
    textGradient: "from-emerald-400 via-teal-400 to-amber-300",
    chartColor: "#10b981",
    chartSecondary: "#f59e0b"
  },
  copper: {
    accentText: "text-amber-400",
    accentBg: "bg-amber-500/10 border-amber-500/20",
    btnAccent: "bg-gradient-to-tr from-amber-600 via-orange-600 to-yellow-500 text-white shadow-amber-600/20 hover:from-amber-500 hover:to-yellow-400",
    textGradient: "from-amber-400 via-orange-400 to-yellow-300",
    chartColor: "#f59e0b",
    chartSecondary: "#ef4444"
  },
  lagoon: {
    accentText: "text-blue-400",
    accentBg: "bg-blue-500/10 border-blue-500/20",
    btnAccent: "bg-gradient-to-tr from-blue-600 via-cyan-600 to-teal-500 text-white shadow-blue-600/20 hover:from-blue-500 hover:to-teal-400",
    textGradient: "from-blue-400 via-cyan-400 to-teal-400",
    chartColor: "#3b82f6",
    chartSecondary: "#14b8a6"
  }
};

const priorityPulseColors = {
  high: "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)] animate-pulse",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
  low: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
};

export default function Copilot({ user, products, invoices, transactions, theme = "cosmic" }) {
  const [activeTab, setActiveTab] = useState("summary");
  const styles = copilotThemeStyles[theme] || copilotThemeStyles.cosmic;

  // State collections
  const [healthData, setHealthData] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [inventoryOpts, setInventoryOpts] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [profitabilityData, setProfitabilityData] = useState(null);
  const [profitabilityLoading, setProfitabilityLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);

  // Recommendations
  const [recs, setRecs] = useState([]);
  const [recsLoading, setRecsLoading] = useState(true);

  // Forecast state
  const [selectedProductId, setSelectedProductId] = useState("");
  const [demandForecast, setDemandForecast] = useState(null);
  const [demandLoading, setDemandLoading] = useState(false);
  const [revenueForecast, setRevenueForecast] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenuePeriod, setRevenuePeriod] = useState("week");

  // Expense analysis state
  const [expenseAnalysis, setExpenseAnalysis] = useState(null);
  const [expenseLoading, setExpenseLoading] = useState(true);
  const [testDesc, setTestDesc] = useState("");
  const [testAmount, setTestAmount] = useState("");
  const [testCategory, setTestCategory] = useState("");
  const [categorizeLoading, setCategorizeLoading] = useState(false);

  // Goals State
  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoalType, setNewGoalType] = useState("revenue");
  const [newGoalTarget, setNewGoalTarget] = useState("");

  // Load initial summary and health data
  useEffect(() => {
    fetchHealthScore();
    fetchInventoryOpts();
    fetchProfitability();
    fetchNotifications();
    fetchExpenseAnalysis();
    fetchGoals();
    fetchRevenueForecast();
  }, []);

  // Fetch functions
  const fetchHealthScore = async () => {
    setHealthLoading(true);
    setRecsLoading(true);
    try {
      const res = await fetch("/api/health-score");
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
        // Call recommendations right after health score completes
        fetchRecommendations(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHealthLoading(false);
    }
  };

  const fetchRecommendations = async (healthMetrics) => {
    try {
      const res = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(healthMetrics)
      });
      if (res.ok) {
        const data = await res.json();
        setRecs(data.recommendations);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRecsLoading(false);
    }
  };

  const fetchInventoryOpts = async () => {
    setInventoryLoading(true);
    try {
      const res = await fetch("/api/inventory/optimization");
      if (res.ok) {
        const data = await res.json();
        setInventoryOpts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchProfitability = async () => {
    setProfitabilityLoading(true);
    try {
      const res = await fetch("/api/analytics/profitability");
      if (res.ok) {
        const data = await res.json();
        setProfitabilityData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProfitabilityLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setNotifLoading(false);
    }
  };

  const fetchRevenueForecast = async () => {
    setRevenueLoading(true);
    try {
      const res = await fetch(`/api/forecast/revenue?period=${revenuePeriod}`);
      if (res.ok) {
        const data = await res.json();
        setRevenueForecast(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRevenueLoading(false);
    }
  };

  // Re-fetch revenue forecast if period changes
  useEffect(() => {
    fetchRevenueForecast();
  }, [revenuePeriod]);

  const fetchExpenseAnalysis = async () => {
    setExpenseLoading(true);
    try {
      const res = await fetch("/api/expense/analysis");
      if (res.ok) {
        const data = await res.json();
        setExpenseAnalysis(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExpenseLoading(false);
    }
  };

  const fetchGoals = async () => {
    setGoalsLoading(true);
    try {
      const res = await fetch("/api/goals");
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGoalsLoading(false);
    }
  };

  // Load demand forecast for selected product
  useEffect(() => {
    if (!selectedProductId) {
      setDemandForecast(null);
      return;
    }
    const loadDemand = async () => {
      setDemandLoading(true);
      try {
        const res = await fetch(`/api/forecast/demand/${selectedProductId}`);
        if (res.ok) {
          const data = await res.json();
          setDemandForecast(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setDemandLoading(false);
      }
    };
    loadDemand();
  }, [selectedProductId]);

  // Set default product selected
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products]);

  // Expense Sandbox Categorize
  const handleCategorizeExpense = async (e) => {
    e.preventDefault();
    if (!testDesc) return;
    setCategorizeLoading(true);
    setTestCategory("");
    try {
      const res = await fetch("/api/expense/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: testDesc, amount: Number(testAmount) || 0 })
      });
      if (res.ok) {
        const data = await res.json();
        setTestCategory(data.category);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCategorizeLoading(false);
    }
  };

  // Business Goals CRUD
  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoalTarget) return;
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: newGoalType, target: Number(newGoalTarget), period: "month" })
      });
      if (res.ok) {
        setShowAddGoalModal(false);
        setNewGoalTarget("");
        fetchGoals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!confirm("Are you sure you want to delete this business goal?")) return;
    try {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchGoals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Format Recharts Forecast Data
  const forecastChartData = useMemo(() => {
    if (!demandForecast || demandForecast.error) return [];
    
    const hist = demandForecast.historical.map(h => ({
      date: h.date.substring(5),
      historical: h.quantity,
      predicted: null
    }));
    
    const lastHist = hist[hist.length - 1];
    const pred = demandForecast.predicted.map((p, idx) => ({
      date: p.date.substring(5),
      historical: idx === 0 && lastHist ? lastHist.historical : null,
      predicted: p.quantity
    }));

    return [...hist.slice(-20), ...pred];
  }, [demandForecast]);

  const revenueChartData = useMemo(() => {
    if (!revenueForecast) return [];
    
    const hist = revenueForecast.historical.map(h => ({
      label: h.label,
      historical: h.amount,
      predicted: null
    }));
    
    const lastHist = hist[hist.length - 1];
    const pred = revenueForecast.predicted.map((p, idx) => ({
      label: p.label,
      historical: idx === 0 && lastHist ? lastHist.historical : null,
      predicted: p.amount
    }));

    return [...hist.slice(-10), ...pred];
  }, [revenueForecast]);

  return (
    <div className="space-y-8 animate-fade-in relative pb-12" id="copilot-container">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className={`text-xs uppercase font-bold tracking-widest ${styles.accentText} font-mono flex items-center gap-1.5`}>
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            AI Operations Advisor
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Executive Copilot Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Machine learning forecasting, AI decision auditing, and real-time business health indicators.
          </p>
        </div>
        <button
          onClick={fetchHealthScore}
          className={`${styles.btnAccent} px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md`}
        >
          <Cpu className="w-4 h-4" />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-4 overflow-x-auto border-b border-slate-800/40 scrollbar-none">
        <button
          onClick={() => setActiveTab("summary")}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative shrink-0 ${activeTab === "summary" ? styles.accentText : "text-slate-500 hover:text-slate-300"}`}
        >
          Executive Summary
          {activeTab === "summary" && <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${styles.textGradient} rounded-full`} />}
        </button>
        <button
          onClick={() => setActiveTab("forecasting")}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative shrink-0 ${activeTab === "forecasting" ? styles.accentText : "text-slate-500 hover:text-slate-300"}`}
        >
          Predictive Forecasting
          {activeTab === "forecasting" && <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${styles.textGradient} rounded-full`} />}
        </button>
        <button
          onClick={() => setActiveTab("profitability")}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative shrink-0 ${activeTab === "profitability" ? styles.accentText : "text-slate-500 hover:text-slate-300"}`}
        >
          Profitability & Expenses
          {activeTab === "profitability" && <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${styles.textGradient} rounded-full`} />}
        </button>
        <button
          onClick={() => setActiveTab("goals")}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative shrink-0 ${activeTab === "goals" ? styles.accentText : "text-slate-500 hover:text-slate-300"}`}
        >
          Business Goals ({goals.length})
          {activeTab === "goals" && <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${styles.textGradient} rounded-full`} />}
        </button>
      </div>

      {/* Summary Tab */}
      {activeTab === "summary" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Health Score radial gauge */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-between text-center min-h-[380px]">
            <div className="w-full text-left">
              <h3 className="text-sm font-bold text-slate-200">System Health Score</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-0.5">Weighted composite rating</p>
            </div>

            {healthLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-indigo-400" />
                <span className="text-xs text-slate-500 mt-3">Synthesizing metrics...</span>
              </div>
            ) : (
              <div className="relative my-4 flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="68" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke={`url(#healthGradient-${theme})`}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 68}
                    strokeDashoffset={2 * Math.PI * 68 * (1 - (healthData?.score || 50) / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id={`healthGradient-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="60%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display font-bold text-4xl text-white">{healthData?.score}%</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">Overall Status</span>
                </div>
              </div>
            )}

            {/* Sub-metric progress bars */}
            <div className="w-full space-y-3 mt-4">
              {[
                { label: "Sales Trend (25%)", val: healthData?.breakdown?.sales || 0, color: "bg-emerald-500" },
                { label: "Profit Margin (25%)", val: healthData?.breakdown?.profit || 0, color: "bg-teal-500" },
                { label: "Inventory Turnover (20%)", val: healthData?.breakdown?.inventory || 0, color: "bg-indigo-500" },
                { label: "Net Cash Flow (20%)", val: healthData?.breakdown?.cashflow || 0, color: "bg-purple-500" },
                { label: "Overdue Payments (10%)", val: healthData?.breakdown?.payments || 0, color: "bg-rose-500" }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-300">
                    <span>{item.label}</span>
                    <span>{item.val}%</span>
                  </div>
                  <div className="w-full bg-slate-950/60 h-1 rounded-full overflow-hidden border border-slate-900">
                    <div className={`${item.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${item.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Advisory recommendations */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="glass-card p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 text-indigo-500/5 pointer-events-none">
                <Sparkles className="w-20 h-20" />
              </div>
              <div className="flex gap-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl h-fit">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">AI Advisory Synthesis</h4>
                  <p className="text-[12px] text-slate-300 mt-1 leading-relaxed italic">
                    "{healthLoading ? "Synthesizing operations ledger..." : healthData?.explanation}"
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col">
              <h3 className="text-sm font-bold text-slate-200">Action Recommendations</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">High-priority operational suggestions derived by AI</p>

              {recsLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12">
                  <Loader className="w-6 h-6 animate-spin text-indigo-400" />
                  <span className="text-xs text-slate-500 mt-2">Consulting advisor model...</span>
                </div>
              ) : (
                <div className="space-y-4 mt-5 flex-1 overflow-y-auto max-h-[300px] pr-2">
                  {recs.map((rec, idx) => (
                    <div key={idx} className="glass-card p-4 rounded-xl border border-slate-800/85 hover:border-indigo-500/20 flex justify-between items-start gap-4 hover:translate-x-0.5 transition-transform duration-200">
                      <div className="flex gap-3">
                        <div className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-lg border h-fit shrink-0 ${priorityPulseColors[rec.priority.toLowerCase()] || priorityPulseColors.low}`}>
                          {rec.priority}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-100">{rec.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-1">{rec.reason}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 self-center" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active alerts */}
          <div className="lg:col-span-3 glass-panel p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Smart Operations Monitor</h3>
                <p className="text-[11px] text-slate-500">Live background system events and triggers</p>
              </div>
              <Bell className="w-4 h-4 text-slate-500" />
            </div>

            {notifLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader className="w-5 h-5 animate-spin text-slate-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notifications.length === 0 ? (
                  <div className="col-span-2 py-6 text-center text-xs text-slate-500">
                    All background operations parameters are healthy. No active flags.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl flex gap-3 items-start">
                      <div className={`p-1.5 rounded-lg h-fit ${
                        notif.severity === "error" ? "bg-red-500/10 text-red-400 border border-red-500/25" :
                        notif.severity === "warning" ? "bg-amber-500/10 text-amber-400 border border-amber-500/25" :
                        "bg-blue-500/10 text-blue-400 border border-blue-500/25"
                      }`}>
                        {notif.severity === "error" ? <AlertTriangle className="w-3.5 h-3.5" /> :
                         notif.severity === "warning" ? <AlertTriangle className="w-3.5 h-3.5" /> :
                         <CheckCircle className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-200 leading-snug">{notif.message}</p>
                        <p className="text-[9px] text-slate-500 mt-1">{new Date(notif.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Forecasting Tab */}
      {activeTab === "forecasting" && (
        <div className="space-y-8">
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Predictive Product Demand</h3>
                <p className="text-[11px] text-slate-500 font-medium">Smoothed daily units history vs next 30-day extrapolated trend line</p>
              </div>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl text-xs px-3 py-2 text-slate-300 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-auto cursor-pointer"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {demandLoading ? (
              <div className="h-[280px] flex flex-col items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-indigo-500" />
                <span className="text-xs text-slate-500 mt-3">Computing polyfit extrapolation...</span>
              </div>
            ) : demandForecast?.error ? (
              <div className="h-[280px] flex flex-col items-center justify-center text-center">
                <AlertTriangle className="w-10 h-10 text-amber-500 opacity-60" />
                <h4 className="text-xs font-bold text-slate-300 mt-3">Insufficient Transaction History</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                  This product has less than 14 days of sales history. Seed more invoices to calculate demand.
                </p>
              </div>
            ) : (
              <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                    <ChartTooltip
                      contentStyle={{ backgroundColor: "#0f172a", border: `1px solid ${styles.chartColor}40`, borderRadius: "12px", fontSize: "11px" }}
                      itemStyle={{ color: "#f8fafc" }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                    <Line
                      type="monotone"
                      dataKey="historical"
                      stroke={styles.chartColor}
                      strokeWidth={2}
                      dot={false}
                      name="Historical Sales (7d moving avg)"
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke={styles.chartSecondary}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                      name="Predictive Linear Forecast"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Reconciled Revenue Forecast</h3>
                  <p className="text-[11px] text-slate-500 font-medium font-sans">Aggregate sales revenue projected over coming periods</p>
                </div>
                <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setRevenuePeriod("week")}
                    className={`text-[9px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${revenuePeriod === "week" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setRevenuePeriod("month")}
                    className={`text-[9px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${revenuePeriod === "month" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {revenueLoading ? (
                <div className="h-[220px] flex items-center justify-center">
                  <Loader className="w-6 h-6 animate-spin text-indigo-500" />
                </div>
              ) : (
                <div className="w-full h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={styles.chartColor} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={styles.chartColor} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={styles.chartSecondary} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={styles.chartSecondary} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                      <XAxis dataKey="label" stroke="#64748b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                      <ChartTooltip
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", fontSize: "11px" }}
                        formatter={(val) => [formatAmount(val, user?.currency), "Revenue"]}
                      />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                      <Area type="monotone" dataKey="historical" stroke={styles.chartColor} strokeWidth={2} fillOpacity={1} fill="url(#colorHist)" name="Historical Revenue" />
                      <Area type="monotone" dataKey="predicted" stroke={styles.chartSecondary} strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPred)" name="Forecast Trend" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h4 className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">Future Sales Run Rate</h4>
                <p className="text-[11px] text-slate-400 mt-1">Projected revenue inflows next 7 days</p>
              </div>
              <div className="my-4">
                {revenueLoading ? (
                  <span className="text-xl text-slate-500 animate-pulse">Calculating...</span>
                ) : (
                  <span className="font-display font-bold text-3xl text-slate-100 block">
                    {formatAmount(revenueForecast?.projected_revenue || 0, user?.currency)}
                  </span>
                )}
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Forecast positive</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal border-t border-slate-800 pt-3">
                Extrapolations are calculated using daily linear regression coefficients. Actual results may vary due to seasonality.
              </p>
            </div>
          </div>

          {/* Replenishment Optimizer */}
          <div className="glass-panel p-6 rounded-2xl animate-fade-in">
            <h3 className="text-sm font-bold text-slate-200">Smart Inventory Replenishment</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Automated reordering schedule based on demand velocity and safety stocks</p>

            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/30 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-4 px-4">Item Name</th>
                    <th className="py-4 px-2 text-right">Stock Level</th>
                    <th className="py-4 px-2 text-right">Min Buffer</th>
                    <th className="py-4 px-2 text-right">Avg Daily Sold</th>
                    <th className="py-4 px-2 text-right">Days left</th>
                    <th className="py-4 px-2">Action Required</th>
                    <th className="py-4 px-2 text-right">Suggested Qty</th>
                    <th className="py-4 px-4 text-right">Reorder Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-[11px] font-mono">
                  {inventoryLoading ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center">
                        <Loader className="w-5 h-5 animate-spin mx-auto text-slate-500" />
                      </td>
                    </tr>
                  ) : (
                    inventoryOpts.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/10">
                        <td className="py-3.5 px-4 font-sans text-xs text-slate-200 font-semibold">{item.name}</td>
                        <td className="py-3.5 px-2 text-right font-bold text-slate-300">{item.currentStock}</td>
                        <td className="py-3.5 px-2 text-right text-slate-500">{item.minStock}</td>
                        <td className="py-3.5 px-2 text-right text-slate-300 font-bold">{item.avgDailyDemand}</td>
                        <td className="py-3.5 px-2 text-right">
                          <span className={`font-bold ${item.daysUntilStockout <= 10 ? "text-red-400" : "text-slate-400"}`}>
                            {item.daysUntilStockout}
                          </span>
                        </td>
                        <td className="py-3.5 px-2">
                          {item.restock ? (
                            <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded font-bold text-[9px] uppercase tracking-wide">
                              Restock Trigger
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold text-[9px] uppercase tracking-wide">
                              Healthy
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-2 text-right font-bold text-slate-300">
                          {item.suggestedQty > 0 ? item.suggestedQty : "-"}
                        </td>
                        <td className={`py-3.5 px-4 text-right font-semibold ${item.reorderByDate === "Immediate" ? "text-red-400" : "text-slate-400"}`}>
                          {item.reorderByDate}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Profitability & Expenses Tab */}
      {activeTab === "profitability" && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-slate-200">Product Profit Yields</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Absolute profits (Revenue - Cost) realized per product</p>
              
              {profitabilityLoading ? (
                <div className="h-[220px] flex items-center justify-center">
                  <Loader className="w-6 h-6 animate-spin text-indigo-500" />
                </div>
              ) : (
                <div className="w-full h-[220px] mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profitabilityData?.mostProfitableProducts || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                      <ChartTooltip
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", fontSize: "11px" }}
                        formatter={(val) => [formatAmount(val, user?.currency), "Profit"]}
                      />
                      <Bar dataKey="profit" fill={styles.chartColor} radius={[6, 6, 0, 0]}>
                        {(profitabilityData?.mostProfitableProducts || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? styles.chartColor : styles.chartSecondary} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Profitability Ranking</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Top performing products by margin</p>
              </div>

              <div className="space-y-4 my-6 flex-1 overflow-y-auto max-h-[180px]">
                {profitabilityLoading ? (
                  <div className="py-12 flex justify-center"><Loader className="w-5 h-5 animate-spin text-slate-600" /></div>
                ) : (
                  (profitabilityData?.mostProfitableProducts || []).map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="min-w-0 flex-1 pr-3">
                        <span className="text-xs font-semibold text-slate-200 truncate block">{p.name}</span>
                        <span className="text-[9px] font-mono text-slate-500">{p.quantitySold} units sold</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-200 font-mono block">{formatAmount(p.profit, user?.currency)}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold font-mono">{p.margin}% margin</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <p className="text-[10px] text-slate-500 border-t border-slate-800 pt-3">
                Margins are computed as net earnings over gross item revenues.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sandbox */}
            <div className="glass-panel p-6 rounded-2xl">
              <span className={`text-[10px] uppercase font-bold tracking-widest ${styles.accentText} font-mono flex items-center gap-1.5`}>
                <Cpu className="w-3.5 h-3.5" />
                Category Sandbox
              </span>
              <h3 className="text-sm font-bold text-slate-200 mt-1">Expense Categorization</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Test the AI expense classification model below</p>

              <form onSubmit={handleCategorizeExpense} className="space-y-4 mt-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Description</label>
                  <input
                    type="text"
                    required
                    value={testDesc}
                    onChange={(e) => setTestDesc(e.target.value)}
                    placeholder="e.g. Purchased silicon cells from Waaree or Electric grid fees"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs px-3.5 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Amount</label>
                  <input
                    type="number"
                    value={testAmount}
                    onChange={(e) => setTestAmount(e.target.value)}
                    placeholder="Optional amount"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs px-3.5 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={categorizeLoading}
                  className={`${styles.btnAccent} w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md`}
                >
                  {categorizeLoading ? <Loader className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4" />}
                  <span>Classify Expense</span>
                </button>
              </form>

              {testCategory && (
                <div className="mt-5 p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Classified Category:</span>
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded font-bold text-xs uppercase font-mono">
                    {testCategory}
                  </span>
                </div>
              )}
            </div>

            {/* spend analysis */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Expense Analysis</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Breakdown of operational spend and flags</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 flex-1">
                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                  {expenseLoading ? (
                    <div className="py-12 text-center"><Loader className="w-5 h-5 animate-spin mx-auto text-slate-600" /></div>
                  ) : (
                    expenseAnalysis?.categoryTotals.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">{item.category}</span>
                        <div className="text-right">
                          <span className="font-bold text-slate-200 font-mono">{formatAmount(item.amount, user?.currency)}</span>
                          <span className="text-[10px] text-slate-500 block font-semibold">{item.percentage}% of total</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="bg-slate-950/30 p-4 border border-slate-900 rounded-xl space-y-4 max-h-[180px] overflow-y-auto pr-1">
                  <h4 className="text-[10px] text-amber-500 font-bold uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Cost optimization flags
                  </h4>
                  {expenseLoading ? (
                    <span className="text-xs text-slate-600 animate-pulse block">Analyzing...</span>
                  ) : expenseAnalysis?.opportunities.length === 0 ? (
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      All category expenditures are within healthy parameters.
                    </p>
                  ) : (
                    expenseAnalysis?.opportunities.map((opp, idx) => (
                      <div key={idx} className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                        <p className="text-[11px] text-amber-200 leading-normal font-sans font-medium">{opp.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <p className="text-[10px] text-slate-500 border-t border-slate-800 pt-3">
                Rent and Salaries are considered fixed overheads and excluded from efficiency calculations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === "goals" && (
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Business Milestones Tracker</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Configure and audit monthly target achievements from actual data</p>
            </div>
            <button
              onClick={() => setShowAddGoalModal(true)}
              className={`${styles.btnAccent} px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md`}
            >
              <Plus className="w-4 h-4" />
              <span>New Goal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {goalsLoading ? (
              <div className="col-span-2 py-12 text-center">
                <Loader className="w-6 h-6 animate-spin mx-auto text-slate-500" />
              </div>
            ) : goals.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No business goals are currently set. Set a goal to track performance progress.
              </div>
            ) : (
              goals.map((g) => {
                const percent = Math.min(100, Math.round((g.currentValue / g.target) * 100));
                
                return (
                  <div key={g.id} className="glass-card p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between min-h-[160px]">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-xl h-fit border ${
                          g.type === "revenue" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" :
                          g.type === "profit" ? "bg-teal-500/10 text-teal-400 border-teal-500/25" :
                          "bg-purple-500/10 text-purple-400 border-purple-500/25"
                        }`}>
                          {g.type === "revenue" ? <DollarSign className="w-4 h-4" /> :
                           g.type === "profit" ? <TrendingUp className="w-4 h-4" /> :
                           <Briefcase className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200 capitalize">{g.type} Achievement</h4>
                          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Monthly target</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(g.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="my-4">
                      <div className="flex justify-between text-[11px] font-bold font-mono text-slate-300 mb-1.5">
                        <span>
                          {g.type === "sales" ? `${g.currentValue} units` : formatAmount(g.currentValue, user?.currency)}
                        </span>
                        <span className="text-slate-500">
                          / {g.type === "sales" ? `${g.target} units` : formatAmount(g.target, user?.currency)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            percent >= 100 ? "bg-emerald-500" :
                            percent >= 50 ? "bg-indigo-500" : "bg-purple-500"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400">
                      <span>{percent}% Completed</span>
                      <span>Month of July</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* modal */}
          {showAddGoalModal && (
            <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAddGoalModal(false)} />
              <div className="glass-panel w-full max-w-sm rounded-2xl p-6 relative z-10 border border-slate-800">
                <h3 className="text-md font-bold text-white mb-4">Set Business Goal</h3>

                <form onSubmit={handleAddGoal} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Goal Type</label>
                    <select
                      value={newGoalType}
                      onChange={(e) => setNewGoalType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs px-3.5 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="revenue">Gross Revenue Inflows</option>
                      <option value="profit">Net Profit Margin</option>
                      <option value="sales">Product Sales (Units)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Target Value</label>
                    <input
                      type="number"
                      required
                      value={newGoalTarget}
                      onChange={(e) => setNewGoalTarget(e.target.value)}
                      placeholder={newGoalType === "sales" ? "Target units sold (e.g. 100)" : `Target amount (e.g. 200000)`}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs px-3.5 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddGoalModal(false)}
                      className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-400 font-bold py-2.5 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 ${styles.btnAccent} text-xs font-bold py-2.5 rounded-xl cursor-pointer shadow-md`}
                    >
                      Establish Goal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
