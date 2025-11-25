
import React, { useState, useEffect } from 'react';
import { Equipment, OperatorSession, Task, TaskPriority } from '../types';
import { Power, Coffee, Play, AlertTriangle, CheckCircle, Timer, X, AlertOctagon, ClipboardCheck, Trophy } from 'lucide-react';
import { generateShiftSummary } from '../services/geminiService';
import { WeatherWidget } from './WeatherWidget';

interface Props {
  session: OperatorSession;
  equipment: Equipment;
  onToggleBreak: () => void;
  onLogout: () => void;
  onReportIssue: (issue: string) => void;
  tasks: Task[];
  onCompleteTask: (taskId: string) => void;
}

export const ActiveSession: React.FC<Props> = ({ session, equipment, onToggleBreak, onLogout, onReportIssue, tasks, onCompleteTask }) => {
  const [duration, setDuration] = useState(0);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [showReportIssue, setShowReportIssue] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');
  const [summary, setSummary] = useState<string | null>(null);

  const activeTask = tasks.find(t => t.equipmentId === equipment.id && !t.completed);

  // Simulated Streak Data (In a real app, calculate from history)
  const safetyStreak = 12; 

  useEffect(() => {
    const timer = setInterval(() => {
      setDuration(Math.floor((Date.now() - session.startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [session.startTime]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleLogoutClick = async () => {
    if (!showConfirmLogout) {
      setShowConfirmLogout(true);
      const mins = Math.floor(duration / 60);
      const genSummary = await generateShiftSummary(mins, session.operatorName, equipment.name);
      setSummary(genSummary);
    } else {
      onLogout();
    }
  };

  const handleSubmitIssue = () => {
    if (issueDescription.trim()) {
      onReportIssue(issueDescription);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in relative pb-12">
      
      {/* New Task Notification Overlay */}
      {activeTask && (
        <div className="fixed inset-x-0 top-24 mx-auto w-[90%] max-w-md z-40 animate-slide-up">
          <div className={`p-5 rounded-2xl shadow-2xl border-2 flex flex-col gap-3 ${
            activeTask.priority === TaskPriority.URGENT ? 'bg-red-50 border-red-500' : 
            activeTask.priority === TaskPriority.HIGH ? 'bg-amber-50 border-amber-500' : 
            'bg-blue-50 border-blue-500'
          }`}>
            <div className="flex justify-between items-start">
               <div className="flex items-center gap-2">
                 <ClipboardCheck className={`w-6 h-6 ${
                    activeTask.priority === TaskPriority.URGENT ? 'text-red-600' : 
                    activeTask.priority === TaskPriority.HIGH ? 'text-amber-600' : 
                    'text-blue-600'
                 }`} />
                 <div>
                   <h3 className={`font-bold text-lg ${
                      activeTask.priority === TaskPriority.URGENT ? 'text-red-800' : 
                      activeTask.priority === TaskPriority.HIGH ? 'text-amber-800' : 
                      'text-blue-800'
                   }`}>New Task Assigned</h3>
                   <span className="text-xs font-bold uppercase opacity-75">{activeTask.priority} Priority</span>
                 </div>
               </div>
               <span className="text-xs text-muted-foreground">{new Date(activeTask.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
            </div>
            
            <p className="text-sm font-medium text-foreground/90 bg-white/50 p-3 rounded-lg border border-black/5">
              {activeTask.message}
            </p>

            <button 
              onClick={() => onCompleteTask(activeTask.id)}
              className={`w-full py-3 font-bold rounded-xl shadow-lg text-white transition-transform active:scale-95 ${
                activeTask.priority === TaskPriority.URGENT ? 'bg-red-600 hover:bg-red-700' : 
                activeTask.priority === TaskPriority.HIGH ? 'bg-amber-600 hover:bg-amber-700' : 
                'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Acknowledge & Complete
            </button>
          </div>
        </div>
      )}

      {/* Report Issue Modal Overlay */}
      {showReportIssue && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 rounded-[2rem]">
          <div className="bg-card w-full max-w-sm p-6 rounded-2xl shadow-2xl border border-destructive/20 animate-slide-up">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertOctagon className="w-6 h-6" />
                <h3 className="font-bold text-lg">Report Issue</h3>
              </div>
              <button onClick={() => setShowReportIssue(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Describe the issue below. This will flag the equipment as <span className="font-bold text-destructive">MAINTENANCE</span> and end your session immediately.
            </p>

            <textarea 
              className="w-full p-3 bg-secondary/50 border border-border rounded-xl text-sm min-h-[100px] focus:ring-2 focus:ring-destructive outline-none mb-4"
              placeholder="e.g., Hydraulic leak observed, Brakes failing..."
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
            />

            <button 
              onClick={handleSubmitIssue}
              disabled={!issueDescription.trim()}
              className="w-full py-3 bg-destructive text-destructive-foreground font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-destructive/90 transition-colors"
            >
              Submit Report & Tag Out
            </button>
          </div>
        </div>
      )}

      {/* Weather Header */}
      <div className="mb-6 flex justify-center">
        <WeatherWidget />
      </div>

      <div className="bg-card rounded-[2.5rem] shadow-2xl shadow-primary/10 overflow-hidden border border-border relative">
        
        {/* Status Indicator Bar */}
        <div className={`h-2 w-full ${session.isOnBreak ? 'bg-amber-500' : 'bg-primary'}`}></div>

        {/* Gamification Badge */}
        <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <Trophy className="w-3.5 h-3.5" />
          <span className="text-xs font-bold">{safetyStreak} Day Streak</span>
        </div>

        {/* Main Status Display */}
        <div className="p-8 pb-0 text-center relative">
           <div className={`mx-auto w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl transition-colors duration-500 ${
             session.isOnBreak ? 'bg-amber-100 text-amber-600' : 'bg-primary/10 text-primary'
           }`}>
              {session.isOnBreak ? (
                <Coffee className="w-12 h-12" />
              ) : (
                <Timer className="w-12 h-12 animate-pulse-slow" />
              )}
           </div>

           <h2 className={`text-sm font-bold tracking-widest uppercase mb-2 transition-colors duration-500 ${
             session.isOnBreak ? 'text-amber-600' : 'text-primary'
           }`}>
             {session.isOnBreak ? 'Session Paused' : 'Session Active'}
           </h2>
           
           <div className="font-mono text-7xl font-bold text-foreground tracking-tighter tabular-nums mb-4">
             {formatTime(duration)}
           </div>
           
           <div className="inline-flex items-center justify-center gap-3 text-muted-foreground mb-8 bg-secondary/30 px-4 py-2 rounded-full border border-border">
             <span className="font-bold text-foreground">{equipment.name}</span>
             <span className="w-1 h-1 rounded-full bg-border"></span>
             <span className="font-mono font-bold text-primary">{equipment.id}</span>
           </div>
        </div>

        {/* Info Card */}
        <div className="px-8 mb-8">
          <div className="bg-secondary/50 rounded-2xl p-5 flex items-center justify-between border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground shadow-sm text-lg font-bold">
                {session.operatorName.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Operator</p>
                <div className="flex flex-col">
                  <p className="font-bold text-foreground text-base leading-tight">{session.operatorName}</p>
                  <p className="text-xs text-muted-foreground font-medium">#{session.staffNumber}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Started</p>
              <p className="font-bold text-foreground text-base">{new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-secondary/20 p-8 border-t border-border">
          {showConfirmLogout ? (
             <div className="space-y-6 animate-slide-up">
               <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                 <h3 className="text-primary font-bold mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                   <CheckCircle className="w-4 h-4" /> Shift Summary
                 </h3>
                 <p className="text-foreground/80 font-medium leading-relaxed text-sm">
                   {summary || 'Analyzing shift metrics...'}
                 </p>
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <button
                  onClick={() => setShowConfirmLogout(false)}
                  className="w-full py-3.5 text-muted-foreground hover:bg-background hover:shadow-sm font-bold rounded-xl border border-transparent hover:border-border transition-all text-sm"
                >
                  Resume
                </button>
                <button
                  onClick={() => onLogout()}
                  className="w-full py-3.5 bg-foreground hover:bg-foreground/90 text-background font-bold rounded-xl shadow-lg shadow-foreground/10 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Power className="w-4 h-4" />
                  End Shift
                </button>
               </div>
             </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={onToggleBreak}
                className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all duration-200 transform active:scale-[0.98] ${
                  session.isOnBreak
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 border-transparent'
                    : 'bg-card border-border text-foreground hover:bg-secondary hover:border-border'
                }`}
              >
                {session.isOnBreak ? (
                  <>
                    <Play className="w-4 h-4" /> Resume Operations
                  </>
                ) : (
                  <>
                    <Coffee className="w-4 h-4" /> Start Break
                  </>
                )}
              </button>

              <button
                onClick={handleLogoutClick}
                className="w-full py-4 bg-foreground hover:bg-foreground/90 text-background font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-foreground/10 transition-all transform active:scale-[0.98]"
              >
                <Power className="w-4 h-4" />
                End Shift
              </button>
              
              <div className="pt-2 text-center">
                <button 
                  onClick={() => setShowReportIssue(true)}
                  className="text-muted-foreground hover:text-destructive text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 mx-auto transition-colors px-4 py-2 rounded-lg hover:bg-destructive/5"
                >
                   <AlertTriangle className="w-3 h-3" /> Report Issue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
