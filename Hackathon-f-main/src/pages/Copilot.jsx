import { useState, useEffect, useMemo, useRef } from "react";
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
  HelpCircle,
  Send,
  Mic,
  Paperclip,
  MessageSquare,
  User,
  ChevronDown,
  ChevronUp
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
    btnAccent: "bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 text-gray-900 shadow-purple-600/20 hover:from-purple-500 hover:to-cyan-400",
    textGradient: "from-purple-400 via-indigo-400 to-cyan-400",
    chartColor: "#a855f7",
    chartSecondary: "#06b6d4"
  },
  emerald: {
    accentText: "text-teal-700",
    accentBg: "bg-emerald-500/10 border-emerald-500/20",
    btnAccent: "bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 text-gray-900 shadow-emerald-600/20 hover:from-emerald-500 hover:to-amber-400",
    textGradient: "from-emerald-400 via-teal-400 to-amber-300",
    chartColor: "#10b981",
    chartSecondary: "#f59e0b"
  },
  copper: {
    accentText: "text-amber-700",
    accentBg: "bg-whitember-500/10 border-amber-500/20",
    btnAccent: "bg-gradient-to-tr from-amber-600 via-orange-600 to-yellow-500 text-gray-900 shadow-amber-600/20 hover:from-amber-500 hover:to-yellow-400",
    textGradient: "from-amber-400 via-orange-400 to-yellow-300",
    chartColor: "#f59e0b",
    chartSecondary: "#ef4444"
  },
  lagoon: {
    accentText: "text-blue-400",
    accentBg: "bg-blue-500/10 border-blue-500/20",
    btnAccent: "bg-gradient-to-tr from-blue-600 via-cyan-600 to-teal-500 text-gray-900 shadow-blue-600/20 hover:from-blue-500 hover:to-teal-400",
    textGradient: "from-blue-400 via-cyan-400 to-teal-400",
    chartColor: "#3b82f6",
    chartSecondary: "#14b8a6"
  }
};

// Simple bold inline parser
function parseInlineFormatting(text) {
  const parts = [];
  
  // Simple regex for **bold** and `code`
  const boldRegex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    const before = text.substring(lastIndex, match.index);
    if (before) parts.push(before);
    parts.push(<strong key={`b-${match.index}`} className="font-bold text-gray-900">{match[1]}</strong>);
    lastIndex = boldRegex.lastIndex;
  }
  
  const after = text.substring(lastIndex);
  if (after) parts.push(after);

  if (parts.length === 0) return text;
  return <>{parts}</>;
}

function CopilotMarkdown({ text, user }) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let currentTable = null;
  let inList = false;
  let listItems = [];

  const flushList = (key) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="list-disc pl-5 space-y-1 my-2 text-xs text-gray-700">
          {listItems.map((li, idx) => (
            <li key={idx}>{li}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
    inList = false;
  };

  const renderCellContent = (cell) => {
    const trimmed = cell.trim();
    if (trimmed.includes("🔴 Overdue")) {
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-755 border border-red-200">🔴 Overdue</span>;
    }
    if (trimmed.includes("🟡 Pending")) {
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">🟡 Pending</span>;
    }
    if (trimmed.includes("🟢 Paid") || trimmed.includes("🟢 Settled")) {
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-green-700 border border-green-200">🟢 Paid</span>;
    }
    return parseInlineFormatting(cell);
  };

  const flushTable = (key) => {
    if (currentTable) {
      const rows = currentTable.rows;
      const headers = currentTable.headers;
      elements.push(
        <div key={`table-${key}`} className="overflow-x-auto my-3 border border-gray-200 rounded-lg bg-gray-50/50">
          <table className="min-w-full text-left text-xs text-gray-700 border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-150/40 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                {headers.map((h, idx) => (
                  <th key={idx} className="py-2 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans text-xs">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-gray-50/20">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-2.5 px-4 text-gray-700">{renderCellContent(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTable = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if table row
    if (line.startsWith("|")) {
      flushList(i);
      const cells = line.split("|").map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      // If it's a separator line like :--- | ---
      if (cells.every(c => c.startsWith(":") || c.startsWith("-"))) {
        continue;
      }
      
      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
      continue;
    } else {
      flushTable(i);
    }

    // Check if list item
    if (line.startsWith("*") || line.startsWith("-")) {
      inList = true;
      const itemContent = line.substring(1).trim();
      listItems.push(parseInlineFormatting(itemContent));
      continue;
    } else {
      flushList(i);
    }

    // Check headings
    if (line.startsWith("###")) {
      elements.push(
        <h3 key={i} className="text-sm font-bold text-gray-900 mt-4 mb-2 font-sans flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
          {parseInlineFormatting(line.replace("###", "").trim())}
        </h3>
      );
    } else if (line.startsWith("####")) {
      elements.push(
        <h4 key={i} className="text-xs font-bold text-gray-800 mt-3 mb-1.5 font-sans">
          {parseInlineFormatting(line.replace("####", "").trim())}
        </h4>
      );
    } else if (line) {
      elements.push(
        <p key={i} className="text-xs text-gray-700 leading-relaxed my-1.5 font-sans">
          {parseInlineFormatting(line)}
        </p>
      );
    }
  }

  flushList(lines.length);
  flushTable(lines.length);

  return <div className="space-y-1">{elements}</div>;
}

const priorityPulseColors = {
  high: "bg-red-500/10 text-red-650 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)] animate-pulse",
  medium: "bg-whitember-500/10 text-amber-700 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
  low: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
};

export default function Copilot({ user, products, invoices, transactions, theme = "cosmic" }) {
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState([
    {
      id: "init",
      role: "assistant",
      content: "Hello! I am your **BizPilot AI Copilot**. I have synced with your business data, and I'm ready to answer any questions you have about inventory, invoice totals, sales forecasts, or outstanding payments.\n\nClick one of the suggested prompts below or type a question to get started!"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [quickCommandsOpen, setQuickCommandsOpen] = useState(true);
  const [followUps, setFollowUps] = useState([
    "Which products are low in stock?",
    "Generate this month's invoice summary.",
    "Predict next month's sales.",
    "Which customers have pending payments?"
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeCommand, setActiveCommand] = useState(null);
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

  const chatEndRef = useRef(null);

  const getChipIcon = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes("stock") || lower.includes("restock")) return <AlertTriangle className="w-3 h-3 text-indigo-650" />;
    if (lower.includes("invoice") || lower.includes("summary")) return <CheckCircle className="w-3 h-3 text-indigo-650" />;
    if (lower.includes("forecast") || lower.includes("predict") || lower.includes("sales")) return <TrendingUp className="w-3 h-3 text-indigo-650" />;
    if (lower.includes("payment") || lower.includes("reminder") || lower.includes("outstanding") || lower.includes("customer") || lower.includes("client")) return <DollarSign className="w-3 h-3 text-indigo-650" />;
    return <Sparkles className="w-3 h-3 text-indigo-650" />;
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (activeTab === "chat" && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || chatInput).trim();
    if (!text) return;

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    if (!textToSend) setChatInput("");

    // Simulate AI typing response
    setTimeout(() => {
      let replyContent = "";
      let nextChips = [];
      const lower = text.toLowerCase();

      // Dynamic Query Engine using mock variables: products, invoices, transactions, etc.
      if (lower.includes("stock") || lower.includes("restock") || lower.includes("reorder")) {
        // Query low stock items
        const lowStock = products.filter(p => p.quantity <= (p.minStock || p.min_stock || 10));
        if (lowStock.length > 0) {
          replyContent = `### Low Stock Inventory Audit\n\nI found **${lowStock.length}** product(s) currently low in stock or below safety threshold. Restocking is highly recommended:\n\n| Product Name | Category | SKU | Current Stock | Min Safety Level |\n| :--- | :--- | :--- | :---: | :---: |\n` +
            lowStock.map(p => `| ${p.name} | ${p.category || "N/A"} | \`${p.sku || "N/A"}\` | **${p.quantity}** | ${p.minStock || 10} |`).join("\n") +
            `\n\n**Restock Action Item**: Place a replenishment order with Waaree/OEM vendors for these items immediately to avoid stockout downtime.`;
        } else {
          replyContent = `### Stock Levels Status\n\nAll products in your inventory database are currently **above safety thresholds**. No restocks are immediately required. Good job!`;
        }
        nextChips = ["What should I restock?", "Generate invoice summary", "Forecast revenue", "Analyze fixed expenses"];
      } else if (lower.includes("invoice") || lower.includes("summary") || lower.includes("sale") || lower.includes("revenue")) {
        // Generate summary
        const totalCount = invoices.length;
        const paidCount = invoices.filter(i => i.status === "paid").length;
        const unpaidInvoices = invoices.filter(i => i.status !== "paid");
        
        const sumPaid = invoices.filter(i => i.status === "paid").reduce((acc, i) => acc + (i.total || 0), 0);
        const sumUnpaid = unpaidInvoices.reduce((acc, i) => acc + (i.total || 0), 0);
        
        replyContent = `### Monthly Invoice Summary\n\nHere is the breakdown of your generated invoices:\n\n* **Total Invoices**: ${totalCount} generated in total\n* **Paid Settled Invoices**: ${paidCount} (Valued at **${formatAmount(sumPaid, user?.currency)}**)\n* **Unpaid Ledger Balance**: ${unpaidInvoices.length} (Valued at **${formatAmount(sumUnpaid, user?.currency)}**)\n\n#### Highlights & Insights:\n- **Collectables Ledger**: You have outstanding collections of **${formatAmount(sumUnpaid, user?.currency)}** across unpaid invoices.\n- **Turnaround Efficiency**: Recommend automating payment reminders on Settings page for overdue invoices.`;
        nextChips = ["Which customers have pending payments?", "Send payment reminders", "Forecast revenue", "Establish revenue goals"];
      } else if (lower.includes("predict") || lower.includes("forecast") || lower.includes("next month")) {
        replyContent = `### Reconciled Revenue Forecast\n\nBased on historical invoices and machine learning trends, here are the projections for the upcoming period:\n\n* **Forecasted Growth**: **+8.4%** projected month-over-month\n* **Expected Inflow (July/August)**: Approximately **${formatAmount(24500, user?.currency)}**\n* **Top Revenue Drivers**:\n  - Waaree Solar Panels\n  - High-Efficiency Inverters\n\n**Strategic Recommendation**: Secure additional inventory capacity for top solar items to capture the seasonal spikes in demand next month.`;
        nextChips = ["Which products are low in stock?", "Generate invoice summary", "Review milestone targets", "Analyze profitability yields"];
      } else if (lower.includes("payment") || lower.includes("pending") || lower.includes("customer") || lower.includes("client")) {
        const unpaid = invoices.filter(i => i.status !== "paid");
        if (unpaid.length > 0) {
          replyContent = `### Outstanding Customer Receivables\n\nThe following customers currently have pending payments on their accounts:\n\n| Customer Name | Invoice No. | Due Date | Outstanding Amount | Status |\n| :--- | :--- | :--- | :---: | :---: |\n` +
            unpaid.map(i => {
              let dDate = i.dueDate || i.date;
              const isOverdue = dDate && new Date(dDate) < new Date();
              return `| ${i.clientName || i.customer_name || "N/A"} | \`${i.invoiceNumber || `INV-${String(i.id).substring(0, 8)}`}\` | ${dDate || "N/A"} | **${formatAmount(i.total, user?.currency)}** | ${isOverdue ? "🔴 Overdue" : "🟡 Pending"} |`;
            }).join("\n") +
            `\n\n**Action Plan**: Review the action triggers in the Invoices Hub to dispatch follow-up alerts or settle payments directly.`;
        } else {
          replyContent = `### Receivables Ledger Status\n\nAll invoices are fully settled. There are currently no clients with outstanding pending invoice balances.`;
        }
        nextChips = ["Send payment reminders", "Generate PDF summary", "Generate invoice summary", "Forecast revenue"];
      } else {
        replyContent = `### AI Copilot Advisory Insights\n\nI am your business copilot command center. Here are the core highlights of your business stats:\n\n* **Products Count**: ${products.length} registered SKUs\n* **Invoices Logged**: ${invoices.length} invoices total\n* **Current User**: ${user.name} (${user.businessName})\n\nHow can I help you further? Try asking:\n- "Which products are low in stock?"\n- "Show customers with pending payments."\n- "Predict next month's sales projections."`;
        nextChips = ["Which products are low in stock?", "Generate invoice summary", "Predict next month's sales", "Which customers have pending payments?"];
      }

      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: replyContent
      }]);
      setFollowUps(nextChips);
      setIsTyping(false);
      setActiveCommand(null);
    }, 600);
  };

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
        {activeTab === "chat" ? (
          <div>
            <span className={`text-xs uppercase font-bold tracking-widest ${styles.accentText} font-mono flex items-center gap-1.5`}>
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              Conversational Command
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mt-1">
              BizPilot AI Copilot
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Ask anything about your business.
            </p>
          </div>
        ) : (
          <div>
            <span className={`text-xs uppercase font-bold tracking-widest ${styles.accentText} font-mono flex items-center gap-1.5`}>
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              AI Operations Advisor
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mt-1">
              Executive Copilot Center
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Machine learning forecasting, AI decision auditing, and real-time business health indicators.
            </p>
          </div>
        )}
        {activeTab !== "chat" && (
          <button
            onClick={fetchHealthScore}
            className={`${styles.btnAccent} px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md`}
          >
            <Cpu className="w-4 h-4" />
            <span>Refresh Analysis</span>
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-4 overflow-x-auto border-b border-gray-200/50 scrollbar-none">
        <button
          onClick={() => setActiveTab("chat")}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative shrink-0 ${activeTab === "chat" ? styles.accentText : "text-gray-450 hover:text-gray-800"}`}
        >
          AI Copilot
          {activeTab === "chat" && <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${styles.textGradient} rounded-full`} />}
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative shrink-0 ${activeTab === "summary" ? styles.accentText : "text-gray-450 hover:text-gray-800"}`}
        >
          Executive Summary
          {activeTab === "summary" && <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${styles.textGradient} rounded-full`} />}
        </button>
        <button
          onClick={() => setActiveTab("forecasting")}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative shrink-0 ${activeTab === "forecasting" ? styles.accentText : "text-gray-450 hover:text-gray-800"}`}
        >
          Predictive Forecasting
          {activeTab === "forecasting" && <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${styles.textGradient} rounded-full`} />}
        </button>
        <button
          onClick={() => setActiveTab("profitability")}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative shrink-0 ${activeTab === "profitability" ? styles.accentText : "text-gray-450 hover:text-gray-800"}`}
        >
          Profitability & Expenses
          {activeTab === "profitability" && <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${styles.textGradient} rounded-full`} />}
        </button>
        <button
          onClick={() => setActiveTab("goals")}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative shrink-0 ${activeTab === "goals" ? styles.accentText : "text-gray-450 hover:text-gray-800"}`}
        >
          Business Goals ({goals.length})
          {activeTab === "goals" && <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${styles.textGradient} rounded-full`} />}
        </button>
      </div>

      {/* AI Copilot Chat Tab */}
      {activeTab === "chat" && (
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 min-h-[520px]">
          
          {/* Scrollable Conversation Viewport */}
          <div className="flex-1 overflow-y-auto border border-gray-200 rounded-2xl p-4 space-y-4 min-h-[380px] max-h-[500px] bg-gray-50/20 shadow-inner">
            {messages.length === 1 && (
              <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-2xl p-5 text-center max-w-xl mx-auto space-y-3.5 shadow-sm my-4 animate-fade-in">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-sm">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="font-display font-bold text-sm text-gray-900">Welcome to BizPilot AI Command Copilot</h3>
                <p className="text-[11px] text-gray-500 max-w-sm mx-auto leading-relaxed">
                  I have analyzed your catalogs, invoices, and expense ledgers. Select an example operational question below to test AI analysis:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-left">
                  {[
                    { question: "Which products are low in stock?", desc: "Analyze SKU safety levels" },
                    { question: "Generate this month's invoice summary.", desc: "Revenue & payment logs" },
                    { question: "Predict next month's sales.", desc: "Growth projections audit" },
                    { question: "Which customers have pending payments?", desc: "Outstanding invoice balances" }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.question)}
                      className="p-2.5 bg-white hover:bg-indigo-50/50 border border-gray-200 hover:border-indigo-200 text-left rounded-xl transition-all cursor-pointer shadow-xs group hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <span className="text-[11px] font-semibold text-gray-850 group-hover:text-indigo-650 transition-colors block">{item.question}</span>
                      <span className="text-[9px] text-gray-400 block mt-0.5">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 items-start ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-650 shrink-0 shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                
                <div
                  className={`p-4 rounded-2xl text-xs max-w-[80%] shadow-sm ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none animate-slide-up"
                      : "bg-white border border-gray-250/70 text-gray-800 rounded-tl-none space-y-2 animate-slide-up"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <CopilotMarkdown text={msg.content} user={user} />
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 shrink-0 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 items-start justify-start animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-650 shrink-0 shadow-sm animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="p-3.5 bg-white border border-gray-250/70 rounded-2xl rounded-tl-none text-xs text-gray-500 shadow-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Collapsible Quick Commands Section */}
          <div className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm space-y-2">
            <button
              onClick={() => setQuickCommandsOpen(prev => !prev)}
              className="w-full flex items-center justify-between text-xs font-bold text-gray-700 hover:text-gray-955 transition-colors cursor-pointer focus:outline-none"
            >
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] text-gray-500 font-bold">
                <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                Quick Commands
              </span>
              {quickCommandsOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {quickCommandsOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2 border-t border-gray-100">
                {[
                  { label: "Check Stock Alert", text: "Which products are low in stock?", desc: "Check SKU safety levels" },
                  { label: "Invoice Audit", text: "Generate this month's invoice summary.", desc: "Revenue & payment logs" },
                  { label: "Sales Projections", text: "Predict next month's sales.", desc: "Growth forecast indicators" },
                  { label: "Pending Payments", text: "Which customers have pending payments?", desc: "Outstanding invoice balances" },
                  { label: "Restock Orders", text: "What should I restock?", desc: "Replenishment advice list" }
                ].map((item, idx) => {
                  const isExecuting = isTyping && activeCommand === item.text;
                  return (
                    <button
                      key={idx}
                      disabled={isTyping}
                      onClick={() => {
                        setActiveCommand(item.text);
                        handleSendMessage(item.text);
                      }}
                      className={`p-2.5 bg-gray-50/50 hover:bg-indigo-50/30 border border-gray-200 hover:border-indigo-200 text-left rounded-xl transition-all cursor-pointer shadow-sm flex flex-col justify-between group hover:scale-[1.02] active:scale-[0.98] duration-100 ${isExecuting ? "ring-1 ring-indigo-500 bg-indigo-50/10 border-indigo-200" : ""}`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-xs font-bold text-gray-850 group-hover:text-indigo-650 transition-colors">{item.label}</span>
                        {isExecuting ? (
                          <Loader className="w-3 h-3 text-indigo-600 animate-spin" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                        )}
                      </div>
                      <span className="text-[9px] text-gray-400 mt-0.5">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Follow-up Suggestion Chips with Icons */}
          {followUps.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center py-0.5">
              <span className="text-[9px] uppercase font-bold text-gray-450 tracking-wider">Suggested:</span>
              {followUps.map((chipText, idx) => (
                <button
                  key={idx}
                  disabled={isTyping}
                  onClick={() => handleSendMessage(chipText)}
                  className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-700 text-xs font-semibold rounded-full transition-all cursor-pointer shadow-xs hover:scale-102 active:scale-98 flex items-center gap-1.5"
                >
                  {getChipIcon(chipText)}
                  <span>{chipText}</span>
                </button>
              ))}
            </div>
          )}

          {/* Chat Input panel */}
          <div className="border-t border-gray-200 pt-4 flex gap-3 items-center">
            <button
              type="button"
              className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 rounded-xl transition-colors cursor-pointer shrink-0 shadow-sm"
              title="Attach File"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <div className="flex-1 relative flex items-center bg-gray-50 border border-gray-200 rounded-xl focus-within:border-indigo-500 transition-colors shadow-inner">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                placeholder="Ask about stock levels, invoice summaries, forecasts, or customer balances..."
                className="w-full bg-transparent text-xs py-3 px-4 pr-10 text-gray-900 focus:outline-none placeholder-gray-400"
              />
              <button
                type="button"
                className="absolute right-3 p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-650 rounded-lg transition-colors cursor-pointer"
                title="Voice input"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={isTyping}
              className="p-3 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl transition-colors cursor-pointer shadow-sm shrink-0 flex items-center justify-center disabled:opacity-50"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Summary Tab */}
      {activeTab === "summary" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Health Score radial gauge */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-between text-center min-h-[380px]">
            <div className="w-full text-left">
              <h3 className="text-sm font-bold text-gray-900">System Health Score</h3>
              <p className="text-[10px] text-gray-450 uppercase tracking-widest font-mono mt-0.5">Weighted composite rating</p>
            </div>

            {healthLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="text-xs text-gray-450 mt-3">Synthesizing metrics...</span>
              </div>
            ) : (
              <div className="relative my-4 flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="68" stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
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
                  <span className="font-display font-bold text-4xl text-gray-900">{healthData?.score}%</span>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mt-0.5">Overall Status</span>
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
                  <div className="flex justify-between text-[11px] font-semibold text-gray-800">
                    <span>{item.label}</span>
                    <span>{item.val}%</span>
                  </div>
                  <div className="w-full bg-gray-150 h-1 rounded-full overflow-hidden border border-gray-250">
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
                <div className="p-2 bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 rounded-xl h-fit">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">AI Advisory Synthesis</h4>
                  <p className="text-[12px] text-gray-800 mt-1 leading-relaxed italic">
                    "{healthLoading ? "Synthesizing operations ledger..." : healthData?.explanation}"
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col">
              <h3 className="text-sm font-bold text-gray-900">Action Recommendations</h3>
              <p className="text-[11px] text-gray-450 mt-0.5">High-priority operational suggestions derived by AI</p>

              {recsLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12">
                  <Loader className="w-6 h-6 animate-spin text-indigo-600" />
                  <span className="text-xs text-gray-450 mt-2">Consulting advisor model...</span>
                </div>
              ) : (
                <div className="space-y-4 mt-5 flex-1 overflow-y-auto max-h-[300px] pr-2">
                  {recs.map((rec, idx) => (
                    <div key={idx} className="glass-card p-4 rounded-xl border border-gray-200 hover:border-indigo-500/20 flex justify-between items-start gap-4 hover:translate-x-0.5 transition-transform duration-200">
                      <div className="flex gap-3">
                        <div className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-lg border h-fit shrink-0 ${priorityPulseColors[rec.priority.toLowerCase()] || priorityPulseColors.low}`}>
                          {rec.priority}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900">{rec.title}</h4>
                          <p className="text-[11px] text-gray-500 mt-1">{rec.reason}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 self-center" />
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
                <h3 className="text-sm font-bold text-gray-900">Smart Operations Monitor</h3>
                <p className="text-[11px] text-gray-450">Live background system events and triggers</p>
              </div>
              <Bell className="w-4 h-4 text-gray-450" />
            </div>

            {notifLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notifications.length === 0 ? (
                  <div className="col-span-2 py-6 text-center text-xs text-gray-450">
                    All background operations parameters are healthy. No active flags.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-3.5 bg-gray-50/50 border border-gray-250 rounded-xl flex gap-3 items-start">
                      <div className={`p-1.5 rounded-lg h-fit ${
                        notif.severity === "error" ? "bg-red-500/10 text-red-650 border border-red-500/25" :
                        notif.severity === "warning" ? "bg-whitember-500/10 text-amber-700 border border-amber-500/25" :
                        "bg-blue-500/10 text-blue-400 border border-blue-500/25"
                      }`}>
                        {notif.severity === "error" ? <AlertTriangle className="w-3.5 h-3.5" /> :
                         notif.severity === "warning" ? <AlertTriangle className="w-3.5 h-3.5" /> :
                         <CheckCircle className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900 leading-snug">{notif.message}</p>
                        <p className="text-[9px] text-gray-450 mt-1">{new Date(notif.timestamp).toLocaleTimeString()}</p>
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
                <h3 className="text-sm font-bold text-gray-900">Predictive Product Demand</h3>
                <p className="text-[11px] text-gray-450 font-medium">Smoothed daily units history vs next 30-day extrapolated trend line</p>
              </div>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl text-xs px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-auto cursor-pointer"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {demandLoading ? (
              <div className="h-[280px] flex flex-col items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-indigo-500" />
                <span className="text-xs text-gray-450 mt-3">Computing polyfit extrapolation...</span>
              </div>
            ) : demandForecast?.error ? (
              <div className="h-[280px] flex flex-col items-center justify-center text-center">
                <AlertTriangle className="w-10 h-10 text-amber-500 opacity-60" />
                <h4 className="text-xs font-bold text-gray-800 mt-3">Insufficient Transaction History</h4>
                <p className="text-[11px] text-gray-450 mt-1 max-w-sm">
                  This product has less than 14 days of sales history. Seed more invoices to calculate demand.
                </p>
              </div>
            ) : (
              <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                    <ChartTooltip
                      contentStyle={{ backgroundColor: "#ffffff", border: `1px solid ${styles.chartColor}40`, borderRadius: "12px", fontSize: "11px", color: "#0f172a" }}
                      itemStyle={{ color: "#0f172a" }}
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
                  <h3 className="text-sm font-bold text-gray-900">Reconciled Revenue Forecast</h3>
                  <p className="text-[11px] text-gray-450 font-medium font-sans">Aggregate sales revenue projected over coming periods</p>
                </div>
                <div className="flex bg-gray-50 p-0.5 rounded-lg border border-gray-200">
                  <button
                    onClick={() => setRevenuePeriod("week")}
                    className={`text-[9px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${revenuePeriod === "week" ? "bg-indigo-600 text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setRevenuePeriod("month")}
                    className={`text-[9px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${revenuePeriod === "month" ? "bg-indigo-600 text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
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
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                      <XAxis dataKey="label" stroke="#64748b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                      <ChartTooltip
                        contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "11px", color: "#0f172a" }}
                        itemStyle={{ color: "#0f172a" }}
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
                <h4 className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest font-mono">Future Sales Run Rate</h4>
                <p className="text-[11px] text-gray-500 mt-1">Projected revenue inflows next 7 days</p>
              </div>
              <div className="my-4">
                {revenueLoading ? (
                  <span className="text-xl text-gray-450 animate-pulse">Calculating...</span>
                ) : (
                  <span className="font-display font-bold text-3xl text-gray-900 block">
                    {formatAmount(revenueForecast?.projected_revenue || 0, user?.currency)}
                  </span>
                )}
                <span className="text-[10px] text-teal-700 flex items-center gap-1 mt-1 font-semibold">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Forecast positive</span>
                </span>
              </div>
              <p className="text-[10px] text-gray-450 leading-normal border-t border-gray-200 pt-3">
                Extrapolations are calculated using daily linear regression coefficients. Actual results may vary due to seasonality.
              </p>
            </div>
          </div>

          {/* Replenishment Optimizer */}
          <div className="glass-panel p-6 rounded-2xl animate-fade-in">
            <h3 className="text-sm font-bold text-gray-900">Smart Inventory Replenishment</h3>
            <p className="text-[11px] text-gray-450 mt-0.5">Automated reordering schedule based on demand velocity and safety stocks</p>

            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left text-xs text-gray-800 border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/30 text-gray-450 uppercase tracking-wider text-[10px] font-bold">
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
                        <Loader className="w-5 h-5 animate-spin mx-auto text-gray-450" />
                      </td>
                    </tr>
                  ) : (
                    inventoryOpts.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/10">
                        <td className="py-3.5 px-4 font-sans text-xs text-gray-900 font-semibold">{item.name}</td>
                        <td className="py-3.5 px-2 text-right font-bold text-gray-800">{item.currentStock}</td>
                        <td className="py-3.5 px-2 text-right text-gray-450">{item.minStock}</td>
                        <td className="py-3.5 px-2 text-right text-gray-800 font-bold">{item.avgDailyDemand}</td>
                        <td className="py-3.5 px-2 text-right">
                          <span className={`font-bold ${item.daysUntilStockout <= 10 ? "text-red-650" : "text-gray-500"}`}>
                            {item.daysUntilStockout}
                          </span>
                        </td>
                        <td className="py-3.5 px-2">
                          {item.restock ? (
                            <span className="px-1.5 py-0.5 bg-red-500/10 text-red-650 border border-red-500/20 rounded font-bold text-[9px] uppercase tracking-wide">
                              Restock Trigger
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-teal-700 border border-emerald-500/20 rounded font-bold text-[9px] uppercase tracking-wide">
                              Healthy
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-2 text-right font-bold text-gray-800">
                          {item.suggestedQty > 0 ? item.suggestedQty : "-"}
                        </td>
                        <td className={`py-3.5 px-4 text-right font-semibold ${item.reorderByDate === "Immediate" ? "text-red-650" : "text-gray-500"}`}>
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
              <h3 className="text-sm font-bold text-gray-900">Product Profit Yields</h3>
              <p className="text-[11px] text-gray-450 mt-0.5">Absolute profits (Revenue - Cost) realized per product</p>
              
              {profitabilityLoading ? (
                <div className="h-[220px] flex items-center justify-center">
                  <Loader className="w-6 h-6 animate-spin text-indigo-500" />
                </div>
              ) : (
                <div className="w-full h-[220px] mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profitabilityData?.mostProfitableProducts || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                      <ChartTooltip
                        contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "11px", color: "#0f172a" }}
                        itemStyle={{ color: "#0f172a" }}
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
                <h3 className="text-sm font-bold text-gray-900">Profitability Ranking</h3>
                <p className="text-[11px] text-gray-450 mt-0.5">Top performing products by margin</p>
              </div>

              <div className="space-y-4 my-6 flex-1 overflow-y-auto max-h-[180px]">
                {profitabilityLoading ? (
                  <div className="py-12 flex justify-center"><Loader className="w-5 h-5 animate-spin text-gray-400" /></div>
                ) : (
                  (profitabilityData?.mostProfitableProducts || []).map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="min-w-0 flex-1 pr-3">
                        <span className="text-xs font-semibold text-gray-900 truncate block">{p.name}</span>
                        <span className="text-[9px] font-mono text-gray-450">{p.quantitySold} units sold</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-900 font-mono block">{formatAmount(p.profit, user?.currency)}</span>
                        <span className="text-[10px] text-teal-700 font-semibold font-mono">{p.margin}% margin</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <p className="text-[10px] text-gray-450 border-t border-gray-200 pt-3">
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
              <h3 className="text-sm font-bold text-gray-900 mt-1">Expense Categorization</h3>
              <p className="text-[11px] text-gray-450 mt-0.5">Test the AI expense classification model below</p>

              <form onSubmit={handleCategorizeExpense} className="space-y-4 mt-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-450">Description</label>
                  <input
                    type="text"
                    required
                    value={testDesc}
                    onChange={(e) => setTestDesc(e.target.value)}
                    placeholder="e.g. Purchased silicon cells from Waaree or Electric grid fees"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl text-xs px-3.5 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-450">Amount</label>
                  <input
                    type="number"
                    value={testAmount}
                    onChange={(e) => setTestAmount(e.target.value)}
                    placeholder="Optional amount"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl text-xs px-3.5 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={categorizeLoading}
                  className={`${styles.btnAccent} w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md`}
                >
                  {categorizeLoading ? <Loader className="w-4 h-4 animate-spin text-gray-900" /> : <Sparkles className="w-4 h-4" />}
                  <span>Classify Expense</span>
                </button>
              </form>

              {testCategory && (
                <div className="mt-5 p-4 bg-gray-100/80 border border-gray-200 rounded-xl flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-gray-500">Classified Category:</span>
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 rounded font-bold text-xs uppercase font-mono">
                    {testCategory}
                  </span>
                </div>
              )}
            </div>

            {/* spend analysis */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Expense Analysis</h3>
                <p className="text-[11px] text-gray-450 mt-0.5">Breakdown of operational spend and flags</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 flex-1">
                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                  {expenseLoading ? (
                    <div className="py-12 text-center"><Loader className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div>
                  ) : (
                    expenseAnalysis?.categoryTotals.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">{item.category}</span>
                        <div className="text-right">
                          <span className="font-bold text-gray-900 font-mono">{formatAmount(item.amount, user?.currency)}</span>
                          <span className="text-[10px] text-gray-450 block font-semibold">{item.percentage}% of total</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="bg-gray-50/30 p-4 border border-gray-250 rounded-xl space-y-4 max-h-[180px] overflow-y-auto pr-1">
                  <h4 className="text-[10px] text-amber-500 font-bold uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Cost optimization flags
                  </h4>
                  {expenseLoading ? (
                    <span className="text-xs text-gray-400 animate-pulse block">Analyzing...</span>
                  ) : expenseAnalysis?.opportunities.length === 0 ? (
                    <p className="text-[11px] text-gray-450 leading-relaxed">
                      All category expenditures are within healthy parameters.
                    </p>
                  ) : (
                    expenseAnalysis?.opportunities.map((opp, idx) => (
                      <div key={idx} className="p-3 bg-whitember-500/5 border border-amber-500/10 rounded-lg">
                        <p className="text-[11px] text-amber-200 leading-normal font-sans font-medium">{opp.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <p className="text-[10px] text-gray-450 border-t border-gray-200 pt-3">
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
              <h3 className="text-sm font-bold text-gray-900">Business Milestones Tracker</h3>
              <p className="text-[11px] text-gray-450 mt-0.5">Configure and audit monthly target achievements from actual data</p>
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
                <Loader className="w-6 h-6 animate-spin mx-auto text-gray-450" />
              </div>
            ) : goals.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-xs text-gray-450 border border-dashed border-gray-200 rounded-xl">
                No business goals are currently set. Set a goal to track performance progress.
              </div>
            ) : (
              goals.map((g) => {
                const percent = Math.min(100, Math.round((g.currentValue / g.target) * 100));
                
                return (
                  <div key={g.id} className="glass-card p-5 rounded-2xl border border-gray-200 flex flex-col justify-between min-h-[160px]">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-xl h-fit border ${
                          g.type === "revenue" ? "bg-emerald-500/10 text-teal-700 border-emerald-500/25" :
                          g.type === "profit" ? "bg-teal-500/10 text-teal-400 border-teal-500/25" :
                          "bg-purple-500/10 text-purple-400 border-purple-500/25"
                        }`}>
                          {g.type === "revenue" ? <DollarSign className="w-4 h-4" /> :
                           g.type === "profit" ? <TrendingUp className="w-4 h-4" /> :
                           <Briefcase className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 capitalize">{g.type} Achievement</h4>
                          <span className="text-[9px] font-mono font-bold text-gray-450 uppercase tracking-widest">Monthly target</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(g.id)}
                        className="p-1 rounded-lg text-gray-450 hover:text-red-650 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="my-4">
                      <div className="flex justify-between text-[11px] font-bold font-mono text-gray-800 mb-1.5">
                        <span>
                          {g.type === "sales" ? `${g.currentValue} units` : formatAmount(g.currentValue, user?.currency)}
                        </span>
                        <span className="text-gray-450">
                          / {g.type === "sales" ? `${g.target} units` : formatAmount(g.target, user?.currency)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden border border-gray-250">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            percent >= 100 ? "bg-emerald-500" :
                            percent >= 50 ? "bg-indigo-500" : "bg-purple-500"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-semibold text-gray-500">
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
              <div className="fixed inset-0 bg-gray-100/80 backdrop-blur-sm" onClick={() => setShowAddGoalModal(false)} />
              <div className="glass-panel w-full max-w-sm rounded-2xl p-6 relative z-10 border border-gray-200">
                <h3 className="text-md font-bold text-gray-900 mb-4">Set Business Goal</h3>

                <form onSubmit={handleAddGoal} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-450">Goal Type</label>
                    <select
                      value={newGoalType}
                      onChange={(e) => setNewGoalType(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl text-xs px-3.5 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="revenue">Gross Revenue Inflows</option>
                      <option value="profit">Net Profit Margin</option>
                      <option value="sales">Product Sales (Units)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-450">Target Value</label>
                    <input
                      type="number"
                      required
                      value={newGoalTarget}
                      onChange={(e) => setNewGoalTarget(e.target.value)}
                      placeholder={newGoalType === "sales" ? "Target units sold (e.g. 100)" : `Target amount (e.g. 200000)`}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl text-xs px-3.5 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddGoalModal(false)}
                      className="flex-1 bg-gray-100 border border-gray-200 text-xs text-gray-500 font-bold py-2.5 rounded-xl cursor-pointer"
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
