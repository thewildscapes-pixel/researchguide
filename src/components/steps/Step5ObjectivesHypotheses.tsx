import React, { useState, useEffect } from 'react';
import {
  Step5Data,
  Step1Data,
  Step3Data,
  Step4Data,
  FrameworkRelationship,
  ConceptualFrameworkModel,
  ConstructVariable,
  ObjectiveEvaluation,
  HypothesisEvaluation,
  MisalignmentFlag,
} from '../../types';
import {
  Target,
  Sparkles,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Edit3,
  Download,
  Share2,
  Info,
  HelpCircle,
  Check,
  X,
  Sliders,
  Layers,
  FileText,
  Network,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface Step5Props {
  data: Step5Data;
  step1: Step1Data;
  step3: Step3Data;
  step4: Step4Data;
  onUpdate: (updated: Partial<Step5Data>) => void;
  onComplete: () => void;
  onPrev: () => void;
}

export const Step5ObjectivesHypotheses: React.FC<Step5Props> = ({
  data,
  step1,
  step3,
  step4,
  onUpdate,
  onComplete,
  onPrev,
}) => {
  const titleToUse = step1.approvedTitle || step1.workingTitle || 'Untitled Study';
  const designToUse = step3.userSelectedDesign || step3.designResult?.recommendedDesign || 'Empirical Social Science';
  const identifiedVariables: ConstructVariable[] = step4.variables || [];

  // Local states
  const [activeTab, setActiveTab] = useState<'diagram' | 'matrix' | 'objectives' | 'theory'>('diagram');
  const [framework, setFramework] = useState<ConceptualFrameworkModel | undefined>(data.conceptualFramework);
  const [objectives, setObjectives] = useState<string[]>(
    data.draftObjectives && data.draftObjectives.length > 0
      ? data.draftObjectives
      : [
          `To examine the empirical relationship between ${
            identifiedVariables[0]?.name || 'key predictors'
          } and ${identifiedVariables[1]?.name || 'target outcomes'}.`,
        ]
  );
  const [hypotheses, setHypotheses] = useState<string[]>(
    data.draftHypotheses && data.draftHypotheses.length > 0
      ? data.draftHypotheses
      : [
          `H₁: There is a statistically significant positive direct relationship between ${
            identifiedVariables[0]?.name || 'independent variable'
          } and ${identifiedVariables[1]?.name || 'dependent variable'}.`,
        ]
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<FrameworkRelationship | null>(null);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [isDiagramExpanded, setIsDiagramExpanded] = useState(false);

  // Form state for creating / editing relationships
  const [formRel, setFormRel] = useState<Partial<FrameworkRelationship>>({
    hypothesisCode: 'H1',
    relationshipType: 'Direct',
    direction: 'Positive (+)',
    hypothesisStatement: '',
    theoreticalBasis: '',
    suggestedStatisticalTest: 'Multiple Linear Regression',
  });

  // Automatically synthesize framework if empty and variables exist
  const handleSynthesizeFramework = async () => {
    setIsSynthesizing(true);
    setError(null);

    try {
      const res = await fetch('/api/conceptual-framework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titleToUse,
          description: step1.description,
          researchDesign: designToUse,
          variables: identifiedVariables,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to synthesize conceptual framework');
      }

      const result = await res.json();
      const updatedFramework: ConceptualFrameworkModel = {
        theoreticalNarrative: result.theoreticalNarrative || '',
        underpinningTheories: result.underpinningTheories || ['Social Capital Theory', 'Resource-Based View'],
        relationships: result.relationships || [],
        boundaryConditions: result.boundaryConditions || '',
      };

      const extractedHypotheses = (result.relationships || []).map(
        (r: FrameworkRelationship) => r.hypothesisStatement
      );
      const extractedObjectives = result.suggestedObjectives || objectives;

      setFramework(updatedFramework);
      setHypotheses(extractedHypotheses.length > 0 ? extractedHypotheses : hypotheses);
      if (result.suggestedObjectives && result.suggestedObjectives.length > 0) {
        setObjectives(result.suggestedObjectives);
      }

      onUpdate({
        conceptualFramework: updatedFramework,
        draftHypotheses: extractedHypotheses.length > 0 ? extractedHypotheses : hypotheses,
        draftObjectives: result.suggestedObjectives || objectives,
      });
    } catch (err: any) {
      setError(err.message || 'Error synthesizing conceptual framework');
    } finally {
      setIsSynthesizing(false);
    }
  };

  useEffect(() => {
    if (!framework && identifiedVariables.length > 0 && !isSynthesizing) {
      handleSynthesizeFramework();
    }
  }, []);

  // Relationship CRUD
  const handleOpenAddRelationship = () => {
    const defaultSource = identifiedVariables.find((v) => v.role === 'Independent') || identifiedVariables[0];
    const defaultTarget = identifiedVariables.find((v) => v.role === 'Dependent') || identifiedVariables[1] || identifiedVariables[0];
    const nextHNum = (framework?.relationships.length || 0) + 1;

    setFormRel({
      id: `rel-${Date.now()}`,
      hypothesisCode: `H${nextHNum}`,
      sourceVarId: defaultSource?.id || 'var-1',
      sourceVarName: defaultSource?.name || 'Independent Variable',
      targetVarId: defaultTarget?.id || 'var-2',
      targetVarName: defaultTarget?.name || 'Dependent Variable',
      relationshipType: 'Direct',
      direction: 'Positive (+)',
      hypothesisStatement: `H${nextHNum}: ${defaultSource?.name || 'Predictor'} has a statistically significant positive effect on ${defaultTarget?.name || 'Outcome'}.`,
      theoreticalBasis: 'Direct structural determination and empirical effect.',
      suggestedStatisticalTest: 'Multiple Linear Regression',
    });
    setSelectedRelationship(null);
    setIsEditingModalOpen(true);
  };

  const handleOpenEditRelationship = (rel: FrameworkRelationship) => {
    setFormRel({ ...rel });
    setSelectedRelationship(rel);
    setIsEditingModalOpen(true);
  };

  const handleSaveRelationship = () => {
    if (!formRel.sourceVarName || !formRel.targetVarName || !formRel.hypothesisStatement) {
      alert('Please specify the variables and hypothesis statement.');
      return;
    }

    const currentRels = framework?.relationships || [];
    let updatedRels: FrameworkRelationship[];

    if (selectedRelationship) {
      // Edit existing
      updatedRels = currentRels.map((r) => (r.id === selectedRelationship.id ? (formRel as FrameworkRelationship) : r));
    } else {
      // Add new
      const newRel: FrameworkRelationship = {
        id: formRel.id || `rel-${Date.now()}`,
        hypothesisCode: formRel.hypothesisCode || `H${currentRels.length + 1}`,
        sourceVarId: formRel.sourceVarId || '',
        sourceVarName: formRel.sourceVarName || '',
        targetVarId: formRel.targetVarId || '',
        targetVarName: formRel.targetVarName || '',
        relationshipType: formRel.relationshipType || 'Direct',
        direction: formRel.direction || 'Positive (+)',
        hypothesisStatement: formRel.hypothesisStatement || '',
        theoreticalBasis: formRel.theoreticalBasis || '',
        suggestedStatisticalTest: formRel.suggestedStatisticalTest || 'Multiple Linear Regression',
        moderatorVarId: formRel.moderatorVarId,
        moderatorVarName: formRel.moderatorVarName,
      };
      updatedRels = [...currentRels, newRel];
    }

    const updatedFramework: ConceptualFrameworkModel = {
      theoreticalNarrative: framework?.theoreticalNarrative || '',
      underpinningTheories: framework?.underpinningTheories || [],
      relationships: updatedRels,
      boundaryConditions: framework?.boundaryConditions || '',
    };

    const newHypotheses = updatedRels.map((r) => r.hypothesisStatement);

    setFramework(updatedFramework);
    setHypotheses(newHypotheses);
    onUpdate({
      conceptualFramework: updatedFramework,
      draftHypotheses: newHypotheses,
    });
    setIsEditingModalOpen(false);
  };

  const handleDeleteRelationship = (relId: string) => {
    if (!framework) return;
    const updatedRels = framework.relationships.filter((r) => r.id !== relId);
    const updatedFramework: ConceptualFrameworkModel = {
      ...framework,
      relationships: updatedRels,
    };
    const newHypotheses = updatedRels.map((r) => r.hypothesisStatement);

    setFramework(updatedFramework);
    setHypotheses(newHypotheses);
    onUpdate({
      conceptualFramework: updatedFramework,
      draftHypotheses: newHypotheses,
    });
  };

  // Objectives handling
  const handleAddObjective = () => {
    const updated = [...objectives, ''];
    setObjectives(updated);
    onUpdate({ draftObjectives: updated });
  };

  const handleUpdateObjective = (index: number, val: string) => {
    const updated = [...objectives];
    updated[index] = val;
    setObjectives(updated);
    onUpdate({ draftObjectives: updated });
  };

  const handleDeleteObjective = (index: number) => {
    const updated = objectives.filter((_, i) => i !== index);
    setObjectives(updated);
    onUpdate({ draftObjectives: updated });
  };

  // Alignment Audit API
  const handleRunAlignmentCheck = async () => {
    const filteredObjs = objectives.filter((o) => o.trim().length > 0);
    const filteredHyps = hypotheses.filter((h) => h.trim().length > 0);

    if (filteredObjs.length === 0 || filteredHyps.length === 0) {
      setError('Please provide at least one objective and one hypothesis.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/check-alignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titleToUse,
          description: step1.description,
          researchDesign: designToUse,
          objectives: filteredObjs,
          hypotheses: filteredHyps,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to check alignment');
      }

      const result = await res.json();
      onUpdate({
        draftObjectives: filteredObjs,
        draftHypotheses: filteredHyps,
        alignmentResult: result,
      });
    } catch (err: any) {
      setError(err.message || 'Error checking alignment');
    } finally {
      setIsLoading(false);
    }
  };

  const alignment = data.alignmentResult;

  // Variables categorized
  const ivs = identifiedVariables.filter((v) => v.role === 'Independent');
  const dvs = identifiedVariables.filter((v) => v.role === 'Dependent');
  const meds = identifiedVariables.filter((v) => v.role === 'Mediator');
  const mods = identifiedVariables.filter((v) => v.role === 'Moderator');
  const ctrls = identifiedVariables.filter((v) => v.role === 'Control');

  const relationships = framework?.relationships || [];

  // Download SVG diagram
  const handleDownloadSVG = () => {
    const svgElement = document.getElementById('conceptual-framework-svg');
    if (!svgElement) return;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Conceptual_Framework_${titleToUse.substring(0, 20).replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="border-b border-[#E5E7EB] pb-6">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#2563EB] mb-2">
          <Target className="w-3.5 h-3.5" />
          Step 05 • Conceptual Framework & Hypotheses
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase text-[#1A1A1A] leading-[1.05]">
          Conceptual Framework <br className="hidden sm:inline" />& <span className="text-[#2563EB] italic">Hypotheses Mapping</span>
        </h2>
        <div className="h-1 w-20 bg-[#2563EB] mt-3 mb-3"></div>
        <p className="text-sm font-medium text-slate-600 max-w-3xl leading-relaxed">
          Translate identified constructs into an integrated conceptual framework diagram. Map direct, mediating,
          and moderating paths between variables, formulate testable directional hypotheses, and audit the golden thread.
        </p>
      </div>

      {/* Anchor Banner */}
      <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Study Anchor
          </span>
          <p className="text-sm sm:text-base font-bold text-[#1A1A1A]">&ldquo;{titleToUse}&rdquo;</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-[#2563EB] font-black uppercase tracking-wider border border-blue-200">
            {designToUse}
          </span>
          <button
            onClick={handleSynthesizeFramework}
            disabled={isSynthesizing}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#2563EB] text-white font-black uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isSynthesizing ? 'animate-spin' : ''}`} />
            <span>{isSynthesizing ? 'Synthesizing...' : 'Regenerate Framework'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('diagram')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'diagram'
              ? 'bg-[#1A1A1A] text-white shadow-xs'
              : 'bg-[#F8F9FA] text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Visual Framework Canvas</span>
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-[#1A1A1A] text-white shadow-xs'
              : 'bg-[#F8F9FA] text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Hypotheses & Path Matrix ({relationships.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('objectives')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'objectives'
              ? 'bg-[#1A1A1A] text-white shadow-xs'
              : 'bg-[#F8F9FA] text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Objectives & Golden Thread Audit</span>
        </button>
        <button
          onClick={() => setActiveTab('theory')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'theory'
              ? 'bg-[#1A1A1A] text-white shadow-xs'
              : 'bg-[#F8F9FA] text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Theoretical Narrative</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs text-red-700 font-medium">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* TAB 1: VISUAL CONCEPTUAL FRAMEWORK DIAGRAM */}
      {activeTab === 'diagram' && (
        <div className="space-y-6">
          {/* Controls bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">Framework Topology:</span>
              <div className="flex items-center gap-2 text-[11px] font-bold">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  IV: {ivs.length || 1}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                  Mediators: {meds.length}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                  Moderators: {mods.length}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  DV: {dvs.length || 1}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddRelationship}
                className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Path Link</span>
              </button>
              <button
                onClick={handleDownloadSVG}
                className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl bg-[#F8F9FA] hover:bg-slate-200 text-[#1A1A1A] border border-slate-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export SVG</span>
              </button>
              <button
                onClick={() => setIsDiagramExpanded(!isDiagramExpanded)}
                className="text-xs font-black uppercase tracking-wider p-2 rounded-xl bg-[#F8F9FA] hover:bg-slate-200 text-slate-600 border border-slate-300 transition-colors cursor-pointer"
                title={isDiagramExpanded ? 'Collapse Canvas' : 'Expand Canvas'}
              >
                {isDiagramExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* SVG Diagram Canvas */}
          <div
            className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-x-auto transition-all ${
              isDiagramExpanded ? 'min-h-[600px]' : 'min-h-[460px]'
            }`}
          >
            <div className="text-center mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                Visual Conceptual Model & Hypothesized Paths
              </span>
              <h3 className="text-base font-black text-[#1A1A1A] uppercase tracking-tight">
                {titleToUse}
              </h3>
            </div>

            <svg
              id="conceptual-framework-svg"
              viewBox="0 0 960 420"
              className="w-full h-auto min-w-[760px] mx-auto select-none"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              <defs>
                <marker
                  id="arrow-direct"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563EB" />
                </marker>
                <marker
                  id="arrow-mediator"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#8B5CF6" />
                </marker>
                <marker
                  id="arrow-moderator"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#D97706" />
                </marker>
                <marker
                  id="arrow-control"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748B" />
                </marker>
              </defs>

              {/* Background Grid Pattern */}
              <rect x="0" y="0" width="960" height="420" fill="#FAFAFA" rx="16" />
              <rect x="10" y="10" width="940" height="400" fill="none" stroke="#E5E7EB" strokeWidth="1" rx="12" />

              {/* 1. Independent Variables Box (Left Column) */}
              <g transform="translate(40, 100)">
                <rect
                  width="220"
                  height="160"
                  rx="12"
                  fill="#F0FDF4"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeDasharray="0"
                />
                <rect width="220" height="28" rx="12" fill="#10B981" />
                <rect y="16" width="220" height="12" fill="#10B981" />
                <text x="110" y="19" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle" letterSpacing="1">
                  INDEPENDENT VARIABLES (IV)
                </text>
                {ivs.length > 0 ? (
                  ivs.slice(0, 3).map((v, i) => (
                    <g key={v.id} transform={`translate(10, ${40 + i * 36})`}>
                      <rect width="200" height="30" rx="6" fill="#FFFFFF" stroke="#A7F3D0" strokeWidth="1" />
                      <text x="10" y="19" fill="#065F46" fontSize="10" fontWeight="bold">
                        {v.name.length > 28 ? v.name.substring(0, 26) + '...' : v.name}
                      </text>
                    </g>
                  ))
                ) : (
                  <g transform="translate(10, 50)">
                    <rect width="200" height="40" rx="6" fill="#FFFFFF" stroke="#A7F3D0" strokeWidth="1" />
                    <text x="10" y="24" fill="#065F46" fontSize="11" fontWeight="bold">
                      {identifiedVariables[0]?.name || 'Predictor / Institutional Factor'}
                    </text>
                  </g>
                )}
              </g>

              {/* 2. Dependent Variables Box (Right Column) */}
              <g transform="translate(700, 100)">
                <rect
                  width="220"
                  height="160"
                  rx="12"
                  fill="#EFF6FF"
                  stroke="#2563EB"
                  strokeWidth="2"
                />
                <rect width="220" height="28" rx="12" fill="#2563EB" />
                <rect y="16" width="220" height="12" fill="#2563EB" />
                <text x="110" y="19" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle" letterSpacing="1">
                  DEPENDENT VARIABLES (DV)
                </text>
                {dvs.length > 0 ? (
                  dvs.slice(0, 3).map((v, i) => (
                    <g key={v.id} transform={`translate(10, ${40 + i * 36})`}>
                      <rect width="200" height="30" rx="6" fill="#FFFFFF" stroke="#BFDBFE" strokeWidth="1" />
                      <text x="10" y="19" fill="#1E40AF" fontSize="10" fontWeight="bold">
                        {v.name.length > 28 ? v.name.substring(0, 26) + '...' : v.name}
                      </text>
                    </g>
                  ))
                ) : (
                  <g transform="translate(10, 50)">
                    <rect width="200" height="40" rx="6" fill="#FFFFFF" stroke="#BFDBFE" strokeWidth="1" />
                    <text x="10" y="24" fill="#1E40AF" fontSize="11" fontWeight="bold">
                      {identifiedVariables[1]?.name || 'Primary Outcome / Social Wellbeing'}
                    </text>
                  </g>
                )}
              </g>

              {/* 3. Mediators Box (Center Middle) */}
              {meds.length > 0 && (
                <g transform="translate(370, 110)">
                  <rect
                    width="220"
                    height="130"
                    rx="12"
                    fill="#FAF5FF"
                    stroke="#8B5CF6"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                  <rect width="220" height="24" rx="12" fill="#8B5CF6" />
                  <rect y="12" width="220" height="12" fill="#8B5CF6" />
                  <text x="110" y="17" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="1">
                    MEDIATING MECHANISMS (M)
                  </text>
                  {meds.slice(0, 2).map((v, i) => (
                    <g key={v.id} transform={`translate(10, ${36 + i * 40})`}>
                      <rect width="200" height="32" rx="6" fill="#FFFFFF" stroke="#DDD6FE" strokeWidth="1" />
                      <text x="10" y="20" fill="#5B21B6" fontSize="10" fontWeight="bold">
                        {v.name.length > 28 ? v.name.substring(0, 26) + '...' : v.name}
                      </text>
                    </g>
                  ))}
                </g>
              )}

              {/* 4. Moderators Box (Top Center) */}
              {mods.length > 0 ? (
                <g transform="translate(370, 20)">
                  <rect
                    width="220"
                    height="65"
                    rx="10"
                    fill="#FFFBEB"
                    stroke="#D97706"
                    strokeWidth="1.5"
                  />
                  <text x="110" y="18" fill="#92400E" fontSize="9" fontWeight="black" textAnchor="middle" letterSpacing="1">
                    MODERATING FACTORS (W)
                  </text>
                  <text x="110" y="42" fill="#78350F" fontSize="10" fontWeight="bold" textAnchor="middle">
                    {mods[0]?.name.length > 26 ? mods[0].name.substring(0, 24) + '...' : mods[0]?.name}
                  </text>
                </g>
              ) : (
                <g transform="translate(370, 20)">
                  <rect
                    width="220"
                    height="50"
                    rx="8"
                    fill="#F8FAFC"
                    stroke="#CBD5E1"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text x="110" y="22" fill="#64748B" fontSize="9" fontWeight="bold" textAnchor="middle">
                    CONTEXTUAL MODERATORS
                  </text>
                  <text x="110" y="38" fill="#94A3B8" fontSize="9" textAnchor="middle">
                    (e.g., Traditional Council / Remoteness)
                  </text>
                </g>
              )}

              {/* 5. Control Variables Box (Bottom Center) */}
              <g transform="translate(320, 315)">
                <rect
                  width="320"
                  height="75"
                  rx="10"
                  fill="#F8FAFC"
                  stroke="#94A3B8"
                  strokeWidth="1"
                />
                <text x="160" y="18" fill="#475569" fontSize="9" fontWeight="black" textAnchor="middle" letterSpacing="1">
                  CONTROL & DEMOGRAPHIC COVARIATES
                </text>
                <text x="160" y="40" fill="#334155" fontSize="10" fontWeight="medium" textAnchor="middle">
                  {ctrls.length > 0
                    ? ctrls.map((c) => c.name).join(', ')
                    : 'Age, Gender, Household Income, Sub-district Cluster'}
                </text>
                <text x="160" y="60" fill="#64748B" fontSize="9" fontStyle="italic" textAnchor="middle">
                  Held constant to isolate genuine predictor effects
                </text>
              </g>

              {/* CONNECTING ARROWS & HYPOTHESES BADGES */}
              {/* Direct Path: IV -> DV */}
              <path
                d={meds.length > 0 ? "M 260 145 C 310 120, 650 120, 700 145" : "M 260 170 L 700 170"}
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                markerEnd="url(#arrow-direct)"
              />
              <g transform={meds.length > 0 ? "translate(480, 108)" : "translate(480, 155)"}>
                <rect x="-42" y="-12" width="84" height="24" rx="12" fill="#2563EB" />
                <text x="0" y="4" fill="#FFFFFF" fontSize="10" fontWeight="black" textAnchor="middle">
                  {relationships[0]?.hypothesisCode || 'H₁'} (+) Direct
                </text>
              </g>

              {/* Mediation Paths if mediators present */}
              {meds.length > 0 && (
                <>
                  {/* IV -> Mediator (Path a) */}
                  <path
                    d="M 260 180 L 370 180"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="2"
                    markerEnd="url(#arrow-mediator)"
                  />
                  <g transform="translate(315, 170)">
                    <rect x="-24" y="-10" width="48" height="20" rx="10" fill="#8B5CF6" />
                    <text x="0" y="3.5" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
                      {relationships[1]?.hypothesisCode || 'H₂a'} (+)
                    </text>
                  </g>

                  {/* Mediator -> DV (Path b) */}
                  <path
                    d="M 590 180 L 700 180"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="2"
                    markerEnd="url(#arrow-mediator)"
                  />
                  <g transform="translate(645, 170)">
                    <rect x="-24" y="-10" width="48" height="20" rx="10" fill="#8B5CF6" />
                    <text x="0" y="3.5" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
                      {relationships[2]?.hypothesisCode || 'H₂b'} (+)
                    </text>
                  </g>
                </>
              )}

              {/* Moderator Arrow pointing down into direct path */}
              <path
                d="M 480 85 L 480 135"
                fill="none"
                stroke="#D97706"
                strokeWidth="2"
                strokeDasharray="4 2"
                markerEnd="url(#arrow-moderator)"
              />
              <g transform="translate(480, 80)">
                <rect x="-35" y="-10" width="70" height="20" rx="10" fill="#D97706" />
                <text x="0" y="3.5" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
                  {mods.length > 0 ? (relationships.find((r) => r.relationshipType === 'Moderating')?.hypothesisCode || 'H₃') : 'Mod'} (×)
                </text>
              </g>

              {/* Control arrows */}
              <path
                d="M 480 315 L 480 260"
                fill="none"
                stroke="#64748B"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                markerEnd="url(#arrow-control)"
              />
            </svg>
          </div>

          {/* Quick Relationship Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relationships.slice(0, 3).map((rel) => (
              <div
                key={rel.id}
                onClick={() => handleOpenEditRelationship(rel)}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-[#2563EB] transition-all cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#2563EB] font-black text-xs">
                    {rel.hypothesisCode} ({rel.direction})
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-[#2563EB]">
                    {rel.relationshipType}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#1A1A1A] line-clamp-2 mb-1.5">
                  {rel.sourceVarName} &rarr; {rel.targetVarName}
                </p>
                <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                  &ldquo;{rel.hypothesisStatement}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HYPOTHESES & VARIABLE-TO-VARIABLE PATH MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-[#1A1A1A]">
                Structural Path & Hypotheses Matrix
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Explicit mapping connecting independent variables, mediators, moderators, and dependent outcomes with testable hypotheses.
              </p>
            </div>
            <button
              onClick={handleOpenAddRelationship}
              className="text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Hypothesized Path</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8F9FA] border-b border-slate-200 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                    <th className="py-3.5 px-4">Hypothesis</th>
                    <th className="py-3.5 px-4">Predictor (X) &rarr; Outcome (Y)</th>
                    <th className="py-3.5 px-4">Path Type & Direction</th>
                    <th className="py-3.5 px-4">Hypothesis Statement</th>
                    <th className="py-3.5 px-4">Suggested Statistical Test</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {relationships.length > 0 ? (
                    relationships.map((rel, idx) => (
                      <tr key={rel.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-black text-[#1A1A1A] whitespace-nowrap">
                          <span className="w-7 h-7 rounded-lg bg-[#1A1A1A] text-white flex items-center justify-center text-xs">
                            {rel.hypothesisCode}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#1A1A1A]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                              {rel.sourceVarName}
                            </span>
                            <span className="text-slate-400">&rarr;</span>
                            <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                              {rel.targetVarName}
                            </span>
                          </div>
                          {rel.moderatorVarName && (
                            <span className="mt-1 block text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded w-fit">
                              Moderated by: {rel.moderatorVarName}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 mr-1.5">
                            {rel.relationshipType}
                          </span>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              rel.direction.includes('+')
                                ? 'bg-emerald-50 text-emerald-700'
                                : rel.direction.includes('-')
                                ? 'bg-red-50 text-red-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {rel.direction}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 max-w-sm">
                          <p className="font-semibold text-xs leading-relaxed">&ldquo;{rel.hypothesisStatement}&rdquo;</p>
                          {rel.theoreticalBasis && (
                            <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-1">
                              Basis: {rel.theoreticalBasis}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#2563EB] font-bold text-[11px] border border-blue-100">
                            {rel.suggestedStatisticalTest || 'Regression / SEM'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditRelationship(rel)}
                              className="p-1.5 text-slate-400 hover:text-[#2563EB] transition-colors rounded-md hover:bg-blue-50 cursor-pointer"
                              title="Edit Hypothesis"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRelationship(rel.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50 cursor-pointer"
                              title="Delete Hypothesis"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        No relationships generated yet. Click &ldquo;Add Hypothesized Path&rdquo; or synthesize above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OBJECTIVES & GOLDEN THREAD AUDIT */}
      {activeTab === 'objectives' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Objectives List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.15em] text-[#1A1A1A] flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#2563EB]" />
                    Specific Research Objectives (RO)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    SMART statements mapped directly to the conceptual framework.
                  </p>
                </div>
                <button
                  onClick={handleAddObjective}
                  className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg bg-[#F8F9FA] hover:bg-blue-50 text-[#1A1A1A] hover:text-[#2563EB] border border-slate-200 inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add RO</span>
                </button>
              </div>

              <div className="space-y-3">
                {objectives.map((obj, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-[#1A1A1A] text-white font-black flex items-center justify-center text-xs shrink-0 mt-1">
                      RO{idx + 1}
                    </span>
                    <textarea
                      rows={2}
                      value={obj}
                      onChange={(e) => handleUpdateObjective(idx, e.target.value)}
                      placeholder={`Research Objective ${idx + 1}...`}
                      className="flex-1 p-3 rounded-xl border border-slate-300 focus:border-[#2563EB] text-xs font-medium text-[#1A1A1A] bg-[#F8F9FA]"
                    />
                    {objectives.length > 1 && (
                      <button
                        onClick={() => handleDeleteObjective(idx)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors mt-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Hypotheses List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.15em] text-[#1A1A1A] flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    Formulated Testable Hypotheses (H)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Synchronized directly from your framework path matrix.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {hypotheses.map((hyp, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-xs shrink-0 mt-1">
                      H{idx + 1}
                    </span>
                    <div className="flex-1 p-3 rounded-xl border border-slate-200 text-xs font-medium text-[#1A1A1A] bg-blue-50/40">
                      {hyp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Action Button */}
          <div className="text-center pt-2">
            <button
              onClick={handleRunAlignmentCheck}
              disabled={isLoading}
              className="px-6 py-3.5 rounded-xl bg-[#1A1A1A] hover:bg-[#2563EB] text-white text-xs font-black uppercase tracking-widest inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Auditing Alignment...' : 'Run Golden Thread Alignment Audit'}</span>
            </button>
          </div>

          {/* Alignment Audit Result */}
          {alignment && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2563EB]">
                    Audit Verdict
                  </span>
                  <h3 className="text-xl font-black uppercase tracking-tight text-[#1A1A1A] mt-0.5">
                    Alignment Coherence Report
                  </h3>
                </div>
                <div
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${
                    alignment.overallAlignmentScore === 'High'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : alignment.overallAlignmentScore === 'Moderate'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  Score: {alignment.overallAlignmentScore}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 leading-relaxed">
                {alignment.alignmentSummary}
              </div>

              {/* Objectives Feedback */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
                  Objectives Evaluation & Critiques:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {alignment.objectivesEvaluation.map((obj) => (
                    <div key={obj.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1A1A1A]">{obj.id}</span>
                        {obj.mappedToTitle ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            Maps to Title
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                            Review Scope
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-medium italic">&ldquo;{obj.originalText}&rdquo;</p>
                      <p className="text-[11px] text-slate-500">{obj.critique}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: THEORETICAL NARRATIVE & UNDERPINNING THEORIES */}
      {activeTab === 'theory' && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black uppercase tracking-tight text-[#1A1A1A]">
              Theoretical Framework Narrative & Foundations
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Academic rationale and theoretical lenses explaining why the hypothesized relationships exist.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-2">
                Underpinning Theories
              </label>
              <div className="flex flex-wrap gap-2">
                {(framework?.underpinningTheories || ['Social Capital Theory', 'Resource-Based View']).map((th, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-200 text-xs font-bold"
                  >
                    {th}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-2">
                Theoretical Narrative (Chapter 2 & 3 Synthesis)
              </label>
              <textarea
                rows={5}
                value={framework?.theoreticalNarrative || ''}
                onChange={(e) => {
                  const updated = {
                    ...(framework || {
                      underpinningTheories: [],
                      relationships: [],
                    }),
                    theoreticalNarrative: e.target.value,
                  };
                  setFramework(updated);
                  onUpdate({ conceptualFramework: updated });
                }}
                placeholder="Synthesize the theoretical mechanisms..."
                className="w-full p-4 rounded-xl border border-slate-300 focus:border-[#2563EB] text-xs font-medium text-slate-800 bg-[#F8F9FA] leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-2">
                Boundary Conditions & Regional Scope
              </label>
              <textarea
                rows={2}
                value={framework?.boundaryConditions || ''}
                onChange={(e) => {
                  const updated = {
                    ...(framework || {
                      underpinningTheories: [],
                      relationships: [],
                      theoreticalNarrative: '',
                    }),
                    boundaryConditions: e.target.value,
                  };
                  setFramework(updated);
                  onUpdate({ conceptualFramework: updated });
                }}
                placeholder="Specify contextual limits (e.g. customary tenure systems, hill geography)..."
                className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#2563EB] text-xs font-medium text-slate-800 bg-[#F8F9FA]"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PATH RELATIONSHIP */}
      {isEditingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black uppercase tracking-tight text-[#1A1A1A] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#2563EB]" />
                {selectedRelationship ? 'Edit Hypothesized Path' : 'Add New Hypothesized Path'}
              </h3>
              <button
                onClick={() => setIsEditingModalOpen(false)}
                className="p-1 text-slate-400 hover:text-[#1A1A1A] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Hypothesis Code
                  </label>
                  <input
                    type="text"
                    value={formRel.hypothesisCode || 'H1'}
                    onChange={(e) => setFormRel({ ...formRel, hypothesisCode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Expected Direction / Sign
                  </label>
                  <select
                    value={formRel.direction || 'Positive (+)'}
                    onChange={(e) => setFormRel({ ...formRel, direction: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-[#1A1A1A]"
                  >
                    <option value="Positive (+)">Positive (+)</option>
                    <option value="Negative (-)">Negative (-)</option>
                    <option value="Non-directional">Non-directional (&ne;)</option>
                    <option value="Moderation (Interaction)">Moderation (Interaction &times;)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Source Variable (Predictor X)
                  </label>
                  <input
                    type="text"
                    value={formRel.sourceVarName || ''}
                    onChange={(e) => setFormRel({ ...formRel, sourceVarName: e.target.value })}
                    placeholder="e.g. Customary Governance"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Target Variable (Outcome Y)
                  </label>
                  <input
                    type="text"
                    value={formRel.targetVarName || ''}
                    onChange={(e) => setFormRel({ ...formRel, targetVarName: e.target.value })}
                    placeholder="e.g. Forest Conservation"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-[#1A1A1A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">
                  Relationship Type
                </label>
                <select
                  value={formRel.relationshipType || 'Direct'}
                  onChange={(e) => setFormRel({ ...formRel, relationshipType: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-[#1A1A1A]"
                >
                  <option value="Direct">Direct Effect (IV &rarr; DV)</option>
                  <option value="Mediating">Mediating Path (IV &rarr; M or M &rarr; DV)</option>
                  <option value="Moderating">Moderating Interaction (W &times; IV &rarr; DV)</option>
                  <option value="Correlational">Correlational Association (&harr;)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">
                  Hypothesis Formulation Statement
                </label>
                <textarea
                  rows={2}
                  value={formRel.hypothesisStatement || ''}
                  onChange={(e) => setFormRel({ ...formRel, hypothesisStatement: e.target.value })}
                  placeholder="e.g. H1: Higher levels of customary governance lead to a statistically significant increase in forest conservation."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">
                  Theoretical Basis / Reference
                </label>
                <input
                  type="text"
                  value={formRel.theoreticalBasis || ''}
                  onChange={(e) => setFormRel({ ...formRel, theoreticalBasis: e.target.value })}
                  placeholder="e.g. Social Capital Theory (Coleman, 1988)"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">
                  Recommended Statistical Verification
                </label>
                <input
                  type="text"
                  value={formRel.suggestedStatisticalTest || 'Multiple Linear Regression'}
                  onChange={(e) => setFormRel({ ...formRel, suggestedStatisticalTest: e.target.value })}
                  placeholder="e.g. Multiple Regression / SEM / Hayes PROCESS Model 4"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-[#1A1A1A]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setIsEditingModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRelationship}
                className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-[#2563EB] hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs"
              >
                Save Hypothesized Path
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step Navigation Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={onPrev}
          className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Constructs (Step 04)</span>
        </button>

        <button
          onClick={() => {
            onUpdate({
              draftObjectives: objectives.filter((o) => o.trim().length > 0),
              draftHypotheses: hypotheses.filter((h) => h.trim().length > 0),
            });
            onComplete();
          }}
          className="px-7 py-3.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <span>Save & Proceed to Sampling (Step 06)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
