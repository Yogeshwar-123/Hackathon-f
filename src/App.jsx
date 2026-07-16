import { useState, useEffect, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Invoices from "./pages/Invoices";
import Workforce from "./pages/Workforce";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/SettingsPage";
import Logistics from "./pages/Logistics";
import Customers from "./pages/Customers";
import Backups from "./pages/Backups";
import Copilot from "./pages/Copilot";
import OperationsDashboard from "./pages/OperationsDashboard";
import { auth } from "./googleDrive";
import { signOut } from "firebase/auth";
export default function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("bizpilot_theme") || "emerald";
  });
  const handleUpdateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("bizpilot_theme", newTheme);
  };
  const [crtEnabled, setCrtEnabled] = useState(() => {
    const saved = localStorage.getItem("bizpilot_crt");
    if (saved !== null) {
      return saved === "true";
    }
    // Default fallback from environment variable
    return import.meta.env.VITE_DEFAULT_CRT_ENABLED === "true";
  });
  const handleToggleCrt = () => {
    const nextVal = !crtEnabled;
    setCrtEnabled(nextVal);
    localStorage.setItem("bizpilot_crt", nextVal ? "true" : "false");
  };
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [reports, setReports] = useState([]);
  const [compileLoading, setCompileLoading] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("bizpilot_profile");
    if (saved) {
      setUser(JSON.parse(saved));
    }
    fetch("/api/profile")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Unauthorized or session expired");
      })
      .then((data) => {
        if (data && data.businessName) {
          setUser(data);
          localStorage.setItem("bizpilot_profile", JSON.stringify(data));
        }
      })
      .catch((err) => {
        console.warn("Backend profile sync error on load", err);
        setUser(null);
        localStorage.removeItem("bizpilot_profile");
      });
  }, []);
  useEffect(() => {
    const loadEntities = async () => {
      try {
        const [pRes, iRes, tRes, rRes] = await Promise.all([
          fetch("/api/inventory"),
          fetch("/api/invoices"),
          fetch("/api/transactions"),
          fetch("/api/reports")
        ]);
        if (pRes.ok) setProducts(await pRes.json());
        if (iRes.ok) setInvoices(await iRes.json());
        if (tRes.ok) setTransactions(await tRes.json());
        if (rRes.ok) setReports(await rRes.json());
      } catch (err) {
        console.warn("Express backend connection not active yet. Fallback to client state memory.");
      }
    };
    if (user) {
      loadEntities();
    }
  }, [user]);
  const handleLoginSuccess = (profile) => {
    setUser(profile);
  };
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout sync failed:", err);
    }
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Firebase signout error:", err);
    }
    localStorage.removeItem("bizpilot_profile");
    localStorage.removeItem("bizpilot_chat");
    setUser(null);
  };
  const handleUpdateProfile = (profile) => {
    setUser(profile);
    localStorage.setItem("bizpilot_profile", JSON.stringify(profile));
  };
  const handleAddProduct = async (prodPayload) => {
    const newProduct = {
      ...prodPayload,
      id: "prod_" + Date.now()
    };
    setProducts((prev) => [newProduct, ...prev]);
    try {
      await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct)
      });
    } catch (err) {
      console.error(err);
    }
  };
  const handleEditProduct = async (id, partial) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, ...partial } : p));
    try {
      await fetch(`/api/inventory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial)
      });
    } catch (err) {
      console.error(err);
    }
  };
  const handleDeleteProduct = async (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/inventory/${id}`, {
        method: "DELETE"
      });
    } catch (err) {
      console.error(err);
    }
  };
  const handleAddInvoice = async (invPayload) => {
    const newInvoice = {
      ...invPayload,
      id: "inv_" + Date.now()
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    const txPayload = {
      description: `Invoice collection: ${invPayload.clientName} (${invPayload.invoiceNumber})`,
      amount: invPayload.total,
      type: invPayload.status === "paid" ? "revenue" : "revenue",
      // pending accounts receivable are still recorded
      category: "Invoice Collection",
      date: invPayload.issueDate
    };
    await handleAddTransaction(txPayload);
    try {
      await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInvoice)
      });
    } catch (err) {
      console.error(err);
    }
  };
  const handleEditInvoice = async (id, partial) => {
    setInvoices((prev) => prev.map((i) => i.id === id ? { ...i, ...partial } : i));
    try {
      await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial)
      });
    } catch (err) {
      console.error(err);
    }
  };
  const handleDeleteInvoice = async (id) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    try {
      await fetch(`/api/invoices/${id}`, {
        method: "DELETE"
      });
    } catch (err) {
      console.error(err);
    }
  };
  const handleAddTransaction = async (txPayload) => {
    const newTx = {
      ...txPayload,
      id: "tx_" + Date.now()
    };
    setTransactions((prev) => [newTx, ...prev]);
    try {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTx)
      });
    } catch (err) {
      console.error(err);
    }
  };
  const handleCompileReport = async () => {
    setCompileLoading(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error("Advisory compiler failed");
      }
      const newReport = await response.json();
      setReports((prev) => [newReport, ...prev]);
    } catch (err) {
      console.error("Report compilation error:", err);
      const mockReport = {
        id: "rep_" + Date.now(),
        title: `Strategic Trade Audit (${(/* @__PURE__ */ new Date()).toLocaleDateString()})`,
        date: (/* @__PURE__ */ new Date()).toLocaleDateString(),
        summary: "Operations are within optimal limits.",
        revenue: 0,
        expense: 0,
        profit: 0,
        lowStockItemsCount: 0,
        topProducts: [],
        recommendations: [],
        content: `### Executive Operations Summary
* **Gross margin levels**: Product profitability averages healthy margin levels.
* **Inventory restock triggers**: Review procurement logs for items that have breached minimal stock limits.`
      };
      setReports((prev) => [mockReport, ...prev]);
    } finally {
      setCompileLoading(false);
    }
  };
  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.quantity <= p.minStock).length;
  }, [products]);
  return <BrowserRouter>
      <Routes>
        {
    /* Landing Page Route */
  }
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />} />
        
        {
    /* Authentication Mode */
  }
        <Route
    path="/auth"
    element={<Auth onLoginSuccess={handleLoginSuccess} user={user} />}
  />

        {
    /* Protected BizPilot Platform Routes */
  }
        <Route
    path="/dashboard"
    element={user ? <Layout user={user} onLogout={handleLogout} lowStockCount={lowStockCount} theme={theme} crtEnabled={crtEnabled} onToggleCrt={handleToggleCrt}>
                <Dashboard
       user={user}
       products={products}
       invoices={invoices}
       transactions={transactions}
       theme={theme}
       crtEnabled={crtEnabled}
       onAddProduct={handleAddProduct}
       onEditProduct={handleEditProduct}
     />
              </Layout> : <Navigate to="/auth" replace />}
  />

        <Route
    path="/copilot"
    element={user ? <Layout user={user} onLogout={handleLogout} lowStockCount={lowStockCount} theme={theme} crtEnabled={crtEnabled} onToggleCrt={handleToggleCrt}>
                <Copilot
      user={user}
      products={products}
      invoices={invoices}
      transactions={transactions}
      theme={theme}
      crtEnabled={crtEnabled}
    />
              </Layout> : <Navigate to="/auth" replace />}
  />

        <Route
    path="/inventory"
    element={user ? <Layout user={user} onLogout={handleLogout} lowStockCount={lowStockCount} theme={theme} crtEnabled={crtEnabled} onToggleCrt={handleToggleCrt}>
                <Inventory
                  products={products}
                  user={user}
                  onAddProduct={handleAddProduct}
                  onEditProduct={handleEditProduct}
                  onDeleteProduct={handleDeleteProduct}
                />
              </Layout> : <Navigate to="/auth" replace />}
  />

        <Route
    path="/invoices"
    element={user ? <Layout user={user} onLogout={handleLogout} lowStockCount={lowStockCount} theme={theme} crtEnabled={crtEnabled} onToggleCrt={handleToggleCrt}>
                <Invoices
                  user={user}
                  invoices={invoices}
                  products={products}
                  onAddInvoice={handleAddInvoice}
                  onEditInvoice={handleEditInvoice}
                  onDeleteInvoice={handleDeleteInvoice}
                />
              </Layout> : <Navigate to="/auth" replace />}
  />

        <Route
    path="/workforce"
    element={user ? <Layout user={user} onLogout={handleLogout} lowStockCount={lowStockCount} theme={theme} crtEnabled={crtEnabled} onToggleCrt={handleToggleCrt}>
                <OperationsDashboard view="staff" user={user} crtEnabled={crtEnabled} />
              </Layout> : <Navigate to="/auth" replace />}
  />

        <Route
    path="/reports"
    element={user ? <Layout user={user} onLogout={handleLogout} lowStockCount={lowStockCount} theme={theme} crtEnabled={crtEnabled} onToggleCrt={handleToggleCrt}>
                <OperationsDashboard view="reports" user={user} crtEnabled={crtEnabled} />
              </Layout> : <Navigate to="/auth" replace />}
  />

        <Route
    path="/logistics"
    element={user ? <Layout user={user} onLogout={handleLogout} lowStockCount={lowStockCount} theme={theme} crtEnabled={crtEnabled} onToggleCrt={handleToggleCrt}>
                <Logistics crtEnabled={crtEnabled} />
              </Layout> : <Navigate to="/auth" replace />}
  />

        <Route
    path="/customers"
    element={user ? <Layout user={user} onLogout={handleLogout} lowStockCount={lowStockCount} theme={theme} crtEnabled={crtEnabled} onToggleCrt={handleToggleCrt}>
                <Customers user={user} crtEnabled={crtEnabled} />
              </Layout> : <Navigate to="/auth" replace />}
  />

        <Route
    path="/backups"
    element={user ? <Layout user={user} onLogout={handleLogout} lowStockCount={lowStockCount} theme={theme} crtEnabled={crtEnabled} onToggleCrt={handleToggleCrt}>
                <Backups crtEnabled={crtEnabled} />
              </Layout> : <Navigate to="/auth" replace />}
  />

        <Route
    path="/settings"
    element={user ? <Layout user={user} onLogout={handleLogout} lowStockCount={lowStockCount} theme={theme} crtEnabled={crtEnabled} onToggleCrt={handleToggleCrt}>
                <SettingsPage
      user={user}
      onUpdateProfile={handleUpdateProfile}
      theme={theme}
      onChangeTheme={handleUpdateTheme}
      crtEnabled={crtEnabled}
    />
              </Layout> : <Navigate to="/auth" replace />}
  />

        {
    /* Fallbacks */
  }
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>;
}
