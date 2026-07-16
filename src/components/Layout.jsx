import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FileText,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Users,
  Search,
  Archive,
  Activity,
  Database,
  ShieldCheck,
  Mail,
  HelpCircle,
  BookOpen,
  Compass,
  MapPin,
  Info,
  Tv
} from "lucide-react";
const themeStyles = {
  cosmic: {
    bg: "bg-gray-50 text-gray-900",
    glow1: "hidden",
    glow2: "hidden",
    glow3: "hidden",
    navActive: "bg-slate-100 text-slate-900 border-l-4 border-slate-800 shadow-none",
    navIconActive: "text-slate-800",
    logoBg: "bg-slate-800",
    badge: "text-slate-800 bg-slate-100 border border-slate-200 shadow-none",
    badgeColor: "bg-slate-700",
    btnPrimary: "bg-slate-800 hover:bg-slate-900 text-white focus:ring-slate-500"
  },
  emerald: {
    bg: "bg-gray-50 text-gray-900",
    glow1: "hidden",
    glow2: "hidden",
    glow3: "hidden",
    navActive: "bg-teal-50 text-teal-800 border-l-4 border-teal-700 shadow-none",
    navIconActive: "text-teal-700",
    logoBg: "bg-teal-700",
    badge: "text-teal-800 bg-teal-100 border border-teal-200 shadow-none",
    badgeColor: "bg-teal-700",
    btnPrimary: "bg-teal-700 hover:bg-teal-800 text-white focus:ring-teal-500"
  },
  copper: {
    bg: "bg-gray-50 text-gray-900",
    glow1: "hidden",
    glow2: "hidden",
    glow3: "hidden",
    navActive: "bg-amber-50 text-amber-900 border-l-4 border-amber-850 shadow-none",
    navIconActive: "text-amber-800",
    logoBg: "bg-amber-700",
    badge: "text-amber-800 bg-amber-100 border border-amber-200 shadow-none",
    badgeColor: "bg-amber-700",
    btnPrimary: "bg-amber-700 hover:bg-amber-800 text-white focus:ring-amber-500"
  },
  lagoon: {
    bg: "bg-gray-50 text-gray-900",
    glow1: "hidden",
    glow2: "hidden",
    glow3: "hidden",
    navActive: "bg-blue-50 text-blue-800 border-l-4 border-blue-700 shadow-none",
    navIconActive: "text-blue-700",
    logoBg: "bg-blue-800",
    badge: "text-blue-800 bg-blue-100 border border-blue-200 shadow-none",
    badgeColor: "bg-blue-750",
    btnPrimary: "bg-blue-800 hover:bg-blue-900 text-white focus:ring-blue-500"
  }
};
export default function Layout({ children, user, onLogout, lowStockCount, theme = "cosmic", crtEnabled, onToggleCrt }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState("what");
  const location = useLocation();
  const navigate = useNavigate();

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);

  const paletteOptions = [
    { name: "Dashboard", description: "Operations Overview, Revenue & Insights", path: "/dashboard", icon: LayoutDashboard },
    { name: "AI Copilot", description: "Consult BizPilot AI on any business queries", path: "/copilot", icon: Sparkles },
    { name: "Invoices", description: "Create, view and manage billing ledgers", path: "/invoices", icon: FileText },
    { name: "Inventory", description: "Equipment, stock levels and reorder parameters", path: "/inventory", icon: Package },
    { name: "Customers", description: "Accounts directory and relationships ledger", path: "/customers", icon: Users },
    { name: "Reports", description: "Strategic Trade Audit and compiler settings", path: "/reports", icon: TrendingUp },
    { name: "Settings", description: "Control panel parameters and visuals type", path: "/settings", icon: Settings },
  ];

  const filteredOptions = useMemo(() => {
    return paletteOptions.filter((opt) =>
      opt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        setSearchQuery("");
        setSelectedIdx(0);
      } else if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!commandPaletteOpen) return;
    
    const handleNavigationKeys = (e) => {
      if (filteredOptions.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((prev) => (prev + 1) % filteredOptions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredOptions[selectedIdx]) {
          navigate(filteredOptions[selectedIdx].path);
          setCommandPaletteOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleNavigationKeys);
    return () => window.removeEventListener("keydown", handleNavigationKeys);
  }, [commandPaletteOpen, filteredOptions, selectedIdx, navigate]);

  useEffect(() => {
    // If it is a completely empty DB and the user is logged in, auto-open the guide to show them "what is what"
    const dismissed = localStorage.getItem("bizpilot_guide_dismissed");
    if (!dismissed && user) {
      setShowHelpGuide(true);
    }
  }, [user]);
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI Copilot", href: "/copilot", icon: Sparkles, badge: "AI" },
    { name: "Billing & Invoices", href: "/invoices", icon: FileText },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Sales & Reports", href: "/reports", icon: TrendingUp },
    { name: "Staff & Wages", href: "/workforce", icon: Activity },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings }
  ];
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);
  const currentTheme = themeStyles[theme] || themeStyles.cosmic;
  return <div className={`min-h-screen ${currentTheme.bg} text-gray-900 flex font-sans selection:bg-teal-100 selection:text-teal-900 transition-colors duration-200 ${crtEnabled ? "crt-active theme-" + theme + " crt-flicker" : ""}`}>
      <div className="absolute inset-0 grid-bg-overlay pointer-events-none z-0" />
      
      {
    /* Background glow effects - Dynamic Theme */
  }
      <div className={`absolute top-[-10%] left-1/4 w-[600px] h-[600px] ${currentTheme.glow1} rounded-full blur-[140px] pointer-events-none animate-pulse-slow transition-all duration-500`} />
      <div className={`absolute bottom-10 right-10 w-[500px] h-[500px] ${currentTheme.glow2} rounded-full blur-[120px] pointer-events-none transition-all duration-500`} />
      <div className={`absolute top-1/2 left-1/3 w-[400px] h-[400px] ${currentTheme.glow3} rounded-full blur-[130px] pointer-events-none transition-all duration-500`} />

      {
    /* Desktop Sidebar */
  }
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-250 p-5 h-screen sticky top-0 z-20 transition-all duration-200 overflow-y-auto scrollbar-none shadow-sm">
        <div className="flex items-center gap-3 px-2 py-4">
          <div className={`${currentTheme.logoBg} p-2.5 rounded-lg shadow-sm transition-all duration-200`}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <span className="font-display font-bold text-base tracking-tight text-gray-900 truncate block">{user?.businessName || "BizPilot"}</span>
            <span className="text-[9px] block text-gray-500 font-semibold uppercase tracking-widest truncate">Business Command Center</span>
            <span className="text-[8px] block text-gray-400 font-medium italic truncate mt-0.5">Pilot Your Business with AI</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 mt-8">
          {navigation.map((item) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;
    return <Link
      key={item.name}
      id={`nav-${item.name.toLowerCase().replace(" ", "-")}`}
      to={item.href}
      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive ? currentTheme.navActive : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
    >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-105 ${isActive ? currentTheme.navIconActive : "text-gray-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && <span className="px-1.5 py-0.5 text-[9px] font-semibold text-teal-850 bg-teal-50 rounded border border-teal-200">
                    {item.badge}
                  </span>}
                {item.name === "Inventory" && lowStockCount > 0 && <span className="px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 bg-amber-50 rounded-full border border-amber-250 animate-pulse">
                    {lowStockCount}
                  </span>}
              </Link>;
  })}
        </nav>

        {
    /* User Card */
  }
        <div className="mt-auto border-t border-gray-200 pt-4 px-2">
          {user ? <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold truncate text-gray-700">{user.name}</h4>
                  <p className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                    <Mail className="w-3 h-3 text-gray-450 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{user.businessName}</p>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg px-2 py-1 flex items-center gap-1.5 mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span className="text-[9px] font-mono font-bold text-green-700 tracking-wider uppercase">Identity Verified</span>
              </div>
              <button
                id="btn-desktop-logout"
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-650 hover:bg-red-50 transition-colors mt-1 hover:text-red-750"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div> : <button
    onClick={() => navigate("/auth")}
    className={`w-full ${currentTheme.btnPrimary} py-2 rounded-lg text-sm font-semibold transition-all`}
  >
              Log In
            </button>}
        </div>
      </aside>

      {
    /* Mobile Sidebar overlay */
  }
      {sidebarOpen && <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {
    /* Mobile Sidebar */
  }
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-250 p-5 z-40 lg:hidden transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} shadow-lg`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-gray-700" />
            <div className="min-w-0">
              <span className="font-display font-bold text-lg text-gray-900 block leading-none">BizPilot</span>
              <span className="text-[8px] text-gray-500 font-medium italic mt-0.5 block">Pilot Your Business with AI</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;
    return <Link
      key={item.name}
      to={item.href}
      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? currentTheme.navActive : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
    >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge && <span className="px-1.5 py-0.5 text-[9px] font-semibold text-teal-850 bg-teal-50 rounded border border-teal-200">
                    {item.badge}
                  </span>}
                {item.name === "Inventory" && lowStockCount > 0 && <span className="px-1.5 py-0.5 text-[10px] font-semibold text-amber-850 bg-amber-50 rounded-full">
                    {lowStockCount}
                  </span>}
              </Link>;
  })}
        </nav>

        <div className="absolute bottom-5 left-5 right-5 border-t border-gray-200 pt-4">
          {user ? <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold truncate text-gray-700">{user.name}</h4>
                  <p className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                    <Mail className="w-3 h-3 text-gray-450 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </p>
                  <p className="text-[10px] text-gray-450 truncate mt-0.5">{user.businessName}</p>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg px-2 py-1 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span className="text-[9px] font-mono font-bold text-green-700 tracking-wider uppercase">Identity Verified</span>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-650 py-2 rounded-lg text-xs font-semibold transition-colors mt-1 hover:text-red-750"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div> : <button
    onClick={() => navigate("/auth")}
    className={`w-full ${currentTheme.btnPrimary} py-2.5 rounded-lg text-sm font-semibold transition-all`}
  >
              Log In
            </button>}
        </div>
      </aside>

      {
    /* Main Content Area */
  }
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden relative z-10">
        
        {
    /* Top Header */
  }
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 p-4 flex items-center justify-between shadow-sm transition-all duration-200">
          <button
    onClick={() => setSidebarOpen(true)}
    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
  >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden lg:flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 bg-gray-50 border border-gray-250 rounded-full ${currentTheme.badge} flex items-center gap-1.5 transition-all duration-200`}>
              <span className={`w-1.5 h-1.5 ${currentTheme.badgeColor} rounded-full animate-pulse`} />
              Operations Panel Active
            </span>
          </div>

          <div className="flex items-center gap-4">
            {
    /* Quick alert indicator */
  }
            {lowStockCount > 0 && <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-full">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{lowStockCount} Low stock alerts</span>
              </div>}

            {
    /* Notification system */
  }
            <div className="relative">
              <button
    id="btn-notification"
    onClick={() => setShowNotifications(!showNotifications)}
    className="p-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-700 transition-all relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
  >
                <Bell className="w-4 h-4" />
                {lowStockCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-650 rounded-full animate-bounce" />}
              </button>

              {showNotifications && <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-2.5 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden divide-y divide-gray-150">
                    <div className="p-4 flex items-center justify-between">
                      <span className="font-semibold text-sm text-gray-800">Operations Alerts</span>
                      <span className="text-xs text-teal-700 font-semibold cursor-pointer hover:underline" onClick={() => navigate("/workforce")}>Track Wages</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                      {lowStockCount > 0 ? <div className="p-4 flex gap-3 hover:bg-gray-50 transition-colors">
                          <div className="p-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg h-fit shrink-0">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">Replenishment Alert</p>
                            <p className="text-[11px] text-gray-500 mt-1">{lowStockCount} products have fallen below minimum thresholds. Review inventory now.</p>
                          </div>
                        </div> : <div className="p-4 flex gap-3">
                          <div className="p-1.5 bg-green-50 border border-green-200 text-green-850 rounded-lg h-fit shrink-0">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">All Operations Healthy</p>
                            <p className="text-[11px] text-gray-500 mt-1">Stock levels, reports, and payments are up to date.</p>
                          </div>
                        </div>}
                      <div className="p-4 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate("/workforce")}>
                        <div className="p-1.5 bg-teal-55 text-teal-800 border border-teal-200 rounded-lg h-fit shrink-0">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">Workforce Notification</p>
                          <p className="text-[11px] text-gray-500 mt-1">Check surveillance actions log & settle outstanding employee wages before month-end closure.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>}
            </div>

            {/* CRT Display Mode Switch */}
            <button
              onClick={onToggleCrt}
              className={`p-2 rounded-lg border transition-all duration-200 flex items-center gap-1.5 font-medium text-xs px-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                crtEnabled
                  ? "bg-teal-50 text-teal-850 border-teal-350 shadow-sm animate-pulse"
                  : "bg-white hover:bg-gray-50 border-gray-250 text-gray-600 hover:text-gray-800"
              }`}
            >
              <Tv className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">{crtEnabled ? "CRT: ON" : "CRT: OFF"}</span>
            </button>

            {
    /* Interactive Help Guide Trigger Button */
  }
            <button
              id="btn-help-guide"
              onClick={() => setShowHelpGuide(true)}
              className="p-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-250 text-gray-600 hover:text-teal-700 transition-all relative flex items-center gap-1.5 font-medium text-xs px-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <HelpCircle className="w-4 h-4 text-teal-650" />
              <span className="hidden md:inline">App Guide</span>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
              </span>
            </button>

            {
    /* Quick Profile Icon */
  }
            {user && <div className="flex items-center gap-2.5 border-l border-gray-200 pl-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-650 font-bold text-xs">
                  {user.name?.charAt(0) || "?"}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-gray-700 leading-none">{user.name}</p>
                  <span className="text-[10px] text-gray-400 block mt-0.5">{user.businessName}</span>
                </div>
              </div>}
          </div>
        </header>

        {
    /* Dynamic Page Stage */
  }
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto relative">
          {children}
        </main>
      </div>

      {showHelpGuide && (
        <>
          {/* Overlay backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/30 backdrop-blur-sm z-50 transition-opacity duration-300"
            onClick={() => {
              setShowHelpGuide(false);
              localStorage.setItem("bizpilot_guide_dismissed", "true");
            }}
          />
          
          {/* Drawer Panel */}
          <div className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-white border-l border-gray-250 p-6 shadow-2xl z-50 flex flex-col justify-between overflow-y-auto">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-teal-50 text-teal-850 border border-teal-200">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-md font-bold tracking-tight text-gray-900 flex items-center gap-2">
                      Interactive Operations Guide
                    </h2>
                    <p className="text-[11px] text-gray-500">Master BizPilot’s clean business workspace</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowHelpGuide(false);
                    localStorage.setItem("bizpilot_guide_dismissed", "true");
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-lg border border-gray-200 mb-6">
                <button
                  onClick={() => setActiveGuideTab("what")}
                  className={`py-2 px-1 text-center text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    activeGuideTab === "what"
                      ? `${currentTheme.btnPrimary} shadow-sm`
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  What is What?
                </button>
                <button
                  onClick={() => setActiveGuideTab("where")}
                  className={`py-2 px-1 text-center text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    activeGuideTab === "where"
                      ? `${currentTheme.btnPrimary} shadow-sm`
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Which is Where?
                </button>
                <button
                  onClick={() => setActiveGuideTab("progressive")}
                  className={`py-2 px-1 text-center text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    activeGuideTab === "progressive"
                      ? `${currentTheme.btnPrimary} shadow-sm`
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Getting Started
                </button>
              </div>

              {/* Tab Contents */}
              {activeGuideTab === "what" && (
                <div className="space-y-4">
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg mb-4">
                    <p className="text-[11px] text-teal-850 font-medium">
                      💡 Welcome to your clean slate! To ensure data privacy and pristine records, there is no default mock data. Use the guide below to learn about the system.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    <div className="flex gap-3">
                      <div className="p-2 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg h-fit shrink-0">
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">Executive Dashboard</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                          Your live solar metrics hub. It displays your active inventory stats, revenue flow, recent transaction ledgers, and intelligent action insights.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="p-2 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg h-fit shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">Inventory Catalog</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                          Houses your solar assets (e.g., Panels, Inverters, Battery Kits). You can log unit costs, stock quantities, and minimum thresholds to receive restock warnings.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="p-2 bg-amber-55 text-amber-800 border border-amber-200 rounded-lg h-fit shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">Professional Invoices</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                          Draft, download, and track professional solar B2B and retail invoices. Completing invoices seamlessly posts to your financial statement!
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg h-fit shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">Partner & Customers DB</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                          Manage contact info, installation projects, and billing details for regular customers, installation subcontractors, and partners.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="p-2 bg-pink-50 text-pink-850 border border-pink-200 rounded-lg h-fit shrink-0">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">Workforce & Wages</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                          Log technician hours or solar panel piece-rate installations, track installer attendance logs, and settle monthly technician wages securely.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="p-2 bg-slate-50 text-slate-800 border border-slate-200 rounded-lg h-fit shrink-0">
                        <Archive className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">Task Scheduler</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                          Schedule recurring checks, run remote site surveys, and keep your solar installation pipeline perfectly in sync.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="p-2 bg-red-50 text-red-805 border border-red-200 rounded-lg h-fit shrink-0">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">Daily Operations Reports</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                          Run calculations to summarize your solar company profit margins, check stock restock indicators, and download official operations PDF.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeGuideTab === "where" && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-250">
                    <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5 mb-2">
                      <Compass className="w-4 h-4 text-teal-600" /> Visual Map & Navigation
                    </h4>
                    <p className="text-[11px] text-gray-600 leading-relaxed mb-3">
                      BizPilot features a clean, responsive layout carefully divided into distinct sections:
                    </p>
                    <ul className="space-y-2 text-[11px] text-gray-500 list-disc list-inside">
                      <li>
                        <strong className="text-gray-800">Left Sidebar</strong>: Toggle between all core business modules. Includes a quick user identity status card at the bottom.
                      </li>
                      <li>
                        <strong className="text-gray-800">Top Header Navigation</strong>: Contains system health, low-stock alerts, and the Notification Center panel.
                      </li>
                      <li>
                        <strong className="text-gray-800">Bottom Left Footer</strong>: Contains your active credentials, database sync verification status, and the secure logout button.
                      </li>
                      <li>
                        <strong className="text-gray-800">Main Canvas</strong>: The large area where active lists, charts, and invoice documents are rendered dynamically.
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-250">
                    <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5 mb-2">
                      <MapPin className="w-4 h-4 text-teal-600" /> Key Actions & Locations
                    </h4>
                    <table className="w-full text-left text-[11px] text-gray-500">
                      <thead>
                        <tr className="border-b border-gray-250 text-gray-700 font-bold">
                           <th className="pb-1.5">Action</th>
                           <th className="pb-1.5">Where is it?</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150">
                        <tr>
                          <td className="py-2 text-gray-800 font-semibold">Add New Product</td>
                          <td className="py-2">"Inventory" → "+ Add Solar Product"</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-800 font-semibold">Create Invoices</td>
                          <td className="py-2">"Invoices" → "New Invoice" button</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-800 font-semibold">Track Wages</td>
                          <td className="py-2">"Workforce" → "Add Employee" / "Log Hours"</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-800 font-semibold">Compile Daily PDF</td>
                          <td className="py-2">"Daily Reports" → "Compile Operations"</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-800 font-semibold">Currency & Profile</td>
                          <td className="py-2">"Settings" → Edit profile, select INR or USD</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}


              {activeGuideTab === "progressive" && (
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
                    <p className="text-[11px] text-green-800 font-medium">
                      🚀 Progressive Setup Checklist: Follow these 5 steps to populate your clean dashboard with solar operations!
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex gap-3 items-start">
                      <span className="w-5 h-5 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-xs shrink-0">1</span>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          Create Your Solar Catalog
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                          Navigate to the <span className="text-teal-700 font-semibold">Inventory</span> tab. Add a few products, like "450W Mono Solar Panel" or "5kW Hybrid Inverter" with quantity, cost, and safety stock levels.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex gap-3 items-start">
                      <span className="w-5 h-5 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-xs shrink-0">2</span>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          Register Installation Clients
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                          Go to <span className="text-teal-700 font-semibold">Customers</span>. Log customer business names, project addresses, and phone numbers. This gives you partners to link to upcoming invoices.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex gap-3 items-start">
                      <span className="w-5 h-5 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-xs shrink-0">3</span>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          Onboard Solar Installers
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                          Open <span className="text-teal-700 font-semibold">Workforce & Wages</span>. Register your engineers and laborers. Add daily attendance entries and log piece-rate hours to automatically calculate wages.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex gap-3 items-start">
                      <span className="w-5 h-5 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-xs shrink-0">4</span>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          Generate Your First Sale Invoice
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                          Open the <span className="text-teal-700 font-semibold">Invoices</span> page. Click "New Invoice", choose your client, select products from your catalog, set the tax rate, and choose "Paid" or "Pending". 
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex gap-3 items-start">
                      <span className="w-5 h-5 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-xs shrink-0">5</span>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          Observe Real-Time Reporting
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                          Once data is inputted, check the <span className="text-teal-750 font-semibold">Dashboard</span>. You'll see real charts, margins, and transactions. Navigate to <span className="text-teal-750 font-semibold">Daily Reports</span> to compile a professional PDF report!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-8 border-t border-gray-200 pt-4 flex items-center justify-between">
              <span className="text-[10px] text-gray-400">BizPilot Command Center Guide v1.2</span>
              <button
                onClick={() => {
                  setShowHelpGuide(false);
                  localStorage.setItem("bizpilot_guide_dismissed", "true");
                }}
                className={`px-4 py-2 ${currentTheme.btnPrimary} rounded-lg text-xs font-semibold transition-all shadow-sm`}
              >
                Let's Build!
              </button>
            </div>
          </div>
        </>
      )}

      {/* Global CRT overlays */}
      {crtEnabled && (
        <>
          <div className="crt-scanlines" />
          <div className="crt-refresh-bar" />
          <div className="crt-vignette" />
        </>
      )}

      {/* Global Command Palette Dialog */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-slide-up flex flex-col max-h-[60vh]">
            {/* Search Input field */}
            <div className="relative border-b border-gray-150 flex items-center px-4.5 py-3">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIdx(0);
                }}
                placeholder="Search command or page..."
                className="w-full ml-3 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400 font-sans"
              />
              <span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-500 border border-gray-200 tracking-wider">
                ESC
              </span>
            </div>

            {/* List options */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, idx) => {
                  const Icon = opt.icon;
                  const isSelected = selectedIdx === idx;
                  return (
                    <button
                      key={opt.name}
                      onClick={() => {
                        navigate(opt.path);
                        setCommandPaletteOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-150 flex items-center gap-3 cursor-pointer group ${
                        isSelected 
                          ? "bg-gray-55 border border-gray-200 text-gray-900 shadow-sm" 
                          : "border border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span className={`p-2 rounded-lg transition-colors ${
                        isSelected ? "bg-teal-50 text-teal-700" : "bg-gray-100 text-gray-400 group-hover:text-gray-650"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold block">{opt.name}</span>
                        <span className="text-[10px] text-gray-400 group-hover:text-gray-500 truncate block mt-0.5">{opt.description}</span>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-semibold text-teal-700 animate-pulse shrink-0">
                          ↵ Select
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-450">
                  <p className="text-xs font-medium">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>

            {/* Footer guide */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-150 flex items-center justify-between text-[9px] text-gray-450 font-bold uppercase tracking-wider">
              <span>Use ↑↓ keys to navigate</span>
              <span>Enter to go</span>
            </div>
          </div>
        </div>
      )}

    </div>;
}
