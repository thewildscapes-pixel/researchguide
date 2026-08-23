import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ResearchProject, StepNumber } from '../types';
import { STEPS_CONFIG } from './StepProgressBar';
import {
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Layers,
  MapPin,
  FileCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BarChart2,
  Target,
  BookOpen,
  StickyNote,
} from 'lucide-react';

interface DashboardOverviewProps {
  project: ResearchProject;
  onSelectStep: (step: StepNumber) => void;
  onOpenGlossary?: () => void;
  onOpenScratchpad?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  project,
  onSelectStep,
  onOpenGlossary,
  onOpenScratchpad,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const completedCount = project.completedSteps.length;
  const totalSteps = 9;
  const remainingCount = totalSteps - completedCount;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  // Pie chart dataset
  const chartData = [
    { name: 'Finalized', value: completedCount, color: '#10B981' }, // Emerald
    { name: 'Pending', value: remainingCount, color: '#E2E8F0' }, // Slate
  ];

  const activeTitle = project.step1.approvedTitle || project.step1.workingTitle || 'Untitled Social Science Proposal';
  const region = project.step1.targetRegion || 'Northeast India';
  const design = project.step3.userSelectedDesign || project.step3.designResult?.recommendedDesign || 'Not Selected Yet';
  const sampleSize = project.step6.computedMath?.adjustedSampleSize || project.step6.calcConfig?.populationSize;

  return (
    <section
      id="methodology-dashboard-overview"
      aria-label="Methodology Completion Dashboard"
      className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden transition-all"
    >
      {/* Top Banner / Summary Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-[#1E293B] to-[#0F172A] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          {/* Mini Pie / Donut Chart */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center bg-white/5 rounded-2xl p-1 border border-white/10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      return (
                        <div className="bg-slate-900 text-white text-[11px] font-bold px-2 py-1 rounded shadow-lg border border-slate-700">
                          {data.name}: {data.value} {data.value === 1 ? 'Step' : 'Steps'}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="90%"
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center Percentage Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-sm sm:text-base font-black tracking-tight text-white leading-none">
                {progressPercent}%
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Done
              </span>
            </div>
          </div>

          {/* Project Highlights */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {completedCount} of 9 Steps Finalized
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-slate-300 border border-white/15 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-400" />
                {region}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1">
              {activeTitle}
            </h2>

            <p className="text-xs text-slate-300 flex items-center gap-2">
              <span>Current Focus:</span>
              <button
                onClick={() => onSelectStep(project.currentStep)}
                className="font-bold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Step 0{project.currentStep}: {STEPS_CONFIG[project.currentStep - 1]?.title}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </p>
          </div>
        </div>

        {/* Action / Toggle */}
        <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
          {onOpenGlossary && (
            <button
              id="dashboard-open-glossary-btn"
              onClick={onOpenGlossary}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-white/10 transition-all cursor-pointer"
              title="Open Academic Glossary"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Glossary</span>
            </button>
          )}

          {onOpenScratchpad && (
            <button
              id="dashboard-open-scratchpad-btn"
              onClick={onOpenScratchpad}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-amber-300 hover:text-amber-200 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-white/10 transition-all cursor-pointer"
              title="Open Research Scratchpad"
            >
              <StickyNote className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Notes</span>
            </button>
          )}

          <button
            id="jump-to-active-step-btn"
            onClick={() => onSelectStep(project.currentStep)}
            className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <span>Continue Step 0{project.currentStep}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            id="toggle-dashboard-overview-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse Overview' : 'Expand Overview'}
            aria-expanded={isExpanded}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Progress Matrix & Methodology Metadata */}
      {isExpanded && (
        <div className="p-5 sm:p-6 bg-slate-50/70 border-t border-[#E5E7EB] space-y-5 animate-in fade-in duration-200">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Research Design
              </span>
              <span className="text-xs font-bold text-slate-800 line-clamp-1 mt-0.5 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                {design}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Target Sample Size
              </span>
              <span className="text-xs font-bold text-slate-800 line-clamp-1 mt-0.5 flex items-center gap-1">
                <BarChart2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {sampleSize ? `N = ${sampleSize} respondents` : 'Uncalculated (Step 6)'}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Constructs & Alignment
              </span>
              <span className="text-xs font-bold text-slate-800 line-clamp-1 mt-0.5 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                {project.completedSteps.includes(5) ? 'Formally Aligned' : `${project.step4.variables.length} Variables Defined`}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Ethics & Governance
              </span>
              <span className="text-xs font-bold text-slate-800 line-clamp-1 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                {project.completedSteps.includes(8) ? 'Dual-Consent Mapped' : 'Pending Step 8'}
              </span>
            </div>
          </div>

          {/* 9-Step Interactive Progress Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                Methodology Pipeline Status
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Click any step to inspect or edit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2">
              {STEPS_CONFIG.map((step) => {
                const isCompleted = project.completedSteps.includes(step.number);
                const isActive = project.currentStep === step.number;
                const IconComponent = step.icon;

                let cardStyle = 'bg-white border-slate-200 text-slate-600 hover:border-slate-300';
                let badgeStyle = 'bg-slate-100 text-slate-500';
                let statusLabel = 'Pending';

                if (isActive) {
                  cardStyle = 'bg-blue-50/80 border-[#2563EB] text-blue-950 ring-2 ring-[#2563EB]/15';
                  badgeStyle = 'bg-[#2563EB] text-white';
                  statusLabel = 'Active';
                } else if (isCompleted) {
                  cardStyle = 'bg-emerald-50/40 border-emerald-200 text-emerald-950 hover:bg-emerald-50/70';
                  badgeStyle = 'bg-emerald-500 text-white';
                  statusLabel = 'Finalized';
                }

                return (
                  <button
                    key={step.number}
                    id={`dashboard-step-card-${step.number}`}
                    onClick={() => onSelectStep(step.number)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer shadow-2xs group ${cardStyle}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${badgeStyle}`}>
                        {isCompleted && !isActive ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          `0${step.number}`
                        )}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600">
                        {statusLabel}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <IconComponent className={`w-3 h-3 ${isActive ? 'text-[#2563EB]' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span className="text-[11px] font-bold leading-tight block line-clamp-1">
                          {step.title}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
