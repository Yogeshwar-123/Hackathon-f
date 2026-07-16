import { useState, useEffect } from "react";
import {
  Truck,
  MapPin,
  Clock,
  Play,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  UserCheck,
  Scan,
  Camera,
  Layers,
  CheckCircle,
  Map
} from "lucide-react";
export default function Logistics() {
  const [vehicles, setVehicles] = useState([]);
  const [facescans, setFacescans] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState("load");
  const [scanTargetVehicleId, setScanTargetVehicleId] = useState("v_1");
  const [scanEmployeeName, setScanEmployeeName] = useState("Marcus Vance");
  const [scanSuccessMessage, setScanSuccessMessage] = useState(null);
  const fetchData = async () => {
    try {
      const [vRes, fRes] = await Promise.all([
        fetch("/api/logistics"),
        fetch("/api/facescans")
      ]);
      let vData = [];
      if (vRes.ok) {
        vData = await vRes.json();
        setVehicles(vData);
        if (vData.length > 0 && !selectedVehicleId) {
          setSelectedVehicleId(vData[0].id);
        }
      }
      if (fRes.ok) {
        const fData = await fRes.json();
        setFacescans(fData);
      }
    } catch (err) {
      console.error("Error loading logistics metrics", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const handleSimulateTick = async () => {
    try {
      const res = await fetch("/api/logistics/simulate-tick", { method: "POST" });
      if (res.ok) {
        const updated = await res.json();
        setVehicles(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleResetSimulation = async () => {
    try {
      const res = await fetch("/api/logistics/reset-simulation", { method: "POST" });
      if (res.ok) {
        const updated = await res.json();
        setVehicles(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const triggerFaceScan = async (e) => {
    e.preventDefault();
    setIsScanning(true);
    setScanSuccessMessage(null);
    setTimeout(async () => {
      const matchScore = Number((96 + Math.random() * 3.8).toFixed(1));
      const chosenVehicle = vehicles.find((v) => v.id === scanTargetVehicleId);
      const scanPayload = {
        employeeName: scanEmployeeName,
        employeeId: scanEmployeeName === "Marcus Vance" ? "EMP-041" : "EMP-038",
        type: scanType,
        status: "success",
        location: scanType === "load" ? "Main Distribution Center (Hub A)" : chosenVehicle?.destinationName || "Delivery Address",
        vehicleId: scanTargetVehicleId,
        vehiclePlate: chosenVehicle?.plateNumber || "TX-8921-H",
        matchScore
      };
      try {
        const res = await fetch("/api/facescans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(scanPayload)
        });
        if (res.ok) {
          const newLog = await res.json();
          setFacescans((prev) => [newLog, ...prev]);
          setScanSuccessMessage(`Biometric Scan matches ${scanEmployeeName} (${matchScore}% match score). Load security token generated!`);
        }
      } catch (err) {
        console.error("Biometric scan registration failed", err);
      } finally {
        setIsScanning(false);
      }
    }, 2200);
  };
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  return <div id="logistics_workspace" className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      
      {
    /* Upper header action section */
  }
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-medium tracking-wide text-xs uppercase">
            <Layers className="w-4 h-4 animate-pulse" />
            BizPilot Freight & Logistics Terminal
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Live Delivery Tracking & Verification
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor GPS delivery channels, examine unsolicited vehicle stops, and mandate loading scans for security.
          </p>
        </div>
        
        {
    /* Sim action buttons */
  }
        <div className="flex items-center gap-3 self-start md:self-center">
          <button
    id="btn_sim_tick"
    onClick={handleSimulateTick}
    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
  >
            <Play className="w-4 h-4" />
            Move Vehicles (Simulate Progress)
          </button>
          
          <button
    id="btn_sim_reset"
    onClick={handleResetSimulation}
    className="flex items-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 rounded-xl text-sm font-medium transition-all"
    title="Reset Simulation"
  >
            <RotateCcw className="w-4 h-4" />
            Reset Route
          </button>
        </div>
      </div>

      {
    /* Grid of tracking map and diagnostics */
  }
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {
    /* Left Column: Live Vehicles List & Info */
  }
        <div className="space-y-4">
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-300 mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              Active Fleet Status ({vehicles.length})
            </h2>
            
            <div className="space-y-3">
              {vehicles.map((v) => {
    const isSelected = v.id === selectedVehicleId;
    return <button
      key={v.id}
      id={`vehicle_card_${v.id}`}
      onClick={() => setSelectedVehicleId(v.id)}
      className={`w-full text-left p-4 rounded-xl border transition-all ${isSelected ? "bg-emerald-600/15 border-emerald-500/80 shadow-md shadow-emerald-500/10" : "bg-slate-900/80 border-slate-800 hover:border-slate-700"}`}
    >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/50">
                          {v.plateNumber}
                        </span>
                        <h3 className="font-semibold text-white mt-1 text-sm">{v.driverName}</h3>
                      </div>
                      
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${v.status === "transit" ? "bg-amber-500/10 text-amber-400 border border-amber-500/25" : v.status === "complete" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
                        {v.status === "transit" ? "In Transit" : v.status === "complete" ? "Completed" : "On Standby"}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                      <div className="flex justify-between">
                        <span>ETA:</span>
                        <span className="font-semibold text-slate-200">{v.eta}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>To:</span>
                        <span className="truncate max-w-[150px] text-right text-slate-300">{v.destinationName}</span>
                      </div>
                    </div>

                    {
      /* Progress tracking line */
    }
                    {v.status !== "idle" && <div className="mt-3">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span>Route Progress</span>
                          <span>{v.routeProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
      className={`h-full rounded-full bg-gradient-to-r ${v.unexpectedStopAlert ? "from-red-500 to-amber-500 animate-pulse" : "from-emerald-500 to-teal-400"}`}
      style={{ width: `${v.routeProgress}%` }}
    />
                        </div>
                      </div>}

                    {v.unexpectedStopAlert && <div className="mt-3 flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 px-2 py-1 rounded-lg text-[11px] text-red-400 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 animate-bounce" />
                        Unexpected Idle Alert Detected!
                      </div>}
                  </button>;
  })}
            </div>
          </div>
        </div>

        {
    /* Middle Column: Live GPS Route Journey Visualizer */
  }
        <div className="lg:col-span-2 space-y-6">
          
          {
    /* Journey map visualizer */
  }
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50 flex flex-col h-full min-h-[420px] justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-300 flex items-center gap-2">
                  <Map className="w-4 h-4 text-emerald-400" />
                  Live GPS Journey Route Map
                </h3>
                {selectedVehicle && <span className="text-xs text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                    Target: {selectedVehicle.plateNumber}
                  </span>}
              </div>

              {selectedVehicle ? <div className="space-y-4">
                  {
    /* Styled Vector Map Journey Canvas Container */
  }
                  <div className="relative bg-slate-950 rounded-xl border border-slate-800/80 p-6 overflow-hidden h-[240px] flex flex-col justify-between">
                    {
    /* Gridded overlay */
  }
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
                    
                    {
    /* Decorative Map routes */
  }
                    <svg className="absolute inset-0 w-full h-full text-slate-800/40 pointer-events-none">
                      <path d="M 50 120 Q 150 50 250 120 T 450 120" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                      <path d="M 50 120 H 450" fill="none" stroke="currentColor" strokeWidth="1" />
                    </svg>

                    {
    /* Active Transit Path line */
  }
                    {selectedVehicle.status !== "idle" && <div
    className="absolute bottom-[114px] left-[50px] h-[3px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-500"
    style={{ width: `calc(${selectedVehicle.routeProgress}% * 0.72)` }}
  />}

                    {
    /* Origin Marker */
  }
                    <div className="absolute left-[30px] top-[100px] flex flex-col items-center z-10">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        H
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium mt-1 truncate max-w-[80px]">
                        {selectedVehicle.originName.split(" ")[0]}
                      </span>
                    </div>

                    {
    /* Moving vehicle pin position */
  }
                    {selectedVehicle.status !== "idle" && <div
    className="absolute top-[80px] flex flex-col items-center transition-all duration-500 z-20"
    style={{ left: `calc(${selectedVehicle.routeProgress}% * 0.72 + 35px)` }}
  >
                        <div className={`p-2 rounded-lg ${selectedVehicle.unexpectedStopAlert ? "bg-red-500 text-white animate-bounce shadow-red-500/30" : "bg-emerald-600 text-white shadow-emerald-500/30"} shadow-lg border border-white/20`}>
                          <Truck className="w-4 h-4" />
                        </div>
                        <span className="bg-slate-900 border border-slate-800 text-[9px] px-1.5 py-0.5 rounded font-mono text-emerald-300 mt-1 shadow">
                          {selectedVehicle.routeProgress}%
                        </span>
                      </div>}

                    {
    /* Destination Marker */
  }
                    <div className="absolute right-[30px] top-[100px] flex flex-col items-center z-10">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        D
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium mt-1 truncate max-w-[85px]">
                        {selectedVehicle.destinationName.split(" ")[0]}
                      </span>
                    </div>

                    {
    /* Bottom Status panel */
  }
                    <div className="mt-auto flex justify-between items-end z-10 bg-slate-900/90 p-3 rounded-lg border border-slate-800/80">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400">Current GPS Coordinates</span>
                        <div className="text-xs font-mono font-bold text-slate-200">
                          {selectedVehicle.currentLat.toFixed(5)}° N , {selectedVehicle.currentLng.toFixed(5)}° W
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400">Driver</span>
                        <div className="text-xs font-semibold text-emerald-300">{selectedVehicle.driverName}</div>
                      </div>
                    </div>
                  </div>

                  {
    /* Vehicle Stop Monitoring Logs & Alerts */
  }
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Stop History & Unexpected Idle Monitoring
                      </h4>
                      {selectedVehicle.unexpectedStopAlert && <span className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/25 rounded font-medium animate-pulse">
                          Prolonged Stop Alert Active
                        </span>}
                    </div>

                    <div className="space-y-2.5">
                      {selectedVehicle.stopsMade.length === 0 ? <div className="text-xs text-slate-500 italic p-3 text-center border border-dashed border-slate-800 rounded">
                          No transit stops recorded on this route yet.
                        </div> : selectedVehicle.stopsMade.map((stop) => <div
    key={stop.id}
    className={`p-3 rounded-lg flex items-start justify-between border ${stop.isUnexpected ? "bg-red-500/15 border-red-500/30" : "bg-slate-900 border-slate-800/80"}`}
  >
                            <div className="flex gap-2.5">
                              <MapPin className={`w-4 h-4 mt-0.5 ${stop.isUnexpected ? "text-red-400" : "text-slate-400"}`} />
                              <div>
                                <h5 className="text-xs font-semibold text-white">{stop.locationName}</h5>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  {stop.reason || "Routine rest/traffic stop"}
                                </p>
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0 text-[11px]">
                              <span className="font-semibold text-slate-300">{stop.durationMin} mins stop</span>
                              <div className="text-[10px] text-slate-500 mt-0.5">{stop.timestamp}</div>
                            </div>
                          </div>)}
                    </div>
                  </div>
                </div> : <div className="text-center p-8 text-slate-500 italic">
                  Select a delivery vehicle to examine the live GPS journey route.
                </div>}
            </div>
          </div>
        </div>
      </div>

      {
    /* Security Scanning Verification Module */
  }
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {
    /* Face Scan Scanner Simulator Form */
  }
        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-300 mb-4 flex items-center gap-2">
            <Scan className="w-4 h-4 text-emerald-400" />
            Biometric Verification Terminal
          </h3>

          <form onSubmit={triggerFaceScan} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Scan Event Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
    type="button"
    onClick={() => setScanType("load")}
    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${scanType === "load" ? "bg-emerald-600/20 border-emerald-500 text-emerald-300" : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"}`}
  >
                  Load Stock Scan
                </button>
                <button
    type="button"
    onClick={() => setScanType("unload")}
    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${scanType === "unload" ? "bg-emerald-600/20 border-emerald-500 text-emerald-300" : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"}`}
  >
                  Unload Stock Scan
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Target Vehicle & Load
              </label>
              <select
    value={scanTargetVehicleId}
    onChange={(e) => setScanTargetVehicleId(e.target.value)}
    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
  >
                {vehicles.map((v) => <option key={v.id} value={v.id}>
                    {v.plateNumber} — {v.driverName}
                  </option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Employee Verification Identity
              </label>
              <select
    value={scanEmployeeName}
    onChange={(e) => setScanEmployeeName(e.target.value)}
    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
  >
                <option value="Marcus Vance">Marcus Vance (Driver ID: EMP-041)</option>
                <option value="Sarah Jenkins">Sarah Jenkins (Driver ID: EMP-038)</option>
                <option value="Ray Patel">Ray Patel (Staff ID: EMP-022)</option>
              </select>
            </div>

            {
    /* Styled Scanner Camera Preview Simulator */
  }
            <div className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 h-[150px] flex items-center justify-center">
              {isScanning ? <>
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500 shadow-lg shadow-emerald-500/80 animate-[bounce_2s_infinite] z-20" />
                  <div className="absolute inset-0 bg-emerald-500/10 animate-pulse z-10" />
                  <Camera className="w-8 h-8 text-emerald-400 animate-spin-slow z-20" />
                  <span className="absolute bottom-3 text-[10px] font-mono tracking-wider uppercase text-emerald-300 bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/30 z-20">
                    Running facial alignment...
                  </span>
                </> : <div className="text-center p-4">
                  <Camera className="w-7 h-7 text-slate-600 mx-auto mb-1.5" />
                  <span className="text-[10px] text-slate-400 block font-mono">
                    CAMERA STANDBY
                  </span>
                  <span className="text-[9px] text-slate-600 block mt-0.5">
                    Align face in the box during scanning
                  </span>
                </div>}
            </div>

            {scanSuccessMessage && <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{scanSuccessMessage}</span>
              </div>}

            <button
    type="submit"
    disabled={isScanning}
    className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
  >
              <Scan className="w-4 h-4" />
              {isScanning ? "Processing Match..." : "Activate Facial Recognition Scan"}
            </button>
          </form>
        </div>

        {
    /* Security Logs (Loaded & Unloaded Load Events) */
  }
        <div className="lg:col-span-2 bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verifiable Load Scan Audit Registry
            </h3>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60">
              TAMPER PROOF LEDGER
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Employee</th>
                  <th className="pb-3 font-semibold">Vehicle Plate</th>
                  <th className="pb-3 font-semibold">Event Type</th>
                  <th className="pb-3 font-semibold">Scan Date & Time</th>
                  <th className="pb-3 font-semibold">Match Confidence</th>
                  <th className="pb-3 font-semibold text-right">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {facescans.length === 0 ? <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500 italic text-xs">
                      No biometric loading verification logs captured yet.
                    </td>
                  </tr> : facescans.map((log) => <tr key={log.id} className="text-xs text-slate-300 hover:bg-slate-900/30 transition-all">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-slate-800 rounded-lg text-slate-300">
                            <UserCheck className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-200">{log.employeeName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{log.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-slate-400">
                        {log.vehiclePlate || "N/A"}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${log.type === "load" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"}`}>
                          {log.type === "load" ? "Loaded Load" : "Unloaded Load"}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 font-mono">
                        {log.timestamp}
                      </td>
                      <td className="py-3 font-mono text-emerald-400">
                        {log.matchScore}% match
                      </td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      </td>
                    </tr>)}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>;
}
