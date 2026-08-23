import React, { useState, useEffect } from 'react';
import { Step3Data, Step1Data, Step2Data } from '../../types';
import {
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Scale,
  Compass,
} from 'lucide-react';

interface Step3Props {
  data: Step3Data;
  step1: Step1Data;
  step2: Step2Data;
  onUpdate: (updated: Partial<Step3Data>) => void;
  onComplete: () => void;
  onPrev: () => void;
}

export const Step3ResearchDesign: React.FC<Step3Props> = ({
  data,
  step1,
  step2,
  onUpdate,
  onComplete,
  onPrev,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDesign, setSelectedDesign] = useState(
    data.userSelectedDesign || data.designResult?.recommendedDesign || ''
  );

  const titleToUse = step1.approvedTitle || step1.workingTitle || 'Untitled Study';
  const literatureGap =
    step2.searchResult?.identifiedGaps?.map((g) => g.description).join('; ') || '';

  const handleGenerateRecommendation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/research-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titleToUse,
          description: step1.description,
          literatureGap,
          targetRegion: step1.targetRegion,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate research design recommendation');
      }

      const result = await res.json();
      onUpdate({
        designResult: result,
        userSelectedDesign: result.recommendedDesign,
      });
      setSelectedDesign(result.recommendedDesign);
    } catch (err: any) {
      setError(err.message || 'Error recommending research design');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate if not yet loaded
  useEffect(() => {
    if (!data.designResult && !isLoading) {
      handleGenerateRecommendation();
    }
  }, []);

  const result = data.designResult;

  const handleSaveAndProceed = () => {
    onUpdate({
      userSelectedDesign: selectedDesign || result?.recommendedDesign,
    });
    onComplete();
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="border-b border-[#E5E7EB] pb-6">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#2563EB] mb-2">
          <Layers className="w-3.5 h-3.5" />
          Step 03 • Research Design & Statistical Paradigm
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase text-[#1A1A1A] leading-[1.05]">
          Methodological <br className="hidden sm:inline" />Architecture & <span className="text-[#2563EB] italic">Paradigm</span>
        </h2>
        <div className="h-1 w-20 bg-[#2563EB] mt-3 mb-3"></div>
        <p className="text-sm font-medium text-slate-600 max-w-3xl leading-relaxed">
          Select research design (exploratory, descriptive, explanatory, mixed-methods) and
          parametric vs. non-parametric pathways with explicit consideration of field realities in
          Northeast India (small accessible cluster sizes, non-normal distributions).
        </p>
      </div>

      {/* Title & Region Context */}
      <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Study Anchor
          </span>
          <p className="text-sm sm:text-base font-bold text-[#1A1A1A]">&ldquo;{titleToUse}&rdquo;</p>
        </div>
        <button
          onClick={handleGenerateRecommendation}
          disabled={isLoading}
          className="text-xs px-4 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 font-bold uppercase tracking-wider text-slate-700 inline-flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#2563EB] ${isLoading ? 'animate-spin' : ''}`} />
          <span>Re-Evaluate</span>
        </button>
      </div>

      {isLoading && (
        <div className="p-12 text-center bg-[#F8F9FA] rounded-2xl border border-slate-200 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#2563EB] mx-auto" />
          <p className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide">
            Synthesizing methodological frameworks & statistical paradigm fits...
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && !isLoading && (
        <div className="space-y-7 animate-in fade-in duration-300">
          {/* Main Recommendation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Recommended Design */}
            <div className="bg-[#1A1A1A] text-white p-6 md:p-8 rounded-2xl space-y-4 md:col-span-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  Recommended Research Design
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {result.methodologyFit}
                </span>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                {result.recommendedDesign}
              </h3>
              <p className="text-sm font-medium leading-relaxed text-slate-300">
                {result.designRationale}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>Epistemological Paradigm:</span>
                <span className="text-blue-300">{result.epistemologicalParadigm}</span>
              </div>
            </div>

            {/* Parametric vs Non-Parametric Guidance */}
            <div className="bg-[#F8F9FA] p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <Scale className="w-4 h-4 text-[#2563EB]" />
                Statistical Stance
              </div>
              <div className="inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-blue-100 text-[#2563EB] border border-blue-200">
                {result.parametricVsNonParametric?.recommendation} Approach
              </div>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {result.parametricVsNonParametric?.reasoning}
              </p>
              {result.parametricVsNonParametric?.cautions && (
                <div className="p-3 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 font-medium">
                  <strong className="text-[#2563EB] font-black uppercase tracking-wider block mb-0.5">Assumptions Check:</strong> {result.parametricVsNonParametric.cautions}
                </div>
              )}
            </div>
          </div>

          {/* Strengths, Tradeoffs & Step-by-Step Implementation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths & Limitations */}
            <div className="bg-[#F8F9FA] p-6 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Methodological Strengths & Mitigations
              </h4>
              <div className="space-y-2.5">
                {result.strengthsAndTradeoffs?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1 shadow-2xs"
                  >
                    <span className="font-bold text-[#1A1A1A] block">{item.aspect}</span>
                    <p className="text-slate-600 font-medium leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Methodological Steps */}
            <div className="bg-[#F8F9FA] p-6 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Sequential Field & Analytical Steps
              </h4>
              <div className="space-y-2.5">
                {result.keyMethodologicalSteps?.map((step: string, sIdx: number) => (
                  <div
                    key={sIdx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 shadow-2xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white font-black flex items-center justify-center shrink-0 text-[10px]">
                      {sIdx + 1}
                    </span>
                    <p className="leading-relaxed font-medium">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Editable / Selected Design Confirmation */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-slate-900 space-y-4">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Confirm or Customise Research Design Formulation
            </label>
            <input
              type="text"
              value={selectedDesign}
              onChange={(e) => setSelectedDesign(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-[#F8F9FA] text-sm font-bold text-[#1A1A1A] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
              placeholder="e.g. Mixed-Methods (Convergent Parallel) / Exploratory Sequential"
            />
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              onClick={onPrev}
              className="px-5 py-3 rounded-xl border border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Step 02</span>
            </button>

            <button
              id="design-next-btn"
              onClick={handleSaveAndProceed}
              className="px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-[#1A1A1A] hover:bg-[#2563EB] shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Proceed to Step 04: Constructs & Variables</span>
              <ArrowRight className="w-4 h-4 text-blue-300" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
