import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Receipt,
  Package,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Activity,
  Plus,
  Users,
  Copy,
  Download,
  Check,
  X,
  FileText,
  Camera,
  RefreshCw
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { formatAmount } from "../types";
const dashboardThemeStyles = {
  cosmic: {
    textAccent: "text-slate-800",
    badgeText: "text-slate-700",
    btnAccent: "bg-slate-800 hover:bg-slate-900 text-white focus:ring-slate-500 shadow-sm",
    textGradient: "text-gray-900",
    chartRevenue: "#475569", // slate-600
    chartExpenses: "#f43f5e",
    borderHover: "hover:border-slate-300",
    badgePulseColor: "bg-slate-500",
    quickInvoiceBtn: "text-slate-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50",
    reorderBtn: "bg-slate-50 hover:bg-slate-100 text-slate-700 border-gray-250"
  },
  emerald: {
    textAccent: "text-teal-700",
    badgeText: "text-teal-800",
    btnAccent: "bg-teal-700 hover:bg-teal-800 text-white focus:ring-teal-500 shadow-sm",
    textGradient: "text-gray-900",
    chartRevenue: "#0f766e", // teal-700
    chartExpenses: "#f43f5e",
    borderHover: "hover:border-teal-300",
    badgePulseColor: "bg-teal-650",
    quickInvoiceBtn: "text-teal-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50",
    reorderBtn: "bg-teal-55 hover:bg-teal-100 text-teal-800 border-gray-250"
  },
  copper: {
    textAccent: "text-amber-800",
    badgeText: "text-amber-900",
    btnAccent: "bg-amber-700 hover:bg-amber-800 text-white focus:ring-amber-500 shadow-sm",
    textGradient: "text-gray-900",
    chartRevenue: "#b45309", // amber-700
    chartExpenses: "#f43f5e",
    borderHover: "hover:border-amber-300",
    badgePulseColor: "bg-amber-600",
    quickInvoiceBtn: "text-amber-800 border-gray-200 hover:border-gray-300 hover:bg-gray-50",
    reorderBtn: "bg-amber-50 hover:bg-amber-100 text-amber-800 border-gray-250"
  },
  lagoon: {
    textAccent: "text-blue-800",
    badgeText: "text-blue-900",
    btnAccent: "bg-blue-800 hover:bg-blue-900 text-white focus:ring-blue-500 shadow-sm",
    textGradient: "text-gray-900",
    chartRevenue: "#1d4ed8", // blue-700
    chartExpenses: "#f43f5e",
    borderHover: "hover:border-blue-300",
    badgePulseColor: "bg-blue-650",
    quickInvoiceBtn: "text-blue-800 border-gray-200 hover:border-gray-300 hover:bg-gray-50",
    reorderBtn: "bg-blue-50 hover:bg-blue-100 text-blue-800 border-gray-250"
  }
};
const pieColors = {
  cosmic: ["#475569", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"],
  emerald: ["#0f766e", "#14b8a6", "#5eead4", "#2dd4bf", "#99f6e4"],
  copper: ["#b45309", "#f59e0b", "#fcd34d", "#fde68a", "#fef3c7"],
  lagoon: ["#1d4ed8", "#3b82f6", "#93c5fd", "#bfdbfe", "#dbeafe"]
};

function CountUpAmount({ targetValue, currency }) {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = targetValue;
    if (end === 0) {
      setCurrentValue(0);
      return;
    }

    const duration = 1000; // 1s
    const stepTime = Math.max(10, Math.floor(duration / 60)); // max 60 fps
    const stepValue = end / (duration / stepTime);

    const timer = setInterval(() => {
      start += stepValue;
      if (start >= end) {
        setCurrentValue(end);
        clearInterval(timer);
      } else {
        setCurrentValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetValue]);

  return <>{formatAmount(currentValue, currency)}</>;
}

const mockProductDatabase = [
  {
    name: "Cadbury Dairy Milk Silk",
    barcode: "8901234567890",
    brand: "Cadbury",
    category: "Chocolate",
    mrp: 95,
    price: 90,
    cost: 70,
    quantity: 25,
    minStock: 10,
    supplier: "ABC Foods",
    warehouse: "Hyderabad",
    expiry: "2026-12-12",
    sku: "CAD-SILK-95",
    description: "Premium smooth Cadbury Dairy Milk Silk chocolate bar.",
    image: "🍫"
  },
  {
    name: "Maggi 2-Minute Noodles",
    barcode: "8901058001207",
    brand: "Nestlé",
    category: "Instant Noodles",
    mrp: 18,
    price: 18,
    cost: 14,
    quantity: 120,
    minStock: 20,
    supplier: "Nestlé Wholesale",
    warehouse: "Bangalore",
    expiry: "2026-08-20",
    sku: "NES-MAG-18",
    description: "Classic instant masala noodles.",
    image: "🍜"
  },
  {
    name: "Coca-Cola 750ml",
    barcode: "8901764012278",
    brand: "Coca-Cola",
    category: "Soft Drink",
    mrp: 45,
    price: 40,
    cost: 30,
    quantity: 85,
    minStock: 15,
    supplier: "Coke Distributors",
    warehouse: "Mumbai",
    expiry: "2026-09-15",
    sku: "COKE-750ML",
    description: "Refreshing carbonated soft drink.",
    image: "🥤"
  },
  {
    name: "Pepsi 500ml",
    barcode: "8901200003412",
    brand: "PepsiCo",
    category: "Soft Drink",
    mrp: 35,
    price: 32,
    cost: 24,
    quantity: 60,
    minStock: 12,
    supplier: "Pepsi Wholesale",
    warehouse: "Chennai",
    expiry: "2026-10-05",
    sku: "PEPSI-500ML",
    description: "Sparkling cola soft drink.",
    image: "🥤"
  },
  {
    name: "Parle-G Biscuit",
    barcode: "8901109001421",
    brand: "Parle",
    category: "Biscuits",
    mrp: 10,
    price: 10,
    cost: 7.5,
    quantity: 200,
    minStock: 30,
    supplier: "Parle Agency",
    warehouse: "Pune",
    expiry: "2027-01-10",
    sku: "PARLE-G-10",
    description: "India's favorite glucose biscuits.",
    image: "🍪"
  },
  {
    name: "Good Day Cashew Biscuit",
    barcode: "8901063004521",
    brand: "Britannia",
    category: "Biscuits",
    mrp: 30,
    price: 28,
    cost: 20,
    quantity: 110,
    minStock: 25,
    supplier: "Britannia Distributors",
    warehouse: "Delhi",
    expiry: "2026-11-30",
    sku: "BRIT-GD-30",
    description: "Cashew cookies baked to perfection.",
    image: "🍪"
  },
  {
    name: "Amul Pasteurised Butter 500g",
    barcode: "8901262010214",
    brand: "Amul",
    category: "Dairy",
    mrp: 275,
    price: 270,
    cost: 240,
    quantity: 40,
    minStock: 8,
    supplier: "Amul Dairy Corp",
    warehouse: "Gujarat",
    expiry: "2026-07-30",
    sku: "AMUL-BUTTER-500",
    description: "Pasteurised salted butter.",
    image: "🧈"
  },
  {
    name: "Tata Salt 1kg",
    barcode: "8901058895028",
    brand: "Tata",
    category: "Edible Salt",
    mrp: 28,
    price: 28,
    cost: 22,
    quantity: 95,
    minStock: 15,
    supplier: "Tata Consumer Products",
    warehouse: "Kolkata",
    expiry: "2028-12-31",
    sku: "TATA-SALT-1KG",
    description: "Iodised vacuum evaporated salt.",
    image: "🧂"
  },
  {
    name: "Aashirvaad Whole Wheat Atta 5kg",
    barcode: "8901725181227",
    brand: "ITC",
    category: "Flour",
    mrp: 290,
    price: 275,
    cost: 230,
    quantity: 35,
    minStock: 6,
    supplier: "ITC Wholesale Agency",
    warehouse: "Lucknow",
    expiry: "2026-10-25",
    sku: "ITC-ATTA-5KG",
    description: "100% pure whole wheat flour.",
    image: "🌾"
  },
  {
    name: "Surf Excel Easy Wash 1kg",
    barcode: "8901030753049",
    brand: "Hindustan Unilever",
    category: "Detergent",
    mrp: 140,
    price: 130,
    cost: 105,
    quantity: 50,
    minStock: 10,
    supplier: "HUL Distribution",
    warehouse: "Indore",
    expiry: "2028-05-15",
    sku: "HUL-SURF-1KG",
    description: "Washing powder for easy stain removal.",
    image: "🧼"
  },
  {
    name: "Vim Bar 300g",
    barcode: "8901030656111",
    brand: "Hindustan Unilever",
    category: "Dishwash",
    mrp: 20,
    price: 20,
    cost: 16,
    quantity: 150,
    minStock: 25,
    supplier: "HUL Distribution",
    warehouse: "Nagpur",
    expiry: "2028-09-01",
    sku: "HUL-VIM-300G",
    description: "Dishwash bar with power of lemons.",
    image: "🧼"
  },
  {
    name: "Colgate Toothpaste 200g",
    barcode: "8901123000417",
    brand: "Colgate-Palmolive",
    category: "Oral Care",
    mrp: 120,
    price: 110,
    cost: 85,
    quantity: 75,
    minStock: 15,
    supplier: "Colgate Agency",
    warehouse: "Patna",
    expiry: "2027-11-20",
    sku: "COLG-TOOTH-200G",
    description: "Calcium-boost toothpaste for strong teeth.",
    image: "🪥"
  },
  {
    name: "Clinic Plus Shampoo 340ml",
    barcode: "8901030702047",
    brand: "Hindustan Unilever",
    category: "Hair Care",
    mrp: 195,
    price: 185,
    cost: 145,
    quantity: 45,
    minStock: 10,
    supplier: "HUL Distribution",
    warehouse: "Guwahati",
    expiry: "2027-04-18",
    sku: "HUL-CLINIC-340ML",
    description: "Milk protein formula shampoo for strong hair.",
    image: "🧴"
  },
  {
    name: "Nescafe Coffee 100g",
    barcode: "8901058002471",
    brand: "Nestlé",
    category: "Beverages",
    mrp: 320,
    price: 300,
    cost: 240,
    quantity: 30,
    minStock: 8,
    supplier: "Nestlé Distributors",
    warehouse: "Jaipur",
    expiry: "2027-02-28",
    sku: "NES-COFFEE-100G",
    description: "100% pure instant coffee powder.",
    image: "☕"
  },
  {
    name: "Red Bull Energy Drink 250ml",
    barcode: "9002490100117",
    brand: "Red Bull GmbH",
    category: "Beverages",
    mrp: 125,
    price: 120,
    cost: 95,
    quantity: 90,
    minStock: 20,
    supplier: "Red Bull India",
    warehouse: "Mumbai",
    expiry: "2027-06-15",
    sku: "RB-250ML",
    description: "Vitalizes body and mind energy drink.",
    image: "🔋"
  }
];

export default function Dashboard({
  user,
  products,
  invoices,
  transactions,
  onAddTransaction,
  theme = "cosmic",
  onChangeTheme,
  onAddProduct,
  onEditProduct
}) {
  const navigate = useNavigate();
  const dbTheme = dashboardThemeStyles[theme] || dashboardThemeStyles.cosmic;

  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [showNotFoundDialog, setShowNotFoundDialog] = useState(false);
  const [notFoundBarcode, setNotFoundBarcode] = useState("");
  const [flashOn, setFlashOn] = useState(false);
  const [showDemoSelector, setShowDemoSelector] = useState(false);
  const [scannerStatus, setScannerStatus] = useState("Position Barcode in Center");

  const html5QrCodeRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const getStockStatusBadge = (stock, minS) => {
    if (stock === 0) return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/20">🔴 Out of Stock</span>;
    if (stock <= minS) return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/20 animate-pulse">🟡 Low Stock</span>;
    return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">🟢 In Stock</span>;
  };

  const handleLookupBarcode = async (barcodeVal) => {
    // 1. Search local catalog
    let found = products.find(p => p.description && p.description.includes(barcodeVal));
    if (!found) {
      found = products.find(p => p.sku === barcodeVal || p.name.toLowerCase().includes(barcodeVal.toLowerCase()));
    }

    if (found) {
      const mappedProduct = {
        id: found.id,
        name: found.name,
        barcode: barcodeVal,
        brand: "Active Catalog",
        category: found.category || "General Goods",
        mrp: Math.round(found.price * 1.15),
        price: found.price,
        cost: found.cost,
        quantity: found.quantity,
        minStock: found.minStock || 5,
        supplier: found.supplier || "Local Supplier",
        warehouse: "Central Warehouse",
        expiry: "2026-12-31",
        sku: found.sku,
        description: found.description || "",
        image: "📦",
        isAlreadyInInventory: true
      };
      setScannedProduct(mappedProduct);
      setScannerStatus("Barcode Detected");
      return;
    }

    // 2. Fallback to existing Demo Product List
    const mockItem = mockProductDatabase.find(p => p.barcode === barcodeVal);
    if (mockItem) {
      setScannedProduct({ ...mockItem, isAlreadyInInventory: false });
      setScannerStatus("Barcode Detected");
      return;
    }

    // 3. Search OpenFoodFacts API
    setScannerStatus("Querying public database...");
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcodeVal}.json`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 1 && data.product) {
          const prod = data.product;
          const name = prod.product_name || prod.product_name_en || "Unknown Barcode Item";
          const brand = prod.brands || "Public Registry";
          const category = prod.categories_tags?.[0]?.replace("en:", "") || "General Goods";
          const mappedApiProduct = {
            name: name,
            barcode: barcodeVal,
            brand: brand,
            category: category,
            mrp: 150,
            price: 130,
            cost: 95,
            quantity: 10,
            minStock: 5,
            supplier: "Import Distributors",
            warehouse: "Central Warehouse",
            expiry: "2027-12-31",
            sku: `OFF-${barcodeVal.substring(0, 6)}`,
            description: prod.generic_name || "Product retrieved from OpenFoodFacts public database.",
            image: "🛒",
            isAlreadyInInventory: false
          };
          setScannedProduct(mappedApiProduct);
          setScannerStatus("Barcode Detected");
          return;
        }
      }
    } catch (err) {
      console.warn("Public registry fetch failed", err);
    }

    // 4. Unknown product dialog fallback
    setNotFoundBarcode(barcodeVal);
    setShowNotFoundDialog(true);
    setScannerStatus("Product Not Found");
  };

  const startCameraScanning = () => {
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.clear();
      } catch (e) {}
    }

    setScannerStatus("Initializing Camera...");
    const html5QrCode = new Html5Qrcode("dashboard-scanner-reader");
    html5QrCodeRef.current = html5QrCode;

    const qrCodeSuccessCallback = (decodedText) => {
      setScannerStatus("Scanning...");
      if (html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
          html5QrCode.clear();
          html5QrCodeRef.current = null;
        }).catch(e => console.warn(e));
      }
      handleLookupBarcode(decodedText);
    };

    const config = {
      fps: 24,
      qrbox: { width: 260, height: 180 },
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39
      ]
    };

    html5QrCode.start(
      { facingMode: "environment" },
      config,
      qrCodeSuccessCallback
    )
    .then(() => {
      setIsScanningActive(true);
      setScanningProgress(100);
      setScannerStatus("Scanning...");
    })
    .catch((err) => {
      console.warn("Camera start failed, showing manual demo list", err);
      setScannerStatus("Camera permission denied / No camera available");
      setShowDemoSelector(true);
    });
  };

  const handleStartScanner = () => {
    setScannedProduct(null);
    setShowScannerModal(true);
    setIsScanningActive(true);
    setScanningProgress(0);
    setShowDemoSelector(false);
  };

  const handleStopScanner = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (html5QrCodeRef.current) {
      if (html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().then(() => {
          html5QrCodeRef.current.clear();
          html5QrCodeRef.current = null;
        }).catch(e => console.warn(e));
      } else {
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      }
    }
    setShowScannerModal(false);
    setIsScanningActive(false);
    setScannedProduct(null);
  };

  const handleSimulateScan = (barcodeVal) => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current.stop().then(() => {
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      }).catch(e => console.warn(e));
    }

    setScanningProgress(0);
    setIsScanningActive(true);
    setScannedProduct(null);
    
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      setScanningProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressIntervalRef.current);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    setTimeout(() => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setIsScanningActive(false);
      if (barcodeVal === "not_found_123") {
        setNotFoundBarcode("8909999999999");
        setShowNotFoundDialog(true);
      } else {
        handleLookupBarcode(barcodeVal);
      }
    }, 1600);
  };

  const handleAddScannedToInventory = () => {
    if (!scannedProduct) return;
    const exists = products.find(p => p.sku === scannedProduct.sku || (p.description && p.description.includes(scannedProduct.barcode)));
    if (exists) {
      setToastMessage("Product is already in the inventory.");
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    const payload = {
      name: scannedProduct.name,
      sku: scannedProduct.sku || ("SKU-" + Math.floor(1e3 + Math.random() * 9e3)),
      category: scannedProduct.category || "Solar Panels",
      price: scannedProduct.price || scannedProduct.mrp || 0,
      cost: scannedProduct.cost || Math.floor((scannedProduct.price || scannedProduct.mrp) * 0.75),
      quantity: scannedProduct.quantity || 10,
      minStock: scannedProduct.minStock || 5,
      description: `[Barcode: ${scannedProduct.barcode}] ${scannedProduct.description || ""}`,
      supplier: scannedProduct.supplier || "Supplier Inc."
    };

    if (onAddProduct) {
      onAddProduct(payload);
      setToastMessage("Product successfully added to inventory.");
      setTimeout(() => setToastMessage(null), 4000);
      setScannedProduct(prev => ({ ...prev, isAlreadyInInventory: true }));
    }
  };

  const handleUpdateScannedStock = () => {
    if (!scannedProduct) return;
    const activeProd = products.find(p => p.sku === scannedProduct.sku || (p.description && p.description.includes(scannedProduct.barcode)));
    if (!activeProd) {
      setToastMessage("Product not found in active inventory catalog.");
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    const newQty = (activeProd.quantity || 0) + 10;
    if (onEditProduct) {
      onEditProduct(activeProd.id, {
        ...activeProd,
        quantity: newQty
      });
      setToastMessage("Stock successfully updated.");
      setTimeout(() => setToastMessage(null), 4000);
      setScannedProduct(prev => ({
        ...prev,
        quantity: newQty,
        isAlreadyInInventory: true
      }));
    }
  };

  useEffect(() => {
    if (showScannerModal) {
      const timer = setTimeout(() => {
        startCameraScanning();
      }, 350);
      return () => clearTimeout(timer);
    } else {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().then(() => {
            html5QrCodeRef.current.clear();
            html5QrCodeRef.current = null;
          }).catch(e => console.warn(e));
        } else {
          html5QrCodeRef.current.clear();
          html5QrCodeRef.current = null;
        }
      }
    }
  }, [showScannerModal]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(e => console.warn(e));
        }
      }
    };
  }, []);

  const getThemeHoverGlow = (themeId) => {
    switch (themeId) {
      case "emerald": return "hover:shadow-[0_0_25px_rgba(16,185,129,0.18)] hover:border-emerald-500/40";
      case "copper": return "hover:shadow-[0_0_25px_rgba(245,158,11,0.18)] hover:border-amber-500/40";
      case "lagoon": return "hover:shadow-[0_0_25px_rgba(59,130,246,0.18)] hover:border-blue-500/40";
      default: return "hover:shadow-[0_0_25px_rgba(168,85,247,0.18)] hover:border-purple-500/40";
    }
  };

  const mockTransactions = useMemo(() => {
    const today = new Date();
    const dates = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    const baseline = [
      { id: "base_rev_1", date: dates[0], type: "revenue", amount: 110000, description: "Bulk Solar Panel Wholesale Sales", category: "Solar equipment" },
      { id: "base_exp_1", date: dates[0], type: "expense", amount: 82000, description: "Raw Silicon procurement payout", category: "Wages & Materials" },
      
      { id: "base_rev_2", date: dates[1], type: "revenue", amount: 115000, description: "Inverter Fleet retail shipment", category: "Solar equipment" },
      { id: "base_exp_2", date: dates[1], type: "expense", amount: 85000, description: "Warehouse storage operations fee", category: "Rent & Utilities" },
      
      { id: "base_rev_3", date: dates[2], type: "revenue", amount: 125000, description: "Residential Grid installation order", category: "Services" },
      { id: "base_exp_3", date: dates[2], type: "expense", amount: 90000, description: "Logistics shipping transit settle", category: "Transport" },
      
      { id: "base_rev_4", date: dates[3], type: "revenue", amount: 105000, description: "Commercial Microgrid consult fee", category: "Services" },
      { id: "base_exp_4", date: dates[3], type: "expense", amount: 78000, description: "Contractor installer day wages", category: "Wages & Materials" },
      
      { id: "base_rev_5", date: dates[4], type: "revenue", amount: 130000, description: "Lithium Storage battery supply order", category: "Solar equipment" },
      { id: "base_exp_5", date: dates[4], type: "expense", amount: 92000, description: "Biometric security operations fee", category: "Rent & Utilities" },
      
      { id: "base_rev_6", date: dates[5], type: "revenue", amount: 120000, description: "Hybrid Inverters batch wholesales", category: "Solar equipment" },
      { id: "base_exp_6", date: dates[5], type: "expense", amount: 80000, description: "Corporate office utility settle", category: "Rent & Utilities" },
      
      { id: "base_rev_7", date: dates[6], type: "revenue", amount: 140000, description: "Solar Array mounting racks installation", category: "Services" },
      { id: "base_exp_7", date: dates[6], type: "expense", amount: 85000, description: "Cloud API and Gemini servers billing", category: "Services" }
    ];

    return [...transactions.slice().reverse(), ...baseline];
  }, [transactions]);

  const mockInvoices = useMemo(() => {
    const baseInvoices = [
      {
        id: "base_inv_unpaid_1",
        date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split("T")[0],
        customer_name: "Apex Power Solutions",
        status: "unpaid",
        total: 48000,
        items: [{ name: "Premium Hybrid Solar Inverter (15kW)", qty: 2, price: 24000, total: 48000 }]
      },
      {
        id: "base_inv_unpaid_2",
        date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split("T")[0],
        customer_name: "Greenfield Housing Society",
        status: "unpaid",
        total: 36000,
        items: [{ name: "High-Density Lithium Iron Phosphate Battery Pack", qty: 1, price: 36000, total: 36000 }]
      }
    ];

    return [...invoices, ...baseInvoices];
  }, [invoices]);

  const sortedMockTransactions = useMemo(() => {
    return mockTransactions.slice().sort((a, b) => b.date.localeCompare(a.date));
  }, [mockTransactions]);

  const totalRevenue = useMemo(() => {
    return mockTransactions.filter((t) => t.type === "revenue").reduce((sum, t) => sum + t.amount, 0);
  }, [mockTransactions]);
  const totalExpense = useMemo(() => {
    return mockTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  }, [mockTransactions]);
  const netProfit = totalRevenue - totalExpense;
  const profitMargin = totalRevenue > 0 ? netProfit / totalRevenue * 100 : 0;
  const [workforceCount, setWorkforceCount] = useState(4);
  const [pendingWages, setPendingWages] = useState(2320);
  useEffect(() => {
    fetch("/api/workforce").then((res) => {
      if (res.ok) return res.json();
    }).then((data) => {
      if (data && Array.isArray(data)) {
        setWorkforceCount(data.length);
        const unpaid = data.reduce((sum, w) => sum + (w.unpaidWages || 0), 0);
        setPendingWages(unpaid);
      }
    }).catch((err) => console.warn("Error syncing workforce stats on dashboard", err));
  }, []);
  const topSellingProducts = useMemo(() => {
    const salesMap = {};
    products.forEach((p) => {
      salesMap[p.name] = { qty: 0, revenue: 0, category: p.category };
    });
    mockInvoices.forEach((inv) => {
      inv.items.forEach((item) => {
        if (!salesMap[item.name]) {
          salesMap[item.name] = { qty: 0, revenue: 0, category: "Solar Equipment" };
        }
        salesMap[item.name].qty += item.quantity || item.qty || 0;
        salesMap[item.name].revenue += item.total || (item.qty * item.price) || 0;
      });
    });
    return Object.entries(salesMap).map(([name, data]) => ({
      name,
      quantitySold: data.qty,
      revenue: data.revenue,
      category: data.category
    })).sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 3);
  }, [mockInvoices, products]);
  const unpaidInvoicesAmount = useMemo(() => {
    return mockInvoices.filter((inv) => inv.status === "unpaid").reduce((sum, inv) => sum + inv.total, 0);
  }, [mockInvoices]);
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.quantity <= p.minStock);
  }, [products]);
  const expensePieData = useMemo(() => {
    const categories = {};
    mockTransactions.filter((t) => t.type === "expense").forEach((t) => {
      const cat = t.category || "Uncategorized";
      categories[cat] = (categories[cat] || 0) + t.amount;
    });
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);
  }, [mockTransactions]);
  const chartData = useMemo(() => {
    const dateGroups = {};
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();
    last7Days.forEach((date) => {
      dateGroups[date] = { date: date.slice(5), Revenue: 0, Expenses: 0 };
    });
    mockTransactions.forEach((t) => {
      const dateKey = t.date;
      const formattedDate = dateKey.slice(5);
      if (dateGroups[dateKey]) {
        if (t.type === "revenue") {
          dateGroups[dateKey].Revenue += t.amount;
        } else {
          dateGroups[dateKey].Expenses += t.amount;
        }
      }
    });
    return Object.values(dateGroups).sort((a, b) => a.date.localeCompare(b.date));
  }, [mockTransactions]);

  // --- BUSINESS HEALTH SCORE CALCULATIONS ---
  const financeScore = useMemo(() => {
    let score = 75;
    if (profitMargin >= 30) score = 95;
    else if (profitMargin >= 15) score = 85;
    else if (profitMargin > 0) score = 78;
    else score = 55;
    
    if (totalRevenue > 0 && (unpaidInvoicesAmount / totalRevenue) > 0.15) {
      score -= 10;
    }
    return Math.max(0, Math.min(100, score));
  }, [profitMargin, unpaidInvoicesAmount, totalRevenue]);

  const inventoryScore = useMemo(() => {
    const lowStockCount = lowStockProducts.length;
    if (lowStockCount === 0) return 100;
    if (lowStockCount <= 2) return 85;
    if (lowStockCount <= 5) return 70;
    return 55;
  }, [lowStockProducts]);

  const salesScore = useMemo(() => {
    const invoiceCount = mockInvoices.length;
    if (invoiceCount >= 10) return 98;
    if (invoiceCount >= 5) return 90;
    if (invoiceCount >= 2) return 82;
    return 65;
  }, [mockInvoices]);

  const workforceScore = useMemo(() => {
    let score = 95;
    if (pendingWages > 5000) score -= 15;
    else if (pendingWages > 2000) score -= 8;
    
    if (workforceCount === 0) score -= 20;
    return Math.max(0, Math.min(100, score));
  }, [workforceCount, pendingWages]);

  const overallScore = useMemo(() => {
    return Math.round((financeScore + inventoryScore + salesScore + workforceScore) / 4);
  }, [financeScore, inventoryScore, salesScore, workforceScore]);

  const getStatusIcon = (score) => {
    if (score >= 80) return "✅";
    if (score >= 60) return "⚠️";
    return "❌";
  };

  const getHealthLabel = (score) => {
    if (score >= 90) return { text: "Excellent", color: "text-green-700 font-bold" };
    if (score >= 80) return { text: "Good", color: "text-green-700 font-semibold" };
    if (score >= 60) return { text: "Fair", color: "text-amber-705 font-semibold" };
    return { text: "Needs Attention", color: "text-red-700 font-bold" };
  };

  const healthLabel = getHealthLabel(overallScore);

  const [animatedScore, setAnimatedScore] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = overallScore;
    if (end === 0) return;
    
    const duration = 800; // ms
    const stepTime = Math.max(10, Math.floor(duration / end));
    
    const timer = setInterval(() => {
      start += 1;
      if (start >= end) {
        setAnimatedScore(end);
        clearInterval(timer);
      } else {
        setAnimatedScore(start);
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [overallScore]);

  const [showBriefModal, setShowBriefModal] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!showBriefModal) {
      setTypedText("");
      return;
    }
    
    const name = user?.name || "Siddu";
    const lowStockCount = lowStockProducts?.length ?? 2;
    const pendingInvoices = mockInvoices?.filter(i => i.status === "unpaid").length ?? 3;
    const stockRec = lowStockProducts?.[0]?.name ? lowStockProducts[0].name.split(' ')[0] : "Printer Paper";
    const cashFlowStatus = netProfit > 0 ? "healthy" : "recovering";
    
    const fullText = `Good Morning, ${name}.\n\nToday's Business Summary\n\n• Revenue increased by 12%\n• Expenses reduced by 6%\n• ${lowStockCount} products need restocking\n• Cash flow is ${cashFlowStatus}\n• ${pendingInvoices} invoices are pending\n\nAI Recommendation:\n\nIncrease inventory of ${stockRec} before weekend demand.`;
    
    let currentText = "";
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        currentText += fullText[index];
        setTypedText(currentText);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 12);
    
    return () => clearInterval(interval);
  }, [showBriefModal, user?.name, lowStockProducts, mockInvoices, netProfit]);

  const handleCopyText = () => {
    navigator.clipboard.writeText(typedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>AI Executive Brief - BizPilot</title>
          <style>
            body { 
              font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif; 
              padding: 50px; 
              color: #0f172a; 
              line-height: 1.6;
              background-color: #fafafa;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 16px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.05);
              border: 1px solid #e2e8f0;
            }
            .header {
              display: flex;
              align-items: center;
              gap: 10px;
              border-bottom: 2px solid #6366f1;
              padding-bottom: 15px;
              margin-bottom: 25px;
            }
            h1 { 
              font-size: 20px;
              color: #4f46e5; 
              margin: 0;
            }
            .date {
              font-size: 11px;
              color: #64748b;
              margin-left: auto;
              font-weight: 600;
            }
            pre { 
              white-space: pre-wrap; 
              font-size: 14px; 
              font-family: inherit; 
              color: #334155;
            }
            .footer { 
              margin-top: 40px; 
              font-size: 11px; 
              color: #94a3b8; 
              border-top: 1px solid #e2e8f0; 
              padding-top: 15px; 
              text-align: center;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BizPilot AI Executive Brief</h1>
              <div class="date">${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <pre>${typedText}</pre>
            <div class="footer">Generated by BizPilot Command Center • Pilot Your Business with AI</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const [toastMessage, setToastMessage] = useState(null);
  const triggerToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  return <div className="space-y-8 animate-fade-in text-gray-900">
      
      {
    /* Welcome Banner */
  }
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 w-full xl:w-auto">
          <div>
            <span className={`text-xs uppercase font-bold tracking-widest ${dbTheme.textAccent} font-mono transition-all duration-200`}>Business Command Center</span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mt-1">Hello, {user.name}</h1>
            <p className="text-xs text-gray-500 mt-1">Real-time financials and automation logs for <span className="font-bold text-gray-800">{user.businessName}</span>.</p>
          </div>

          {
    /* Dynamic theme selector widget */
  }
          <div className="flex flex-col items-start sm:items-end gap-1.5 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Visual Theme Type</span>
            <div className="flex items-center gap-2">
              {[
    { id: "cosmic", label: "Cosmic Midnight", color: "bg-slate-800 border-slate-650" },
    { id: "emerald", label: "Royal Emerald", color: "bg-teal-700 border-teal-550" },
    { id: "copper", label: "Sunset Copper", color: "bg-amber-700 border-amber-550" },
    { id: "lagoon", label: "Oceanic Lagoon", color: "bg-blue-800 border-blue-650" }
  ].map((t) => <button
    key={t.id}
    onClick={() => onChangeTheme?.(t.id)}
    title={t.label}
    className={`w-5 h-5 rounded-full ${t.color} border transition-all duration-200 relative flex items-center justify-center cursor-pointer ${theme === t.id ? "scale-115 ring-2 ring-teal-500" : "opacity-50 hover:opacity-100 hover:scale-105"}`}
  >
                  {theme === t.id && <span className="text-[8px] font-bold text-white">✓</span>}
                </button>)}
            </div>
          </div>
        </div>

        {
    /* Quick action group */
  }
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            id="btn-quick-invoice"
            onClick={() => navigate("/invoices")}
            className={`px-4 py-2 bg-white hover:bg-gray-50 text-xs border border-gray-250 text-gray-700 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm w-full sm:w-auto hover:scale-[1.01] active:scale-[0.99] duration-150`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Invoice</span>
          </button>
          <button
            id="btn-quick-workforce"
            onClick={() => navigate("/workforce")}
            className={`px-4 py-2 ${dbTheme.btnAccent} text-xs text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto hover:scale-[1.01] active:scale-[0.99] duration-150`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Track Team & Wages</span>
          </button>
          <button
            id="btn-quick-scanner"
            onClick={handleStartScanner}
            className={`px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto hover:scale-[1.01] active:scale-[0.99] duration-150 shadow-sm`}
          >
            <Camera className="w-3.5 h-3.5 text-white" />
            <span>Smart Scanner</span>
          </button>
          <button
            id="btn-generate-brief"
            onClick={() => setShowBriefModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm w-full sm:w-auto hover:scale-[1.01] active:scale-[0.99] duration-150"
          >
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>AI Executive Brief</span>
          </button>
        </div>
      </div>

      {
    /* KPI Financial Grid */
  }
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Cumulative Revenue */}
          <div className="bg-white border border-gray-200 p-6 rounded-lg relative overflow-hidden group hover:border-gray-300 transition-all duration-200 shadow-sm">
            <div className="absolute top-0 right-0 p-3 opacity-20 transition-colors">
              <DollarSign className="w-16 h-16" style={{ color: dbTheme.chartRevenue }} />
            </div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Gross Revenue</p>
            <p className="font-display font-bold text-2xl text-gray-900 mt-2">
              <CountUpAmount targetValue={totalRevenue} currency={user?.currency} />
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-700 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Inflows tracked</span>
            </div>
          </div>

          {/* Cumulative Expenses */}
          <div className="bg-white border border-gray-200 p-6 rounded-lg relative overflow-hidden group hover:border-gray-300 transition-all duration-200 shadow-sm">
            <div className="absolute top-0 right-0 p-3 opacity-15 transition-colors">
              <ArrowDownRight className="w-16 h-16" style={{ color: dbTheme.chartExpenses }} />
            </div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Outflows</p>
            <p className="font-display font-bold text-2xl text-gray-900 mt-2">
              <CountUpAmount targetValue={totalExpense} currency={user?.currency} />
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 font-medium">
              <Activity className="w-3.5 h-3.5 text-gray-400" />
              <span>Ledger procurement</span>
            </div>
          </div>

          {/* Profit margin */}
          <div className="bg-white border border-gray-200 p-6 rounded-lg relative overflow-hidden group hover:border-gray-300 transition-all duration-200 shadow-sm">
            <div className="absolute top-0 right-0 p-3 opacity-20 transition-colors">
              <TrendingUp className="w-16 h-16" style={{ color: dbTheme.chartRevenue }} />
            </div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Net Profit Margin</p>
            <p className={`font-display font-bold text-2xl mt-2 ${dbTheme.textAccent}`}>
              <CountUpAmount targetValue={netProfit} currency={user?.currency} />
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-gray-600">
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-teal-650" />
              <span>{profitMargin.toFixed(1)}% profitability</span>
            </div>
          </div>

          {/* Pending collection */}
          <div className="bg-white border border-gray-200 p-6 rounded-lg relative overflow-hidden group hover:border-gray-300 transition-all duration-200 shadow-sm">
            <div className="absolute top-0 right-0 p-3 opacity-15 transition-colors">
              <Receipt className="w-16 h-16 text-amber-600" />
            </div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Pending Collection</p>
            <p className="font-display font-bold text-2xl text-gray-900 mt-2">
              <CountUpAmount targetValue={unpaidInvoicesAmount} currency={user?.currency} />
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-amber-800 font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{mockInvoices.filter((i) => i.status === "unpaid").length} invoices outstanding</span>
            </div>
          </div>
        </div>

        {/* Right Side: Insights + Health Score */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Column 1: AI Insight Card + AI Quick Actions */}
          <div className="flex flex-col gap-6 justify-between">
            {/* AI Insight Card */}
            <div className="bg-white border border-gray-200 p-5 rounded-lg relative overflow-hidden flex flex-col justify-between flex-1 group hover:border-gray-300 transition-all duration-200 shadow-sm border-l-4 border-l-teal-650">
              <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
                <Sparkles className="w-12 h-12 text-teal-650" />
              </div>
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] uppercase font-bold text-teal-850 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-teal-700 animate-pulse" />
                    BizPilot AI Insight
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                
                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                    <span className="text-gray-500 font-medium">Revenue Trend:</span>
                    <span className="text-green-700 font-bold flex items-center gap-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                      ↑12%
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                    <span className="text-gray-500 font-medium">Low Stock:</span>
                    <span className="text-red-700 font-semibold max-w-[120px] truncate" title={lowStockProducts.length > 0 ? lowStockProducts[0].name : "Printer Paper"}>
                      {lowStockProducts.length > 0 ? lowStockProducts[0].name.split(' ')[0] : "Printer Paper"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                    <span className="text-gray-500 font-medium">Biz Health:</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                      Excellent
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 bg-teal-50/50 rounded-lg p-2.5 border border-teal-100 text-[10px] text-teal-850 font-medium leading-relaxed">
                <span className="font-bold text-teal-900 block mb-0.5 uppercase tracking-widest text-[8px]">AI Recommendation</span>
                Restock {lowStockProducts.length > 0 ? `200 units of ${lowStockProducts[0].name.split(' ')[0]}` : "200 units of Printer Paper"} today.
              </div>
            </div>

            {/* AI Quick Actions Card */}
            <div className="bg-white border border-gray-200 p-5 rounded-lg relative overflow-hidden flex flex-col justify-between flex-1 hover:border-gray-300 transition-all duration-205 shadow-sm">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5 mb-3.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-650 animate-pulse" />
                  AI Quick Actions
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowBriefModal(true)}
                    className="py-2 px-3 text-[10px] font-bold text-gray-600 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all hover:scale-[1.01] active:scale-[0.99] duration-150 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 text-teal-700" />
                    <span>Generate Report</span>
                  </button>
                  <button
                    onClick={() => triggerToast("BizPilot AI Revenue Analysis: Revenue is projected to grow by 14% over the next quarter based on wholesale order trends.")}
                    className="py-2 px-3 text-[10px] font-bold text-gray-600 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all hover:scale-[1.01] active:scale-[0.99] duration-150 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-teal-700" />
                    <span>Analyze Revenue</span>
                  </button>
                  <button
                    onClick={() => triggerToast("BizPilot Sales Prediction: Strong weekend demand detected for High-Density Lithium Batteries. Stock levels are currently adequate.")}
                    className="py-2 px-3 text-[10px] font-bold text-gray-600 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all hover:scale-[1.01] active:scale-[0.99] duration-150 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Activity className="w-3.5 h-3.5 text-teal-700" />
                    <span>Predict Sales</span>
                  </button>
                  <button
                    onClick={() => triggerToast("BizPilot Procurement Action: Auto-generated purchase requisition draft for 200 units of safety-threshold products.")}
                    className="py-2 px-3 text-[10px] font-bold text-gray-600 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all hover:scale-[1.01] active:scale-[0.99] duration-150 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Package className="w-3.5 h-3.5 text-teal-700" />
                    <span>Restock Inventory</span>
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="py-2 px-3 text-[10px] font-bold text-gray-600 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all hover:scale-[1.01] active:scale-[0.99] duration-150 cursor-pointer col-span-2 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-700" />
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Business Health Score Widget */}
          <div className="bg-white border border-gray-200 p-5 rounded-lg relative overflow-hidden flex flex-col justify-between h-full group hover:border-gray-300 transition-all duration-200 shadow-sm">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5 mb-3">
                <Activity className="w-3.5 h-3.5 text-teal-650 animate-pulse" />
                Business Health
              </span>

              <div className="flex items-center gap-5">
                {/* Circular SVG Gauge */}
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#f1f5f9"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="url(#healthGradient)"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 - (2 * Math.PI * 40 * animatedScore) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-350 ease-out"
                    />
                    <defs>
                      <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={dbTheme.chartRevenue} />
                        <stop offset="100%" stopColor={dbTheme.chartRevenue} stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-gray-900 font-mono leading-none">
                      {animatedScore}
                    </span>
                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                      /100
                    </span>
                  </div>
                </div>

                {/* Status categories */}
                <div className="flex-1 space-y-1.5 text-[11px] font-semibold text-gray-700">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                    <span className="text-gray-500 font-medium">Finance</span>
                    <span>{getStatusIcon(financeScore)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                    <span className="text-gray-500 font-medium">Inventory</span>
                    <span>{getStatusIcon(inventoryScore)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                    <span className="text-gray-500 font-medium">Sales</span>
                    <span>{getStatusIcon(salesScore)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                    <span className="text-gray-500 font-medium">Workforce</span>
                    <span>{getStatusIcon(workforceScore)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Overall Rating</span>
              <span className={`text-xs font-bold ${healthLabel.color} tracking-wide`}>
                {healthLabel.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      {
    /* Main Charts & Activity Grid */
  }
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {
    /* Visual Recharts Area */
  }
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6 flex flex-col min-h-[380px] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Reconciled Trade Analytics</h3>
              <p className="text-[11px] text-gray-400">Dual-axis ledger trends tracking inflows vs cost margins.</p>
            </div>
          </div>
          
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={dbTheme.chartRevenue} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={dbTheme.chartRevenue} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={dbTheme.chartExpenses} stopOpacity={0.1} />
                    <stop offset="95%" stopColor={dbTheme.chartExpenses} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" opacity={0.7} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "11px", color: "#1e293b" }}
                  labelStyle={{ color: dbTheme.chartRevenue, fontWeight: "bold" }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                <Area type="monotone" dataKey="Revenue" stroke={dbTheme.chartRevenue} strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue Inflows" />
                <Area type="monotone" dataKey="Expenses" stroke={dbTheme.chartExpenses} strokeWidth={1.5} fillOpacity={1} fill="url(#colorExpenses)" name="Expense Outflows" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {
    /* Expense Breakdown Pie Chart */
  }
        <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col min-h-[380px] justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Expense Distribution</h3>
            <p className="text-[11px] text-gray-400">Category breakdown of ledger outflows.</p>
          </div>
          
          <div className="flex-1 w-full h-[180px] sm:h-[200px] flex items-center justify-center relative my-2">
            {expensePieData.length > 0 ? <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {expensePieData.map((entry, index) => {
                      const colors = pieColors[theme] || pieColors.cosmic;
                      const color = colors[index % colors.length];
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "11px" }}
                    itemStyle={{ color: "#1f2937" }}
                    formatter={(value) => [formatAmount(value, user?.currency), "Spent"]}
                  />
                </PieChart>
              </ResponsiveContainer> : <div className="text-center py-8">
                <p className="text-[11px] text-gray-400">No expense transactions recorded.</p>
              </div>}
            
            {expensePieData.length > 0 && <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-gray-900">
                  {formatAmount(expensePieData.reduce((acc, curr) => acc + curr.value, 0), user?.currency)}
                </span>
              </div>}
          </div>
          
          {
    /* Custom Custom Legend to match the design style */
  }
          {expensePieData.length > 0 && <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5 justify-center max-h-[85px] overflow-y-auto pt-2 border-t border-gray-200">
              {expensePieData.map((entry, index) => {
                const colors = pieColors[theme] || pieColors.cosmic;
                const color = colors[index % colors.length];
                const total = expensePieData.reduce((sum, item) => sum + item.value, 0);
                const percent = total > 0 ? (entry.value / total * 100).toFixed(0) : "0";
                return <div key={entry.name} className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="truncate max-w-[70px]">{entry.name}</span>
                    <span className="text-gray-400 text-[9px] font-mono">({percent}%)</span>
                  </div>;
              })}
            </div>}
        </div>

      </div>

      {
    /* Bottom Ledger Logs and Low Stock Alert Grid */
  }
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {
    /* Recent Ledger Logs (Transactions) */
  }
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Recent Transaction Ledger</h3>
              <p className="text-[11px] text-gray-400">Live feed of trade cash flows.</p>
            </div>
            <button
              onClick={() => navigate("/reports")}
              className={`text-xs font-semibold ${dbTheme.textAccent} cursor-pointer hover:underline`}
            >
              Full History
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700 border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider text-[10px] font-bold bg-gray-50/50">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5">Description</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5 text-right px-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedMockTransactions.slice(0, 5).map((tx) => <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="py-3 px-3 text-gray-500 font-mono text-[11px]">{tx.date}</td>
                    <td className="py-3 font-medium text-gray-900">{tx.description}</td>
                    <td className="py-3">
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-650 rounded border border-gray-200 text-[10px] font-semibold">
                        {tx.category}
                      </span>
                    </td>
                    <td className={`py-3 text-right px-3 font-bold ${tx.type === "revenue" ? "text-green-700" : "text-red-700"}`}>
                      {tx.type === "revenue" ? "+" : "-"}{formatAmount(tx.amount, user?.currency)}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side stack: Stock watchlist + AI Timeline */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Low Stock Watchlist */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 flex-1 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Stock Reorder Watchlist</h3>
                <p className="text-[11px] text-gray-400">Safety thresholds breach monitoring.</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {lowStockProducts.length > 0 ? lowStockProducts.map((p) => <div key={p.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-gray-800 truncate">{p.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-1">Available: <span className="text-red-700 font-bold">{p.quantity}</span> / safety threshold: {p.minStock}</p>
                    </div>
                    <button
                      onClick={() => navigate("/inventory")}
                      className={`px-2.5 py-1.5 ${dbTheme.reorderBtn} text-[10px] font-bold rounded-lg border transition-all shrink-0 cursor-pointer`}
                    >
                      Manage Stock
                    </button>
                  </div>) : <div className="text-center py-8">
                  <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-[11px] text-gray-400">All products have healthy stock.</p>
                </div>}
            </div>
          </div>

          {/* Recent AI Activity Timeline */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 flex-1 hover:border-gray-300 transition-all duration-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-650 animate-pulse" />
                  Recent AI Activity
                </h3>
                <p className="text-[11px] text-gray-400">Autonomous BizPilot automation logs.</p>
              </div>
            </div>

            {/* Timeline Container */}
            <div className="relative pl-6 space-y-4.5 before:absolute before:top-2 before:bottom-2 before:left-[9px] before:w-[2px] before:bg-gray-150">
              {[
                { time: "09:12", title: "Invoice OCR Completed", desc: "Parsed Apex Power Solutions PDF", icon: FileText },
                { time: "09:13", title: "Inventory Updated", desc: "Synchronized equipment counts", icon: Package },
                { time: "09:14", title: "AI Generated Insights", desc: "Identified high-demand metrics", icon: Sparkles },
                { time: "09:16", title: "Vendor Recommendation", desc: "Optimized wholesale supplier route", icon: Users },
                { time: "09:18", title: "Executive Report Generated", desc: "Brief typed and formatted", icon: Activity }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="relative group/item flex items-start gap-3 text-left">
                    {/* Timeline Node Point */}
                    <span className="absolute -left-[23px] top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm group-hover/item:border-teal-500 transition-colors duration-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-650 group-hover/item:scale-125 transition-transform duration-200" />
                    </span>

                    {/* Content Block */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-gray-800 group-hover/item:text-teal-700 transition-colors">
                          {item.title}
                        </span>
                        <span className="text-[9px] font-mono text-gray-400 font-semibold shrink-0">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {
    /* Workforce Operations & Best-Selling Equipment Panel */
  }
      <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Workforce & Sales Operations Overview</h3>
              <p className="text-xs text-gray-500">Live division staffing allocations, wages tracking, and top equipment demand metrics.</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/workforce")}
            className="bg-gray-150 hover:bg-gray-200 border border-gray-250 text-gray-750 px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Manage Team & Wages</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {
    /* Best Sellers */
  }
          <div className="p-4 bg-gray-50/50 border border-gray-200 rounded-xl flex flex-col justify-between space-y-3 shadow-sm">
            <div>
              <h4 className="text-xs font-bold flex items-center gap-1.5 text-emerald-700 font-sans">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                Best-Selling Equipment
              </h4>
              <p className="text-[11px] text-gray-500 mt-1">High-demand products by invoice units:</p>
              
              <div className="space-y-2 mt-3">
                {topSellingProducts.length > 0 ? topSellingProducts.map((p) => <div key={p.name} className="flex justify-between items-center text-[11px]">
                      <span className="text-gray-700 truncate max-w-[150px]" title={p.name}>{p.name}</span>
                      <span className="font-mono text-emerald-700 font-semibold shrink-0">{p.quantitySold} units</span>
                    </div>) : <p className="text-[11px] text-gray-500">No equipment sales logged yet.</p>}
              </div>
            </div>
            <button
              onClick={() => navigate("/inventory")}
              className="text-[10px] font-bold text-emerald-700 hover:opacity-85 transition-opacity flex items-center gap-1 cursor-pointer w-fit mt-2"
            >
              <span>View Inventory</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {
    /* Workforce Roster summary */
  }
          <div className="p-4 bg-gray-50/50 border border-gray-200 rounded-xl flex flex-col justify-between space-y-3 shadow-sm">
            <div>
              <h4 className="text-xs font-bold flex items-center gap-1.5 text-indigo-600 font-sans">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
                Operations Staff Status
              </h4>
              <p className="text-[11px] text-gray-500 mt-1">Personnel stats under direct supervision:</p>
              
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-700">Total Registered Employees</span>
                  <span className="font-mono font-semibold text-gray-900">{workforceCount} staffs</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-700">Operational Sectors</span>
                  <span className="font-mono font-semibold text-gray-900">4 divisions</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/workforce")}
              className="text-[10px] font-bold text-indigo-600 hover:opacity-85 transition-opacity flex items-center gap-1 cursor-pointer w-fit mt-2"
            >
              <span>View Roster</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {
    /* Wages Settlement status */
  }
          <div className="p-4 bg-gray-50/50 border border-gray-200 rounded-xl flex flex-col justify-between space-y-3 shadow-sm">
            <div>
              <h4 className="text-xs font-bold flex items-center gap-1.5 text-amber-700 font-sans">
                <span className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                Surveillance Wages Settle
              </h4>
              <p className="text-[11px] text-gray-500 mt-1">Pending wage balances generated by logged actions:</p>
              
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-700">Outstanding Wages</span>
                  <span className="font-mono font-bold text-amber-600">{formatAmount(pendingWages, user?.currency)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-700">Approval Ledger</span>
                  <span className="text-gray-550 font-semibold">Settle-on-Demand</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/workforce")}
              className="text-[10px] font-bold text-amber-700 hover:opacity-85 transition-opacity flex items-center gap-1 cursor-pointer w-fit mt-2"
            >
              <span>Review Wage Balances</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>

      {/* AI Executive Brief Modal */}
      {showBriefModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-gray-200 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-150 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                <h3 className="font-display text-base font-bold text-gray-900">AI Daily Operations Brief</h3>
              </div>
              <button
                onClick={() => setShowBriefModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-150 text-gray-450 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl min-h-[220px]">
                <pre className="text-sm font-sans text-gray-800 leading-relaxed white-space-pre-wrap text-left">
                  {typewriterText}
                </pre>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-150 flex items-center justify-end gap-3">
              <button
                onClick={handleCopyText}
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-250 text-xs font-bold rounded-xl flex items-center gap-1.5 text-gray-700 cursor-pointer transition-all hover:text-gray-900"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                    <span className="text-emerald-600 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-xs font-bold rounded-xl text-white cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export as PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Dashboard Smart Product Scanner Modal */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800/85 w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)] relative flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
            
            {/* Header */}
            <div className="p-5 border-b border-slate-850 flex justify-between items-center bg-slate-950/40">
              <div>
                <h3 className="font-display font-bold text-base text-slate-200 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-400 animate-pulse" />
                  Smart Product Scanner
                </h3>
                <p className="text-[11px] text-slate-500">Scan packaging barcode to identify and audit inventory item.</p>
              </div>
              <button
                onClick={handleStopScanner}
                className="text-slate-400 hover:text-white transition-colors font-bold text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-755 rounded-xl cursor-pointer"
              >
                Close Dialog
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* STATE 1: SCANNING OR VIEWPORT */}
              {!scannedProduct && !showNotFoundDialog && (
                <div className="space-y-5 flex flex-col items-center">
                  
                  {/* Camera Viewfinder Box */}
                  <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner max-w-md">
                    <div id="dashboard-scanner-reader" className="w-full h-full object-cover" />

                    {/* Scanner laser lines */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.95)] pointer-events-none animate-bounce z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/30 pointer-events-none z-10" />
                    <div className="crt-scanlines opacity-40 z-10" />
                  </div>

                  {/* Animation progress bar */}
                  <div className="w-full max-w-md text-center space-y-2">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-mono">
                      {scannerStatus}
                    </span>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-150"
                        style={{ width: `${scanningProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions & Simulation controls inside modal */}
                  <div className="w-full max-w-md bg-slate-950/50 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scanner Options</span>
                      
                      {/* Flash toggle */}
                      <button
                        onClick={() => setFlashOn(!flashOn)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                          flashOn 
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/35" 
                            : "bg-slate-900 text-slate-500 border-slate-800"
                        }`}
                      >
                        ⚡ Flash {flashOn ? "ON" : "OFF"}
                      </button>
                    </div>

                    <div className="border-t border-slate-900 pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Demo Simulation Database</span>
                        <button
                          onClick={() => setShowDemoSelector(!showDemoSelector)}
                          className="text-[9px] text-emerald-400 font-bold hover:underline"
                        >
                          {showDemoSelector ? "Hide List" : "Show List"}
                        </button>
                      </div>

                      {showDemoSelector && (
                        <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-1">
                          {mockProductDatabase.map((p) => (
                            <button
                              key={p.barcode}
                              onClick={() => handleSimulateScan(p.barcode)}
                              className="text-left px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] text-slate-300 font-medium transition-all"
                            >
                              {p.name}
                            </button>
                          ))}
                          <button
                            onClick={() => handleSimulateScan("not_found_123")}
                            className="text-left px-2.5 py-1.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-rose-300 rounded-lg text-[10px] font-medium transition-all"
                          >
                            ⚠️ Unknown Code
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* STATE 2: SUCCESSFUL RESULTS VIEW */}
              {scannedProduct && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  
                  {/* Left Column: Product details */}
                  <div className="glass-card p-5 rounded-2xl bg-slate-950/40 border border-slate-850 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between pb-3.5 border-b border-slate-905">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Identified product</span>
                          <h4 className="text-sm font-bold text-white mt-0.5">{scannedProduct.name}</h4>
                        </div>
                        {getStockStatusBadge(scannedProduct.quantity, scannedProduct.minStock)}
                      </div>

                      <div className="flex gap-4 pt-3.5">
                        <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-4xl shadow-inner shrink-0">
                          {scannedProduct.image || "📦"}
                        </div>
                        
                        <div className="flex-1 grid grid-cols-1 gap-1 text-[11px] text-slate-400">
                          <div><span className="text-slate-500 font-semibold uppercase tracking-wider text-[8px] block">Barcode</span> <span className="font-mono font-bold text-slate-300">{scannedProduct.barcode}</span></div>
                          <div><span className="text-slate-500 font-semibold uppercase tracking-wider text-[8px] block">Brand / Cat</span> <span className="font-bold text-slate-300">{scannedProduct.brand} • {scannedProduct.category}</span></div>
                          <div><span className="text-slate-500 font-semibold uppercase tracking-wider text-[8px] block">SKU / Warehouse</span> <span className="font-mono font-bold text-slate-300">{scannedProduct.sku} ({scannedProduct.warehouse})</span></div>
                          <div><span className="text-slate-500 font-semibold uppercase tracking-wider text-[8px] block">MRP / Selling</span> <span className="font-bold text-emerald-400">₹{scannedProduct.mrp} / ₹{scannedProduct.price}</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-900 flex justify-between text-[10px] text-slate-500">
                      <span>Supplier: <span className="text-slate-400 font-semibold">{scannedProduct.supplier}</span></span>
                      <span>Expiry: <span className="text-slate-400 font-semibold">{scannedProduct.expiry}</span></span>
                    </div>
                  </div>

                  {/* Right Column: AI Analysis & Business Recommendation */}
                  <div className="glass-card p-5 rounded-2xl bg-gradient-to-b from-indigo-950/20 to-slate-950/40 border border-indigo-500/15 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider flex items-center gap-1.5 mb-3.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                        AI Analysis
                      </span>

                      <div className="grid grid-cols-2 gap-3.5 text-xs border-b border-slate-900 pb-3.5">
                        <div>
                          <span className="text-slate-500 block font-bold text-[8px] uppercase tracking-wider">Current Stock</span>
                          <span className="text-slate-200 font-bold font-mono">{scannedProduct.quantity} Units</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block font-bold text-[8px] uppercase tracking-wider">Daily Sales</span>
                          <span className="text-slate-200 font-bold font-mono">8 Units (Avg)</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block font-bold text-[8px] uppercase tracking-wider">Estimated Stockout</span>
                          <span className={`${scannedProduct.quantity <= scannedProduct.minStock ? "text-rose-400 font-bold" : "text-slate-200"} font-mono`}>
                            {Math.ceil(scannedProduct.quantity / 8)} Days
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block font-bold text-[8px] uppercase tracking-wider">Suggested Reorder</span>
                          <span className="text-emerald-400 font-bold font-mono">
                            {scannedProduct.quantity <= scannedProduct.minStock ? "100" : "50"} Units
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10 text-[10px] text-indigo-300 leading-relaxed">
                      <span className="font-bold text-white block mb-0.5 uppercase tracking-widest text-[8px] text-indigo-400">Business Recommendation</span>
                      Securing restock of {scannedProduct.quantity <= scannedProduct.minStock ? "100" : "50"} units is recommended in 48 hours to maintain steady sales margins in {scannedProduct.warehouse}.
                    </div>

                    {/* Action buttons based on catalog state */}
                    <div className="pt-2">
                      {scannedProduct.isAlreadyInInventory ? (
                        <button
                          onClick={handleUpdateScannedStock}
                          className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-xs font-bold text-white rounded-xl transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] duration-150 cursor-pointer"
                        >
                          ⚡ Update Stock (+10 Units)
                        </button>
                      ) : (
                        <button
                          onClick={handleAddScannedToInventory}
                          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white rounded-xl transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] duration-150 cursor-pointer"
                        >
                          📥 Add to Inventory
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* STATE 3: NOT FOUND DIALOG */}
              {showNotFoundDialog && (
                <div className="text-center py-6 max-w-sm mx-auto space-y-4">
                  <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl w-fit mx-auto border border-rose-500/15">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-200">Unknown Product</h3>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">Scanned Barcode: {notFoundBarcode}</p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    No matching inventory item was found. Would you like to register this new product or try scanning again?
                  </p>
                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={() => {
                        setShowNotFoundDialog(false);
                        handleStopScanner();
                        navigate("/inventory", { state: { autoOpenScanner: false, prefillBarcode: notFoundBarcode } });
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-xl transition-all shadow-md cursor-pointer text-center font-sans"
                    >
                      Register New Product
                    </button>
                    <button
                      onClick={() => {
                        setShowNotFoundDialog(false);
                        startCameraScanning();
                      }}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-xl transition-all border border-slate-700 cursor-pointer text-center font-sans"
                    >
                      Scan Again
                    </button>
                    <button
                      onClick={() => {
                        setShowNotFoundDialog(false);
                        handleStopScanner();
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-xs font-bold text-slate-400 rounded-xl transition-all border border-slate-800 cursor-pointer text-center font-sans"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Footer options */}
            <div className="p-4 bg-slate-950/40 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500">
              {scannedProduct ? (
                <button
                  onClick={() => {
                    setScannedProduct(null);
                    setShowDemoSelector(false);
                    startCameraScanning();
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-400 border border-indigo-500/20 rounded-xl font-bold cursor-pointer transition-all"
                >
                  ← Scan Another Product
                </button>
              ) : (
                <span>Click Demo options to simulate barcode reading</span>
              )}
              <span>BizPilot Scanner Engine v1.5</span>
            </div>

          </div>
        </div>
      )}

      {/* Toast alert popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-slate-900/90 border border-indigo-500/30 text-slate-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 max-w-sm backdrop-blur-md">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <div className="text-xs font-semibold leading-relaxed">
              {toastMessage}
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 hover:bg-slate-850 rounded text-slate-400 hover:text-white transition-colors ml-auto cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

    </div>;
}
