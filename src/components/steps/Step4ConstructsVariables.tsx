import React, { useState, useEffect } from 'react';
import { Step4Data, Step1Data, Step3Data, ConstructVariable } from '../../types';
import {
  Sliders,
  Sparkles,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  HelpCircle,
  Languages,
  BookCheck,
} from 'lucide-react';

interface Step4Props {
  data: Step4Data;
  step1: Step1Data;
  step3: Step3Data;
  onUpdate: (updated: Partial<Step4Data>) => void;
  onComplete: () => void;
  onPrev: () => void;
}

export const Step4ConstructsVariables: React.FC<Step4Props> = ({
  data,
  step1,
  step3,
  onUpdate,
  onComplete,
  onPrev,
}) => {
  const [variables, setVariables] = useState<ConstructVariable[]>(data.variables || []);
  const [frameworkSummary, setFrameworkSummary] = useState(data.measurementFrameworkSummary || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleToUse = step1.approvedTitle || step1.workingTitle || 'Untitled Study';
  const designToUse = step3.userSelectedDesign || step3.designResult?.recommendedDesign || 'Empirical Study';

  const handleGenerateVariables = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/constructs-variables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titleToUse,
          description: step1.description,
          researchDesign: designToUse,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to analyze constructs and variables');
      }

      const result = await res.json();
      const mappedVars: ConstructVariable[] = (result.variables || []).map((v: any, i: number) => ({
        id: `var-${Date.now()}-${i}`,
        name: v.name || 'Untitled Variable',
        role: v.role || 'Independent',
        conceptualDefinition: v.conceptualDefinition || '',
        isAbstract: !!v.isAbstract,
        abstractWarning: v.abstractWarning || '',
        operationalDefinition: v.operationalDefinition || '',
        measurementLevel: v.measurementLevel || 'Ordinal',
        suggestedInstruments: v.suggestedInstruments || '',
        culturalAdaptationNotes: v.culturalAdaptationNotes || '',
      }));

      setVariables(mappedVars);
      setFrameworkSummary(result.measurementFrameworkSummary || '');
      onUpdate({
        variables: mappedVars,
        measurementFrameworkSummary: result.measurementFrameworkSummary,
      });
    } catch (err: any) {
      setError(err.message || 'Error generating variables');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (variables.length === 0 && !isLoading) {
      handleGenerateVariables();
    }
  }, []);

  const handleAddVariable = () => {
    const newVar: ConstructVariable = {
      id: `var-${Date.now()}`,
      name: 'New Construct / Variable',
      role: 'Independent',
      conceptualDefinition: 'Theoretical definition of this construct',
      isAbstract: false,
      operationalDefinition: 'Observable indicators, survey items, or frequency metric',
      measurementLevel: 'Ordinal',
      suggestedInstruments: 'Custom questionnaire / Likert scale',
      culturalAdaptationNotes: 'Vernacular translation & back-translation into local language',
    };
    const updated = [...variables, newVar];
    setVariables(updated);
    onUpdate({ variables: updated });
  };

  const handleUpdateVariable = (id: string, updates: Partial<ConstructVariable>) => {
    const updated = variables.map((v) => (v.id === id ? { ...v, ...updates } : v));
    setVariables(updated);
    onUpdate({ variables: updated });
  };

  const handleDeleteVariable = (id: string) => {
    const updated = variables.filter((v) => v.id !== id);
    setVariables(updated);
    onUpdate({ variables: updated });
  };

  const handleSaveAndProceed = () => {
    if (variables.length === 0) {
      setError('Please add or define at least one variable/construct.');
      return;
    }
    onUpdate({
      variables,
      measurementFrameworkSummary: frameworkSummary,
    });
    onComplete();
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="border-b border-[#E5E7EB] pb-6">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#2563EB] mb-2">
          <Sliders className="w-3.5 h-3.5" />
          Step 04 • Constructs & Operationalization
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase text-[#1A1A1A] leading-[1.05]">
          Variables & <span className="text-[#2563EB] italic">Measurement Scales</span>
        </h2>
        <div className="h-1 w-20 bg-[#2563EB] mt-3 mb-3"></div>
        <p className="text-sm font-medium text-slate-600 max-w-3xl leading-relaxed">
          Decompose theoretical concepts into measurable independent, dependent, mediator, and moderator
          variables. We flag abstract concepts and provide cultural/linguistic adaptation guidelines
          (vernacular translations, cognitive pre-testing) for Northeast Indian languages.
        </p>
      </div>

      {/* Control Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#F8F9FA] p-5 rounded-2xl border border-[#E5E7EB]">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Study Anchor
          </span>
          <p className="text-sm sm:text-base font-bold text-[#1A1A1A]">&ldquo;{titleToUse}&rdquo;</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAddVariable}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 font-black uppercase tracking-wider text-xs text-[#1A1A1A] inline-flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Add Variable</span>
          </button>
          <button
            onClick={handleGenerateVariables}
            disabled={isLoading}
            className="px-5 py-2 rounded-xl bg-[#1A1A1A] text-white font-black uppercase tracking-wider text-xs hover:bg-[#2563EB] inline-flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-300 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Auto-Identify</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="p-12 text-center bg-[#F8F9FA] rounded-2xl border border-slate-200 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#2563EB] mx-auto" />
          <p className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide">
            Operationalizing constructs, mapping measurement scales, and translation protocols...
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Variables List */}
      {!isLoading && variables.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5">
            {variables.map((v, idx) => (
              <div
                key={v.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4 transition-all"
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="w-7 h-7 rounded-lg bg-[#1A1A1A] text-white font-black flex items-center justify-center text-xs shrink-0">
                      0{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => handleUpdateVariable(v.id, { name: e.target.value })}
                      placeholder="Variable / Construct Name"
                      className="font-black text-base text-[#1A1A1A] border-b border-transparent hover:border-slate-300 focus:border-[#2563EB] px-1 py-0.5 w-full max-w-md focus:outline-none uppercase tracking-tight"
                    />
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                    {/* Role Dropdown */}
                    <select
                      value={v.role}
                      onChange={(e) => handleUpdateVariable(v.id, { role: e.target.value as any })}
                      className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-slate-300 bg-[#F8F9FA] text-[#1A1A1A] cursor-pointer"
                    >
                      <option value="Independent">Independent (IV)</option>
                      <option value="Dependent">Dependent (DV)</option>
                      <option value="Mediator">Mediator</option>
                      <option value="Moderator">Moderator</option>
                      <option value="Control">Control Variable</option>
                      <option value="Qualitative Theme">Qualitative Theme</option>
                    </select>

                    {/* Scale Level Dropdown */}
                    <select
                      value={v.measurementLevel}
                      onChange={(e) =>
                        handleUpdateVariable(v.id, { measurementLevel: e.target.value as any })
                      }
                      className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 cursor-pointer"
                    >
                      <option value="Nominal">Nominal (Categorical)</option>
                      <option value="Ordinal">Ordinal (Likert / Rank)</option>
                      <option value="Interval">Interval (Continuous)</option>
                      <option value="Ratio">Ratio (Continuous Absolute)</option>
                      <option value="Qualitative / Narrative">Qualitative / Narrative</option>
                    </select>

                    <button
                      onClick={() => handleDeleteVariable(v.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete construct"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Abstract Warning Callout */}
                {v.isAbstract && (
                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-900 font-black uppercase tracking-wider text-[10px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Abstract Construct Flag: Requires Concrete Operationalization</span>
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed">
                      {v.abstractWarning ||
                        'This construct is conceptually broad. Define specific empirical indicators below to ensure peer-review validity.'}
                    </p>
                  </div>
                )}

                {/* Grid of Definitions & Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="block font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">
                      Conceptual Definition (Theoretical Meaning)
                    </label>
                    <textarea
                      rows={2}
                      value={v.conceptualDefinition}
                      onChange={(e) =>
                        handleUpdateVariable(v.id, { conceptualDefinition: e.target.value })
                      }
                      className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#2563EB] text-[#1A1A1A] font-medium text-xs bg-[#F8F9FA]"
                      placeholder="What theoretical literature defines this as..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">
                      Operational Definition & Observable Indicators
                    </label>
                    <textarea
                      rows={2}
                      value={v.operationalDefinition}
                      onChange={(e) =>
                        handleUpdateVariable(v.id, { operationalDefinition: e.target.value })
                      }
                      className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#2563EB] text-[#1A1A1A] text-xs font-medium bg-[#F8F9FA]"
                      placeholder="How this will be measured concretely (e.g. 5-point Likert scale items, attendance records, monthly income bracket)..."
                    />
                  </div>
                </div>

                {/* Scale Instruments & Cultural Adaptation Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-100">
                  <div className="p-3.5 bg-[#F8F9FA] rounded-xl border border-slate-200 space-y-1.5">
                    <span className="font-black text-[#1A1A1A] uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                      <BookCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                      Suggested Scales / Instruments
                    </span>
                    <input
                      type="text"
                      value={v.suggestedInstruments}
                      onChange={(e) =>
                        handleUpdateVariable(v.id, { suggestedInstruments: e.target.value })
                      }
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white text-[#1A1A1A] font-medium"
                      placeholder="e.g. Connor-Davidson Resilience Scale / Custom 7-item Likert"
                    />
                  </div>

                  <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200 space-y-1.5">
                    <span className="font-black text-[#2563EB] uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                      <Languages className="w-3.5 h-3.5 text-[#2563EB]" />
                      Linguistic & Cultural Adaptation Protocol
                    </span>
                    <input
                      type="text"
                      value={v.culturalAdaptationNotes}
                      onChange={(e) =>
                        handleUpdateVariable(v.id, { culturalAdaptationNotes: e.target.value })
                      }
                      className="w-full p-2 rounded-lg border border-blue-200 text-xs bg-white text-[#1A1A1A] font-medium"
                      placeholder="e.g. Forward and back-translation to Khasi/Assamese; local idiom pre-test"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {frameworkSummary && (
            <div className="bg-[#1A1A1A] text-white p-6 rounded-2xl text-xs space-y-1.5 shadow-xs">
              <span className="font-black uppercase tracking-[0.2em] text-blue-400 block text-[10px]">
                Measurement Architecture Advice
              </span>
              <p className="leading-relaxed text-slate-300 font-medium">{frameworkSummary}</p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              onClick={onPrev}
              className="px-5 py-3 rounded-xl border border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Step 03</span>
            </button>

            <button
              id="variables-next-btn"
              onClick={handleSaveAndProceed}
              className="px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-[#1A1A1A] hover:bg-[#2563EB] shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Proceed to Step 05: Objectives & Hypotheses</span>
              <ArrowRight className="w-4 h-4 text-blue-300" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
