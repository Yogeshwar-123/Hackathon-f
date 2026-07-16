import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Trash2,
  Edit,
  Mail,
  Phone,
  MapPin,
  Search
} from "lucide-react";
import { formatAmount, getCurrencySymbol } from "../types";
export default function Customers({ user }) {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [totalSales, setTotalSales] = useState(0);
  const loadData = async () => {
    try {
      const cRes = await fetch("/api/customers");
      if (cRes.ok) setCustomers(await cRes.json());
    } catch (err) {
      console.error("Error loading customer data workspace", err);
    }
  };
  useEffect(() => {
    loadData();
  }, []);
  const handleResetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setAddress("");
    setTotalSales(0);
    setIsAdding(false);
    setEditingCustomer(null);
  };
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, company, address, totalSales })
      });
      if (res.ok) {
        const added = await res.json();
        setCustomers((prev) => [...prev, added]);
        handleResetForm();
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleEditInit = (cust) => {
    setEditingCustomer(cust);
    setName(cust.name);
    setEmail(cust.email);
    setPhone(cust.phone);
    setCompany(cust.company);
    setAddress(cust.address);
    setTotalSales(cust.totalSales);
    setIsAdding(false);
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCustomer) return;
    try {
      const res = await fetch(`/api/customers/${editingCustomer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, company, address, totalSales })
      });
      if (res.ok) {
        const updated = await res.json();
        setCustomers((prev) => prev.map((c) => c.id === updated.id ? updated : c));
        handleResetForm();
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer record?")) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCustomers((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };
  const filteredCustomers = customers.filter(
    (c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase()) || c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return <div id="customers_workspace" className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      
      {
    /* Title Header Banner */
  }
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-2 text-emerald-400 font-medium tracking-wide text-xs uppercase">
          <Users className="w-4 h-4 animate-pulse" />
          BizPilot Operations Portal
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
          Customer Directory
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Store and manage customer directory entries.
        </p>
      </div>

      {
    /* Bento Grid: Left Column (CRUD & Search) | Right Column (Interactive Analytics Question/Answers) */
  }
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {
    /* Customer Directory Ledger (8-Columns wide on lg screens) */
  }
        <div className="lg:col-span-12 space-y-4">
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Customer Directory
              </h3>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
    type="text"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="Search customers..."
    className="pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500 w-full sm:w-48"
  />
                </div>

                <button
    id="btn_add_customer"
    onClick={() => {
      handleResetForm();
      setIsAdding(true);
    }}
    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-md shadow-emerald-500/10 active:scale-95 transition-all"
  >
                  <Plus className="w-3.5 h-3.5" />
                  New Client
                </button>
              </div>
            </div>

            {
    /* Form Drawer / Area */
  }
            {(isAdding || editingCustomer) && <form onSubmit={editingCustomer ? handleUpdate : handleAdd} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 mb-4 space-y-3.5">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase">
                    {editingCustomer ? "Edit Customer Record" : "Register New Wholesale Account"}
                  </h4>
                  <button type="button" onClick={handleResetForm} className="text-[10px] text-slate-500 hover:text-slate-300">
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Customer Name *</label>
                    <input
    type="text"
    required
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="e.g. Timothy Cooper"
    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
  />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Company / Branch</label>
                    <input
    type="text"
    value={company}
    onChange={(e) => setCompany(e.target.value)}
    placeholder="e.g. Peak Solar Installations"
    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
  />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Email Address *</label>
                    <input
    type="email"
    required
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="tim@artisan.com"
    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
  />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Phone Number</label>
                    <input
    type="text"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    placeholder="+1 (555) 012-9922"
    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
  />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-400 mb-1">Billing / Delivery Address</label>
                    <input
    type="text"
    value={address}
    onChange={(e) => setAddress(e.target.value)}
    placeholder="Street, Suite, State"
    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
  />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Starting Life-time Sales ({getCurrencySymbol(user?.currency)})</label>
                    <input
    type="number"
    value={totalSales}
    onChange={(e) => setTotalSales(Number(e.target.value))}
    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
  />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
    type="submit"
    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-semibold"
  >
                    {editingCustomer ? "Save Changes" : "Create Record"}
                  </button>
                </div>
              </form>}

            {
    /* Customers table */
  }
            <div className="space-y-2">
              {filteredCustomers.length === 0 ? <div className="text-center py-8 text-slate-500 italic text-xs">
                  No customer records matched your query. Click "New Client" to register one.
                </div> : filteredCustomers.map((c) => <div key={c.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{c.name}</h4>
                        {c.company && <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            {c.company}
                          </span>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{c.email}</span>
                        </div>
                        {c.phone && <div className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>{c.phone}</span>
                          </div>}
                        {c.address && <div className="flex items-center gap-1 sm:col-span-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span className="truncate max-w-[280px]">{c.address}</span>
                          </div>}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/50">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Total Sales Volume</span>
                        <span className="text-xs font-bold text-emerald-400 font-mono">{formatAmount(c.totalSales, user?.currency)}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
    onClick={() => handleEditInit(c)}
    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg transition-all"
    title="Edit Customer"
  >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
    onClick={() => handleDelete(c.id)}
    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 rounded-lg transition-all"
    title="Delete Customer"
  >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>)}
            </div>
          </div>
        </div>

      </div>

    </div>;
}
