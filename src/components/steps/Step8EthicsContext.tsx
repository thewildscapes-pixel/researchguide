import React, { useState, useEffect } from 'react';
import { Step8Data, Step1Data, Step3Data, Step6Data } from '../../types';
import {
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  FileCheck,
  Building2,
  Users,
  Lock,
} from 'lucide-react';

interface Step8Props {
  data: Step8Data;
  step1: Step1Data;
  step3: Step3Data;
  step6: Step6Data;
  onUpdate: (updated: Partial<Step8Data>) => void;
  onComplete: () => void;
  onPrev: () => void;
}

export const Step8EthicsContext: React.FC<Step8Props> = ({
  data,
  step1,
  step3,
  step6,
  onUpdate,
  onComplete,
  onPrev,
}) => {
  const [targetCommunity, setTargetCommunity] = useState(
    data.targetCommunity || `${step1.targetRegion || 'Indigenous and local community members in Northeast India'}`
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleToUse = step1.approvedTitle || step1.workingTitle || 'Untitled Study';
  const designToUse = step3.userSelectedDesign || step3.designResult?.recommendedDesign || 'Empirical Study';

  const handleGenerateEthics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ethics-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titleToUse,
          targetCommunity,
          targetRegion: step1.targetRegion,
          researchDesign: designToUse,
          fieldSetting: step6.fieldSetting,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate ethics evaluation');
      }

      const result = await res.json();
      onUpdate({
        targetCommunity,
        ethicsResult: result,
      });
    } catch (err: any) {
      setError(err.message || 'Error generating ethics protocol');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!data.ethicsResult && !isLoading) {
      handleGenerateEthics();
    }
  }, []);

  const ethics = data.ethicsResult;

  const handleSaveAndProceed = () => {
    onUpdate({ targetCommunity });
    onComplete();
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="border-b border-[#E5E7EB] pb-6">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#2563EB] mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Step 08 • Ethics & Community Sovereignty
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase text-[#1A1A1A] leading-[1.05]">
          Ethical Safeguards & <br className="hidden sm:inline" /><span className="text-[#2563EB] italic">Community-Grounded Consent</span>
        </h2>
        <div className="h-1 w-20 bg-[#2563EB] mt-3 mb-3"></div>
        <p className="text-sm font-medium text-slate-600 max-w-3xl leading-relaxed">
          Comprehensive ethics appraisal covering dual-level consent (traditional community authorities +
          voluntary individual), multilingual vernacular consent in oral-tradition contexts, avoiding
          extractive research, data sovereignty, and institutional review clearances.
        </p>
      </div>

      {/* Anchor Banner */}
      <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Study Anchor
          </span>
          <p className="text-sm sm:text-base font-bold text-[#1A1A1A]">&ldquo;{titleToUse}&rdquo;</p>
        </div>
        <button
          onClick={handleGenerateEthics}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#2563EB] text-white font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-300' : ''}`} />
          <span>Re-Evaluate Protocol</span>
        </button>
      </div>

      {isLoading && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#2563EB] mx-auto" />
          <p className="text-sm font-bold text-[#1A1A1A]">
            Assessing vulnerability classifications, customary governance clearance, and data sovereignty protocols...
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {ethics && !isLoading && (
        <div className="space-y-7 animate-in fade-in duration-300">
          {/* Vulnerability Assessment Banner */}
          <div className="bg-[#1A1A1A] text-white p-6 md:p-8 rounded-2xl space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
              <ShieldCheck className="w-4 h-4" />
              Ethics Board Vulnerability & Protection Appraisal
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-200 font-medium">
              {ethics.vulnerabilityAssessment}
            </p>
          </div>

          {/* Dual Consent & Informed Consent Protocols */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dual Level Consent (Traditional Council + Individual) */}
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-200 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#2563EB]" />
                Community Governance & Dual-Consent Model
              </h3>
              <div className="p-4 bg-white rounded-xl border border-blue-200 text-xs space-y-1.5 shadow-2xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Traditional Authorities to Engage:
                </span>
                <p className="text-[#1A1A1A] font-bold leading-relaxed">
                  {ethics.communityGovernanceAndDualConsent?.traditionalInstitutionsToEngage}
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-blue-200 text-xs space-y-1 shadow-2xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB] block">Voluntary Principle:</span>
                <p className="text-slate-700 leading-relaxed text-[11px] font-medium">
                  {ethics.communityGovernanceAndDualConsent?.distinction}
                </p>
              </div>
            </div>

            {/* Multilingual & Oral Tradition Consent Protocol */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#2563EB]" />
                Informed Consent Format & Oral Traditions
              </h3>
              <div className="inline-block px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 font-bold text-[#2563EB] text-xs">
                Format: {ethics.informedConsentProtocol?.consentFormat}
              </div>
              <div className="space-y-2 text-xs">
                {ethics.informedConsentProtocol?.keyElements?.map((elem: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 text-slate-700 font-medium">
                    <span className="text-[#2563EB] font-black">✓</span>
                    <span className="leading-snug">{elem}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-[#F8F9FA] rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed font-medium">
                <strong className="text-[#1A1A1A]">Oral Tradition Note:</strong> {ethics.informedConsentProtocol?.oralTraditionGuidance}
              </div>
            </div>
          </div>

          {/* Data Sovereignty & Institutional Ethics Clearance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Indigenous Data Sovereignty & Reciprocity */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#2563EB]" />
                Non-Extractive Research & Data Sovereignty
              </h3>
              <div className="space-y-2.5 text-xs">
                {ethics.dataSovereigntyAndReciprocity?.map((item: string, dIdx: number) => (
                  <div key={dIdx} className="p-3 rounded-xl bg-[#F8F9FA] border border-slate-200 text-slate-800 font-medium flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-lg bg-blue-50 text-[#2563EB] border border-blue-200 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ethics Committees to Apply */}
            <div className="bg-[#F8F9FA] p-6 md:p-8 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#2563EB]" />
                Institutional Ethics Review Bodies
              </h3>
              <div className="space-y-2.5 text-xs">
                {ethics.ethicsCommitteesToApply?.map((comm: string, cIdx: number) => (
                  <div key={cIdx} className="p-3.5 bg-white rounded-xl border border-slate-200 font-bold text-[#1A1A1A] shadow-2xs">
                    {comm}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              onClick={onPrev}
              className="px-5 py-3 rounded-xl border border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Step 07</span>
            </button>

            <button
              id="ethics-next-btn"
              onClick={handleSaveAndProceed}
              className="px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-[#1A1A1A] hover:bg-[#2563EB] shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Proceed to Step 09: Methodology Chapter</span>
              <ArrowRight className="w-4 h-4 text-blue-300" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
