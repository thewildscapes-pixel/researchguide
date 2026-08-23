import React, { useState, useEffect } from 'react';
import { Step6Data, Step1Data, Step3Data, SampleSizeCalculationResult } from '../../types';
import { calculateSampleSize } from '../../utils/sampleSizeMath';
import {
  Calculator,
  Sparkles,
  Users,
  Compass,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sliders,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';

interface Step6Props {
  data: Step6Data;
  step1: Step1Data;
  step3: Step3Data;
  onUpdate: (updated: Partial<Step6Data>) => void;
  onComplete: () => void;
  onPrev: () => void;
}

export const Step6SamplingCalculator: React.FC<Step6Props> = ({
  data,
  step1,
  step3,
  onUpdate,
  onComplete,
  onPrev,
}) => {
  // Field settings state
  const [targetPopulation, setTargetPopulation] = useState(
    data.targetPopulation || `Households and community members in ${step1.targetRegion || 'target district'}`
  );
  const [accessiblePopulation, setAccessiblePopulation] = useState(
    data.accessiblePopulation || 'Residents across accessible rural blocks and urban administrative centers'
  );
  const [fieldSetting, setFieldSetting] = useState(data.fieldSetting || 'Mixed Rural/Hill Tracts');
  const [stateOrDistrict, setStateOrDistrict] = useState(data.stateOrDistrict || step1.targetRegion || 'Meghalaya / Assam');
  const [hasRemoteHillAccess, setHasRemoteHillAccess] = useState(data.hasRemoteHillAccess ?? true);
  const [timeAndResourceLimits, setTimeAndResourceLimits] = useState(
    data.timeAndResourceLimits || 'Academic PhD / Master research timeframe with 2 field assistants'
  );

  // Exact math parameters state
  const [formulaType, setFormulaType] = useState<
    'cochran_infinite' | 'cochran_finite' | 'yamane' | 'power_ttest' | 'power_anova' | 'power_regression'
  >(data.calcConfig?.formulaType || 'cochran_infinite');
  const [confidenceLevel, setConfidenceLevel] = useState<90 | 95 | 99>(data.calcConfig?.confidenceLevel || 95);
  const [marginOfErrorPercent, setMarginOfErrorPercent] = useState<number>(data.calcConfig?.marginOfErrorPercent || 5);
  const [populationProportion, setPopulationProportion] = useState<number>(data.calcConfig?.populationProportion || 0.5);
  const [populationSize, setPopulationSize] = useState<number | undefined>(data.calcConfig?.populationSize || 2500);
  const [effectSize, setEffectSize] = useState<number>(data.calcConfig?.effectSize || 0.5);
  const [statisticalPower, setStatisticalPower] = useState<number>(data.calcConfig?.statisticalPower || 0.8);
  const [attritionPercent, setAttritionPercent] = useState<number>(data.calcConfig?.attritionPercent || 15);
  const [numGroups, setNumGroups] = useState<number>(data.calcConfig?.numGroups || 3);
  const [numPredictors, setNumPredictors] = useState<number>(data.calcConfig?.numPredictors || 4);

  // Math result
  const [mathResult, setMathResult] = useState<SampleSizeCalculationResult>(
    data.computedMath ||
      calculateSampleSize({
        formulaType: 'cochran_infinite',
        confidenceLevel: 95,
        marginOfErrorPercent: 5,
        populationProportion: 0.5,
        attritionPercent: 15,
      })
  );

  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleToUse = step1.approvedTitle || step1.workingTitle || 'Untitled Study';
  const designToUse = step3.userSelectedDesign || step3.designResult?.recommendedDesign || 'Empirical Study';

  // Recalculate mathematical sample size instantly whenever parameters change
  useEffect(() => {
    const calc = calculateSampleSize({
      formulaType,
      confidenceLevel,
      marginOfErrorPercent,
      populationProportion,
      populationSize,
      effectSize,
      statisticalPower,
      attritionPercent,
      numGroups,
      numPredictors,
    });
    setMathResult(calc);
    onUpdate({
      calcConfig: {
        formulaType,
        confidenceLevel,
        marginOfErrorPercent,
        populationProportion,
        populationSize,
        effectSize,
        statisticalPower,
        attritionPercent,
        numGroups,
        numPredictors,
      },
      computedMath: calc,
    });
  }, [
    formulaType,
    confidenceLevel,
    marginOfErrorPercent,
    populationProportion,
    populationSize,
    effectSize,
    statisticalPower,
    attritionPercent,
    numGroups,
    numPredictors,
  ]);

  const handleGenerateSamplingPlan = async () => {
    setIsLoadingAI(true);
    setError(null);

    try {
      const res = await fetch('/api/sampling-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titleToUse,
          researchDesign: designToUse,
          targetPopulation,
          accessiblePopulation,
          fieldSetting,
          stateOrDistrict,
          hasRemoteHillAccess,
          timeAndResourceLimits,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate sampling plan');
      }

      const result = await res.json();
      onUpdate({
        targetPopulation,
        accessiblePopulation,
        fieldSetting,
        stateOrDistrict,
        hasRemoteHillAccess,
        timeAndResourceLimits,
        aiSamplingPlan: result,
      });
      if (result.recommendedAttritionBufferPercent) {
        setAttritionPercent(result.recommendedAttritionBufferPercent);
      }
    } catch (err: any) {
      setError(err.message || 'Error generating sampling strategy');
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => {
    if (!data.aiSamplingPlan && !isLoadingAI) {
      handleGenerateSamplingPlan();
    }
  }, []);

  const aiPlan = data.aiSamplingPlan;

  const handleSaveAndProceed = () => {
    onUpdate({
      targetPopulation,
      accessiblePopulation,
      fieldSetting,
      stateOrDistrict,
      hasRemoteHillAccess,
      timeAndResourceLimits,
      calcConfig: {
        formulaType,
        confidenceLevel,
        marginOfErrorPercent,
        populationProportion,
        populationSize,
        effectSize,
        statisticalPower,
        attritionPercent,
        numGroups,
        numPredictors,
      },
      computedMath: mathResult,
    });
    onComplete();
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="border-b border-[#E5E7EB] pb-6">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#2563EB] mb-2">
          <Calculator className="w-3.5 h-3.5" />
          Step 06 • Sampling & Sample Size Engine
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase text-[#1A1A1A] leading-[1.05]">
          Field Sampling <br className="hidden sm:inline" />& <span className="text-[#2563EB] italic">Exact Mathematical Sizing</span>
        </h2>
        <div className="h-1 w-20 bg-[#2563EB] mt-3 mb-3"></div>
        <p className="text-sm font-medium text-slate-600 max-w-3xl leading-relaxed">
          Compute precise mathematical sample sizes (Cochran, Yamane, G*Power power analysis) with live
          parameter adjustments, coupled with regional sampling strategies addressing Northeast India field
          realities (hill hamlet access, traditional gatekeeper protocols, and attrition buffers).
        </p>
      </div>

      {/* SECTION 1: Exact Mathematical Sample Size Calculator */}
      <div className="bg-[#1A1A1A] text-white rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Mathematical Sample Size Computation Engine
            </span>
            <p className="text-xs text-slate-400 font-medium">
              Deterministic calculation verified by standard statistical formulas
            </p>
          </div>

          {/* Formula Selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-300 font-black uppercase tracking-wider">Formula:</label>
            <select
              value={formulaType}
              onChange={(e) => setFormulaType(e.target.value as any)}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white focus:border-[#2563EB]"
            >
              <option value="cochran_infinite" className="bg-[#1A1A1A] text-white">Cochran (Unknown / Infinite Population)</option>
              <option value="cochran_finite" className="bg-[#1A1A1A] text-white">Cochran (Finite Population Correction)</option>
              <option value="yamane" className="bg-[#1A1A1A] text-white">Yamane (Finite Simplified)</option>
              <option value="power_ttest" className="bg-[#1A1A1A] text-white">G*Power Equivalent (t-test)</option>
              <option value="power_anova" className="bg-[#1A1A1A] text-white">G*Power Equivalent (One-Way ANOVA)</option>
              <option value="power_regression" className="bg-[#1A1A1A] text-white">G*Power Equivalent (Multiple Regression)</option>
            </select>
          </div>
        </div>

        {/* Sliders & Math Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Confidence Level */}
          <div className="space-y-2.5 bg-white/5 p-5 rounded-xl border border-white/10">
            <div className="flex justify-between font-bold">
              <span className="text-slate-300 uppercase tracking-wider text-[11px]">Confidence Level (1 - α):</span>
              <span className="text-blue-400 font-mono font-black">{confidenceLevel}% (Z = {mathResult.details.zScore})</span>
            </div>
            <div className="flex gap-2">
              {[90, 95, 99].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setConfidenceLevel(lvl as any)}
                  className={`flex-1 py-2 rounded-lg font-black text-xs transition-colors cursor-pointer ${
                    confidenceLevel === lvl
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {lvl}%
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-400 block font-medium">
              95% is the standard for peer-reviewed social sciences (α = 0.05).
            </span>
          </div>

          {/* Margin of Error */}
          {(formulaType === 'cochran_infinite' || formulaType === 'cochran_finite' || formulaType === 'yamane') && (
            <div className="space-y-2.5 bg-white/5 p-5 rounded-xl border border-white/10">
              <div className="flex justify-between font-bold">
                <span className="text-slate-300 uppercase tracking-wider text-[11px]">Margin of Error (e):</span>
                <span className="text-blue-400 font-mono font-black">±{marginOfErrorPercent}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={marginOfErrorPercent}
                onChange={(e) => setMarginOfErrorPercent(parseFloat(e.target.value))}
                className="w-full accent-[#2563EB] cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block font-medium">
                Standard is ±5% (e = 0.05). Range 1% (high precision) to 10%.
              </span>
            </div>
          )}

          {/* Population Size N (for finite) */}
          {(formulaType === 'cochran_finite' || formulaType === 'yamane') && (
            <div className="space-y-2.5 bg-white/5 p-5 rounded-xl border border-white/10">
              <div className="flex justify-between font-bold">
                <span className="text-slate-300 uppercase tracking-wider text-[11px]">Known Population Size (N):</span>
                <span className="text-blue-400 font-mono font-black">{populationSize?.toLocaleString()}</span>
              </div>
              <input
                type="number"
                min={50}
                max={1000000}
                value={populationSize || ''}
                onChange={(e) => setPopulationSize(parseInt(e.target.value) || 1000)}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-mono text-xs focus:border-[#2563EB]"
              />
              <span className="text-[10px] text-slate-400 block font-medium">
                Total bounded population in target blocks/villages.
              </span>
            </div>
          )}

          {/* Effect size and power for G*Power */}
          {(formulaType === 'power_ttest' || formulaType === 'power_anova' || formulaType === 'power_regression') && (
            <>
              <div className="space-y-2.5 bg-white/5 p-5 rounded-xl border border-white/10">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-300 uppercase tracking-wider text-[11px]">Effect Size:</span>
                  <span className="text-blue-400 font-mono font-black">{effectSize}</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.8}
                  step={0.05}
                  value={effectSize}
                  onChange={(e) => setEffectSize(parseFloat(e.target.value))}
                  className="w-full accent-[#2563EB] cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block font-medium">
                  Cohen's convention: 0.2 (small), 0.5 (medium), 0.8 (large).
                </span>
              </div>

              <div className="space-y-2.5 bg-white/5 p-5 rounded-xl border border-white/10">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-300 uppercase tracking-wider text-[11px]">Statistical Power (1 - β):</span>
                  <span className="text-blue-400 font-mono font-black">{(statisticalPower * 100).toFixed(0)}%</span>
                </div>
                <div className="flex gap-2">
                  {[0.8, 0.9, 0.95].map((pVal) => (
                    <button
                      key={pVal}
                      type="button"
                      onClick={() => setStatisticalPower(pVal)}
                      className={`flex-1 py-2 rounded-lg font-black text-xs transition-colors cursor-pointer ${
                        statisticalPower === pVal
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      {(pVal * 100).toFixed(0)}%
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Attrition / Non-Response Buffer */}
          <div className="space-y-2.5 bg-white/5 p-5 rounded-xl border border-white/10">
            <div className="flex justify-between font-bold">
              <span className="text-slate-300 uppercase tracking-wider text-[11px]">Field Attrition Buffer:</span>
              <span className="text-blue-400 font-mono font-black">{attritionPercent}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              step={5}
              value={attritionPercent}
              onChange={(e) => setAttritionPercent(parseInt(e.target.value))}
              className="w-full accent-[#2563EB] cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block font-medium">
              15-20% is recommended for remote hill/rural fieldwork.
            </span>
          </div>
        </div>

        {/* Computed Result Display Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Base Sample Size */}
          <div className="bg-white/5 p-5 rounded-xl border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">
              Statistically Required Sample (n)
            </span>
            <div className="text-4xl font-black text-white font-mono">
              {mathResult.baseSampleSize}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Effective valid completed responses</span>
          </div>

          {/* Adjusted for Field Attrition */}
          <div className="bg-blue-900/30 p-5 rounded-xl border border-blue-500/40 space-y-1">
            <span className="text-[10px] uppercase font-black text-blue-300 tracking-[0.2em]">
              Total to Approach (+{attritionPercent}% Buffer)
            </span>
            <div className="text-4xl font-black text-blue-400 font-mono">
              {mathResult.adjustedSampleSize}
            </div>
            <span className="text-[11px] text-blue-200/80 font-medium">Target questionnaires to distribute in field</span>
          </div>

          {/* Formula Reference */}
          <div className="bg-white/5 p-5 rounded-xl border border-white/10 space-y-1 text-xs">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] block">
              Methodological Equation
            </span>
            <span className="font-bold text-slate-200 block text-xs">{mathResult.formulaUsed}</span>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              {mathResult.formulaExplanation}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: Field Settings & AI Sampling Protocol */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#2563EB]" />
            Field Geography & Gatekeeper Protocols (Northeast India)
          </h3>
          <button
            onClick={handleGenerateSamplingPlan}
            disabled={isLoadingAI}
            className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg bg-[#F8F9FA] hover:bg-blue-50 text-[#1A1A1A] hover:text-[#2563EB] border border-slate-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAI ? 'animate-spin text-[#2563EB]' : ''}`} />
            <span>Update Regional Strategy</span>
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="block font-black uppercase tracking-wider text-slate-600 text-[10px]">Target Population Frame</label>
            <input
              type="text"
              value={targetPopulation}
              onChange={(e) => setTargetPopulation(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#2563EB] text-[#1A1A1A] font-medium bg-[#F8F9FA]"
              placeholder="e.g. Female tea plantation workers in Dibrugarh & Tinsukia"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-black uppercase tracking-wider text-slate-600 text-[10px]">Accessible Sample Setting</label>
            <input
              type="text"
              value={accessiblePopulation}
              onChange={(e) => setAccessiblePopulation(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#2563EB] text-[#1A1A1A] font-medium bg-[#F8F9FA]"
              placeholder="e.g. 12 tea estate labor lines with active ASHA worker coverage"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-black uppercase tracking-wider text-slate-600 text-[10px]">Specific Districts / States</label>
            <input
              type="text"
              value={stateOrDistrict}
              onChange={(e) => setStateOrDistrict(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#2563EB] text-[#1A1A1A] font-medium bg-[#F8F9FA]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-black uppercase tracking-wider text-slate-600 text-[10px]">Terrain & Accessibility</label>
            <div className="flex items-center gap-4 pt-2">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasRemoteHillAccess}
                  onChange={(e) => setHasRemoteHillAccess(e.target.checked)}
                  className="rounded text-[#2563EB] focus:ring-[#2563EB] w-4 h-4 cursor-pointer"
                />
                <span className="font-bold text-[#1A1A1A]">
                  Involves remote hill villages / unpaved monsoon tracks
                </span>
              </label>
            </div>
          </div>
        </div>

        {isLoadingAI && (
          <div className="p-8 text-center bg-[#F8F9FA] rounded-xl space-y-2 border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin text-[#2563EB] mx-auto" />
            <p className="text-xs font-bold text-slate-700">
              Formulating cluster stratification, traditional village council entry, and bilingual enumerator strategy...
            </p>
          </div>
        )}

        {aiPlan && !isLoadingAI && (
          <div className="space-y-5 pt-2 border-t border-slate-100">
            {/* Recommended Sampling Method Banner */}
            <div className="p-5 bg-[#F8F9FA] rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#2563EB]" />
                  Recommended Method: <span className="text-[#2563EB]">{aiPlan.recommendedMethod}</span>
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">{aiPlan.samplingRationale}</p>
            </div>

            {/* Step-by-Step Sampling Protocol */}
            <div className="space-y-2 text-xs">
              <span className="font-black uppercase tracking-[0.2em] text-slate-400 block text-[10px]">
                Step-by-Step Stratification & Execution Plan
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiPlan.stepByStepSamplingPlan?.map((step: string, sIdx: number) => (
                  <div
                    key={sIdx}
                    className="p-4 bg-[#F8F9FA] rounded-xl border border-slate-200 text-[#1A1A1A] font-medium leading-relaxed flex items-start gap-2.5"
                  >
                    <span className="w-6 h-6 rounded-lg bg-[#1A1A1A] text-white font-black flex items-center justify-center text-[10px] shrink-0">
                      0{sIdx + 1}
                    </span>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Regional Northeast Gatekeeper Protocols */}
            {aiPlan.northeastFieldworkProtocols && (
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-200 space-y-3 text-xs">
                <span className="font-black uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center gap-2 text-[10px]">
                  <ShieldAlert className="w-4 h-4 text-[#2563EB]" />
                  Community Entry & Traditional Authority Protocols
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {aiPlan.northeastFieldworkProtocols.map((proto: any, pIdx: number) => (
                    <div key={pIdx} className="p-4 bg-white rounded-xl border border-blue-200 space-y-1.5 shadow-2xs">
                      <span className="font-bold text-[#1A1A1A] block">{proto.protocol}</span>
                      <p className="text-slate-600 leading-relaxed text-[11px] font-medium">{proto.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <button
            onClick={onPrev}
            className="px-5 py-3 rounded-xl border border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Step 05</span>
          </button>

          <button
            id="sampling-next-btn"
            onClick={handleSaveAndProceed}
            className="px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-[#1A1A1A] hover:bg-[#2563EB] shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Proceed to Step 07: Statistical Tools</span>
            <ArrowRight className="w-4 h-4 text-blue-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
