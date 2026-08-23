import React, { useState } from 'react';
import { Step1Data, TitleIssue, SuggestedTitle } from '../../types';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Edit3,
  MapPin,
  Compass,
  ShieldAlert,
  Check,
  Globe,
} from 'lucide-react';

interface Step1Props {
  data: Step1Data;
  onUpdate: (updated: Partial<Step1Data>) => void;
  onComplete: () => void;
}

const REGION_PRESETS = [
  'East Khasi Hills, Meghalaya',
  'Kohima & Mokokchung, Nagaland',
  'Dibrugarh & Tinsukia (Tea Gardens), Assam',
  'Imphal Valley & Hill Districts, Manipur',
  'Aizawl & Lunglei, Mizoram',
  'Papum Pare & West Siang, Arunachal Pradesh',
  'West Tripura & Dhalai, Tripura',
  'East & South Districts, Sikkim',
  'General Northeast India (Comparative)',
];

export const Step1TitleIntake: React.FC<Step1Props> = ({ data, onUpdate, onComplete }) => {
  const [workingTitle, setWorkingTitle] = useState(data.workingTitle || '');
  const [description, setDescription] = useState(data.description || '');
  const [targetRegion, setTargetRegion] = useState(data.targetRegion || 'Northeast India (General)');
  const [approvedTitle, setApprovedTitle] = useState(data.approvedTitle || data.workingTitle || '');
  const [isApproved, setIsApproved] = useState(data.isApproved || false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!workingTitle.trim() || !description.trim()) {
      setError('Please provide both a working title and a 2-3 sentence description.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/analyze-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workingTitle,
          description,
          targetRegion,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to analyze title');
      }

      const result = await res.json();
      onUpdate({
        workingTitle,
        description,
        targetRegion,
        analysis: result,
        approvedTitle: result.suggestedTitles?.[0]?.title || workingTitle,
        isApproved: false,
      });
      setApprovedTitle(result.suggestedTitles?.[0]?.title || workingTitle);
      setIsApproved(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestedTitle = (title: string) => {
    setApprovedTitle(title);
    onUpdate({ approvedTitle: title });
  };

  const handleApproveAndProceed = () => {
    if (!approvedTitle.trim()) {
      setError('Please approve or enter a finalized research title.');
      return;
    }
    setIsApproved(true);
    onUpdate({
      workingTitle,
      description,
      targetRegion,
      approvedTitle,
      isApproved: true,
    });
    onComplete();
  };

  const analysis = data.analysis;

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="border-b border-[#E5E7EB] pb-6">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#2563EB] mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Step 01 • Title Intake & Bias Audit
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase text-[#1A1A1A] leading-[1.05]">
          Title Intake <br className="hidden sm:inline" />& <span className="text-[#2563EB] italic">Bias Analysis</span>
        </h2>
        <div className="h-1 w-20 bg-[#2563EB] mt-3 mb-3"></div>
        <p className="text-sm font-medium text-slate-600 max-w-3xl leading-relaxed">
          Peer-reviewed social science journals rigorously screen research titles for deficit framing,
          ethnocentric assumptions, and ungrounded generalizations. We analyze your working title
          for ethical representation and methodological clarity in Northeast Indian and global contexts.
        </p>
      </div>

      {/* Input Form Section */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-7 space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                Working Research Title <span className="text-[#2563EB]">*</span>
              </label>
              <input
                id="working-title-input"
                type="text"
                value={workingTitle}
                onChange={(e) => setWorkingTitle(e.target.value)}
                placeholder="e.g. A study on backward tribal customs vs modern conservation in Meghalaya forests"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 text-[#1A1A1A] text-sm font-bold placeholder:text-slate-400 placeholder:font-normal"
              />
              <span className="text-[11px] font-medium text-slate-400 mt-1.5 block">
                Enter your draft title as currently formulated.
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                Research Description (2-3 Sentences) <span className="text-[#2563EB]">*</span>
              </label>
              <textarea
                id="research-description-input"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe specific phenomena, communities, relationships, or questions you intend to study, and why this investigation is important."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 text-[#1A1A1A] text-sm font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="md:col-span-5 space-y-4 bg-[#F8F9FA] p-5 rounded-2xl border border-[#E5E7EB] flex flex-col justify-between">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                Target Region & Community
              </label>
              <input
                type="text"
                value={targetRegion}
                onChange={(e) => setTargetRegion(e.target.value)}
                placeholder="e.g. East Khasi Hills, Meghalaya (Khasi community)"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-[#2563EB] text-xs font-bold text-[#1A1A1A] bg-white mb-2"
              />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                Regional Presets:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {REGION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTargetRegion(preset)}
                    className="text-[10px] font-bold px-2 py-1 rounded bg-white hover:bg-blue-50 hover:text-[#2563EB] text-slate-700 border border-slate-200 transition-colors text-left truncate max-w-full cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="analyze-title-btn"
              onClick={handleAnalyze}
              disabled={isLoading || !workingTitle.trim() || !description.trim()}
              className="w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-[#1A1A1A] hover:bg-[#2563EB] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-300" />
                  <span>Auditing Title & Bias...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-300" />
                  <span>Audit Title & Framing</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Working Title Highlight Box */}
          <section>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
              Analyzed Working Title
            </label>
            <p className="text-base sm:text-lg font-bold p-5 bg-[#F1F5F9] border-l-4 border-[#2563EB] rounded-r-xl text-[#1A1A1A]">
              &ldquo;{workingTitle}&rdquo;
            </p>
          </section>

          {/* Overall Assessment Banner */}
          <div className="bg-[#1A1A1A] text-white p-6 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-blue-400">
              <Compass className="w-4 h-4" />
              Methodological Reviewer Assessment
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-200">
              {analysis.overallAssessment}
            </p>
          </div>

          {/* Issues Found Cards */}
          {analysis.issuesFound && analysis.issuesFound.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded uppercase tracking-widest">
                  Bias Alert
                </span>
                <h3 className="font-black text-sm uppercase tracking-wide text-[#1A1A1A]">
                  Methodological Critiques ({analysis.issuesFound.length} Flagged)
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {analysis.issuesFound.map((issue: TitleIssue, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {issue.category}
                      </span>
                      <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        Flagged: &ldquo;<span className="text-red-700 font-bold">{issue.flaggedText}</span>&rdquo;
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Identified Issue:
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium">{issue.whatTheProblemIs}</p>
                      </div>
                      <div className="space-y-1 bg-[#F8F9FA] p-3.5 rounded-lg border border-slate-200">
                        <div className="text-[10px] font-black uppercase tracking-wider text-[#2563EB]">
                          Why It Matters (Validity & Ethics):
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium">{issue.whyItMatters}</p>
                      </div>
                    </div>

                    {issue.alternatives && issue.alternatives.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                          Recommended De-Biased Phrasings:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {issue.alternatives.map((alt, aIdx) => (
                            <span
                              key={aIdx}
                              className="text-xs bg-slate-50 text-slate-900 px-3 py-1 rounded-lg border border-slate-200 font-bold"
                            >
                              ✓ {alt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scope Evaluation & Suggested Titles */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Scope Box */}
            <div className="lg:col-span-5 bg-[#F8F9FA] p-6 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
                Scope Precision Audit
              </h4>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                    Geographic Scope
                  </span>
                  <span className="font-bold text-[#1A1A1A]">
                    {analysis.scopeEvaluation?.geographicClarity || 'Evaluated'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                    Demographic / Community Scope
                  </span>
                  <span className="font-bold text-[#1A1A1A]">
                    {analysis.scopeEvaluation?.demographicClarity || 'Evaluated'}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 pt-1 leading-relaxed">
                  {analysis.scopeEvaluation?.recommendations}
                </p>
              </div>
            </div>

            {/* Suggested Titles */}
            <div className="lg:col-span-7 bg-[#F8F9FA] p-6 rounded-2xl border border-slate-200 space-y-4 flex flex-col">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
                Proposed Revisions (Select to Adopt)
              </h4>

              <div className="space-y-3 flex-1">
                {analysis.suggestedTitles?.map((item: SuggestedTitle, sIdx: number) => {
                  const isSelected = approvedTitle === item.title;
                  return (
                    <div
                      key={sIdx}
                      onClick={() => handleSelectSuggestedTitle(item.title)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                        isSelected
                          ? 'bg-white border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-[#2563EB]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-[#2563EB] uppercase tracking-wider block">
                            Option 0{sIdx + 1} • {item.focus}
                          </span>
                          <p className="text-sm font-bold text-[#1A1A1A] leading-snug group-hover:text-[#2563EB] transition-colors">
                            {item.title}
                          </p>
                          <p className="text-xs font-medium text-slate-500 leading-relaxed">{item.rationale}</p>
                        </div>
                        <button
                          type="button"
                          className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'bg-[#2563EB] text-white border-[#2563EB]'
                              : 'border-slate-300 text-transparent group-hover:border-slate-400'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Final Approval Section */}
          <div className="p-6 md:p-8 rounded-2xl bg-white border-2 border-slate-900 space-y-5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
              <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
              Researcher Approval Required to Proceed
            </div>
            <p className="text-xs font-medium text-slate-600">
              Confirm or fine-tune your finalized title below. Downstream methodology steps (literature
              context, constructs, alignment) will anchor strictly to this approved title.
            </p>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">
                Approved Research Title
              </label>
              <input
                id="final-approved-title-input"
                type="text"
                value={approvedTitle}
                onChange={(e) => setApprovedTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-[#F8F9FA] font-bold text-[#1A1A1A] text-sm focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#2563EB]" />
                <span>Ready to synthesize literature context</span>
              </div>

              <button
                id="approve-title-next-btn"
                onClick={handleApproveAndProceed}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-[#1A1A1A] hover:bg-[#2563EB] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Approve Title & Continue</span>
                <ArrowRight className="w-4 h-4 text-blue-300" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
