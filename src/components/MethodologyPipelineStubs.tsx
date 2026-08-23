import React from 'react';
import { StepNumber } from '../types';
import {
  Sparkles,
  BookOpen,
  Layers,
  Sliders,
  Target,
  Calculator,
  BarChart3,
  ShieldCheck,
  FileCheck,
  Check,
} from 'lucide-react';

export interface StepStubInfo {
  number: StepNumber;
  title: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const PIPELINE_STEPS: StepStubInfo[] = [
  {
    number: 1,
    title: 'Title Intake & Bias Analysis',
    shortLabel: 'Title & Bias',
    icon: Sparkles,
    description: 'Cultural deconstruction, deficit framing & title precision',
  },
  {
    number: 2,
    title: 'Literature Context & Gaps',
    shortLabel: 'Lit Context',
    icon: BookOpen,
    description: 'Regional empirical grounding & gap identification',
  },
  {
    number: 3,
    title: 'Research Design Matrix',
    shortLabel: 'Design Matrix',
    icon: Layers,
    description: 'Quantitative, Qualitative & Mixed-Methods architectures',
  },
  {
    number: 4,
    title: 'Constructs & Variables',
    shortLabel: 'Variables',
    icon: Sliders,
    description: 'Operationalization & measurement scales',
  },
  {
    number: 5,
    title: 'Conceptual Framework & Hypotheses',
    shortLabel: 'Framework & Hypotheses',
    icon: Target,
    description: 'Visual conceptual framework, variable path relationships & testable hypotheses',
  },
  {
    number: 6,
    title: 'Sampling & Power Calculator',
    shortLabel: 'Sampling',
    icon: Calculator,
    description: 'Cochran, Yamane & cluster design effect calculators',
  },
  {
    number: 7,
    title: 'Statistical Tools & Analysis',
    shortLabel: 'Statistics',
    icon: BarChart3,
    description: 'Parametric/non-parametric & thematic matrix',
  },
  {
    number: 8,
    title: 'Ethics & Customary Governance',
    shortLabel: 'Ethics & Field',
    icon: ShieldCheck,
    description: 'Dual consent, traditional councils & data sovereignty',
  },
  {
    number: 9,
    title: 'Summary & Academic Citations',
    shortLabel: 'Summary Export',
    icon: FileCheck,
    description: 'Methodology chapter synthesis & APA/MLA bibliography',
  },
];

interface MethodologyPipelineStubsProps {
  currentStep?: StepNumber;
  completedSteps: StepNumber[];
  onSelectStep: (step: StepNumber) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

export const MethodologyPipelineStubs: React.FC<MethodologyPipelineStubsProps> = ({
  currentStep,
  completedSteps = [],
  onSelectStep,
  size = 'md',
  showLabels = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: {
      btn: 'w-7 h-7 sm:w-8 sm:h-8',
      icon: 'w-3.5 h-3.5',
      badge: 'w-3 h-3 text-[8px]',
      gap: 'gap-1 sm:gap-1.5',
    },
    md: {
      btn: 'w-9 h-9 sm:w-10 sm:h-10',
      icon: 'w-4 h-4',
      badge: 'w-3.5 h-3.5 text-[9px]',
      gap: 'gap-1.5 sm:gap-2',
    },
    lg: {
      btn: 'w-11 h-11 sm:w-12 sm:h-12',
      icon: 'w-5 h-5',
      badge: 'w-4 h-4 text-[10px]',
      gap: 'gap-2 sm:gap-3',
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center flex-wrap ${currentSize.gap} ${className}`}>
      {PIPELINE_STEPS.map((step) => {
        const IconComponent = step.icon;
        const isCompleted = completedSteps.includes(step.number);
        const isCurrent = currentStep === step.number;

        return (
          <div key={step.number} className="relative group/stub flex flex-col items-center">
            <button
              type="button"
              id={`pipeline-stub-step-${step.number}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectStep(step.number);
              }}
              title={`Step 0${step.number}: ${step.title}`}
              aria-label={`Jump to Step ${step.number}: ${step.title}`}
              className={`${currentSize.btn} rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer relative ${
                isCurrent
                  ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400 ring-offset-1 scale-105 z-10'
                  : isCompleted
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 hover:scale-105 shadow-2xs'
                  : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-300 hover:scale-105'
              }`}
            >
              <IconComponent className={currentSize.icon} />

              {/* Status Badge Indicator */}
              {isCompleted && !isCurrent && (
                <span className={`absolute -top-1 -right-1 ${currentSize.badge} rounded-full bg-emerald-600 text-white flex items-center justify-center font-black shadow-2xs`}>
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
            </button>

            {/* Optional Step Label under icon */}
            {showLabels && (
              <span
                className={`mt-1 text-[10px] font-bold tracking-tight text-center truncate max-w-[64px] ${
                  isCurrent
                    ? 'text-blue-600 font-extrabold'
                    : isCompleted
                    ? 'text-emerald-700'
                    : 'text-slate-500'
                }`}
              >
                {step.shortLabel}
              </span>
            )}

            {/* Hover Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover/stub:flex flex-col items-center z-50 pointer-events-none min-w-[140px] max-w-[200px] text-center">
              <div className="bg-slate-900 text-white px-2.5 py-1.5 rounded-lg shadow-xl text-left border border-slate-700 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-400">
                  <span>Step 0{step.number}</span>
                  <span>•</span>
                  <span>{isCompleted ? '✓ Finalized' : isCurrent ? 'Active' : 'Pending'}</span>
                </div>
                <div className="text-[11px] font-bold text-white leading-tight">{step.title}</div>
                <div className="text-[9px] text-slate-300 line-clamp-2">{step.description}</div>
              </div>
              <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
