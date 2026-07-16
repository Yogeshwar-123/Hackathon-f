import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  MessageSquareCode,
  BarChart3,
  Receipt,
  PackageCheck,
  Zap,
  ChevronDown
} from "lucide-react";
export default function LandingPage() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [activeFaq, setActiveFaq] = useState(null);
  const [userBusinessName, setUserBusinessName] = useState("Siddu Enterprises");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bizpilot_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.businessName) {
          setUserBusinessName(parsed.businessName);
          return;
        }
      }
    } catch (e) {
      console.warn("Error reading local storage profile", e);
    }
    fetch("/api/profile").then((res) => {
      if (res.ok) return res.json();
    }).then((data) => {
      if (data && data.businessName) {
        setUserBusinessName(data.businessName);
      }
    }).catch((err) => console.warn("Landing profile sync error", err));
  }, []);
  const stats = [
    { value: "40%", label: "Average operational cost savings" },
    { value: "15hrs", label: "Admin work automated weekly" },
    { value: "99.4%", label: "OCR invoice parsing accuracy" },
    { value: "10k+", label: "MSMEs empowered worldwide" }
  ];
  const features = [
    {
      icon: LayoutIcon(Receipt, "text-emerald-400 bg-emerald-500/10"),
      title: "Smart Invoice Generator",
      description: "Upload any physical invoice or PDF receipt. Our advanced multimodal model instantly extracts line items, taxes, totals, and logs them to your ledger in 2 seconds."
    },
    {
      icon: LayoutIcon(PackageCheck, "text-amber-400 bg-amber-500/10"),
      title: "Inventory Tracking",
      description: "Track SKU stock, detect depletion triggers automatically, and manage purchase orders before you run out of stock."
    },
    {
      icon: LayoutIcon(BarChart3, "text-blue-400 bg-blue-500/10"),
      title: "One-Click Daily Reporting",
      description: "Stop spending hours reconciling spreadsheets. Generate comprehensive daily visual reports covering revenue, margins, and expenses instantly."
    }
  ];
  const pricingPlans = [
    {
      name: "Starter Pilot",
      price: billingCycle === "monthly" ? "$29" : "$19",
      period: "/month",
      description: "Essential AI automation tools for growing retail shops & small local outlets.",
      features: [
        "Up to 250 products tracked",
        "50 AI Invoice OCR extractions/mo",
        "Weekly automated operations reports",
        "Email support",
        "1 active user profile"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Enterprise Pilot",
      price: billingCycle === "monthly" ? "$79" : "$59",
      period: "/month",
      description: "Comprehensive multi-channel automated intelligence for high-volume distributors & wholesalers.",
      features: [
        "Unlimited products tracked",
        "Unlimited AI Invoice OCR extractions",
        "Real-time low stock prediction & alerts",
        "Daily comprehensive reports & PDF exports",
        "Priority 24/7 Slack and Zoom support",
        "Up to 5 staff user licenses"
      ],
      cta: "Launch Pilot Pro",
      popular: true
    }
  ];
  const faqs = [
    {
      q: "How does BizPilot AI extract data from physical invoices?",
      a: "BizPilot uses state-of-the-art vision models to securely analyze uploaded image snapshots or PDF receipt files. It instantly identifies headers, line-item arrays, taxes, and payment totals, translating them directly into editable ledger records in seconds."
    },
    {
      q: "Can I use BizPilot offline or with local databases?",
      a: "Yes! BizPilot is built with a reliable fallback engine. If cloud sync is not configured, it completely operates and records data locally inside your browser's persistent sandbox so you never lose trade history."
    },
    {
      q: "Does BizPilot require programming or complex ERP training?",
      a: "Absolutely not. We designed BizPilot for everyday business owners. You can interact with your entire inventory, sales totals, and operational logs directly through our friendly, intuitive dashboard."
    },
    {
      q: "How secure is my proprietary business ledger?",
      a: "Extremely. BizPilot enforces zero-trust architecture. Your transaction ledgers and customer tables are completely partitioned, locked down behind rigorous rule structures, and never shared or used to train public models."
    }
  ];
  function LayoutIcon(Icon, styling) {
    return <div className={`p-3 rounded-2xl ${styling}`}>
        <Icon className="w-6 h-6" />
      </div>;
  }
  return <div className="bg-slate-950 text-slate-100 min-h-screen relative overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {
    /* Dynamic Background Glow Rings */
  }
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[1000px] bg-emerald-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[30%] left-[-10%] w-[50vw] h-[50vw] bg-teal-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[60vw] h-[60vw] bg-amber-600/5 rounded-full blur-[160px] pointer-events-none" />

      {
    /* Navigation Navbar */
  }
      <header className="border-b border-slate-900/80 sticky top-0 z-50 bg-slate-950/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 p-2 rounded-xl">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-white flex items-center gap-2">
              <span>BizPilot AI</span>
              <span className="text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">{userBusinessName}</span>
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400 font-medium">
            <a href="#features" className="hover:text-slate-200 transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-slate-200 transition-colors">Testimonials</a>
            <a href="#pricing" className="hover:text-slate-200 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-slate-200 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
    id="btn-login"
    onClick={() => navigate("/auth")}
    className="text-sm font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
  >
              Sign In
            </button>
            <button
    id="btn-get-started"
    onClick={() => navigate("/auth?mode=register")}
    className="bg-emerald-600 hover:bg-emerald-500 text-sm font-bold text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-600/25 cursor-pointer"
  >
              Start Free
            </button>
          </div>
        </div>
      </header>

      {
    /* Hero Section */
  }
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full mb-8">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Automated Solar Grid & Lithium Battery Wholesale Operations Command Center</span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] max-w-5xl mx-auto">
          One AI Employee for Premium Wholesale{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-yellow-300 bg-clip-text text-transparent">
            Clean Energy.
          </span>
        </h1>
        
        <p className="mt-4 text-lg sm:text-xl text-emerald-400 font-display font-semibold italic tracking-wide">
          Pilot Your Business with AI
        </p>
        
        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
          The operations hub built explicitly for premium photovoltaic systems and lithium battery storage wholesale distribution. Streamline solar panel logistics, automatically manage storage stock metrics from single components to utility arrays, track cash flow ledgers, and query metrics instantly.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
    id="btn-hero-launch"
    onClick={() => navigate("/auth")}
    className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-600/20 cursor-pointer animate-pulse"
  >
            <span>Launch {userBusinessName} Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
    href="#features"
    className="w-full sm:w-auto text-sm font-semibold text-slate-300 hover:text-white border border-slate-800 bg-slate-900/30 hover:bg-slate-900/50 py-3.5 px-6 rounded-xl transition-all block"
  >
            Explore Features
          </a>
        </div>

        {
    /* Dashboard Screenshot Preview */
  }
        <div className="mt-16 md:mt-24 border border-slate-800/80 bg-slate-900/30 p-2 md:p-3 rounded-3xl max-w-5xl mx-auto shadow-2xl relative">
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800/40 relative aspect-video flex items-center justify-center">
            {
    /* Mock Dashboard Illustration */
  }
            <div className="absolute inset-0 bg-[radial-gradient(#102d20_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
            <div className="z-10 text-center px-4">
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold block mb-2">Live Demo Sandbox</span>
              <p className="text-sm text-slate-400 max-w-md mx-auto">Get absolute operational visibility. Click "Launch {userBusinessName} Command Center" to try our state-of-the-art interactive simulator instantly.</p>
              <button
    onClick={() => navigate("/auth")}
    className="mt-4 text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 py-2 px-4 rounded-lg border border-emerald-500/30 transition-all cursor-pointer"
  >
                Access Applet Directly
              </button>
            </div>
          </div>
        </div>
      </section>

      {
    /* Stats Section */
  }
      <section className="bg-slate-900/30 border-y border-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => <div key={idx} className="text-center">
                <span className="font-display font-bold text-4xl sm:text-5xl bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">{stat.value}</span>
                <p className="text-xs text-slate-500 mt-2 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>)}
          </div>
        </div>
      </section>

      {
    /* Core Features Bento Grid */
  }
      <section id="features" className="py-20 md:py-28 max-w-7xl mx-auto px-6 scroll-mt-10">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">Your AI Ops Team, All-In-One Hub.</h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg leading-relaxed">BizPilot is loaded with enterprise-grade modular capabilities designed to eliminate redundant manuals and optimize SME profit margins.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feat, idx) => <div key={idx} className="bg-slate-900/40 border border-slate-800/60 hover:border-slate-700/80 p-8 rounded-3xl transition-all duration-300 flex flex-col items-start gap-4 hover:shadow-xl hover:shadow-indigo-950/20">
              {feat.icon}
              <h3 className="font-display font-bold text-xl text-white mt-2">{feat.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feat.description}</p>
            </div>)}
        </div>
      </section>

      {
    /* Testimonials */
  }
      <section id="testimonials" className="py-20 bg-slate-900/20 border-y border-slate-900/80 scroll-mt-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl font-bold text-white">Loved by business builders.</h2>
            <p className="text-slate-500 text-sm mt-2">See how local business builders are saving 15+ hours every week.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl">
              <p className="text-slate-300 text-sm italic leading-relaxed">"OCR invoice parsing is unbelievably fast. I just snap a photo of my distributor's bill, and BizPilot handles the rest, automatically restocked my quantities. Saving me hours of painful manual entry."</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-indigo-400">MD</div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Maria Delgado</h4>
                  <p className="text-[10px] text-slate-500">Owner, Delgado Specialty Coffee</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl">
              <p className="text-slate-300 text-sm italic leading-relaxed">"The business reports generated every evening are better than having a professional accountant. It aggregates all my sales, invoices, and workforce details in a clean operational brief."</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-indigo-400">TL</div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Thomas Lindqvist</h4>
                  <p className="text-[10px] text-slate-500">Founder, EcoCycle Packaging</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {
    /* Pricing Module */
  }
      <section id="pricing" className="py-20 max-w-7xl mx-auto px-6 scroll-mt-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-display text-3xl sm:text-5xl font-bold">Clear, growth-focused pricing.</h2>
          <p className="text-slate-400 mt-4 text-sm sm:text-base">No complex enterprise plans. Choose the speed that matches your business.</p>
          
          {
    /* Toggle Monthly / Yearly */
  }
          <div className="inline-flex items-center gap-1 bg-slate-900 p-1.5 rounded-xl mt-8 border border-slate-800">
            <button
    onClick={() => setBillingCycle("monthly")}
    className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${billingCycle === "monthly" ? "bg-indigo-600 text-white" : "text-slate-400"}`}
  >
              Monthly Billing
            </button>
            <button
    onClick={() => setBillingCycle("yearly")}
    className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${billingCycle === "yearly" ? "bg-indigo-600 text-white" : "text-slate-400"}`}
  >
              <span>Yearly Billing</span>
              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-bold px-1 py-0.5 rounded uppercase tracking-wider">Save 35%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
          {pricingPlans.map((plan, idx) => <div
    key={idx}
    className={`bg-slate-900/40 p-8 rounded-3xl border flex flex-col ${plan.popular ? "border-indigo-500 shadow-xl shadow-indigo-950/20 relative" : "border-slate-800"}`}
  >
              {plan.popular && <span className="absolute top-4 right-4 bg-indigo-600 text-white font-bold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">Most Popular</span>}
              
              <h3 className="font-display font-bold text-xl text-slate-100">{plan.name}</h3>
              <p className="text-slate-400 text-xs mt-2 min-h-10 leading-relaxed">{plan.description}</p>
              
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl sm:text-5xl font-bold text-white">{plan.price}</span>
                <span className="text-slate-500 text-sm">{plan.period}</span>
              </div>

              <button
    onClick={() => navigate("/auth")}
    className={`w-full py-3 rounded-xl font-bold text-sm mt-8 transition-all ${plan.popular ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg" : "bg-slate-800 hover:bg-slate-700 text-slate-200"}`}
  >
                {plan.cta}
              </button>

              <ul className="mt-8 space-y-3 flex-1">
                {plan.features.map((feat, fIdx) => <li key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>)}
              </ul>
            </div>)}
        </div>
      </section>

      {
    /* FAQ Accordion */
  }
      <section id="faq" className="py-20 bg-slate-900/10 border-t border-slate-900 scroll-mt-10">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-xs mt-2">Everything you need to know about BizPilot AI.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
    const isOpen = activeFaq === idx;
    return <div key={idx} className="bg-slate-900/30 border border-slate-900 rounded-2xl overflow-hidden transition-all duration-300">
                  <button
      onClick={() => setActiveFaq(isOpen ? null : idx)}
      className="w-full text-left p-5 flex items-center justify-between font-semibold text-sm sm:text-base text-slate-200 hover:text-white transition-colors"
    >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && <div className="p-5 pt-0 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-900/50 bg-slate-950/20">
                      {faq.a}
                    </div>}
                </div>;
  })}
          </div>
        </div>
      </section>

      {
    /* Call To Action */
  }
      <section className="py-24 max-w-5xl mx-auto px-6 text-center relative z-10">
        <div className="bg-gradient-to-tr from-indigo-900/40 via-slate-900/60 to-blue-900/40 p-12 md:p-16 rounded-3xl border border-indigo-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px] -z-10" />
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">Take complete control of your business operations today.</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mt-4 leading-relaxed">Join thousands of micro, small, and medium enterprise builders who delegate manual reconciliation to BizPilot AI.</p>
          <button
    id="btn-cta-launch"
    onClick={() => navigate("/auth")}
    className="mt-8 bg-white hover:bg-slate-100 text-slate-950 font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer text-sm"
  >
            <span>Activate Your AI Employee</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {
    /* Footer */
  }
      <footer className="border-t border-slate-900 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="font-display font-bold text-white">BizPilot AI</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">Automating day-to-day enterprise operations for local merchants, distributors, and makers worldwide.</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#features" className="hover:text-slate-300">Features</a></li>
              <li><a href="#pricing" className="hover:text-slate-300">Pricing Plan</a></li>
              <li><span className="text-slate-600 line-through">Integrations (Coming Soon)</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">Resources</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#faq" className="hover:text-slate-300">Support FAQ</a></li>
              <li><span className="text-slate-600">SME Operations Manual</span></li>
              <li><span className="text-slate-600">Developers API</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><span className="text-slate-600">About Us</span></li>
              <li><span className="text-slate-600">Privacy Policy</span></li>
              <li><span className="text-slate-600">Terms of Service</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-600">
          <span>&copy; 2026 BizPilot AI Technologies Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <span>Enterprise Certified</span>
            <span>GDPR Compliant</span>
          </div>
        </div>
      </footer>
    </div>;
}
