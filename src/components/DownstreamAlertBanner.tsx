import React from 'react';
import { AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';
import { StepNumber } from '../types';

interface DownstreamAlertBannerProps {
  fromStep: StepNumber;
  currentStep: StepNumber;
  onReverifyDownstream: () => void;
  onDismiss: () => void;
}

export const DownstreamAlertBanner: React.FC<DownstreamAlertBannerProps> = ({
  fromStep,
  currentStep,
  onReverifyDownstream,
  onDismiss,
}) => {
  return (
    <div className="bg-amber-50/90 border-l-4 border-amber-500 rounded-r-xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
      <div className="flex items-start sm:items-center gap-3">
        <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900 shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-700" />
        </div>
        <div>
          <span className="font-black text-amber-950 uppercase tracking-wide block sm:inline mr-2 text-[11px]">
            Downstream Alignment Alert:
          </span>
          <span className="text-slate-700 font-medium">
            Step 0{fromStep} was modified. Downstream constructs, sampling calculations, or statistical models may need re-synchronization.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          onClick={onDismiss}
          className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-black text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          Dismiss
        </button>
        <button
          onClick={onReverifyDownstream}
          className="px-3.5 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#2563EB] text-white font-black text-[11px] uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <span>Re-verify</span>
          <ArrowRight className="w-3 h-3 text-blue-300" />
        </button>
      </div>
    </div>
  );
};
