import React from 'react';
import { Equipment } from '../types';
import { ExternalLink, CheckCircle2, ShieldCheck, AlertTriangle, X, ArrowRight } from 'lucide-react';

interface Props {
  equipment: Equipment;
  operatorName: string;
  onComplete: (passed: boolean) => void;
  onCancel: () => void;
}

export const PreShiftChecklist: React.FC<Props> = ({ equipment, operatorName, onComplete, onCancel }) => {
  const FORM_URL = "https://forms.office.com/r/pBNrNev5e2";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-card rounded-3xl shadow-2xl shadow-primary/10 border border-border overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-violet-700 p-8 text-primary-foreground relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start">
               <div className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl inline-flex mb-6 shadow-lg">
                <ShieldCheck className="w-8 h-8 text-white" />
               </div>
               <button onClick={onCancel} className="text-white/60 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all">
                 <X className="w-6 h-6" />
               </button>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Safety Check</h2>
            <p className="text-white/80 mt-2 text-lg font-medium">
              Mandatory pre-shift inspection
            </p>
            
            <div className="mt-6 flex items-center gap-3">
              <div className="px-3 py-1.5 bg-black/20 rounded-lg text-xs font-bold backdrop-blur-sm border border-white/10 uppercase tracking-wider">
                {equipment.id}
              </div>
              <div className="w-1 h-1 rounded-full bg-white/40"></div>
              <span className="text-sm font-medium text-white/90">{operatorName}</span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Instructions */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">1</div>
              <p className="text-muted-foreground text-sm leading-relaxed pt-1.5">
                Complete the safety checklist form. This will open in a new window.
              </p>
            </div>
            
             {/* Primary Action */}
            <a 
              href={FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group block w-full py-5 bg-background hover:bg-secondary/50 text-primary font-bold rounded-2xl border-2 border-primary/20 border-dashed hover:border-solid hover:border-primary hover:shadow-lg hover:shadow-primary/10 flex items-center justify-between px-6 gap-2 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <ExternalLink className="w-5 h-5" />
                <span>Launch Checklist Form</span>
              </div>
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </a>
          </div>

          <div className="space-y-4">
             <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">2</div>
              <p className="text-muted-foreground text-sm leading-relaxed pt-1.5">
                After submitting the form, confirm below to start your shift.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <button 
                onClick={() => onComplete(true)}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
              >
                <CheckCircle2 className="w-5 h-5" />
                Checklist Submitted - Start Shift
              </button>

              <button 
                onClick={() => onComplete(false)}
                className="w-full py-3 text-destructive hover:bg-destructive/5 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <AlertTriangle className="w-4 h-4" />
                Issues Found / Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};