import { useState, useEffect, useMemo } from "react";
import {
  Users,
  UserPlus,
  Search,
  Briefcase,
  DollarSign,
  Eye,
  Activity,
  Plus,
  TrendingUp,
  Coins,
  Building,
  Layers
} from "lucide-react";
import { formatAmount } from "../types";
const themeStyles = {
  cosmic: {
    textAccent: "text-purple-400",
    badgeText: "text-purple-300",
    btnAccent: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25",
    textGradient: "from-purple-400 via-indigo-400 to-cyan-400",
    borderHover: "hover:border-purple-500/30",
    pulseBg: "bg-purple-500",
    cardGlow: "shadow-[0_0_20px_rgba(168,85,247,0.03)]"
  },
  emerald: {
    textAccent: "text-emerald-400",
    badgeText: "text-emerald-300",
    btnAccent: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25",
    textGradient: "from-emerald-400 via-teal-400 to-amber-300",
    borderHover: "hover:border-emerald-500/30",
    pulseBg: "bg-emerald-500",
    cardGlow: "shadow-[0_0_20px_rgba(16,185,129,0.03)]"
  },
  copper: {
    textAccent: "text-amber-400",
    badgeText: "text-amber-300",
    btnAccent: "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25",
    textGradient: "from-amber-400 via-orange-400 to-yellow-300",
    borderHover: "hover:border-amber-500/30",
    pulseBg: "bg-amber-500",
    cardGlow: "shadow-[0_0_20px_rgba(245,158,11,0.03)]"
  },
  lagoon: {
    textAccent: "text-blue-400",
    badgeText: "text-blue-300",
    btnAccent: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25",
    textGradient: "from-blue-400 via-cyan-400 to-teal-400",
    borderHover: "hover:border-blue-500/30",
    pulseBg: "bg-blue-400",
    cardGlow: "shadow-[0_0_20px_rgba(59,130,246,0.03)]"
  }
};
export default function Workforce({ user, theme = "cosmic" }) {
  const styles = themeStyles[theme] || themeStyles.cosmic;
  const [workers, setWorkers] = useState([]);
  const [actions, setActions] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showLogAction, setShowLogAction] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [newWorkerName, setNewWorkerName] = useState("");
  const [newWorkerRole, setNewWorkerRole] = useState("");
  const [newWorkerSector, setNewWorkerSector] = useState("Assembly & Mounting");
  const [newWorkerPhone, setNewWorkerPhone] = useState("");
  const [newWorkerRate, setNewWorkerRate] = useState(100);
  const [actionDesc, setActionDesc] = useState("");
  const [workUnits, setWorkUnits] = useState(8);
  const [unitType, setUnitType] = useState("hours");
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [wRes, aRes, pRes, iRes, cRes] = await Promise.all([
        fetch("/api/workforce"),
        fetch("/api/workforce/actions"),
        fetch("/api/products"),
        fetch("/api/invoices"),
        fetch("/api/customers")
      ]);
      if (wRes.ok) setWorkers(await wRes.json());
      if (aRes.ok) setActions(await aRes.json());
      if (pRes.ok) setProducts(await pRes.json());
      if (iRes.ok) setInvoices(await iRes.json());
      if (cRes.ok) setCustomers(await cRes.json());
    } catch (err) {
      console.error("Error loading workforce operations parameters", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAllData();
  }, []);
  const handleAddWorkerSubmit = async (e) => {
    e.preventDefault();
    if (!newWorkerName.trim() || !newWorkerRole.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/workforce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newWorkerName,
          role: newWorkerRole,
          sector: newWorkerSector,
          phone: newWorkerPhone || "+91 98765 00000",
          hourlyRate: newWorkerRate
        })
      });
      if (res.ok) {
        const added = await res.json();
        setWorkers((prev) => [...prev, added]);
        setShowAddWorker(false);
        setNewWorkerName("");
        setNewWorkerRole("");
        setNewWorkerPhone("");
        setNewWorkerRate(100);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  const handleLogActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWorkerId || !actionDesc.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/workforce/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId: selectedWorkerId,
          action: actionDesc,
          workUnits: Number(workUnits),
          unitType
        })
      });
      if (res.ok) {
        await fetchAllData();
        setShowLogAction(false);
        setActionDesc("");
        setWorkUnits(8);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  const handlePayWorkerWages = async (workerId) => {
    const worker = workers.find((w) => w.id === workerId);
    if (!worker || worker.unpaidWages <= 0) return;
    if (!window.confirm(`Are you sure you want to approve and pay the wage balance of ${formatAmount(worker.unpaidWages, user.currency)} to ${worker.name}?`)) {
      return;
    }
    try {
      const res = await fetch("/api/workforce/pay-wage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };
  const totalWagesPaid = useMemo(() => {
    return workers.reduce((sum, w) => sum + (w.totalWagesPaid || 0), 0);
  }, [workers]);
  const totalUnpaidWages = useMemo(() => {
    return workers.reduce((sum, w) => sum + (w.unpaidWages || 0), 0);
  }, [workers]);
  const sectorBreakdown = useMemo(() => {
    const counts = {
      "Assembly & Mounting": 0,
      "Logistics & Transport": 0,
      "R&D Lab Testing": 0,
      "Sales & Support": 0
    };
    workers.forEach((w) => {
      if (counts[w.sector] !== void 0) {
        counts[w.sector]++;
      }
    });
    return counts;
  }, [workers]);
  const filteredWorkers = useMemo(() => {
    return workers.filter(
      (w) => w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.role.toLowerCase().includes(searchQuery.toLowerCase()) || w.sector.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [workers, searchQuery]);
  const topSellingProducts = useMemo(() => {
    const salesMap = {};
    products.forEach((p) => {
      salesMap[p.name] = { qty: 0, revenue: 0, category: p.category, cost: p.cost };
    });
    invoices.forEach((inv) => {
      inv.items.forEach((item) => {
        if (!salesMap[item.name]) {
          salesMap[item.name] = { qty: 0, revenue: 0, category: "Solar Equipment", cost: 0 };
        }
        salesMap[item.name].qty += item.quantity;
        salesMap[item.name].revenue += item.total;
      });
    });
    return Object.entries(salesMap).map(([name, data]) => ({
      name,
      quantitySold: data.qty,
      revenue: data.revenue,
      category: data.category,
      estimatedProfit: data.revenue - data.qty * data.cost
    })).sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 4);
  }, [invoices, products]);
  const clientBusinesses = useMemo(() => {
    const businesses = [
      {
        id: "c1",
        name: "Apex Power Solutions",
        type: "Utility & Grid Infrastructure",
        system: "Utility Grid Battery Storage System",
        capacity: "100 kWh Lithium storage",
        status: "Active System",
        impact: "Reduces grid overload by 35% annually"
      },
      {
        id: "c2",
        name: "Greenfield Housing Society",
        type: "Residential Real Estate",
        system: "Commercial Rooftop Hybrid Setup",
        capacity: "75 kW Panel Arrays",
        status: "Active Installation",
        impact: "Offsets 52.4 metric tons of CO2 yearly"
      },
      {
        id: "c3",
        name: "Tata Solar Parks",
        type: "Industrial Energy Farm",
        system: "High-density Monocrystalline Grid",
        capacity: "250 kW Inverter Stations",
        status: "Field Operational",
        impact: "Generates enough energy to power 180 housing units"
      }
    ];
    customers.forEach((cust, idx) => {
      if (!businesses.some((b) => b.name.toLowerCase() === cust.name.toLowerCase())) {
        businesses.push({
          id: `cd_${cust.id || idx}`,
          name: cust.name,
          type: cust.company || "Renewable Customer",
          system: "Custom Monocrystalline Array setup",
          capacity: `${(cust.totalSales / 4500).toFixed(0)}x Panel pallets`,
          status: "Registered Infrastructure",
          impact: `Supported with ${formatAmount(cust.totalSales, user.currency)} equipment procurement`
        });
      }
    });
    return businesses;
  }, [customers, user.currency]);
  return <div className="space-y-8 animate-fade-in">
      
      {
    /* Top Welcome Title Banner */
  }
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
        <div>
          <span className={`text-[10px] uppercase font-bold tracking-widest ${styles.textAccent} block mb-1`}>Staff & Surveillance Operations</span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">Workforce & Wages Command Center</h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Monitor real-time worker actions, supervise division sectors, track client solar equipment, and approve precise wages settlement payouts.
          </p>
        </div>
        
        <button
    id="btn-add-worker-modal"
    onClick={() => setShowAddWorker(true)}
    className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md ${styles.btnAccent}`}
  >
          <UserPlus className="w-4 h-4" />
          <span>Add Operations Staff</span>
        </button>
      </div>

      {loading ? <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-10 h-10 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Loading Workforce & Surveillance Ledger...</p>
        </div> : <>
          {
    /* Section 1: Dashboard Top Metric Widgets */
  }
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className={`glass-card rounded-2xl p-6 ${styles.cardGlow} border border-slate-800/60 flex items-center justify-between`}>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Active Staff</span>
                <p className="text-2xl font-mono font-bold text-slate-100">{workers.length}</p>
                <p className="text-[10px] text-slate-400">Deployed across 4 sectors</p>
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className={`glass-card rounded-2xl p-6 ${styles.cardGlow} border border-slate-800/60 flex items-center justify-between`}>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Wages Paid</span>
                <p className="text-2xl font-mono font-bold text-emerald-400">{formatAmount(totalWagesPaid, user.currency)}</p>
                <p className="text-[10px] text-slate-400">Paid payroll transactions</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                <Coins className="w-5 h-5" />
              </div>
            </div>

            <div className={`glass-card rounded-2xl p-6 ${styles.cardGlow} border border-slate-800/60 flex items-center justify-between`}>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Wages Outstanding</span>
                <p className={`text-2xl font-mono font-bold ${totalUnpaidWages > 0 ? "text-amber-400" : "text-slate-400"}`}>
                  {formatAmount(totalUnpaidWages, user.currency)}
                </p>
                <p className="text-[10px] text-slate-400">Unsettled worker balances</p>
              </div>
              <div className={`p-3 rounded-xl ${totalUnpaidWages > 0 ? "bg-amber-500/10 text-amber-400" : "bg-slate-800/50 text-slate-500"}`}>
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className={`glass-card rounded-2xl p-6 ${styles.cardGlow} border border-slate-800/60 flex items-center justify-between`}>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Logged Actions</span>
                <p className="text-2xl font-mono font-bold text-fuchsia-400">{actions.length}</p>
                <p className="text-[10px] text-slate-400">Civilian & supervisor audits</p>
              </div>
              <div className="p-3 bg-fuchsia-500/10 rounded-xl text-fuchsia-400">
                <Activity className="w-5 h-5" />
              </div>
            </div>

          </div>

          {
    /* Section 2: Division Sectors & Best Sellers Row */
  }
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {
    /* Division Sectors Breakdown */
  }
            <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-slate-800/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Layers className={`w-4 h-4 ${styles.textAccent}`} />
                  <h3 className="text-sm font-bold text-slate-200">Sector Workforce Allocation</h3>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-6">
                  Distribution of solar technicians, field engineering, freight drivers, and customer support.
                </p>

                <div className="space-y-4">
                  {Object.entries(sectorBreakdown).map(([sector, count]) => {
    const total = workers.length || 1;
    const pct = (count / total * 100).toFixed(0);
    return <div key={sector} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-300">{sector}</span>
                          <span className="font-mono text-slate-400">{count} {count === 1 ? "staff" : "staffs"} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div
      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
      style={{ width: `${pct}%` }}
    />
                        </div>
                      </div>;
  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 text-center">
                <p className="text-[10px] text-slate-500 font-mono">
                  All sectors currently running under direct civilian operations supervision.
                </p>
              </div>
            </div>

            {
    /* Best Selling Solar Products */
  }
            <div className="lg:col-span-7 glass-card rounded-2xl p-6 border border-slate-800/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-slate-200">Best-Selling Equipment Sales Matrix</h3>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    Top Sellers
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-6">
                  The primary driving products of the company, calculated dynamically from active invoice ledgers.
                </p>

                <div className="space-y-4">
                  {topSellingProducts.map((p, idx) => {
    const maxQty = Math.max(...topSellingProducts.map((x) => x.quantitySold)) || 1;
    const pct = (p.quantitySold / maxQty * 100).toFixed(0);
    return <div key={p.name} className="flex items-center justify-between gap-4 p-2.5 bg-slate-950/35 border border-slate-900 rounded-xl hover:border-slate-800/60 transition-all">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-semibold text-slate-200 truncate">{p.name}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                            <span className="font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400">{p.category}</span>
                            <span>•</span>
                            <span>{p.quantitySold} units sold</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-mono font-semibold text-emerald-400">{formatAmount(p.revenue, user.currency)}</p>
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5">Profit: {formatAmount(p.estimatedProfit, user.currency)}</p>
                        </div>
                      </div>;
  })}
                </div>
              </div>

              <div className="mt-4 text-right">
                <span className="text-[9px] font-mono text-slate-500">Live transaction synchronization active.</span>
              </div>
            </div>

          </div>

          {
    /* Section 3: Staff Roster Grid */
  }
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-400" />
                  <span>Operations Staff Roster</span>
                </h2>
                <p className="text-xs text-slate-500">Manage worker pay rates, track hours logged, and pay wages.</p>
              </div>

              {
    /* Search filter */
  }
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
    type="text"
    placeholder="Search staff, role, or sector..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
  />
              </div>
            </div>

            {
    /* Workers Cards Grid */
  }
            {filteredWorkers.length === 0 ? <div className="glass-card rounded-2xl p-12 text-center border border-slate-800/60">
                <Users className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-400">No operations staff match your query</p>
                <p className="text-xs text-slate-500 mt-1">Try modifying your search or add a new employee.</p>
              </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredWorkers.map((w) => {
    const hasOutstanding = w.unpaidWages > 0;
    return <div
      key={w.id}
      className={`glass-card rounded-2xl p-5 border border-slate-800/60 flex flex-col justify-between space-y-4 hover:border-slate-700/60 transition-all ${styles.cardGlow}`}
    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold text-sm">
                            {w.name.charAt(0)}
                          </div>
                          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${w.status === "active" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"}`}>
                            {w.status}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-200">{w.name}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{w.role}</p>
                          <span className="text-[10px] inline-block font-medium text-slate-500 font-mono mt-1 bg-slate-950 border border-slate-900 px-2 py-0.5 rounded">
                            {w.sector}
                          </span>
                        </div>

                        {
      /* Financial Ledger specs */
    }
                        <div className="pt-3 border-t border-slate-800/40 space-y-2">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Hourly Rate:</span>
                            <span className="font-mono font-semibold text-slate-300">{formatAmount(w.hourlyRate, user.currency)}/hr</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Tasks Completed:</span>
                            <span className="font-mono text-slate-300">{w.completedTasks || 0}</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Total Wages Paid:</span>
                            <span className="font-mono text-slate-300">{formatAmount(w.totalWagesPaid || 0, user.currency)}</span>
                          </div>
                          <div className="flex justify-between text-[11px] pt-1.5 border-t border-slate-900">
                            <span className="text-slate-400 font-semibold">Unpaid Balance:</span>
                            <span className={`font-mono font-bold ${hasOutstanding ? "text-amber-400" : "text-slate-500"}`}>
                              {formatAmount(w.unpaidWages || 0, user.currency)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {
      /* Interactive Buttons */
    }
                      <div className="space-y-2 pt-2">
                        <button
      onClick={() => {
        setSelectedWorkerId(w.id);
        setShowLogAction(true);
      }}
      className="w-full bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/60 py-2 rounded-xl text-[11px] font-bold text-slate-300 transition-colors flex items-center justify-center gap-1.5"
    >
                          <Activity className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Log Work Units</span>
                        </button>
                        
                        <button
      disabled={!hasOutstanding}
      onClick={() => handlePayWorkerWages(w.id)}
      className={`w-full py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${hasOutstanding ? "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-emerald-600/10" : "bg-slate-900 text-slate-600 border border-slate-800/40 cursor-not-allowed"}`}
    >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Approve & Settle Wages</span>
                        </button>
                      </div>
                    </div>;
  })}
              </div>}
          </div>

          {
    /* Section 4: Civilian Surveillance Log & Quick Form */
  }
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {
    /* Surveillance Action Log */
  }
            <div className="lg:col-span-8 glass-card rounded-2xl p-6 border border-slate-800/60 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-fuchsia-400" />
                  <h3 className="text-sm font-bold text-slate-200">Civilian Action Surveillance Audit</h3>
                </div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest bg-slate-950 border border-slate-900 px-2 py-0.5 rounded">
                  Audit Logs
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Supervisor logs of field actions. When actions are recorded, wage metrics are dynamically generated and added to the employee's pending tab.
              </p>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {actions.length === 0 ? <div className="text-center py-12">
                    <p className="text-xs text-slate-500">No actions logged yet in surveillance record.</p>
                  </div> : actions.slice().reverse().map((a, idx) => <div
    key={a.id || idx}
    className="p-3 bg-slate-950/45 border border-slate-900 hover:border-slate-800/60 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors"
  >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200">{a.workerName}</span>
                          <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded font-mono">
                            {a.workUnits} {a.unitType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{a.action}</p>
                        <span className="text-[9px] font-mono text-slate-600 block mt-1.5">{a.timestamp}</span>
                      </div>
                      
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-900 shrink-0">
                        <span className="font-mono font-bold text-xs text-amber-400">{formatAmount(a.calculatedWage, user.currency)}</span>
                        <span className={`text-[9px] font-bold uppercase mt-1 px-1.5 py-0.5 rounded ${a.status === "paid" ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-amber-500/10 border border-amber-500/20 text-amber-400 animate-pulse"}`}>
                          {a.status}
                        </span>
                      </div>
                    </div>)}
              </div>
            </div>

            {
    /* Quick Logging Supervisor Dashboard */
  }
            <div className="lg:col-span-4 glass-card rounded-2xl p-6 border border-slate-800/60 flex flex-col justify-between">
              <form onSubmit={handleLogActionSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-200">Civilian surveillance logging</h3>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
                  Supervise work in real-time. Log completed tasks/hours to calculate wages instantly.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Select Employee</label>
                    <select
    value={selectedWorkerId}
    onChange={(e) => setSelectedWorkerId(e.target.value)}
    required
    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
  >
                      <option value="">-- Choose employee --</option>
                      {workers.map((w) => <option key={w.id} value={w.id}>{w.name} ({w.role})</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Units of Work</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
    type="number"
    min="1"
    max="100"
    value={workUnits}
    onChange={(e) => setWorkUnits(Number(e.target.value))}
    required
    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 font-mono"
  />
                      <select
    value={unitType}
    onChange={(e) => setUnitType(e.target.value)}
    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
  >
                        <option value="hours">Hours</option>
                        <option value="tasks">Tasks</option>
                        <option value="trips">Trips</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Activity / Action Description</label>
                    <textarea
    placeholder="e.g. Assembled three solar racking frames, checked structural alignment..."
    value={actionDesc}
    onChange={(e) => setActionDesc(e.target.value)}
    required
    rows={3}
    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 leading-relaxed"
  />
                  </div>
                </div>

                <button
    type="submit"
    disabled={submitting || !selectedWorkerId || !actionDesc.trim()}
    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${submitting || !selectedWorkerId || !actionDesc.trim() ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"}`}
  >
                  <span>Log Activity & Add Wages</span>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>

          {
    /* Section 5: Client Businesses solar deployments */
  }
          <div className="glass-card rounded-2xl p-6 border border-slate-800/60 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-200">Active Client Solar Infrastructures & Business Details</h3>
              </div>
              <span className="text-[9px] font-mono text-slate-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-400 font-bold uppercase tracking-widest">
                Deployments
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time monitoring of client business directories using your equipment solutions. Tracks deployment capacity, business sectors, and environmental footprint savings.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              {clientBusinesses.map((b) => <div key={b.id} className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl hover:border-slate-800/60 transition-all flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-slate-200">{b.name}</h4>
                      <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400 font-mono">
                        {b.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">{b.type}</p>
                    
                    <div className="mt-3.5 space-y-1.5 text-[11px] border-t border-slate-900/50 pt-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">System Installed:</span>
                        <span className="text-slate-300 font-medium text-right truncate max-w-[150px]">{b.system}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Capacity Load:</span>
                        <span className="text-slate-300 font-mono font-medium">{b.capacity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-900 p-2 rounded-lg text-center">
                    <span className="text-[9px] uppercase font-bold text-emerald-400 tracking-wider block">Carbon Offset Impact</span>
                    <p className="text-[10px] text-slate-300 font-medium mt-0.5 leading-tight">{b.impact}</p>
                  </div>
                </div>)}
            </div>
          </div>
        </>}

      {
    /* MODALS */
  }
      
      {
    /* 1. Add Worker Modal */
  }
      {showAddWorker && <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAddWorker(false)} />
          <div className="relative glass-card border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl z-10 animate-scale-up">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-slate-200">Register Operations Worker</h3>
              <button onClick={() => setShowAddWorker(false)} className="text-slate-500 hover:text-slate-300 text-xs font-bold">✕</button>
            </div>

            <form onSubmit={handleAddWorkerSubmit} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Employee Name</label>
                  <input
    type="text"
    placeholder="e.g. Liam Patel"
    value={newWorkerName}
    onChange={(e) => setNewWorkerName(e.target.value)}
    required
    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Operational Role</label>
                  <input
    type="text"
    placeholder="e.g. Lead Inverter Diagnostician"
    value={newWorkerRole}
    onChange={(e) => setNewWorkerRole(e.target.value)}
    required
    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Operations Sector</label>
                  <select
    value={newWorkerSector}
    onChange={(e) => setNewWorkerSector(e.target.value)}
    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
  >
                    <option value="Assembly & Mounting">Assembly & Mounting</option>
                    <option value="Logistics & Transport">Logistics & Transport</option>
                    <option value="R&D Lab Testing">R&D Lab Testing</option>
                    <option value="Sales & Support">Sales & Support</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Wage Rate ({getCurrencySymbol(user.currency)}/hr)</label>
                    <input
    type="number"
    min="10"
    max="1000"
    value={newWorkerRate}
    onChange={(e) => setNewWorkerRate(Number(e.target.value))}
    required
    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 font-mono"
  />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Contact Phone</label>
                    <input
    type="text"
    placeholder="+91 98765 00000"
    value={newWorkerPhone}
    onChange={(e) => setNewWorkerPhone(e.target.value)}
    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 font-mono"
  />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
    type="button"
    onClick={() => setShowAddWorker(false)}
    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-semibold rounded-xl text-slate-400"
  >
                  Cancel
                </button>
                <button
    type="submit"
    disabled={submitting}
    className={`px-4 py-2 text-xs font-semibold rounded-xl ${styles.btnAccent}`}
  >
                  {submitting ? "Saving..." : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* 2. Log Action Modal */
  }
      {showLogAction && <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowLogAction(false)} />
          <div className="relative glass-card border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl z-10 animate-scale-up">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-slate-200">Log Surveillance Activity</h3>
              <button onClick={() => setShowLogAction(false)} className="text-slate-500 hover:text-slate-300 text-xs font-bold">✕</button>
            </div>

            <form onSubmit={handleLogActionSubmit} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400">
                    Recording work for: <strong className="text-indigo-400 font-semibold">{workers.find((w) => w.id === selectedWorkerId)?.name}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Units of Work Done</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
    type="number"
    min="1"
    max="100"
    value={workUnits}
    onChange={(e) => setWorkUnits(Number(e.target.value))}
    required
    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 font-mono"
  />
                    <select
    value={unitType}
    onChange={(e) => setUnitType(e.target.value)}
    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
  >
                      <option value="hours">Hours</option>
                      <option value="tasks">Tasks</option>
                      <option value="trips">Trips</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Description of Action / Tasks</label>
                  <textarea
    placeholder="Describe specific field activities audited..."
    value={actionDesc}
    onChange={(e) => setActionDesc(e.target.value)}
    required
    rows={4}
    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 leading-relaxed"
  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
    type="button"
    onClick={() => setShowLogAction(false)}
    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-semibold rounded-xl text-slate-400"
  >
                  Cancel
                </button>
                <button
    type="submit"
    disabled={submitting}
    className={`px-4 py-2 text-xs font-semibold rounded-xl ${styles.btnAccent}`}
  >
                  {submitting ? "Logging..." : "Log Action"}
                </button>
              </div>
            </form>
          </div>
        </div>}

    </div>;
}
function getCurrencySymbol(currency) {
  if (!currency) return "\u20B9";
  const upper = currency.toUpperCase();
  if (upper === "INR" || upper === "INDIA") return "\u20B9";
  if (upper === "USD") return "$";
  if (upper === "EUR") return "\u20AC";
  if (upper === "GBP") return "\xA3";
  if (upper === "JPY") return "\xA5";
  return "$";
}
