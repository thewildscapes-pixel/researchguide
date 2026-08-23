export type StepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface TitleIssue {
  category: 'Cultural/Framing Bias' | 'Non-Researchable Phrasing' | 'Vague Scope' | 'Deficit Framing';
  flaggedText: string;
  whatTheProblemIs: string;
  whyItMatters: string;
  alternatives: string[];
}

export interface SuggestedTitle {
  title: string;
  focus: string;
  rationale: string;
}

export interface Step1Data {
  workingTitle: string;
  description: string;
  targetRegion: string;
  approvedTitle?: string;
  isApproved?: boolean;
  analysis?: {
    overallAssessment: string;
    issuesFound: TitleIssue[];
    scopeEvaluation: {
      geographicClarity: string;
      demographicClarity: string;
      recommendations: string;
    };
    suggestedTitles: SuggestedTitle[];
  };
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface ExistingStudyTheme {
  theme: string;
  keyFindings: string;
  regionalRelevance: string;
  notableWorks: string;
}

export interface LiteratureGap {
  gapType: 'Geographic Underrepresentation' | 'Methodological Gap' | 'Theoretical Disconnect' | 'Policy/Empirical Gap';
  description: string;
  whyItPersists: string;
}

export interface Step2Data {
  keyTerms: string;
  searchResult?: {
    summary: string;
    existingStudies: ExistingStudyTheme[];
    regionalInstitutionsActive: string[];
    identifiedGaps: LiteratureGap[];
    uniqueContributionAngle: string;
    searchTakeaways?: string;
    groundingSources: GroundingSource[];
  };
}

export interface Step3Data {
  userSelectedDesign?: string;
  designResult?: {
    recommendedDesign: string;
    methodologyFit: 'Quantitative' | 'Qualitative' | 'Mixed-Methods';
    designRationale: string;
    parametricVsNonParametric: {
      recommendation: 'Parametric' | 'Non-Parametric' | 'Both / Context-Dependent';
      reasoning: string;
      cautions: string;
    };
    epistemologicalParadigm: string;
    strengthsAndTradeoffs: Array<{ aspect: string; detail: string }>;
    keyMethodologicalSteps: string[];
  };
}

export interface ConstructVariable {
  id: string;
  name: string;
  role: 'Independent' | 'Dependent' | 'Mediator' | 'Moderator' | 'Control' | 'Qualitative Theme';
  conceptualDefinition: string;
  isAbstract: boolean;
  abstractWarning?: string;
  operationalDefinition: string;
  measurementLevel: 'Nominal' | 'Ordinal' | 'Interval' | 'Ratio' | 'Qualitative / Narrative';
  suggestedInstruments: string;
  culturalAdaptationNotes: string;
}

export interface Step4Data {
  variables: ConstructVariable[];
  measurementFrameworkSummary?: string;
}

export interface FrameworkRelationship {
  id: string;
  sourceVarId: string;
  sourceVarName: string;
  targetVarId: string;
  targetVarName: string;
  relationshipType: 'Direct' | 'Mediating' | 'Moderating' | 'Correlational' | 'Qualitative Influence';
  direction: 'Positive (+)' | 'Negative (-)' | 'Non-directional' | 'Moderation (Interaction)';
  hypothesisCode: string; // e.g. "H1", "H2a", "H3"
  hypothesisStatement: string;
  theoreticalBasis?: string;
  suggestedStatisticalTest?: string;
  moderatorVarId?: string;
  moderatorVarName?: string;
}

export interface ConceptualFrameworkModel {
  theoreticalNarrative: string;
  underpinningTheories: string[];
  relationships: FrameworkRelationship[];
  boundaryConditions?: string;
}

export interface ObjectiveEvaluation {
  id: string;
  originalText: string;
  mappedToTitle: boolean;
  linkedHypotheses: string[];
  critique: string;
  suggestedRevision: string;
}

export interface HypothesisEvaluation {
  id: string;
  originalText: string;
  linkedObjective: string;
  isTestable: boolean;
  type: string;
  critique: string;
  suggestedRevision: string;
}

export interface MisalignmentFlag {
  type: string;
  severity: 'Warning' | 'Critical';
  message: string;
  remedy: string;
}

export interface Step5Data {
  draftObjectives: string[];
  draftHypotheses: string[];
  conceptualFramework?: ConceptualFrameworkModel;
  alignmentResult?: {
    overallAlignmentScore: 'High' | 'Moderate' | 'Needs Revision';
    alignmentSummary: string;
    objectivesEvaluation: ObjectiveEvaluation[];
    hypothesesEvaluation: HypothesisEvaluation[];
    misalignmentFlags: MisalignmentFlag[];
    suggestedAlignedSets: Array<{ objective: string; correspondingHypothesis: string }>;
  };
}

export interface SampleSizeCalculationResult {
  baseSampleSize: number;
  adjustedSampleSize: number;
  formulaUsed: string;
  formulaExplanation: string;
  details: {
    zScore: number;
    marginOfError: number;
    proportion: number;
    populationSize?: number;
    power?: number;
    effectSize?: number;
    attritionBufferRate: number;
  };
}

export interface Step6Data {
  targetPopulation: string;
  accessiblePopulation: string;
  fieldSetting: string;
  stateOrDistrict: string;
  hasRemoteHillAccess: boolean;
  timeAndResourceLimits: string;
  calcConfig: {
    formulaType: 'cochran_infinite' | 'cochran_finite' | 'yamane' | 'power_ttest' | 'power_anova' | 'power_regression';
    confidenceLevel: 90 | 95 | 99;
    marginOfErrorPercent: number; // e.g. 5
    populationProportion: number; // e.g. 0.5
    populationSize?: number; // e.g. 1200
    effectSize: number; // e.g. 0.5 (medium d), 0.25 (f), 0.15 (f^2)
    statisticalPower: number; // e.g. 0.80 or 0.95
    attritionPercent: number; // e.g. 15%
    numGroups?: number;
    numPredictors?: number;
  };
  computedMath?: SampleSizeCalculationResult;
  aiSamplingPlan?: {
    recommendedMethod: string;
    samplingRationale: string;
    stepByStepSamplingPlan: string[];
    northeastFieldworkProtocols: Array<{ protocol: string; detail: string }>;
    recommendedAttritionBufferPercent: number;
    samplingCaveatsAndBiases: string;
  };
}

export interface StatisticalTestRecommendation {
  testName: string;
  targetsHypothesisOrObjective: string;
  whyThisTest: string;
  inputVariables: string;
  softwareRecommendation: string;
}

export interface AssumptionCheck {
  assumption: string;
  diagnosticTest: string;
  remedyIfViolated: string;
}

export interface Step7Data {
  dataTypePreference: string;
  statsResult?: {
    primaryTests: StatisticalTestRecommendation[];
    qualitativeAnalysisMethods: Array<{ method: string; applicability: string }>;
    assumptionsChecklist: AssumptionCheck[];
    reportingStandard: string;
  };
}

export interface Step8Data {
  targetCommunity: string;
  ethicsResult?: {
    vulnerabilityAssessment: string;
    informedConsentProtocol: {
      consentFormat: string;
      keyElements: string[];
      oralTraditionGuidance: string;
    };
    communityGovernanceAndDualConsent: {
      needed: boolean;
      traditionalInstitutionsToEngage: string;
      distinction: string;
    };
    dataSovereigntyAndReciprocity: string[];
    ethicsCommitteesToApply: string[];
  };
}

export interface Step9Data {
  finalMarkdownSummary?: string;
  isGenerating?: boolean;
}

export interface ResearchProject {
  id: string;
  lastUpdated: string;
  currentStep: StepNumber;
  completedSteps: StepNumber[];
  hasDownstreamAlert?: boolean;
  downstreamAlertFromStep?: StepNumber;
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
  step6: Step6Data;
  step7: Step7Data;
  step8: Step8Data;
  step9: Step9Data;
}
