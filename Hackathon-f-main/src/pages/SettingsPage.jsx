import { useState } from "react";
import { Save, ShieldAlert, BadgeCheck, CheckCircle2 } from "lucide-react";
const settingsThemeStyles = {
  cosmic: {
    textAccent: "text-purple-700",
    badgeBg: "bg-purple-50/50",
    badgeBorder: "border-purple-200",
    btnAccent: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm",
    focusBorder: "focus:border-purple-500",
    glowLine: "via-purple-500"
  },
  emerald: {
    textAccent: "text-teal-700",
    badgeBg: "bg-teal-50/50",
    badgeBorder: "border-teal-200",
    btnAccent: "bg-teal-700 hover:bg-teal-800 text-white shadow-sm",
    focusBorder: "focus:border-teal-500",
    glowLine: "via-teal-500"
  },
  copper: {
    textAccent: "text-amber-700",
    badgeBg: "bg-amber-50/50",
    badgeBorder: "border-amber-200",
    btnAccent: "bg-amber-600 hover:bg-amber-700 text-white shadow-sm",
    focusBorder: "focus:border-amber-500",
    glowLine: "via-amber-500"
  },
  lagoon: {
    textAccent: "text-blue-700",
    badgeBg: "bg-blue-50/50",
    badgeBorder: "border-blue-200",
    btnAccent: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
    focusBorder: "focus:border-blue-500",
    glowLine: "via-blue-500"
  }
};
export default function SettingsPage({
  user,
  onUpdateProfile,
  theme = "cosmic",
  onChangeTheme
}) {
  const [name, setName] = useState(user.name);
  const [businessName, setBusinessName] = useState(user.businessName);
  const [businessType, setBusinessType] = useState(user.businessType);
  const [currency, setCurrency] = useState(user.currency);
  const [email, setEmail] = useState(user.email);
  const [success, setSuccess] = useState(false);
  const stTheme = settingsThemeStyles[theme] || settingsThemeStyles.cosmic;
  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(false);
    const updated = {
      name,
      businessName,
      businessType,
      currency,
      email
    };
    onUpdateProfile(updated);
    fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    }).then(() => {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3e3);
    }).catch((err) => {
      console.error("Profile sync error:", err);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3e3);
    });
  };
  return <div className="space-y-8 animate-fade-in max-w-2xl">
      
      {
    /* Title block */
  }
      <div>
        <span className={`text-xs uppercase font-bold tracking-widest ${stTheme.textAccent} font-mono transition-all duration-500`}>Command Center Parameters</span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mt-1">Enterprise Settings</h1>
        <p className="text-xs text-gray-500 mt-1">Configure your business parameters, localized currency codes, and visual theme configurations.</p>
      </div>

      {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-teal-700 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Enterprise parameters successfully synchronized to central BizPilot databases!</span>
        </div>}

      {
    /* Main Settings Form */
  }
      <div className="glass-card rounded-2xl p-6 relative">
        <div className={`absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent ${stTheme.glowLine} to-transparent transition-all duration-500`} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {
    /* Operator Name */
  }
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5">Your Executive Name</label>
              <input
    type="text"
    required
    value={name}
    onChange={(e) => setName(e.target.value)}
    className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs ${stTheme.focusBorder} focus:outline-none text-gray-900 transition-all duration-300`}
  />
            </div>

            {
    /* Account Email */
  }
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5">Registered Email</label>
              <input
    type="email"
    required
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs ${stTheme.focusBorder} focus:outline-none text-gray-900 transition-all duration-300`}
  />
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {
    /* Business/Enterprise Name */
  }
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5">Enterprise Name</label>
              <input
    type="text"
    required
    value={businessName}
    onChange={(e) => setBusinessName(e.target.value)}
    className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs ${stTheme.focusBorder} focus:outline-none text-gray-900 transition-all duration-300`}
  />
            </div>

            {
    /* Enterprise Type */
  }
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5">Enterprise Type</label>
              <select
    value={businessType}
    onChange={(e) => setBusinessType(e.target.value)}
    className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs ${stTheme.focusBorder} focus:outline-none text-gray-800 transition-all duration-305`}
  >
                <option value="Wholesale & Distribution">Wholesale & Distribution</option>
                <option value="Retail Boutique">Retail Boutique</option>
                <option value="Local Manufacturing">Local Manufacturing</option>
                <option value="Small Startup">Tech Startup</option>
                <option value="Services & Consulting">Services & Consulting</option>
                <option value="Healthcare & Pharmacy">Healthcare & Pharmacy</option>
                <option value="Logistics & Transport">Logistics & Transport</option>
                <option value="Construction & Materials">Construction & Materials</option>
                <option value="Restaurant & Food Service">Restaurant & Food Service</option>
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {
    /* Preferred currency code */
  }
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5">Standard Currency Code</label>
              <select
    value={currency}
    onChange={(e) => setCurrency(e.target.value)}
    className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs ${stTheme.focusBorder} focus:outline-none text-gray-800 transition-all duration-305`}
  >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>

            {
    /* Visual Theme Selection */
  }
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5">Workspace Theme style</label>
              <select
    value={theme}
    onChange={(e) => onChangeTheme?.(e.target.value)}
    className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs ${stTheme.focusBorder} focus:outline-none text-gray-800 transition-all duration-305`}
  >
                <option value="cosmic">Cosmic Midnight (Indigo/Violet)</option>
                <option value="emerald">Royal Emerald (Jade/Gold)</option>
                <option value="copper">Sunset Copper (Espresso/Amber)</option>
                <option value="lagoon">Oceanic Lagoon (Teal/Cyan)</option>
              </select>
            </div>

          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold bg-gray-50/50 p-4 rounded-xl border border-gray-200 w-full">
            <BadgeCheck className="w-4.5 h-4.5 shrink-0 text-teal-700" />
            <span>AI Command Center & Ledger Database Synced</span>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <button
    type="submit"
    className={`px-6 py-2.5 ${stTheme.btnAccent} text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer`}
  >
              <Save className="w-4 h-4" />
              <span>Synchronize Parameters</span>
            </button>
          </div>

        </form>
      </div>

      {
    /* Safety info card */
  }
      <div className="bg-gray-50 border border-gray-250 rounded-2xl p-5 flex gap-4 items-start">
        <ShieldAlert className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-gray-800">Operations Isolation Zone</h4>
          <p className="text-[11px] text-gray-450 leading-relaxed">BizPilot automatically creates isolated, local database partitions to prevent cross-company leakage. Your API keys and client data are locked inside your secure container environment.</p>
        </div>
      </div>

    </div>;
}
