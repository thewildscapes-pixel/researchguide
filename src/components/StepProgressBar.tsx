import React from 'react';
import { StepNumber } from '../types';
import {
  Check,
  Sparkles,
  BookOpen,
  Layers,
  Sliders,
  Target,
  Calculator,
  BarChart3,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

interface StepProgressBarProps {
  currentStep: StepNumber;
  completedSteps: StepNumber[];
  onSelectStep: (step: StepNumber) => void;
  hasDownstreamAlert?: boolean;
}

export interface StepInfo {
  number: StepNumber;
  title: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const STEPS_CONFIG: StepInfo[] = [
  { number: 1, title: 'Title Intake & Bias Analysis', shortLabel: '01. Title & Bias', icon: Sparkles },
  { number: 2, title: 'Literature Context', shortLabel: '02. Lit Context', icon: BookOpen },
  { number: 3, title: 'Research Design', shortLabel: '03. Design', icon: Layers },
  { number: 4, title: 'Constructs & Variables', shortLabel: '04. Variables', icon: Sliders },
  { number: 5, title: 'Conceptual Framework & Hypotheses', shortLabel: '05. Framework & Hypotheses', icon: Target },
  { number: 6, title: 'Sampling Calculator', shortLabel: '06. Sampling', icon: Calculator },
  { number: 7, title: 'Statistical Tools', shortLabel: '07. Statistics', icon: BarChart3 },
  { number: 8, title: 'Ethics & Governance', shortLabel: '08. Ethics', icon: ShieldCheck },
  { number: 9, title: 'Summary Export', shortLabel: '09. Summary', icon: FileCheck },
];

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  completedSteps,
  onSelectStep,
}) => {
  return (
    <nav aria-label="Methodology Steps" className="bg-[#F8F9FA] border-b border-[#E5E7EB] py-3.5 sticky top-[73px] z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Horizontal step pills container */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {STEPS_CONFIG.map((step) => {
            const isActive = currentStep === step.number;
            const isCompleted = completedSteps.includes(step.number);
            const stepFormatted = step.number < 10 ? `0${step.number}` : `${step.number}`;
            const IconComponent = step.icon;

            return (
              <button
                key={step.number}
                id={`step-nav-btn-${step.number}`}
                onClick={() => onSelectStep(step.number)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 border cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#1A1A1A] border-[#E5E7EB] shadow-xs ring-2 ring-[#2563EB]/20'
                    : isCompleted
                    ? 'bg-white/80 text-slate-700 border-[#E5E7EB] hover:bg-white hover:text-black'
                    : 'bg-transparent text-slate-400 border-transparent hover:border-slate-200 hover:text-slate-600'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-500 text-white font-bold'
                      : 'border border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted && !isActive ? <Check className="w-3 h-3 stroke-[3]" /> : stepFormatted}
                </span>

                <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-[#2563EB]' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />

                <span className="font-bold tracking-tight whitespace-nowrap">
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Thin progress bar indicator */}
        <div className="w-full bg-slate-200/80 h-1 rounded-full overflow-hidden mt-2">
          <div
            className="bg-[#2563EB] h-full transition-all duration-300 ease-out"
            style={{ width: `${Math.max(5, (currentStep / 9) * 100)}%` }}
          />
        </div>
      </div>
    </nav>
  );
};
