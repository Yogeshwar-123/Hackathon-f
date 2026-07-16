import { useState, useEffect } from "react";
import {
  googleSignIn,
  googleSignOut,
  initAuth,
  getOrCreateFolder,
  uploadBackupFile,
  listBackupFiles,
  downloadBackupContent,
  deleteBackupFile
} from "../googleDrive";
import {
  Cloud as CloudIcon,
  LogOut as LogOutIcon,
  Archive as ArchiveIcon,
  Database as DatabaseIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  AlertTriangle as AlertTriangleIcon,
  Bell as BellIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Plus as PlusIcon,
  Trash2 as TrashIcon,
  RefreshCw as RefreshIcon,
  Briefcase as BriefcaseIcon,
  Volume2 as VolumeIcon,
  VolumeX as MuteIcon,
  Megaphone as MegaphoneIcon,
  RotateCw as RenewIcon,
  Sparkles as SparklesIcon
} from "lucide-react";
export default function Backups() {
  const [tasks, setTasks] = useState([]);
  const [backupsList, setBackupsList] = useState([]);
  const [workforce, setWorkforce] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gdConnected, setGdConnected] = useState(false);
  const [gdUser, setGdUser] = useState(null);
  const [gdToken, setGdToken] = useState(null);
  const [gdLoading, setGdLoading] = useState(false);
  const [gdFiles, setGdFiles] = useState([]);
  const [gdFolderId, setGdFolderId] = useState(null);
  const [gdBackupLabel, setGdBackupLabel] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(null);
  const [speakingText, setSpeakingText] = useState("");
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [vocalSector, setVocalSector] = useState("All Sectors");
  const [voiceProvider, setVoiceProvider] = useState("local");
  const [selectedVoiceId, setSelectedVoiceId] = useState("en-US-natalie");
  const [currentAudio, setCurrentAudio] = useState(null);
  const [renewTaskId, setRenewTaskId] = useState(null);
  const [renewDate, setRenewDate] = useState("");
  const [backupYear, setBackupYear] = useState("2026");
  const [backupMonth, setBackupMonth] = useState("07");
  const [backupLabel, setBackupLabel] = useState("");
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskRecurrence, setTaskRecurrence] = useState("once");
  const [taskNextRun, setTaskNextRun] = useState("");
  const [taskUrgency, setTaskUrgency] = useState("medium");
  const [taskStaff, setTaskStaff] = useState("");
  const loadData = async () => {
    try {
      const [tRes, bRes, wRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/backup-restore/list"),
        fetch("/api/workforce")
      ]);
      if (tRes.ok) setTasks(await tRes.json());
      if (bRes.ok) setBackupsList(await bRes.json());
      if (wRes.ok) setWorkforce(await wRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const fetchGoogleDriveFiles = async (token) => {
    setGdLoading(true);
    try {
      const folderId = await getOrCreateFolder(token);
      setGdFolderId(folderId);
      const files = await listBackupFiles(token, folderId);
      setGdFiles(files);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to sync Google Drive files: " + err.message);
    } finally {
      setGdLoading(false);
    }
  };
  useEffect(() => {
    loadData();
    const unsubscribe = initAuth(
      (user, token) => {
        setGdUser(user);
        setGdToken(token);
        setGdConnected(true);
        fetchGoogleDriveFiles(token);
      },
      () => {
        setGdUser(null);
        setGdToken(null);
        setGdConnected(false);
        setGdFiles([]);
      }
    );
    return () => {
      unsubscribe();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  const handleConnectGoogleDrive = async () => {
    setGdLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGdUser(res.user);
        setGdToken(res.accessToken);
        setGdConnected(true);
        setSuccessMsg("Google Drive connected successfully!");
        await fetchGoogleDriveFiles(res.accessToken);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect Google Drive: " + err.message);
    } finally {
      setGdLoading(false);
    }
  };
  const handleDisconnectGoogleDrive = async () => {
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await googleSignOut();
      setGdUser(null);
      setGdToken(null);
      setGdConnected(false);
      setGdFiles([]);
      setSuccessMsg("Disconnected from Google Drive.");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to disconnect: " + err.message);
    }
  };
  const handleSaveBackupToGoogleDrive = async (e) => {
    e.preventDefault();
    if (!gdConnected || !gdToken) {
      setErrorMsg("Google Drive is not connected.");
      return;
    }
    setGdLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const dbRes = await fetch("/api/backup-restore/export");
      if (!dbRes.ok) throw new Error("Failed to export database from local server.");
      const currentDb = await dbRes.json();
      const folderId = gdFolderId || await getOrCreateFolder(gdToken);
      const now = /* @__PURE__ */ new Date();
      const formattedDate = now.toISOString().replace(/[:.]/g, "-");
      const cleanLabel = gdBackupLabel.trim() || `Snapshot_${now.toLocaleDateString()}`;
      const filename = `BizPilot_Backup_${formattedDate}_${cleanLabel.replace(/\s+/g, "_")}.json`;
      await uploadBackupFile(gdToken, folderId, filename, currentDb);
      setGdBackupLabel("");
      setSuccessMsg(`Successfully uploaded backup "${filename}" to Google Drive in 'BizPilot Backups' folder!`);
      await fetchGoogleDriveFiles(gdToken);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save backup to Google Drive: " + err.message);
    } finally {
      setGdLoading(false);
    }
  };
  const handleRestoreFromGoogleDrive = async (fileId, filename) => {
    if (!gdConnected || !gdToken) {
      setErrorMsg("Google Drive is not connected.");
      return;
    }
    if (!window.confirm(`CRITICAL: Are you sure you want to download and restore the backup "${filename}" from Google Drive? This will overwrite your current live products, invoices, transactions, workforce, and customers.`)) {
      return;
    }
    setGdLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const backupData = await downloadBackupContent(gdToken, fileId);
      const res = await fetch("/api/backup-restore/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backupData)
      });
      if (res.ok) {
        setSuccessMsg(`Full-system restored successfully from Google Drive backup "${filename}"! Page will refresh...`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to restore downloaded backup schema.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to restore from Google Drive: " + err.message);
    } finally {
      setGdLoading(false);
    }
  };
  const handleDeleteGoogleDriveBackup = async (fileId, filename) => {
    if (!gdConnected || !gdToken) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${filename}" from Google Drive? This action cannot be undone.`)) {
      return;
    }
    setGdLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await deleteBackupFile(gdToken, fileId);
      setSuccessMsg(`Deleted "${filename}" from Google Drive.`);
      await fetchGoogleDriveFiles(gdToken);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete Google Drive file: " + err.message);
    } finally {
      setGdLoading(false);
    }
  };
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !taskNextRun) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDesc,
          recurrence: taskRecurrence,
          nextRun: taskNextRun,
          urgency: taskUrgency,
          assignedStaff: taskStaff || "Unassigned"
        })
      });
      if (res.ok) {
        const added = await res.json();
        setTasks((prev) => [...prev, added]);
        setTaskTitle("");
        setTaskDesc("");
        setTaskNextRun("");
        setTaskStaff("");
        setSuccessMsg("Task scheduled successfully. Immediate alert tracking is online.");
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleDeleteTask = async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleNotifyStaff = async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notified: true })
      });
      if (res.ok) {
        setTasks((prev) => prev.map((t) => t.id === id ? { ...t, notified: true } : t));
        setSuccessMsg("Urgent staff notification dispatched successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };
  const getWorkerSector = (workerName) => {
    if (!workerName) return "Assembly & Mounting";
    if (!Array.isArray(workforce)) return "Assembly & Mounting";
    const w = workforce.find(
      (member) => member && typeof member.name === "string" && member.name.toLowerCase() === workerName.toLowerCase()
    );
    return w && w.sector ? w.sector : "Assembly & Mounting";
  };
  const speakText = async (text, id) => {
    if (currentAudio) {
      currentAudio.pause();
      try {
        currentAudio.currentTime = 0;
      } catch (e) {
      }
      setCurrentAudio(null);
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (isSpeaking === id) {
      setIsSpeaking(null);
      setSpeakingText("");
      return;
    }
    setIsSpeaking(id);
    setSpeakingText(text);
    if (voiceProvider === "local") {
      if (!("speechSynthesis" in window)) {
        setErrorMsg("Text-to-speech is not supported in this browser.");
        setIsSpeaking(null);
        setSpeakingText("");
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceSpeed;
      utterance.onend = () => {
        setIsSpeaking(null);
        setSpeakingText("");
      };
      utterance.onerror = () => {
        setIsSpeaking(null);
        setSpeakingText("");
      };
      window.speechSynthesis.speak(utterance);
    } else {
      try {
        const response = await fetch("/api/voice/synthesize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            provider: voiceProvider,
            voiceId: selectedVoiceId
          })
        });
        if (!response.ok) {
          throw new Error(`Voice server responded with status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.audioUrl) {
          const audio = new Audio(data.audioUrl);
          setCurrentAudio(audio);
          audio.onended = () => {
            setIsSpeaking(null);
            setSpeakingText("");
            setCurrentAudio(null);
          };
          audio.onerror = () => {
            console.error("Audio playback error");
            setErrorMsg("Could not play synthesized audio. Fallback to local synthesizer.");
            if ("speechSynthesis" in window) {
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.rate = voiceSpeed;
              utterance.onend = () => {
                setIsSpeaking(null);
                setSpeakingText("");
              };
              utterance.onerror = () => {
                setIsSpeaking(null);
                setSpeakingText("");
              };
              window.speechSynthesis.speak(utterance);
            } else {
              setIsSpeaking(null);
              setSpeakingText("");
            }
            setCurrentAudio(null);
          };
          audio.play().catch((err) => {
            console.error("Audio playback promise rejected:", err);
            if ("speechSynthesis" in window) {
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.rate = voiceSpeed;
              utterance.onend = () => {
                setIsSpeaking(null);
                setSpeakingText("");
              };
              window.speechSynthesis.speak(utterance);
            } else {
              setIsSpeaking(null);
              setSpeakingText("");
            }
            setCurrentAudio(null);
          });
          setSuccessMsg(data.message || `Voice generated successfully via ${voiceProvider}!`);
        } else if (data.fallback) {
          console.log("Fallback to local speech synthesis as API is unconfigured");
          setErrorMsg(`API key for ${voiceProvider === "murf" ? "Murf.ai" : "Hume.ai"} is unconfigured. Using high-quality local synthesizer fallback.`);
          if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = voiceSpeed;
            utterance.onend = () => {
              setIsSpeaking(null);
              setSpeakingText("");
            };
            utterance.onerror = () => {
              setIsSpeaking(null);
              setSpeakingText("");
            };
            window.speechSynthesis.speak(utterance);
          } else {
            setIsSpeaking(null);
            setSpeakingText("");
          }
        } else {
          throw new Error(data.error || "Unexpected response schema from voice backend.");
        }
      } catch (err) {
        console.error("API Voice synthesis failed, falling back to local speech synthesis:", err);
        setErrorMsg(`API voice generation failed: ${err.message}. Falling back to standard voice.`);
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = voiceSpeed;
          utterance.onend = () => {
            setIsSpeaking(null);
            setSpeakingText("");
          };
          utterance.onerror = () => {
            setIsSpeaking(null);
            setSpeakingText("");
          };
          window.speechSynthesis.speak(utterance);
        } else {
          setIsSpeaking(null);
          setSpeakingText("");
        }
      }
    }
  };
  const speakTask = (task) => {
    const sector = getWorkerSector(task.assignedStaff);
    const text = `Vocal alert dispatch. Sector: ${sector}. Staff member assigned: ${task.assignedStaff}. Task briefing: ${task.title}. Instructions are: ${task.description || "No custom instructions registered"}. Priority level: ${task.urgency}. Target run-time: ${new Date(task.nextRun).toLocaleString()}. Please execute immediately and log status.`;
    speakText(text, task.id);
  };
  const handleBroadcastSector = () => {
    const activeTasks = tasks.filter((t) => !t.completed);
    const filtered = activeTasks.filter((t) => {
      if (vocalSector === "All Sectors") return true;
      const sec = getWorkerSector(t.assignedStaff);
      return sec === vocalSector;
    });
    if (filtered.length === 0) {
      const msg = `Attention all staff. No pending scheduled works found for ${vocalSector}. All divisions are operating within optimal parameters. Thank you.`;
      speakText(msg, "broadcast_empty");
      return;
    }
    let broadcastMsg = `Attention, division dispatch announcement for ${vocalSector}. There are ${filtered.length} active scheduled works in progress. `;
    filtered.forEach((t, index) => {
      const sec = getWorkerSector(t.assignedStaff);
      broadcastMsg += `Schedule item ${index + 1}: Assigned to ${t.assignedStaff} in ${sec} sector. Briefing: ${t.title}. `;
    });
    broadcastMsg += "All operators, please maintain optimal standards and log completion statuses upon finalizing your assignments.";
    speakText(broadcastMsg, "broadcast_sector");
  };
  const handleCompleteTask = async (id, isCompleted) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: isCompleted })
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks((prev) => prev.map((t) => t.id === id ? updated : t));
        setSuccessMsg(isCompleted ? "Task successfully marked as completed! Ready for renewal." : "Task reset to active status.");
        if (isCompleted) {
          const task = tasks.find((t) => t.id === id);
          if (task) {
            speakText(`Task completed successfully: ${task.title}. Excellent job. Let's schedule its renewal cycle.`, `complete_speak_${id}`);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleRenewTask = async (id, customNextRun) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    let nextRunDate = customNextRun;
    if (!nextRunDate) {
      const currentNextRun = new Date(task.nextRun);
      if (isNaN(currentNextRun.getTime())) {
        const now = /* @__PURE__ */ new Date();
        now.setDate(now.getDate() + 1);
        nextRunDate = now.toISOString().slice(0, 16);
      } else {
        if (task.recurrence === "daily") {
          currentNextRun.setDate(currentNextRun.getDate() + 1);
        } else if (task.recurrence === "weekly") {
          currentNextRun.setDate(currentNextRun.getDate() + 7);
        } else if (task.recurrence === "monthly") {
          currentNextRun.setMonth(currentNextRun.getMonth() + 1);
        } else {
          currentNextRun.setDate(currentNextRun.getDate() + 1);
        }
        nextRunDate = currentNextRun.toISOString().slice(0, 16);
      }
    }
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed: false,
          notified: false,
          nextRun: nextRunDate
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks((prev) => prev.map((t) => t.id === id ? updated : t));
        setRenewTaskId(null);
        setSuccessMsg(`Task "${task.title}" renewed! Rescheduled for ${new Date(nextRunDate).toLocaleString()}`);
        speakText(`Task renewed successfully. The next operations run is scheduled for ${new Date(nextRunDate).toLocaleDateString()}`, `renew_speak_${id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleCreateBackup = async (e) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/backup-restore/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: backupYear,
          month: backupMonth,
          label: backupLabel || `Automated Snap (${backupMonth}/${backupYear})`
        })
      });
      if (res.ok) {
        const data = await res.json();
        setBackupsList((prev) => [data.backup, ...prev]);
        setBackupLabel("");
        setSuccessMsg(`Archival point created successfully for ${backupMonth}/${backupYear}! All products, invoices, and transactions stored.`);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to create archive snapshot.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to the archival server.");
    }
  };
  const handleRestoreBackup = async (backupId) => {
    if (!window.confirm("CRITICAL: Restoring will overwrite your current live products, invoices, transactions, and customers. Proceed with rollback?")) return;
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/backup-restore/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backupId })
      });
      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(data.message);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Restoration rollback failed.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Connection failure during restoration process.");
    }
  };
  const handleDownloadExport = () => {
    window.open("/api/backup-restore/export", "_blank");
  };
  const handleImportJSON = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const rawText = evt.target?.result;
        const parsed = JSON.parse(rawText);
        const res = await fetch("/api/backup-restore/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed)
        });
        if (res.ok) {
          setSuccessMsg("Full database restored successfully from external backup file! Re-syncing...");
          setTimeout(() => window.location.reload(), 1500);
        } else {
          const err = await res.json();
          setErrorMsg(err.error || "Invalid file structure.");
        }
      } catch (err) {
        setErrorMsg("Failed to parse JSON file structure: " + err.message);
      }
    };
    reader.readAsText(file);
  };
  const checkUrgentDeadline = (task) => {
    if (task.notified) return null;
    const taskDate = new Date(task.nextRun);
    const now = /* @__PURE__ */ new Date();
    const diffMs = taskDate.getTime() - now.getTime();
    const diffHours = diffMs / (1e3 * 60 * 60);
    if (diffHours > 0) {
      if (diffHours <= 12 && task.urgency === "high") {
        return { hours: Math.ceil(diffHours), isCritical: true };
      }
      if (diffHours <= 24) {
        return { hours: Math.ceil(diffHours), isCritical: task.urgency === "high" };
      }
    }
    return null;
  };
  return <div id="backups_and_tasks_workspace" className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      
      {
    /* Title Header Banner */
  }
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-2 text-purple-400 font-medium tracking-wide text-xs uppercase">
          <DatabaseIcon className="w-4 h-4 animate-pulse" />
          BizPilot Operations Center
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
          Recovery Backups & Task Scheduler
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure recurring operations tasks, notify staff of urgent deadlines, and securely archive/restore database snapshots based on specific years or months.
        </p>
      </div>

      {
    /* Global Toast Success / Error Notifications */
  }
      {successMsg && <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-3">
          <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>}

      {errorMsg && <div className="p-4 bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl text-xs flex items-center gap-3">
          <AlertTriangleIcon className="w-5 h-5 flex-shrink-0 animate-bounce" />
          <span>{errorMsg}</span>
        </div>}

      {
    /* Real-time Urgent Task Banners (Urgency within 12/24 hours!) */
  }
      <div className="space-y-3">
        {tasks.map((t) => {
    const alertInfo = checkUrgentDeadline(t);
    if (!alertInfo) return null;
    return <div
      key={`alert_${t.id}`}
      className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse ${alertInfo.isCritical ? "bg-red-500/20 border-red-500/40 text-red-300" : "bg-amber-500/20 border-amber-500/40 text-amber-300"}`}
    >
              <div className="flex gap-3">
                <BellIcon className="w-5 h-5 mt-0.5 flex-shrink-0 animate-bounce" />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider">
                    {alertInfo.isCritical ? "\u26A0\uFE0F CRITICAL DEADLINE WARNING (DUE < 12 HRS)" : "\u26A0\uFE0F URGENT TASK ALERT (DUE < 24 HRS)"}
                  </h4>
                  <p className="text-sm font-semibold mt-0.5">
                    "{t.title}" is due in {alertInfo.hours} hours! Assigned to {t.assignedStaff}.
                  </p>
                </div>
              </div>

              <button
      id={`btn_quick_notify_${t.id}`}
      onClick={() => handleNotifyStaff(t.id)}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase ${alertInfo.isCritical ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20" : "bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"}`}
    >
                Send Staff Notification
              </button>
            </div>;
  })}
      </div>

      {
    /* Bento Layout Grid: Task Scheduler | Backups Manager */
  }
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {
    /* Left Column: Scheduled Tasks Directory (7 Columns Wide) */
  }
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-300 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-purple-400" />
              Operational Scheduled Tasks
            </h3>

            {
    /* Task Scheduler Creation Form */
  }
            <form onSubmit={handleAddTask} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 mb-5 space-y-3">
              <h4 className="text-xs font-bold text-purple-400 uppercase pb-2 border-b border-slate-800">
                Schedule Operations / Backup Routine
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-slate-400 mb-1">Task Title / Brief *</label>
                  <input
    type="text"
    required
    value={taskTitle}
    onChange={(e) => setTaskTitle(e.target.value)}
    placeholder="e.g. Conduct weekly stock count"
    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-slate-400 mb-1">Task Description</label>
                  <textarea
    value={taskDesc}
    onChange={(e) => setTaskDesc(e.target.value)}
    placeholder="Provide specific instructions for on-duty staff members..."
    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500 h-16 resize-none"
  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Recurrence Cycle</label>
                  <select
    value={taskRecurrence}
    onChange={(e) => setTaskRecurrence(e.target.value)}
    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
  >
                    <option value="once">Once (Ad-hoc)</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Urgency Priority</label>
                  <select
    value={taskUrgency}
    onChange={(e) => setTaskUrgency(e.target.value)}
    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High (Urgent Alerts)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Target Deadline *</label>
                  <input
    type="datetime-local"
    required
    value={taskNextRun}
    onChange={(e) => setTaskNextRun(e.target.value)}
    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Assigned Employee</label>
                  {workforce.length > 0 ? <select
    value={taskStaff}
    onChange={(e) => setTaskStaff(e.target.value)}
    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
  >
                      <option value="">-- Select Employee --</option>
                      {workforce.map((w) => <option key={w.id} value={w.name}>{w.name} ({w.sector})</option>)}
                    </select> : <input
    type="text"
    value={taskStaff}
    onChange={(e) => setTaskStaff(e.target.value)}
    placeholder="e.g. Marcus Vance"
    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
  />}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
    type="submit"
    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all"
  >
                  <PlusIcon className="w-3.5 h-3.5" />
                  Register Scheduled Task
                </button>
              </div>
            </form>

            {
    /* Live Vocal Dispatch Control widget */
  }
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 mb-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-900 gap-2">
                <h4 className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-2 font-mono">
                  <MegaphoneIcon className="w-4 h-4 text-cyan-400 animate-pulse animate-duration-1000" />
                  Live Vocal Dispatch Broadcaster
                </h4>
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <span className="text-[10px] text-slate-500 font-medium">Local Rate:</span>
                  <select
    value={voiceSpeed}
    onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
    className="bg-slate-900 border border-slate-800 text-[10px] text-slate-300 rounded px-2 py-0.5 focus:outline-none"
    disabled={voiceProvider !== "local"}
  >
                    <option value="0.8">0.8x (Slow)</option>
                    <option value="1">1.0x (Normal)</option>
                    <option value="1.2">1.2x (Fast)</option>
                    <option value="1.4">1.4x (Alert)</option>
                  </select>
                </div>
              </div>
              
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Choose an operational sector to dynamically broadcast all pending task instructions aloud. Powered by high-fidelity browser voice or studio integrations with <strong className="text-slate-300">Murf.ai</strong> or <strong className="text-slate-300">Hume.ai</strong>.
              </p>

              {
    /* Voice Engine Selectors */
  }
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1.5">Voice Engine</label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
    type="button"
    onClick={() => {
      setVoiceProvider("local");
      setSelectedVoiceId("default");
    }}
    className={`py-1 text-[10px] font-bold rounded-md transition-all ${voiceProvider === "local" ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/20 shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
  >
                      Browser API
                    </button>
                    <button
    type="button"
    onClick={() => {
      setVoiceProvider("murf");
      setSelectedVoiceId("en-US-natalie");
    }}
    className={`py-1 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-0.5 ${voiceProvider === "murf" ? "bg-purple-600/20 text-purple-400 border border-purple-500/20 shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
  >
                      <SparklesIcon className="w-2.5 h-2.5" />
                      Murf.ai
                    </button>
                    <button
    type="button"
    onClick={() => {
      setVoiceProvider("hume");
      setSelectedVoiceId("en-US-neutral");
    }}
    className={`py-1 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-0.5 ${voiceProvider === "hume" ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
  >
                      <SparklesIcon className="w-2.5 h-2.5" />
                      Hume.ai
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1.5">Voice Persona Selection</label>
                  {voiceProvider === "local" ? <div className="bg-slate-900/50 text-[11px] text-slate-500 border border-slate-800 rounded-lg p-2 italic flex items-center h-[34px]">
                      Default System Speech voice
                    </div> : voiceProvider === "murf" ? <select
    value={selectedVoiceId}
    onChange={(e) => setSelectedVoiceId(e.target.value)}
    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
  >
                      <option value="en-US-natalie">Natalie (Conversational Female - Default)</option>
                      <option value="en-US-marcus">Marcus (Professional Male)</option>
                      <option value="en-US-terry">Terry (Alert Narrator)</option>
                      <option value="en-UK-charles">Charles (British Male)</option>
                    </select> : <select
    value={selectedVoiceId}
    onChange={(e) => setSelectedVoiceId(e.target.value)}
    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
  >
                      <option value="en-US-neutral">Neutral Voice Persona</option>
                      <option value="en-US-expressive">Expressive Voice Persona</option>
                      <option value="en-US-warm">Warm Conversational Persona</option>
                    </select>}
                </div>
              </div>

              {
    /* Informative credentials badge */
  }
              {voiceProvider !== "local" && <div className="text-[10px] bg-slate-900/40 border border-slate-800 p-2 rounded-lg text-slate-400 flex items-center justify-between gap-2 leading-relaxed">
                  <span>
                    ℹ️ Proxy synthesize: Server looks for <code className="text-slate-300 font-mono font-bold bg-slate-950 px-1 py-0.5 rounded">{voiceProvider === "murf" ? "MURF_API_KEY" : "HUME_API_KEY"}</code>. Fallback mode is active.
                  </span>
                  <span className="shrink-0 text-[9px] font-semibold text-cyan-400 uppercase bg-cyan-950/40 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                    Auto-Fallback Active
                  </span>
                </div>}
              
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                <div className="w-full sm:w-1/2">
                  <select
    value={vocalSector}
    onChange={(e) => setVocalSector(e.target.value)}
    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
  >
                    <option value="All Sectors">All Sectors (All Pending Tasks)</option>
                    <option value="Assembly & Mounting">Assembly & Mounting Sector</option>
                    <option value="Logistics & Transport">Logistics & Transport Sector</option>
                    <option value="R&D Lab Testing">R&D Lab Testing Sector</option>
                    <option value="Sales & Support">Sales & Support Sector</option>
                  </select>
                </div>
                
                <div className="w-full sm:w-1/2 flex items-center gap-2">
                  <button
    type="button"
    onClick={handleBroadcastSector}
    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-2 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/10 active:scale-95 cursor-pointer"
  >
                    <VolumeIcon className="w-3.5 h-3.5" />
                    <span>Broadcast Schedules</span>
                  </button>
                  
                  {isSpeaking && <button
    type="button"
    onClick={() => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (currentAudio) {
        currentAudio.pause();
      }
      setIsSpeaking(null);
      setSpeakingText("");
    }}
    className="bg-red-600/30 hover:bg-red-600/50 border border-red-500/30 text-red-400 p-2 rounded-lg transition-colors cursor-pointer shrink-0"
    title="Stop Announcement"
  >
                      <MuteIcon className="w-4 h-4 animate-bounce" />
                    </button>}
                </div>
              </div>

              {isSpeaking && speakingText && <div className="p-3 bg-cyan-950/25 border border-cyan-800/40 rounded-xl text-[11px] text-cyan-300 animate-pulse flex items-start gap-2 leading-relaxed">
                  <span className="shrink-0 text-cyan-400 font-bold uppercase text-[9px] tracking-wider mt-0.5 bg-cyan-500/15 px-1 py-0.5 rounded border border-cyan-500/20 font-mono">Vocal Subtitles:</span>
                  <p className="italic font-medium">"{speakingText}"</p>
                </div>}
            </div>

            {
    /* List of Tasks */
  }
            <div className="space-y-3.5">
              {tasks.length === 0 ? <div className="text-center py-6 text-slate-500 italic text-xs border border-dashed border-slate-800 rounded-xl">
                  No operational tasks scheduled yet. Create one to enable automated time-critical warnings.
                </div> : tasks.map((t) => {
    const staffSector = getWorkerSector(t.assignedStaff);
    return <div
      key={t.id}
      className={`p-4 rounded-xl border transition-all ${t.completed ? "bg-slate-950/40 border-slate-900/60 opacity-65" : "bg-slate-950 border-slate-800 hover:border-slate-700/60"}`}
    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className={`font-semibold text-sm ${t.completed ? "text-slate-400 line-through" : "text-white"}`}>
                              {t.title}
                            </h4>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${t.completed ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : t.urgency === "high" ? "bg-red-500/10 text-red-400 border border-red-500/20" : t.urgency === "medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-slate-800 text-slate-400"}`}>
                              {t.completed ? "completed" : t.urgency}
                            </span>

                            <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md">
                              {staffSector}
                            </span>
                          </div>
                          {t.description && <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{t.description}</p>}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                          <button
      onClick={() => speakTask(t)}
      className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${isSpeaking === t.id ? "bg-cyan-600 border-cyan-500 text-white animate-pulse" : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"}`}
      title={isSpeaking === t.id ? "Stop Speech" : "Speak Task Instructions (TTS)"}
    >
                            <VolumeIcon className="w-3.5 h-3.5" />
                            <span className="text-[10px]">{isSpeaking === t.id ? "Speaking..." : "Vocalize"}</span>
                          </button>

                          <button
      onClick={() => handleDeleteTask(t.id)}
      className="text-slate-500 hover:text-red-400 p-2 hover:bg-red-500/5 rounded-lg border border-transparent hover:border-red-500/10 transition-all cursor-pointer"
      title="Delete Task"
    >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-900/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                          <div className="flex items-center gap-1 text-[11px]">
                            <ClockIcon className="w-3.5 h-3.5 text-slate-500" />
                            <span>Deadline: <strong className="text-slate-300 font-mono">{new Date(t.nextRun).toLocaleString()}</strong></span>
                          </div>

                          <div className="flex items-center gap-1 text-[11px]">
                            <BriefcaseIcon className="w-3.5 h-3.5 text-slate-500" />
                            <span>Staff: <strong className="text-slate-200">{t.assignedStaff}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {t.completed ? <div className="flex flex-wrap items-center gap-2">
                              <button
      onClick={() => handleCompleteTask(t.id, false)}
      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-300 text-[10px] font-bold px-2 py-1.5 rounded-lg transition-all"
      title="Set Task back to Active"
    >
                                Re-activate
                              </button>

                              {renewTaskId === t.id ? <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 animate-fadeIn">
                                  <input
      type="datetime-local"
      required
      value={renewDate}
      onChange={(e) => setRenewDate(e.target.value)}
      className="bg-slate-950 border border-slate-800 text-[10px] text-slate-300 rounded p-1 w-[140px] focus:outline-none focus:border-purple-500"
    />
                                  <button
      onClick={() => handleRenewTask(t.id, renewDate)}
      className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded"
    >
                                    Apply
                                  </button>
                                  <button
      onClick={() => setRenewTaskId(null)}
      className="text-[10px] text-slate-400 hover:text-white px-1"
    >
                                    Cancel
                                  </button>
                                </div> : <button
      onClick={() => {
        setRenewTaskId(t.id);
        const taskRun = new Date(t.nextRun);
        if (!isNaN(taskRun.getTime())) {
          if (t.recurrence === "daily") taskRun.setDate(taskRun.getDate() + 1);
          else if (t.recurrence === "weekly") taskRun.setDate(taskRun.getDate() + 7);
          else if (t.recurrence === "monthly") taskRun.setMonth(taskRun.getMonth() + 1);
          else taskRun.setDate(taskRun.getDate() + 1);
          setRenewDate(taskRun.toISOString().slice(0, 16));
        } else {
          const now = /* @__PURE__ */ new Date();
          now.setDate(now.getDate() + 1);
          setRenewDate(now.toISOString().slice(0, 16));
        }
      }}
      className="bg-purple-600/95 hover:bg-purple-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1"
    >
                                  <RenewIcon className="w-3 h-3 animate-spin-slow" />
                                  <span>Renew Task</span>
                                </button>}
                            </div> : <div className="flex items-center gap-2">
                              {t.notified ? <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/25">
                                  <CheckCircleIcon className="w-3 h-3" />
                                  Notified
                                </span> : <button
      onClick={() => handleNotifyStaff(t.id)}
      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all"
    >
                                  Dispatch Alert
                                </button>}

                              <button
      onClick={() => handleCompleteTask(t.id, true)}
      className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
    >
                                <CheckCircleIcon className="w-3.5 h-3.5 text-slate-950" />
                                <span>Mark Completed</span>
                              </button>
                            </div>}
                        </div>
                      </div>
                    </div>;
  })}
            </div>
          </div>
        </div>

        {
    /* Right Column: Database Backup, Recovery & Restore Archives (5 Columns Wide) */
  }
        <div className="lg:col-span-5 space-y-6">
          
          {
    /* Create Backup snapshot card */
  }
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50 space-y-3.5">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-300 flex items-center gap-2">
              <ArchiveIcon className="w-4 h-4 text-purple-400" />
              Generate Recovery Point
            </h3>

            <p className="text-xs text-slate-400">
              Create a full-system snapshot of products, transactions, and invoices matching a year and month.
            </p>

            <form onSubmit={handleCreateBackup} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Target Fiscal Year</label>
                  <select
    value={backupYear}
    onChange={(e) => setBackupYear(e.target.value)}
    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
  >
                    <option value="2026">2026 (Current)</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Target Month</label>
                  <select
    value={backupMonth}
    onChange={(e) => setBackupMonth(e.target.value)}
    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
  >
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Archival Point Label / Description</label>
                <input
    type="text"
    value={backupLabel}
    onChange={(e) => setBackupLabel(e.target.value)}
    placeholder="e.g. Pre-Inventory Auditing Point"
    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
  />
              </div>

              <button
    type="submit"
    className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-purple-500/10"
  >
                <ArchiveIcon className="w-4 h-4" />
                Snapshot Database State
              </button>
            </form>
          </div>

          {
    /* Export & Import System-State JSON */
  }
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50 space-y-3">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-300 flex items-center gap-2">
              <RefreshIcon className="w-4 h-4 text-cyan-400" />
              Raw State Export & Import
            </h3>

            <p className="text-xs text-slate-400">
              Export the full database as a single portable JSON file or upload/drag-and-drop a past JSON state file to trigger an offline restore.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
    onClick={handleDownloadExport}
    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition-all"
  >
                <DownloadIcon className="w-4 h-4" />
                Export DB JSON
              </button>

              <label className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 cursor-pointer transition-all">
                <UploadIcon className="w-4 h-4 text-cyan-400 animate-bounce" />
                Import State
                <input
    type="file"
    accept=".json"
    onChange={handleImportJSON}
    className="hidden"
  />
              </label>
            </div>
          </div>

          {
    /* Google Drive Cloud Backups */
  }
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-300 flex items-center gap-2">
                <CloudIcon className="w-4 h-4 text-sky-400" />
                Google Drive Vault
              </h3>
              {gdConnected && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  Online
                </span>}
            </div>

            <p className="text-xs text-slate-400">
              Securely store and restore backups directly in your personal Google Drive account.
            </p>

            {gdLoading && <div className="py-2 flex items-center justify-center gap-2 text-xs text-sky-400 bg-sky-500/5 rounded-xl border border-sky-500/10 animate-pulse">
                <RefreshIcon className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span>Syncing Cloud Vault...</span>
              </div>}

            {!gdConnected ? <button
    onClick={handleConnectGoogleDrive}
    disabled={gdLoading}
    className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
  >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>Connect Google Drive</span>
              </button> : <div className="space-y-4">
                {
    /* Account Details */
  }
                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {gdUser?.photoURL ? <img src={gdUser.photoURL} alt="Google Profile" className="w-6 h-6 rounded-full border border-sky-500/20" referrerPolicy="no-referrer" /> : <div className="w-6 h-6 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400 font-bold text-xs">
                        G
                      </div>}
                    <div className="truncate">
                      <p className="text-[10px] text-slate-500 leading-none">Google Vault Active</p>
                      <p className="text-xs font-semibold text-slate-200 truncate">{gdUser?.email || "Google User"}</p>
                    </div>
                  </div>

                  <button
    onClick={handleDisconnectGoogleDrive}
    className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-all"
    title="Disconnect Google Account"
  >
                    <LogOutIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                {
    /* Create Cloud Backup Form */
  }
                <form onSubmit={handleSaveBackupToGoogleDrive} className="space-y-2">
                  <label className="block text-[10px] text-slate-400">Save Active DB Snapshot to Drive</label>
                  <div className="flex gap-1.5">
                    <input
    type="text"
    value={gdBackupLabel}
    onChange={(e) => setGdBackupLabel(e.target.value)}
    placeholder="e.g. Audit Peak, Golden Backup"
    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
  />
                    <button
    type="submit"
    disabled={gdLoading}
    className="bg-sky-600 hover:bg-sky-500 text-white px-3.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
  >
                      <CloudIcon className="w-3.5 h-3.5" />
                      <span>Backup</span>
                    </button>
                  </div>
                </form>

                {
    /* Cloud Backups List */
  }
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                      Cloud Archives ({gdFiles.length})
                    </span>
                    <button
    type="button"
    onClick={() => gdToken && fetchGoogleDriveFiles(gdToken)}
    className="text-[10px] text-sky-400 hover:underline flex items-center gap-0.5 cursor-pointer"
  >
                      <RefreshIcon className="w-2.5 h-2.5" /> Sync
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {gdFiles.length === 0 ? <div className="text-center py-4 text-slate-600 italic text-[10px] border border-dashed border-slate-800 rounded-lg">
                        No cloud backups found on your Drive.
                      </div> : gdFiles.map((file) => {
    const parts = file.name.split("_");
    const label = parts.length > 3 ? parts.slice(3).join("_").replace(".json", "") : file.name;
    const dateStr = file.createdTime ? new Date(file.createdTime).toLocaleDateString() : "Unknown";
    const sizeKb = file.size ? `${(parseInt(file.size) / 1024).toFixed(1)} KB` : "0 KB";
    return <div key={file.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700/60 transition-all flex items-center justify-between gap-2">
                            <div className="space-y-0.5 min-w-0">
                              <h4 className="text-[11px] font-bold text-white truncate" title={file.name}>
                                {label}
                              </h4>
                              <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono">
                                <span>{dateStr}</span>
                                <span>•</span>
                                <span>{sizeKb}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
      onClick={() => handleRestoreFromGoogleDrive(file.id, file.name)}
      className="px-2 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/25 rounded text-[9px] font-bold uppercase transition-all"
    >
                                Restore
                              </button>
                              <button
      onClick={() => handleDeleteGoogleDriveBackup(file.id, file.name)}
      className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded transition-all"
    >
                                <TrashIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>;
  })}
                  </div>
                </div>
              </div>}
          </div>

          {
    /* Database Backups List & Restore Triggers */
  }
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50 space-y-3">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-300 flex items-center gap-2">
              <DatabaseIcon className="w-4 h-4 text-emerald-400" />
              Secure Archival Backups ({backupsList.length})
            </h3>

            <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
              {backupsList.length === 0 ? <div className="text-center py-6 text-slate-500 italic text-xs border border-dashed border-slate-800 rounded-xl">
                  No backup points recorded yet.
                </div> : backupsList.map((bk) => <div key={bk.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 hover:border-slate-700/60 transition-all flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white">{bk.label}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span>Period: {bk.month}/{bk.year}</span>
                        <span>•</span>
                        <span>{new Date(bk.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button
    onClick={() => handleRestoreBackup(bk.id)}
    className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 rounded text-[10px] font-bold uppercase transition-all"
  >
                      Restore
                    </button>
                  </div>)}
            </div>
          </div>

        </div>

      </div>

    </div>;
}
