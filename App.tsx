
import React, { useState, useEffect } from 'react';
import { INITIAL_FLEET, MOCK_INSPECTION_HISTORY } from './constants';
import { Equipment, EquipmentStatus, OperatorSession, ChecklistEntry, InspectionRecord, Task, Bulletin } from './types';
import { Dashboard } from './components/Dashboard';
import { LoginScreen } from './components/LoginScreen';
import { PreShiftChecklist } from './components/PreShiftChecklist';
import { ActiveSession } from './components/ActiveSession';
import { Box, LogOut, ArrowLeft, Sun, Moon } from 'lucide-react';

const App: React.FC = () => {
  const [fleet, setFleet] = useState<Equipment[]>(INITIAL_FLEET);
  // Default view is now login
  const [view, setView] = useState<'dashboard' | 'login' | 'checklist' | 'active'>('login');
  
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [currentOperator, setCurrentOperator] = useState<string>('');
  const [currentStaffNumber, setCurrentStaffNumber] = useState<string>('');
  const [currentAreaOfWork, setCurrentAreaOfWork] = useState<string>('');
  const [session, setSession] = useState<OperatorSession | null>(null);

  // State for daily checklist compliance
  const [checklistHistory, setChecklistHistory] = useState<ChecklistEntry[]>([]);
  // State for dynamic admin inspection logs
  const [inspectionHistory, setInspectionHistory] = useState<InspectionRecord[]>(MOCK_INSPECTION_HISTORY);
  // State for tasks assigned by admin
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Design Features
  const [darkMode, setDarkMode] = useState(false);
  const [bulletins, setBulletins] = useState<Bulletin[]>([
     { id: '1', title: 'High Wind Alert', message: 'Gusts up to 45km/h expected on Ramp Area. Secure all loose equipment.', priority: 'critical', timestamp: Date.now(), author: 'Safety Ops' }
  ]);

  // Load persistence
  useEffect(() => {
    const savedSession = localStorage.getItem('dnata_session');
    const savedHistory = localStorage.getItem('dnata_checklist_history');
    const savedTasks = localStorage.getItem('dnata_tasks');
    const savedTheme = localStorage.getItem('dnata_theme');
    
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    if (savedHistory) {
      setChecklistHistory(JSON.parse(savedHistory));
    }

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    if (savedSession) {
      const parsedSession = JSON.parse(savedSession);
      const eqId = parsedSession.equipmentId;

      // We need to update the fleet status because INITIAL_FLEET is static
      setFleet(prev => prev.map(eq => 
        eq.id === eqId 
          ? { 
              ...eq, 
              status: parsedSession.isOnBreak ? EquipmentStatus.ON_BREAK : EquipmentStatus.IN_USE, 
              lastOperator: parsedSession.operatorName,
              lastOperatorStaffNumber: parsedSession.staffNumber,
              lastOperatorArea: parsedSession.areaOfWork,
              lastSessionStartTime: parsedSession.startTime // Sync start time from session
            } 
          : eq
      ));

      const eq = fleet.find(e => e.id === eqId) || INITIAL_FLEET.find(e => e.id === eqId);
      
      if (eq) {
        setSession(parsedSession);
        setSelectedEquipment(eq);
        setCurrentOperator(parsedSession.operatorName);
        setCurrentStaffNumber(parsedSession.staffNumber);
        setCurrentAreaOfWork(parsedSession.areaOfWork || '');
        
        // If checklist wasn't completed, go back to checklist
        if (parsedSession.checklistCompleted) {
          setView('active');
        } else {
          setView('checklist');
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme Toggle
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('dnata_theme', newMode ? 'dark' : 'light');
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Update Local Storage when session changes
  useEffect(() => {
    if (session) {
      localStorage.setItem('dnata_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('dnata_session');
    }
  }, [session]);

  // Update Checklist History Storage
  useEffect(() => {
    localStorage.setItem('dnata_checklist_history', JSON.stringify(checklistHistory));
  }, [checklistHistory]);

  // Update Tasks Storage
  useEffect(() => {
    localStorage.setItem('dnata_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleSelectEquipmentFromDashboard = (eq: Equipment) => {
    console.log("Selected from dashboard", eq);
  };

  const handleUpdateFleet = (newFleet: Equipment[]) => {
    setFleet(newFleet);
  };

  const handleAssignTask = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
  };

  const handleAddBulletin = (bulletin: Bulletin) => {
    setBulletins(prev => [bulletin, ...prev]);
  };

  const handleDeleteBulletin = (id: string) => {
    setBulletins(prev => prev.filter(b => b.id !== id));
  };

  // Modified: Locks equipment immediately upon "Book" action
  const handleLogin = (forkliftId: string, name: string, staffNumber: string, areaOfWork: string) => {
    const eq = fleet.find(e => e.id === forkliftId);
    if (eq) {
      const startTime = Date.now();
      // 1. Update status to IN_USE immediately
      setFleet(prev => prev.map(e => 
        e.id === forkliftId 
          ? { 
              ...e, 
              status: EquipmentStatus.IN_USE, 
              lastOperator: name,
              lastOperatorStaffNumber: staffNumber,
              lastOperatorArea: areaOfWork,
              lastSessionStartTime: startTime, // Track start time in fleet
              lastSessionDuration: undefined // Reset duration on new login
            } 
          : e
      ));

      // 2. Initialize session (checklist NOT completed yet)
      const newSession: OperatorSession = {
        operatorName: name,
        staffNumber: staffNumber,
        equipmentId: forkliftId,
        areaOfWork: areaOfWork,
        startTime: startTime,
        isOnBreak: false,
        checklistCompleted: false
      };

      setSession(newSession); // This triggers localStorage update
      setSelectedEquipment(eq);
      setCurrentOperator(name);
      setCurrentStaffNumber(staffNumber);
      setCurrentAreaOfWork(areaOfWork);
      
      // 3. Check if checklist already done today for this operator + equipment
      const today = new Date().toISOString().split('T')[0];
      const hasDoneChecklist = checklistHistory.some(
        entry => entry.date === today && entry.equipmentId === forkliftId && entry.staffNumber === staffNumber
      );

      if (hasDoneChecklist) {
         // Skip checklist, mark session as complete immediately
         const completedSession = { ...newSession, checklistCompleted: true };
         setSession(completedSession);
         setView('active');
      } else {
         // Force checklist
         setView('checklist');
      }
    }
  };

  const handleAdminLogin = () => {
    setView('dashboard');
  };

  const handleChecklistComplete = (passed: boolean) => {
    if (!selectedEquipment || !session) return;

    // Create a record for the dashboard history
    const newRecord: InspectionRecord = {
      id: Date.now().toString(),
      forkliftNumber: selectedEquipment.id,
      name: currentOperator,
      staffNumber: currentStaffNumber,
      areaOfWork: currentAreaOfWork,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now(),
      // Since specific items are in external form, we set these based on the overall result
      externalCondition: passed ? 'Yes' : 'Check',
      fireExtinguisher: passed ? 'Yes' : 'Check',
      batterySecured: passed ? 'Yes' : 'Check',
      brakes: passed ? 'Yes' : 'Check',
      horn: passed ? 'Yes' : 'Check',
      steering: passed ? 'Yes' : 'Check',
      issuesFound: !passed,
      actionTaken: passed ? 'NA' : 'Checklist Failed - Needs Review'
    };
    
    // Update Inspection History for Admin Dashboard
    setInspectionHistory(prev => [newRecord, ...prev]);

    if (passed) {
      // Save completion to history so they don't have to do it again today
      const today = new Date().toISOString().split('T')[0];
      setChecklistHistory(prev => [
        ...prev, 
        { date: today, equipmentId: selectedEquipment.id, staffNumber: currentStaffNumber, timestamp: Date.now() }
      ]);

      // Update session to mark checklist as done
      const updatedSession = { ...session, checklistCompleted: true };
      setSession(updatedSession);
      
      // Status is already IN_USE from handleLogin, so we just confirm status matches in case
      setFleet(prev => prev.map(eq => 
        eq.id === selectedEquipment.id 
          ? { 
              ...eq, 
              status: EquipmentStatus.IN_USE, 
              lastOperator: currentOperator,
              lastOperatorStaffNumber: currentStaffNumber,
              lastOperatorArea: currentAreaOfWork
            } 
          : eq
      ));
      setView('active');
    } else {
      // If failed, Mark as Maintenance and Clear Session
      setFleet(prev => prev.map(eq => 
        eq.id === selectedEquipment.id 
          ? { 
              ...eq, 
              status: EquipmentStatus.MAINTENANCE, 
              currentIssue: 'Safety Check Failed',
              lastOperator: currentOperator,
              lastOperatorStaffNumber: currentStaffNumber,
              lastOperatorArea: currentAreaOfWork
            } 
          : eq
      ));
      // Destroy the booked session since check failed
      setSession(null);
      setSelectedEquipment(null);
      setCurrentOperator('');
      setView('login'); 
    }
  };

  const handleToggleBreak = () => {
    if (!session || !selectedEquipment) return;
    const newBreakState = !session.isOnBreak;
    setSession({ ...session, isOnBreak: newBreakState });
    setFleet(prev => prev.map(eq => 
      eq.id === selectedEquipment.id 
        ? { ...eq, status: newBreakState ? EquipmentStatus.ON_BREAK : EquipmentStatus.IN_USE } 
        : eq
    ));
  };

  const handleReportIssue = (issueDescription: string) => {
    if (!selectedEquipment || !session) return;
    
    // Calculate final duration before closing
    const duration = Math.floor((Date.now() - session.startTime) / 1000);

    // Add Maintenance Record to Admin Dashboard History
    const maintRecord: InspectionRecord = {
      id: `issue-${Date.now()}`,
      forkliftNumber: selectedEquipment.id,
      name: currentOperator,
      staffNumber: currentStaffNumber,
      areaOfWork: currentAreaOfWork,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now(),
      externalCondition: 'Check',
      fireExtinguisher: 'Check',
      batterySecured: 'Check',
      brakes: 'Check',
      horn: 'Check',
      steering: 'Check',
      issuesFound: true,
      actionTaken: `Reported: ${issueDescription}`
    };
    setInspectionHistory(prev => [maintRecord, ...prev]);

    // Mark fleet as Maintenance
    setFleet(prev => prev.map(eq => 
      eq.id === selectedEquipment.id 
        ? { 
            ...eq, 
            status: EquipmentStatus.MAINTENANCE, 
            currentIssue: issueDescription, 
            lastOperator: currentOperator,
            lastOperatorStaffNumber: currentStaffNumber,
            lastOperatorArea: currentAreaOfWork,
            lastSessionDuration: duration,
            lastSessionStartTime: session.startTime
          } 
        : eq
    ));

    // End Session
    setSession(null);
    setSelectedEquipment(null);
    setCurrentOperator('');
    setView('login');
    alert(`Issue reported: "${issueDescription}". Machine tagged for maintenance.`);
  };

  const handleResolveIssue = (equipmentId: string) => {
    // Admin Action: Mark equipment as Available
    setFleet(prev => prev.map(eq => 
      eq.id === equipmentId 
        ? { ...eq, status: EquipmentStatus.AVAILABLE, currentIssue: undefined } 
        : eq
    ));
  };

  const handleLogout = () => {
    if (!selectedEquipment || !session) return;
    
    // Calculate final duration in seconds
    const duration = Math.floor((Date.now() - session.startTime) / 1000);

    setFleet(prev => prev.map(eq => 
      eq.id === selectedEquipment.id 
        ? { 
            ...eq, 
            status: EquipmentStatus.AVAILABLE, 
            // We KEEP lastOperator info to show as "Logged Out" in dashboard
            // We SAVE the duration so dashboard can show "How many hours he worked"
            lastSessionDuration: duration,
            lastSessionStartTime: session.startTime
          } 
        : eq
    ));
    setSession(null);
    setSelectedEquipment(null);
    setCurrentOperator('');
    setView('login');
  };

  return (
    <div className="min-h-screen bg-background font-sans pb-20 transition-colors duration-300">
      {/* Modern Glass Header */}
      <nav className="sticky top-0 z-50 glass h-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => { if (!session) setView('login'); }}
            >
              <div className="bg-primary text-primary-foreground p-2.5 rounded-xl shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform duration-300">
                <Box className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                 <span className="text-xl font-bold tracking-tight text-foreground leading-tight">dnata</span>
                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Operations</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2.5 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
              </button>

              {session && (
                <div className="hidden md:flex items-center gap-3 bg-white/60 dark:bg-black/40 backdrop-blur-md pl-2 pr-4 py-1.5 rounded-full border border-border shadow-sm">
                   <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                     {currentOperator.charAt(0)}
                   </div>
                   <div className="flex flex-col leading-none gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Operator</span>
                      <span className="text-sm font-semibold text-foreground">{currentOperator}</span>
                   </div>
                </div>
              )}
              
              {view === 'active' && (
                 <button onClick={handleLogout} className="md:hidden p-2 text-muted-foreground hover:text-destructive transition-colors">
                    <LogOut className="w-5 h-5" />
                 </button>
              )}
              
              {view === 'dashboard' && !session && (
                <button onClick={() => setView('login')} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-8 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto transition-all duration-500 ease-in-out">
        {view === 'dashboard' && (
          <Dashboard 
            fleet={fleet}
            inspectionHistory={inspectionHistory}
            onSelectEquipment={handleSelectEquipmentFromDashboard} 
            onUpdateFleet={handleUpdateFleet}
            onResolveIssue={handleResolveIssue}
            onAssignTask={handleAssignTask}
            tasks={tasks}
            bulletins={bulletins}
            onAddBulletin={handleAddBulletin}
            onDeleteBulletin={handleDeleteBulletin}
          />
        )}

        {view === 'login' && (
          <LoginScreen 
            fleet={fleet}
            onLogin={handleLogin} 
            onAdminLogin={handleAdminLogin}
            bulletins={bulletins}
          />
        )}

        {view === 'checklist' && selectedEquipment && (
           <PreShiftChecklist 
            equipment={selectedEquipment}
            operatorName={currentOperator}
            onComplete={handleChecklistComplete}
            onCancel={() => {
              // If user cancels during checklist, we assume they are aborting the session.
              // We should free up the equipment.
              handleLogout(); 
            }}
          />
        )}

        {view === 'active' && session && selectedEquipment && (
          <ActiveSession 
            session={session} 
            equipment={selectedEquipment}
            onToggleBreak={handleToggleBreak}
            onLogout={handleLogout}
            onReportIssue={handleReportIssue}
            tasks={tasks}
            onCompleteTask={handleCompleteTask}
          />
        )}
      </main>
    </div>
  );
};

export default App;
