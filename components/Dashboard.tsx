
import React, { useState, useMemo, useRef } from 'react';
import { Equipment, EquipmentStatus, InspectionRecord, Task, TaskPriority, Bulletin } from '../types';
import { Filter, FileSpreadsheet, RefreshCw, Wrench, CheckCircle2, AlertOctagon, HeartPulse, Clock, User, History, XCircle, X, CreditCard, MapPin, Coffee, LogOut, Calendar, ClipboardList, Send, Megaphone, Trash2, Plus } from 'lucide-react';
import { WeatherWidget } from './WeatherWidget';

interface DashboardProps {
  fleet: Equipment[];
  inspectionHistory: InspectionRecord[];
  onSelectEquipment: (eq: Equipment) => void;
  onUpdateFleet: (newFleet: Equipment[]) => void;
  onResolveIssue: (equipmentId: string) => void;
  onAssignTask: (task: Task) => void;
  tasks: Task[];
  bulletins: Bulletin[];
  onAddBulletin: (bulletin: Bulletin) => void;
  onDeleteBulletin: (id: string) => void;
}

// Interactive Bar component
const Bar: React.FC<{ 
  label: string; 
  value: number; 
  max: number; 
  color: string;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ label, value, max, color, onClick, isActive }) => {
  const height = max > 0 ? (value / max) * 100 : 0;
  return (
    <div 
      className={`flex flex-col items-center justify-end h-full w-full group cursor-pointer transition-all ${isActive ? 'opacity-100 scale-105' : 'opacity-70 hover:opacity-90'}`}
      onClick={onClick}
    >
       <div className={`relative w-full flex items-end justify-center h-48 bg-secondary/20 rounded-t-xl overflow-hidden ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
         <div 
            className={`w-2/3 rounded-t-lg transition-all duration-700 ease-out ${color} relative shadow-lg`}
            style={{ height: `${height}%` }}
         >
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-sm font-bold text-foreground transition-opacity bg-background/50 px-2 py-0.5 rounded-md backdrop-blur-sm shadow-sm">
              {value}
            </span>
         </div>
       </div>
       <p className={`text-[10px] font-bold text-center mt-3 uppercase tracking-tight leading-tight px-1 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
         {label}
       </p>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ fleet, inspectionHistory, onSelectEquipment, onUpdateFleet, onResolveIssue, onAssignTask, tasks, bulletins, onAddBulletin, onDeleteBulletin }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL'); // 'Battery', 'Diesel', 'SPM'
  const [isImporting, setIsImporting] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<InspectionRecord | null>(null);
  const [selectedOperatorDetails, setSelectedOperatorDetails] = useState<Equipment | null>(null);
  
  // Task Assignment State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskEquipmentId, setTaskEquipmentId] = useState('');
  const [taskMessage, setTaskMessage] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>(TaskPriority.NORMAL);
  const [foundOperator, setFoundOperator] = useState<Equipment | null>(null);

  // Bulletin State
  const [showBulletinModal, setShowBulletinModal] = useState(false);
  const [bulletinTitle, setBulletinTitle] = useState('');
  const [bulletinMessage, setBulletinMessage] = useState('');
  const [bulletinPriority, setBulletinPriority] = useState<'info' | 'critical'>('info');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    return {
      battery: fleet.filter(e => e.name.includes('Battery')).length,
      diesel: fleet.filter(e => e.name.includes('Diesel')).length,
      spm: fleet.filter(e => e.name.includes('SPM')).length,
      
      // Real data derived from fleet status
      actionInform: fleet.filter(e => e.status === EquipmentStatus.MAINTENANCE).length,
      actionMaint: fleet.filter(e => e.status === EquipmentStatus.MAINTENANCE).length, 
      actionNA: fleet.filter(e => e.status === EquipmentStatus.AVAILABLE || e.status === EquipmentStatus.IN_USE || e.status === EquipmentStatus.ON_BREAK).length,
      
      total: fleet.length,
      operational: fleet.filter(e => e.status !== EquipmentStatus.MAINTENANCE).length
    };
  }, [fleet]);

  const filteredFleet = useMemo(() => {
    return fleet.filter(eq => {
      // Filter by Status
      let matchesStatus = true;
      if (filterStatus === 'ALL') {
        matchesStatus = true;
      } else if (filterStatus === 'OPERATIONAL') {
        matchesStatus = eq.status !== EquipmentStatus.MAINTENANCE;
      } else {
        matchesStatus = eq.status === filterStatus;
      }

      // Filter by Type
      let matchesType = true;
      if (filterType !== 'ALL') {
        matchesType = eq.name.includes(filterType) || eq.model.includes(filterType);
      }

      return matchesStatus && matchesType;
    });
  }, [fleet, filterStatus, filterType]);

  const recentIssues = useMemo(() => {
    return [...inspectionHistory]
      .filter(record => record.issuesFound)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 6);
  }, [inspectionHistory]);

  const operatorStatuses = useMemo(() => {
    return fleet
      .filter(eq => eq.lastOperator)
      .sort((a, b) => {
        const scoreA = a.status === EquipmentStatus.IN_USE ? 3 : a.status === EquipmentStatus.ON_BREAK ? 2 : 1;
        const scoreB = b.status === EquipmentStatus.IN_USE ? 3 : b.status === EquipmentStatus.ON_BREAK ? 2 : 1;
        return scoreB - scoreA;
      });
  }, [fleet]);

  const maxCount = Math.max(stats.battery, stats.diesel, stats.spm) || 1;
  const maxAction = Math.max(stats.actionInform, stats.actionNA) || 1;
  const healthPercentage = Math.round((stats.operational / stats.total) * 100) || 0;

  const handleTypeClick = (type: string) => {
    setFilterType(prev => prev === type ? 'ALL' : type);
  };

  const handleActionClick = (status: string) => {
    setFilterStatus(prev => prev === status ? 'ALL' : status);
  };

  const clearFilters = () => {
    setFilterStatus('ALL');
    setFilterType('ALL');
  };

  const handleEquipmentSearch = (id: string) => {
    setTaskEquipmentId(id);
    const eq = fleet.find(e => e.id.toLowerCase() === id.toLowerCase());
    if (eq && (eq.status === EquipmentStatus.IN_USE || eq.status === EquipmentStatus.ON_BREAK)) {
      setFoundOperator(eq);
    } else {
      setFoundOperator(null);
    }
  };

  const submitTask = () => {
    if (!taskEquipmentId || !taskMessage) return;
    const task: Task = {
      id: Date.now().toString(),
      equipmentId: taskEquipmentId.toUpperCase(),
      message: taskMessage,
      priority: taskPriority,
      assignedBy: 'Admin',
      timestamp: Date.now(),
      completed: false
    };
    onAssignTask(task);
    setShowTaskModal(false);
    setTaskMessage('');
    setTaskEquipmentId('');
    setFoundOperator(null);
    setTaskPriority(TaskPriority.NORMAL);
  };

  const submitBulletin = () => {
    if (!bulletinTitle || !bulletinMessage) return;
    const bulletin: Bulletin = {
      id: Date.now().toString(),
      title: bulletinTitle,
      message: bulletinMessage,
      priority: bulletinPriority,
      timestamp: Date.now(),
      author: 'Operations Admin'
    };
    onAddBulletin(bulletin);
    setShowBulletinModal(false);
    setBulletinTitle('');
    setBulletinMessage('');
    setBulletinPriority('info');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = window.XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = window.XLSX.utils.sheet_to_json(ws);

        const newFleet: Equipment[] = data.map((row: any) => ({
            id: row['Asset'] || row['ID'] || `UNK-${Math.random().toString(36).substr(2,5)}`,
            name: row['Equipment'] || 'Unknown Equipment',
            model: row['Description'] || row['Model'] || 'Unknown Model',
            status: fleet.find(f => f.id === row['Asset'])?.status || EquipmentStatus.AVAILABLE,
            batteryLevel: fleet.find(f => f.id === row['Asset'])?.batteryLevel || 100,
            lastOperator: fleet.find(f => f.id === row['Asset'])?.lastOperator,
            lastOperatorStaffNumber: fleet.find(f => f.id === row['Asset'])?.lastOperatorStaffNumber,
            lastOperatorArea: fleet.find(f => f.id === row['Asset'])?.lastOperatorArea,
            currentIssue: fleet.find(f => f.id === row['Asset'])?.currentIssue
        }));

        if (newFleet.length > 0) {
            onUpdateFleet(newFleet);
            alert(`Successfully imported ${newFleet.length} assets from Excel.`);
        } else {
            alert("No valid data found in Excel.");
        }
      } catch (error) {
        console.error("Error parsing Excel:", error);
        alert("Failed to parse Excel file.");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsBinaryString(file);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0h 0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const formatStartTime = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-slide-up pb-12 relative">

      {/* Bulletin Modal */}
      {showBulletinModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border animate-slide-up overflow-hidden">
             <div className="bg-secondary/50 p-6 flex justify-between items-center border-b border-border">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Megaphone className="w-5 h-5" /> Post Announcement
                </h3>
                <button onClick={() => setShowBulletinModal(false)} className="p-1 hover:bg-secondary rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
             </div>
             <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Title</label>
                  <input 
                    className="w-full p-3 bg-secondary/30 border border-border rounded-xl font-medium outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., High Wind Alert"
                    value={bulletinTitle}
                    onChange={(e) => setBulletinTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Message</label>
                  <textarea 
                    className="w-full p-3 bg-secondary/30 border border-border rounded-xl font-medium outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                    placeholder="Details of the announcement..."
                    value={bulletinMessage}
                    onChange={(e) => setBulletinMessage(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Priority</label>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setBulletinPriority('info')}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${bulletinPriority === 'info' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-transparent border-border text-muted-foreground'}`}
                    >
                      Info
                    </button>
                    <button 
                      onClick={() => setBulletinPriority('critical')}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${bulletinPriority === 'critical' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-transparent border-border text-muted-foreground'}`}
                    >
                      Critical
                    </button>
                  </div>
                </div>
                <button 
                  onClick={submitBulletin}
                  disabled={!bulletinTitle || !bulletinMessage}
                  className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 mt-2"
                >
                  Post Bulletin
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Task Modal (Existing) */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border animate-slide-up overflow-hidden">
              <div className="bg-primary text-primary-foreground p-6 flex justify-between items-center">
                 <h3 className="text-lg font-bold flex items-center gap-2">
                   <ClipboardList className="w-5 h-5" /> Assign Task
                 </h3>
                 <button onClick={() => setShowTaskModal(false)} className="p-1 hover:bg-primary/20 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-6 space-y-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Equipment Number</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-secondary/50 border border-border rounded-xl uppercase font-bold text-foreground focus:ring-2 focus:ring-primary outline-none"
                      placeholder="e.g., FKL101"
                      value={taskEquipmentId}
                      onChange={(e) => handleEquipmentSearch(e.target.value)}
                    />
                 </div>

                 {foundOperator ? (
                   <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase">Operator Found</span>
                         <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="text-sm">
                        <p className="font-bold text-emerald-900 dark:text-emerald-300">{foundOperator.lastOperator}</p>
                        <p className="text-emerald-700 dark:text-emerald-500 text-xs">#{foundOperator.lastOperatorStaffNumber} • {foundOperator.lastOperatorArea}</p>
                      </div>
                   </div>
                 ) : taskEquipmentId.length > 3 ? (
                   <div className="p-3 bg-secondary/50 border border-border rounded-xl">
                      <p className="text-xs text-muted-foreground italic">No active operator found for this ID. Task will be queued.</p>
                   </div>
                 ) : null}

                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Priority</label>
                    <div className="flex gap-2">
                       {[TaskPriority.NORMAL, TaskPriority.HIGH, TaskPriority.URGENT].map(p => (
                         <button 
                           key={p}
                           onClick={() => setTaskPriority(p)}
                           className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase border transition-all ${
                             taskPriority === p 
                               ? p === TaskPriority.URGENT ? 'bg-red-100 border-red-500 text-red-700' : 
                                 p === TaskPriority.HIGH ? 'bg-amber-100 border-amber-500 text-amber-700' :
                                 'bg-blue-100 border-blue-500 text-blue-700'
                               : 'bg-transparent border-border text-muted-foreground'
                           }`}
                         >
                           {p}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Task Description</label>
                    <textarea 
                       className="w-full p-3 bg-secondary/50 border border-border rounded-xl text-sm min-h-[100px] focus:ring-2 focus:ring-primary outline-none"
                       placeholder="Describe the task..."
                       value={taskMessage}
                       onChange={(e) => setTaskMessage(e.target.value)}
                    />
                 </div>

                 <button 
                   onClick={submitTask}
                   disabled={!taskEquipmentId || !taskMessage}
                   className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                 >
                   <Send className="w-4 h-4" /> Assign Task
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Details Modals (Existing) */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border animate-slide-up overflow-hidden">
              <div className="bg-secondary/50 p-6 border-b border-border flex justify-between items-start">
                 <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                       {selectedActivity.forkliftNumber}
                       {selectedActivity.issuesFound ? (
                         <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] uppercase font-bold">Issue Reported</span>
                       ) : (
                         <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 text-[10px] uppercase font-bold">Safe</span>
                       )}
                    </h3>
                    <p className="text-muted-foreground text-xs mt-1">{selectedActivity.date}</p>
                 </div>
                 <button onClick={() => setSelectedActivity(null)} className="p-1 hover:bg-background rounded-full transition-colors">
                    <X className="w-5 h-5 text-muted-foreground" />
                 </button>
              </div>
              <div className="p-6 space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Operator</label>
                    <div className="flex items-center gap-2">
                       <User className="w-4 h-4 text-primary" />
                       <span className="font-bold text-foreground">{selectedActivity.name}</span>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Staff ID</label>
                    <div className="flex items-center gap-2">
                       <CreditCard className="w-4 h-4 text-primary" />
                       <span className="font-medium text-foreground">{selectedActivity.staffNumber || 'N/A'}</span>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Area of Work</label>
                    <div className="flex items-center gap-2">
                       <MapPin className="w-4 h-4 text-primary" />
                       <span className="font-medium text-foreground">{selectedActivity.areaOfWork || 'General Operations'}</span>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Issue</label>
                    <p className="text-sm font-medium text-destructive bg-destructive/5 p-2 rounded">
                         {selectedActivity.actionTaken}
                    </p>
                 </div>
              </div>
              <div className="bg-secondary/30 p-4 border-t border-border">
                 <button onClick={() => setSelectedActivity(null)} className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-lg text-sm">
                    Close Details
                 </button>
              </div>
           </div>
        </div>
      )}

      {selectedOperatorDetails && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border animate-slide-up overflow-hidden">
              <div className="bg-secondary/50 p-6 border-b border-border flex justify-between items-start">
                 <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                       {selectedOperatorDetails.lastOperator}
                    </h3>
                    <p className="text-muted-foreground text-xs mt-1">
                      {selectedOperatorDetails.status === EquipmentStatus.IN_USE ? 'Currently Active' : 
                       selectedOperatorDetails.status === EquipmentStatus.ON_BREAK ? 'Currently On Break' : 
                       'Logged Out / Shift Ended'}
                    </p>
                 </div>
                 <button onClick={() => setSelectedOperatorDetails(null)} className="p-1 hover:bg-background rounded-full transition-colors">
                    <X className="w-5 h-5 text-muted-foreground" />
                 </button>
              </div>
              <div className="p-6 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Staff ID</label>
                      <div className="flex items-center gap-2">
                         <CreditCard className="w-4 h-4 text-primary" />
                         <span className="font-medium text-foreground">{selectedOperatorDetails.lastOperatorStaffNumber || 'N/A'}</span>
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Equipment</label>
                      <div className="flex items-center gap-2">
                         <span className="font-mono font-bold text-foreground bg-secondary px-1.5 py-0.5 rounded text-xs">
                           {selectedOperatorDetails.id}
                         </span>
                      </div>
                   </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Area of Work</label>
                    <div className="flex items-center gap-2">
                       <MapPin className="w-4 h-4 text-primary" />
                       <span className="font-medium text-foreground">{selectedOperatorDetails.lastOperatorArea || 'Unknown'}</span>
                    </div>
                 </div>

                 <div className="p-3 bg-secondary/20 rounded-xl space-y-3">
                   <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Start Time
                      </label>
                      <span className="text-sm font-bold">{formatStartTime(selectedOperatorDetails.lastSessionStartTime)}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <History className="w-3 h-3" /> Duration
                      </label>
                      <span className="text-sm font-bold">
                        {selectedOperatorDetails.status === EquipmentStatus.AVAILABLE 
                          ? formatDuration(selectedOperatorDetails.lastSessionDuration) 
                          : 'In Progress'}
                      </span>
                   </div>
                   <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Coffee className="w-3 h-3" /> Current State
                      </label>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        selectedOperatorDetails.status === EquipmentStatus.IN_USE ? 'bg-emerald-100 text-emerald-700' :
                        selectedOperatorDetails.status === EquipmentStatus.ON_BREAK ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                         {selectedOperatorDetails.status.replace('_', ' ')}
                      </span>
                   </div>
                 </div>
              </div>
              <div className="bg-secondary/30 p-4 border-t border-border">
                 <button onClick={() => setSelectedOperatorDetails(null)} className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-lg text-sm">
                    Close Profile
                 </button>
              </div>
           </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Equipment Dashboard</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-muted-foreground text-sm">Real-time fleet intelligence.</p>
            <div className="px-3 py-1 bg-secondary rounded-full flex items-center gap-2">
               <HeartPulse className={`w-4 h-4 ${healthPercentage > 90 ? 'text-emerald-500' : 'text-amber-500'}`} />
               <span className="text-xs font-bold text-foreground">Fleet Health: {healthPercentage}%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <WeatherWidget />
           
           <div className="flex flex-col items-end gap-2">
             <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold rounded-lg transition-colors shadow-sm shadow-primary/20"
                >
                  <ClipboardList className="w-4 h-4" /> Assign Task
                </button>
                <button
                  onClick={() => setShowBulletinModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground hover:bg-secondary/80 text-sm font-bold rounded-lg transition-colors border border-border"
                >
                  <Megaphone className="w-4 h-4" /> Post Bulletin
                </button>
             </div>
             
             <div className="flex items-center gap-2">
               <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <select 
                    className="pl-8 pr-4 py-1.5 bg-card border border-border rounded-lg text-xs font-medium text-foreground focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value={EquipmentStatus.AVAILABLE}>Available</option>
                    <option value={EquipmentStatus.IN_USE}>In Use</option>
                    <option value={EquipmentStatus.MAINTENANCE}>Maintenance</option>
                    <option value="OPERATIONAL">Ready / Operational</option>
                  </select>
               </div>
               
               <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                  disabled={isImporting}
               >
                  {isImporting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <FileSpreadsheet className="w-3 h-3" />}
                  {isImporting ? 'Syncing...' : 'Sync Data'}
               </button>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept=".xlsx, .xls" 
                 onChange={handleFileUpload}
               />
             </div>
           </div>
        </div>
      </div>

      {/* Bulletins Section */}
      {bulletins.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" /> Active Safety Bulletins
              </h3>
              <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">{bulletins.length} Active</span>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bulletins.map(b => (
                <div key={b.id} className="p-4 rounded-xl border bg-secondary/10 flex justify-between items-start group hover:border-primary/50 transition-colors">
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                         {b.priority === 'critical' && <AlertOctagon className="w-4 h-4 text-red-500" />}
                         <h4 className="font-bold text-sm text-foreground">{b.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{b.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-2 opacity-60">{new Date(b.timestamp).toLocaleDateString()} • {b.author}</p>
                   </div>
                   <button 
                     onClick={() => onDeleteBulletin(b.id)}
                     className="p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Top Section: Charts & List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">
        
        {/* Chart 1: Count by Equipment */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
           <div className="flex justify-between items-start mb-6">
             <h3 className="text-lg font-bold text-primary">Count of ID by Equipment</h3>
             {filterType !== 'ALL' && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">{filterType}</span>}
           </div>
           <div className="flex-1 flex items-end gap-4 px-2">
              <Bar 
                label="Battery Forklift" 
                value={stats.battery} 
                max={maxCount} 
                color="bg-blue-500" 
                onClick={() => handleTypeClick('Battery')}
                isActive={filterType === 'Battery'}
              />
              <Bar 
                label="Diesel Forklift" 
                value={stats.diesel} 
                max={maxCount} 
                color="bg-blue-300" 
                onClick={() => handleTypeClick('Diesel')}
                isActive={filterType === 'Diesel'}
              />
              <Bar 
                label="SPM" 
                value={stats.spm} 
                max={maxCount} 
                color="bg-blue-200" 
                onClick={() => handleTypeClick('SPM')}
                isActive={filterType === 'SPM'}
              />
           </div>
        </div>

        {/* List: Asset List */}
        <div className="bg-card border border-border rounded-2xl shadow-sm flex flex-col overflow-hidden col-span-1 lg:col-span-1">
          <div className="p-4 bg-secondary/30 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-bold text-primary">Asset Status List</h3>
            <span className="text-xs font-medium text-muted-foreground">{filteredFleet.length} items</span>
          </div>
          <div className="overflow-auto flex-1 p-0">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-muted-foreground uppercase bg-secondary/50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">Asset</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Model</th>
                  <th className="px-4 py-3 text-center">Batt.</th>
                  <th className="px-4 py-3">Last Op.</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFleet.length > 0 ? (
                  filteredFleet.map((eq, i) => (
                    <tr key={eq.id} className="hover:bg-secondary/20 transition-colors group">
                      <td className="px-4 py-3 font-bold text-foreground whitespace-nowrap">
                        {eq.id}
                        {eq.status === EquipmentStatus.MAINTENANCE && (
                          <div className="text-[10px] text-destructive font-normal truncate max-w-[100px]" title={eq.currentIssue}>
                            {eq.currentIssue || 'Issue Reported'}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs truncate max-w-[120px] hidden sm:table-cell" title={eq.model}>{eq.model}</td>
                      <td className="px-4 py-3 text-center">
                        <div className={`inline-flex items-center px-1.5 py-0.5 rounded font-mono text-xs font-bold ${
                          eq.batteryLevel < 20 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {eq.batteryLevel}%
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {eq.lastOperator ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                              {eq.lastOperator.charAt(0)}
                            </div>
                            <span className="truncate max-w-[80px]">{eq.lastOperator}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {eq.status === EquipmentStatus.MAINTENANCE ? (
                          <button 
                            onClick={() => onResolveIssue(eq.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded hover:bg-destructive/90 transition-colors shadow-sm"
                          >
                            <Wrench className="w-3 h-3" /> Fix
                          </button>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            eq.status === EquipmentStatus.AVAILABLE ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            eq.status === EquipmentStatus.IN_USE ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            eq.status === EquipmentStatus.ON_BREAK ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                            {eq.status.replace('_', ' ')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">
                      No assets match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart 2: Action to Take (Real Data) */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
           <div className="flex justify-between items-start mb-6">
             <h3 className="text-lg font-bold text-primary">Action to take?</h3>
             {filterStatus !== 'ALL' && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">{filterStatus}</span>}
           </div>
           <div className="flex-1 flex items-end gap-4 px-2">
              <Bar 
                label="Inform RA & Super..." 
                value={stats.actionInform} 
                max={maxAction} 
                color="bg-blue-600" 
                onClick={() => handleActionClick(EquipmentStatus.MAINTENANCE)}
                isActive={filterStatus === EquipmentStatus.MAINTENANCE}
              />
              <Bar 
                label="Need Maint..." 
                value={stats.actionMaint} 
                max={maxAction} 
                color="bg-orange-500" 
                onClick={() => handleActionClick(EquipmentStatus.MAINTENANCE)}
                isActive={filterStatus === EquipmentStatus.MAINTENANCE}
              />
              <Bar 
                label="Ready / NA" 
                value={stats.actionNA} 
                max={maxAction} 
                color="bg-blue-400" 
                onClick={() => handleActionClick('OPERATIONAL')}
                isActive={filterStatus === 'OPERATIONAL'}
              />
           </div>
        </div>
      </div>

      {/* Section: Forklift Issues Reported */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-destructive" />
          <h3 className="text-lg font-bold text-foreground">Forklift issues were reported by</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {recentIssues.map((record) => (
             <div 
                key={record.id} 
                onClick={() => setSelectedActivity(record)}
                className={`p-4 rounded-xl border flex flex-col justify-between h-28 shadow-sm transition-all hover:scale-105 cursor-pointer hover:shadow-md bg-destructive/5 border-destructive/20 hover:border-destructive`}
             >
                <div className="flex justify-between items-start">
                   <span className="font-bold text-sm text-foreground">{record.forkliftNumber}</span>
                   <AlertOctagon className="w-4 h-4 text-destructive" />
                </div>
                <div>
                   <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <User className="w-3 h-3" />
                      <span className="truncate">{record.name}</span>
                   </div>
                   <div className="text-[10px] text-destructive font-bold truncate">
                      {record.actionTaken}
                   </div>
                </div>
             </div>
          ))}
          {recentIssues.length === 0 && (
            <div className="col-span-full p-4 text-center text-sm text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border">
              No reported issues today. All systems operational.
            </div>
          )}
        </div>
      </div>

      {/* New Section: Active Operators */}
      <div className="space-y-4 pt-6">
         <div className="flex items-center gap-2">
           <User className="w-5 h-5 text-primary" />
           <h3 className="text-lg font-bold text-foreground">Operator Status</h3>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
           {operatorStatuses.map((op) => (
              <div 
                key={op.id}
                onClick={() => setSelectedOperatorDetails(op)}
                className={`p-4 rounded-xl border shadow-sm flex items-start justify-between cursor-pointer hover:shadow-md transition-all active:scale-[0.98] ${
                   op.status === EquipmentStatus.IN_USE ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900' :
                   op.status === EquipmentStatus.ON_BREAK ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900' :
                   'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                }`}
              >
                 <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-sm text-foreground">{op.lastOperator}</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{op.lastOperatorStaffNumber || 'N/A'}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-70">
                       {op.lastOperatorArea || 'Unknown Area'}
                    </div>
                 </div>
                 <div className="text-right space-y-1">
                    <div className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${
                        op.status === EquipmentStatus.IN_USE ? 'bg-emerald-100 text-emerald-700' :
                        op.status === EquipmentStatus.ON_BREAK ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                       {op.id}
                    </div>
                    <div className={`text-[10px] font-bold ${
                        op.status === EquipmentStatus.IN_USE ? 'text-emerald-600' :
                        op.status === EquipmentStatus.ON_BREAK ? 'text-amber-600' :
                        'text-red-500'
                    }`}>
                       {op.status === EquipmentStatus.IN_USE ? 'Active' : 
                        op.status === EquipmentStatus.ON_BREAK ? 'On Break' : 
                        'Logged Out'}
                    </div>
                 </div>
              </div>
           ))}
           
           {operatorStatuses.length === 0 && (
              <div className="col-span-full p-6 text-center text-sm text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border">
                 No operator activity recorded yet.
              </div>
           )}
         </div>
      </div>

      {/* Bottom Section: Inspection Log Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
         <div className="p-6 border-b border-border bg-secondary/10">
            <h3 className="text-xl font-bold text-primary">Inspection Logs</h3>
            <p className="text-xs text-muted-foreground mt-1">Historical record of pre-shift safety checklists and findings.</p>
         </div>
         <div className="overflow-x-auto">
           <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-indigo-950 text-white text-xs uppercase tracking-wider">
                   <th className="p-3 border border-indigo-900">Forklift Number</th>
                   <th className="p-3 border border-indigo-900">Name</th>
                   <th className="p-3 border border-indigo-900">Staff #</th>
                   <th className="p-3 border border-indigo-900">Area</th>
                   <th className="p-3 border border-indigo-900">Date</th>
                   <th className="p-3 border border-indigo-900 w-24">Issues?</th>
                   <th className="p-3 border border-indigo-900">Action Taken</th>
                </tr>
              </thead>
              <tbody>
                 {inspectionHistory.map((record) => (
                   <tr key={record.id} className={`${record.issuesFound ? 'bg-yellow-100/50 dark:bg-yellow-900/20' : 'bg-white dark:bg-card'} hover:bg-secondary/20 transition-colors`}>
                      <td className={`p-3 border border-border font-bold ${record.issuesFound ? 'bg-yellow-300/50 dark:bg-yellow-800/50' : ''}`}>{record.forkliftNumber}</td>
                      <td className={`p-3 border border-border ${record.issuesFound ? 'bg-yellow-300/50 dark:bg-yellow-800/50' : ''}`}>{record.name}</td>
                      <td className={`p-3 border border-border ${record.issuesFound ? 'bg-yellow-300/50 dark:bg-yellow-800/50' : ''}`}>{record.staffNumber || '-'}</td>
                      <td className={`p-3 border border-border ${record.issuesFound ? 'bg-yellow-300/50 dark:bg-yellow-800/50' : ''}`}>{record.areaOfWork || '-'}</td>
                      <td className={`p-3 border border-border ${record.issuesFound ? 'bg-yellow-300/50 dark:bg-yellow-800/50' : ''}`}>{record.date}</td>
                      <td className={`p-3 border border-border font-bold ${record.issuesFound ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {record.issuesFound ? 'Yes' : 'No'}
                      </td>
                      <td className="p-3 border border-border font-medium text-muted-foreground">
                        {record.actionTaken}
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
         </div>
      </div>

    </div>
  );
};
