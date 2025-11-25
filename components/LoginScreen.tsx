
import React, { useState } from 'react';
import { Equipment, EquipmentStatus, Bulletin } from '../types';
import { User, ChevronRight, Truck, AlertCircle, CheckCircle2, Lock, Shield, KeyRound, CreditCard, MapPin, Megaphone, AlertTriangle, Info } from 'lucide-react';

interface Props {
  fleet: Equipment[];
  bulletins: Bulletin[];
  onLogin: (forkliftId: string, name: string, staffNumber: string, areaOfWork: string) => void;
  onAdminLogin: () => void;
}

export const LoginScreen: React.FC<Props> = ({ fleet, bulletins, onLogin, onAdminLogin }) => {
  const [loginMode, setLoginMode] = useState<'operator' | 'admin'>('operator');
  
  // Operator State
  const [forkliftId, setForkliftId] = useState('');
  const [name, setName] = useState('');
  const [staffNumber, setStaffNumber] = useState('');
  const [areaOfWork, setAreaOfWork] = useState('Breakdown');
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedEquipment, setVerifiedEquipment] = useState<Equipment | null>(null);

  // Admin State
  const [adminPassword, setAdminPassword] = useState('');

  const handleVerifyOperator = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerified(false);
    setVerifiedEquipment(null);

    if (!forkliftId.trim() || !name.trim() || !staffNumber.trim()) {
      setError('Please enter Forklift Number, Operator Name, and Staff Number');
      return;
    }

    const equipment = fleet.find(e => e.id.toLowerCase() === forkliftId.trim().toLowerCase() || e.name.toLowerCase() === forkliftId.trim().toLowerCase());

    if (!equipment) {
      setError('Invalid Forklift Number. Please check the fleet ID.');
      return;
    }

    if (equipment.status === EquipmentStatus.IN_USE || equipment.status === EquipmentStatus.ON_BREAK) {
      setError(`Forklift ${equipment.id} is currently booked by ${equipment.lastOperator || 'another operator'}.`);
      return;
    }

    if (equipment.status === EquipmentStatus.MAINTENANCE) {
      setError(`Forklift ${equipment.id} is currently under maintenance.`);
      return;
    }

    // If all checks pass
    setVerifiedEquipment(equipment);
    setIsVerified(true);
  };

  const handleBook = () => {
    if (verifiedEquipment && name && staffNumber) {
      onLogin(verifiedEquipment.id, name, staffNumber, areaOfWork);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Simple hardcoded check for demonstration
    if (adminPassword === 'dnata123') {
      onAdminLogin();
    } else {
      setError('Invalid Admin Password');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 animate-fade-in relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side: Welcome & Bulletins */}
        <div className="space-y-8 hidden lg:block">
           <div className="space-y-2">
             <h1 className="text-5xl font-extrabold tracking-tight text-foreground">
               <span className="text-primary">dnata</span> Fleet
             </h1>
             <p className="text-xl text-muted-foreground font-medium">Safe. Efficient. Reliable.</p>
           </div>

           {/* Safety Bulletins Board */}
           <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-3xl p-6 shadow-xl">
             <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-destructive/10 rounded-xl text-destructive">
                 <Megaphone className="w-6 h-6" />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-foreground">Safety Notices</h3>
                 <p className="text-xs text-muted-foreground">Active operational updates</p>
               </div>
             </div>

             <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {bulletins.length > 0 ? (
                  bulletins.map(b => (
                    <div key={b.id} className={`p-4 rounded-2xl border backdrop-blur-sm transition-transform hover:scale-[1.02] ${
                      b.priority === 'critical' 
                        ? 'bg-red-500/10 border-red-500/30' 
                        : 'bg-blue-500/10 border-blue-500/30'
                    }`}>
                      <div className="flex items-start gap-3">
                         {b.priority === 'critical' ? (
                           <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                         ) : (
                           <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                         )}
                         <div>
                           <h4 className={`font-bold text-sm mb-1 ${
                              b.priority === 'critical' ? 'text-red-700 dark:text-red-400' : 'text-blue-700 dark:text-blue-400'
                           }`}>{b.title}</h4>
                           <p className="text-sm text-foreground/80 leading-relaxed">{b.message}</p>
                           <div className="mt-3 flex items-center justify-between text-[10px] opacity-60 font-bold uppercase tracking-wider">
                              <span>{b.author}</span>
                              <span>{new Date(b.timestamp).toLocaleDateString()}</span>
                           </div>
                         </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 text-muted-foreground bg-white/20 rounded-2xl border border-dashed border-white/30">
                     <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                     <p>No active bulletins.</p>
                  </div>
                )}
             </div>
           </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-card/80 dark:bg-card/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-primary/10 border border-white/20 dark:border-white/5 overflow-hidden">
            
            {/* Login Type Tabs */}
            <div className="flex border-b border-border bg-secondary/30">
              <button
                onClick={() => { setLoginMode('operator'); setError(''); setIsVerified(false); }}
                className={`flex-1 py-4 text-sm font-bold transition-all relative ${
                  loginMode === 'operator' 
                    ? 'text-primary bg-card/50' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Operator
                {loginMode === 'operator' && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary mx-auto w-1/2 rounded-b-full"></div>}
              </button>
              <button
                onClick={() => { setLoginMode('admin'); setError(''); }}
                className={`flex-1 py-4 text-sm font-bold transition-all relative ${
                  loginMode === 'admin' 
                    ? 'text-primary bg-card/50' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Admin
                {loginMode === 'admin' && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary mx-auto w-1/2 rounded-b-full"></div>}
              </button>
            </div>

            <div className="p-8 pt-8">
              
              {loginMode === 'operator' && (
                !isVerified ? (
                  <div className="animate-slide-up">
                    <div className="mb-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-foreground">Operator Login</h2>
                          <p className="text-muted-foreground text-xs">Book equipment for your shift</p>
                        </div>
                    </div>

                    <form onSubmit={handleVerifyOperator} className="space-y-4">
                      {/* Forklift Input */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Forklift ID</label>
                        <div className="relative group">
                          <input
                            type="text"
                            className="block w-full px-4 py-3.5 pl-11 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-background transition-all font-medium uppercase text-sm group-hover:bg-secondary/70"
                            placeholder="e.g., FL-01"
                            value={forkliftId}
                            onChange={(e) => {
                              setForkliftId(e.target.value);
                              setError('');
                            }}
                          />
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-primary">
                            <Truck className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {/* Operator Name Input */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Operator Name</label>
                        <div className="relative group">
                          <input
                            type="text"
                            className="block w-full px-4 py-3.5 pl-11 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-background transition-all font-medium text-sm group-hover:bg-secondary/70"
                            placeholder="Enter full name"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              setError('');
                            }}
                          />
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-primary">
                            <User className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {/* Staff Number Input */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Staff Number</label>
                        <div className="relative group">
                          <input
                            type="text"
                            className="block w-full px-4 py-3.5 pl-11 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-background transition-all font-medium text-sm group-hover:bg-secondary/70"
                            placeholder="Enter staff ID"
                            value={staffNumber}
                            onChange={(e) => {
                              setStaffNumber(e.target.value);
                              setError('');
                            }}
                          />
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-primary">
                            <CreditCard className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {/* Area of Work Input */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Area of Work</label>
                        <div className="relative group">
                          <select
                            className="block w-full px-4 py-3.5 pl-11 bg-secondary/50 border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-background transition-all font-medium text-sm appearance-none cursor-pointer group-hover:bg-secondary/70"
                            value={areaOfWork}
                            onChange={(e) => setAreaOfWork(e.target.value)}
                          >
                            <option value="Breakdown">Breakdown</option>
                            <option value="Build-up">Build-up</option>
                            <option value="RFS">RFS</option>
                            <option value="Delivery">Delivery</option>
                            <option value="Acceptance">Acceptance</option>
                            <option value="FG9- Acceptance">FG9- Acceptance</option>
                            <option value="Ramp Housekeeping">Ramp Housekeeping</option>
                          </select>
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-primary">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                            <ChevronRight className="w-4 h-4 rotate-90" />
                          </div>
                        </div>
                      </div>

                      {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2 animate-slide-up">
                          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                          <p className="text-xs text-destructive font-bold leading-tight">{error}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full group relative flex items-center justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 active:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 mt-2"
                      >
                        Check Availability
                        <ChevronRight className="ml-2 w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-6 animate-slide-up">
                    <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 ring-4 ring-emerald-50">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Equipment Available</h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        {verifiedEquipment?.name} <span className="font-mono font-bold text-foreground bg-secondary px-1.5 py-0.5 rounded">{verifiedEquipment?.id}</span> is ready for booking.
                      </p>
                    </div>

                    <div className="bg-secondary/30 p-4 rounded-2xl border border-border space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Operator</span>
                        <span className="font-bold">{name}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Staff #</span>
                        <span className="font-bold">{staffNumber}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Area</span>
                        <span className="font-bold">{areaOfWork}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Model</span>
                        <span className="font-bold text-right max-w-[150px] truncate">{verifiedEquipment?.model}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Battery</span>
                        <span className={`font-bold ${verifiedEquipment && verifiedEquipment.batteryLevel < 20 ? 'text-destructive' : 'text-emerald-600'}`}>
                          {verifiedEquipment?.batteryLevel}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleBook}
                        className="w-full group relative flex items-center justify-center py-4 px-4 border border-transparent text-base font-bold rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 active:bg-primary transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Book Forklift & Start
                      </button>
                      
                      <button
                        onClick={() => setIsVerified(false)}
                        className="w-full py-3 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Cancel & Go Back
                      </button>
                    </div>
                  </div>
                )
              )}

              {loginMode === 'admin' && (
                <div className="animate-slide-up">
                    <div className="mb-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
                          <Shield className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-foreground">Admin Access</h2>
                          <p className="text-muted-foreground text-xs">View fleet dashboard & reports</p>
                        </div>
                    </div>

                    <form onSubmit={handleAdminLogin} className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Admin Password</label>
                        <div className="relative group">
                          <input
                            type="password"
                            className="block w-full px-4 py-3.5 pl-11 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-background transition-all font-medium text-sm group-hover:bg-secondary/70"
                            placeholder="Enter password"
                            value={adminPassword}
                            onChange={(e) => {
                              setAdminPassword(e.target.value);
                              setError('');
                            }}
                          />
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-primary">
                            <KeyRound className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2 animate-slide-up">
                          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                          <p className="text-xs text-destructive font-bold leading-tight">{error}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full group relative flex items-center justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 active:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 mt-4"
                      >
                        Access Dashboard
                        <ChevronRight className="ml-2 w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </form>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
