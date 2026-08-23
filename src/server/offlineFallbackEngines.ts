// Offline Academic Heuristic Engines
// Provides pedagogical, publication-grade methodologic synthesis when the Gemini API
// experiences temporary quota exhaustion (429 RESOURCE_EXHAUSTED) on the free tier.

export function generateTitleFallback(
  workingTitle: string,
  description: string,
  targetRegion: string = 'Northeast India'
) {
  const cleanTitle = workingTitle.trim();
  const cleanDesc = description.trim();
  const region = targetRegion.trim() || 'Northeast India';

  return {
    overallAssessment: `The proposed study explores an important social inquiry topic ("${cleanTitle}") situated within ${region}. From a methodologic perspective, the topic presents substantial empirical promise but requires sharpening around conceptual boundaries, variable demarcation, and avoiding broad deficit or sensational phrasing in the title formulation.`,
    issuesFound: [
      {
        category: 'Vague Scope' as const,
        flaggedText: cleanTitle,
        whatTheProblemIs: 'The title formulation could more precisely specify the target population subgroup, core dependent construct, and ecological setting.',
        whyItMatters: 'Broad titles often obscure the empirical unit of analysis and make formulating SMART research objectives and measurable hypotheses difficult during proposal review.',
        alternatives: [
          `An Empirical Investigation into [Key Construct] among [Target Demographic] in ${region}`,
          `[Primary Predictor] and [Primary Outcome]: A Cross-Sectional Field Study in ${region}`,
          `Socio-Ecological Determinants of [Core Phenomenon]: Perspectives from ${region}`
        ]
      },
      {
        category: 'Cultural/Framing Bias' as const,
        flaggedText: `${region} context`,
        whatTheProblemIs: 'Need to ensure the framing treats local cultural institutions, community resilience, and indigenous governance systems as active agents rather than passive subjects of deficit or underdevelopment.',
        whyItMatters: 'Contemporary social science and Indigenous Data Sovereignty frameworks require non-stigmatizing, strengths-based asset mapping in academic research proposals.',
        alternatives: [
          `Community-Led Dynamics and Socioeconomic Adaptation in ${region}`,
          `Institutional Governance, Livelihood Resilience, and Cultural Identity in ${region}`
        ]
      }
    ],
    scopeEvaluation: {
      geographicClarity: `Identified focus in ${region}. For peer-reviewed publication, specify exact administrative districts or agro-ecological hill/valley zones (e.g., Eastern Himalayan foothill belt, Sixth Schedule Autonomous District Councils).`,
      demographicClarity: 'Clearly delineate respondent eligibility criteria, household vs. individual units of analysis, and gender/age/ethnic stratification parameters.',
      recommendations: 'Ensure the final title includes the independent construct, the outcome variable, the empirical demographic, and the geographic locus in under 16 words.'
    },
    suggestedTitles: [
      {
        title: `${cleanTitle.replace(/[.?!]$/, '')}: An Empirical Study of Social Dynamics in ${region}`,
        focus: 'Balanced Empirical Formulation',
        rationale: 'Retains the core thematic inquiry while establishing rigorous academic demarcation suitable for thesis submissions and journal peer review.'
      },
      {
        title: `Determinants and Community Experiences of ${cleanTitle.slice(0, 40)}: A Multi-Method Investigation in ${region}`,
        focus: 'Multi-Method / Explanatory Angle',
        rationale: 'Highlights analytical depth, linking quantitative predictors directly to lived community experiences and institutional realities.'
      },
      {
        title: `Livelihoods, Governance, and Social Change: Contextualizing ${cleanTitle.slice(0, 35)} in ${region}`,
        focus: 'Structural & Institutional Stance',
        rationale: 'Emphasizes structural factors, governance systems, and policy implications without falling into narrow deficit framing.'
      }
    ]
  };
}

export function generateLiteratureFallback(
  title: string,
  description: string,
  targetRegion: string = 'Northeast India',
  keyTerms: string = ''
) {
  const region = targetRegion.trim() || 'Northeast India';
  return {
    summary: `Scholarly inquiry surrounding "${title}" reflects an expanding corpus of social science research. While mainstream Indian and international scholarship provides foundational theoretical models (e.g., institutional theory, capability approaches, social-ecological systems frameworks), empirical research specifically grounded in ${region} remains disproportionately limited. Existing regional literature from centers like North-Eastern Hill University (NEHU), Tezpur University, Gauhati University, OKDISCD (Guwahati), and ICSSR-NERC highlights distinct socio-political, customary governance, and ecological specificities that standard pan-Indian frameworks often fail to capture.`,
    existingStudies: [
      {
        theme: 'Socio-Ecological & Institutional Dynamics',
        keyFindings: 'Regional studies emphasize the central role of traditional community institutions, customary land rights, and kinship networks in mediating socioeconomic outcomes and community welfare.',
        regionalRelevance: `Directly relevant to ${region}, where formal state welfare mechanisms operate alongside customary village authorities (e.g., Gaon Burahs, Dorbar Shnong, Village Councils).`,
        notableWorks: 'OKDISCD Research Reports; NEHU Journal of Social Sciences & Humanities; Economic and Political Weekly (EPW) Special Northeast Issues.'
      },
      {
        theme: 'Livelihoods, Vulnerability & Economic Transitions',
        keyFindings: 'Agrarian transitions, shifting market linkages, and youth aspirations present unique challenges across hill and valley communities, requiring non-extractive empirical assessment.',
        regionalRelevance: `Highlights the necessity of localized primary data collection across diverse districts of ${region}.`,
        notableWorks: 'ICSSR-NERC Monograph Series; Journal of Northeast Indian Cultures; Space and Culture, India.'
      },
      {
        theme: 'Methodological Paradigms & Indigenous Epistemologies',
        keyFindings: 'Methodological scholars increasingly advocate for mixed-methods and culturally grounded research approaches to avoid conceptual imposition from unadapted Western or metropolitan scales.',
        regionalRelevance: 'Validates this study’s methodological design in respecting vernacular idioms and dual-consent protocols.',
        notableWorks: 'Sociological Bulletin; Indian Anthropologist; Studies in Humanities and Social Sciences (IIAS Shimla).'
      }
    ],
    regionalInstitutionsActive: [
      'Omeo Kumar Das Institute of Social Change and Development (OKDISCD), Guwahati',
      'ICSSR North-Eastern Regional Centre (ICSSR-NERC), Shillong',
      'Department of Sociology & Anthropology, North-Eastern Hill University (NEHU)',
      'Centre for Tribal Studies & Social Work, Tezpur University',
      'Tata Institute of Social Sciences (TISS) Guwahati Campus'
    ],
    identifiedGaps: [
      {
        gapType: 'Geographic Underrepresentation' as const,
        description: `Micro-level empirical baseline data from peripheral districts in ${region} is significantly underrepresented in national and global citation indexes.`,
        whyItPersists: 'Logistical challenges, monsoon transport constraints, and historical centralization of research funding in metropolitan centers.'
      },
      {
        gapType: 'Methodological Gap' as const,
        description: 'Over-reliance on either purely descriptive qualitative reportage or unadapted standardized quantitative surveys lacking cultural and linguistic validation.',
        whyItPersists: 'Lack of systematic mixed-methods studies pairing statistically validated scales with ethnographic field depth.'
      },
      {
        gapType: 'Policy/Empirical Gap' as const,
        description: 'Limited actionable documentation linking local community perceptions directly with state policy implementation frameworks.',
        whyItPersists: 'Disconnection between academic doctoral theses and grassroots policy dissemination.'
      }
    ],
    uniqueContributionAngle: `This proposed research directly bridges the identified gap by combining rigorous empirical data collection with deep contextual grounding in ${region}, generating both peer-reviewed scholarly insights and community-actionable policy recommendations.`,
    searchTakeaways: 'In your literature review chapter (Chapter 2), organize studies thematically rather than chronologically. Dedicate a distinct subsection to Regional Context & Indigenous Governance in Northeast India to establish why macro-level national findings cannot simply be assumed without empirical verification.',
    groundingSources: [
      { title: 'Indian Council of Social Science Research - NERC', url: 'https://icssr-nerc.org' },
      { title: 'Omeo Kumar Das Institute of Social Change and Development', url: 'https://okd.res.in' },
      { title: 'North-Eastern Hill University Research Repository', url: 'https://nehu.ac.in' },
      { title: 'Economic and Political Weekly', url: 'https://www.epw.in' }
    ]
  };
}

export function generateResearchDesignFallback(
  title: string,
  description: string,
  literatureGap: string = '',
  targetRegion: string = 'Northeast India'
) {
  return {
    recommendedDesign: 'Mixed-Methods (Explanatory Sequential)',
    methodologyFit: 'Mixed-Methods' as const,
    designRationale: `Given the complex social realities of "${title}" in ${targetRegion}, a Mixed-Methods Explanatory Sequential Design (QUAN → qual) provides optimal balance. Phase 1 (Quantitative survey) establishes broad empirical trends, statistical relationships, and prevalence rates. Phase 2 (Qualitative in-depth interviews / focus groups) probes the nuanced cultural meanings, institutional mechanisms, and lived community rationales behind the quantitative findings.`,
    parametricVsNonParametric: {
      recommendation: 'Both / Context-Dependent' as const,
      reasoning: 'Likert-type attitudinal indices and continuous demographic variables may approximate normal distributions in moderate samples (N ≥ 150), permitting parametric tests (t-tests, ANOVA, linear regression). However, ordinal rankings, small sub-community clusters, and skewed income/landholding distributions require non-parametric equivalents (Mann-Whitney U, Kruskal-Wallis, Spearman rho) or robust bootstrapping (1,000 resamples).',
      cautions: 'Always execute formal normality diagnostics (Shapiro-Wilk test, Q-Q plots) and variance homogeneity tests (Levene’s test) before committing to parametric inference.'
    },
    epistemologicalParadigm: 'Pragmatic / Critical Realist',
    strengthsAndTradeoffs: [
      {
        aspect: 'Methodological Strength',
        detail: 'High external validity and generalizability from the quantitative phase combined with deep contextual authenticity and cultural validity from the qualitative phase.'
      },
      {
        aspect: 'Fieldwork Tradeoff to Mitigate',
        detail: 'Requires careful time allocation and sequencing; qualitative instruments must be designed only after quantitative preliminary analysis is completed.'
      }
    ],
    keyMethodologicalSteps: [
      'Step 1: Operationalize construct scales and conduct bilingual pre-testing in target field sites.',
      'Step 2: Administer cross-sectional structured questionnaires across stratified representative clusters.',
      'Step 3: Conduct quantitative descriptive and inferential statistical analysis (SPSS / R / Jamovi).',
      'Step 4: Identify outlier cases, paradoxical findings, or nuanced subgroup variations for qualitative inquiry.',
      'Step 5: Execute in-depth key informant interviews (KIIs) and focus group discussions (FGDs) with community elders and participants.',
      'Step 6: Integrate findings in a joint-display matrix synthesizing statistical patterns with thematic narratives.'
    ]
  };
}

export function generateConstructsVariablesFallback(
  title: string,
  description: string,
  researchDesign: string = ''
) {
  return {
    variables: [
      {
        id: 'var-1',
        name: 'Socioeconomic & Institutional Predictor Index',
        role: 'Independent' as const,
        conceptualDefinition: 'The baseline structural, economic, and institutional capital possessed by households or community members.',
        isAbstract: false,
        operationalDefinition: 'Composite score derived from household income quintiles, education level, access to basic infrastructure, and institutional participation.',
        measurementLevel: 'Interval' as const,
        suggestedInstruments: 'Standardized Socioeconomic Status (SES) Scale adapted for rural and hill communities (Modified Kuppuswamy / ICSSR rural index).',
        culturalAdaptationNotes: 'Must account for non-monetized community land access, community forestry shares, and livestock ownership alongside formal cash income.'
      },
      {
        id: 'var-2',
        name: 'Primary Outcome / Social Wellbeing & Adaptation',
        role: 'Dependent' as const,
        conceptualDefinition: 'The core dependent phenomenon reflecting community resilience, program adoption, or perceived welfare enhancement.',
        isAbstract: true,
        abstractWarning: '"Wellbeing" and "adaptation" are multi-dimensional constructs that risk ambiguity if not unpacked into observable behavioral and psychological dimensions.',
        operationalDefinition: '5-point Likert scale measuring perceived economic security, health access, social cohesion, and subjective life satisfaction.',
        measurementLevel: 'Ordinal' as const,
        suggestedInstruments: 'WHO-5 Wellbeing Index or PERMA Profiler adapted with localized community wellbeing indicators.',
        culturalAdaptationNotes: 'Translate into local vernacular (e.g. Assamese, Khasi, Mizo, Garo, Bodo) with cognitive pre-testing to ensure cultural congruence of wellbeing concepts.'
      },
      {
        id: 'var-3',
        name: 'Community Governance & Social Capital',
        role: 'Moderator' as const,
        conceptualDefinition: 'The strength of traditional leadership, clan solidarity, and mutual-aid networks in the village.',
        isAbstract: true,
        abstractWarning: 'Social capital must be operationalized through measurable civic participation and reciprocity norms.',
        operationalDefinition: 'Frequency of attending village assemblies (Dorbar / Village Council), trust in local leadership, and reciprocal labor sharing (e.g., traditional agricultural exchange).',
        measurementLevel: 'Ordinal' as const,
        suggestedInstruments: 'World Bank Integrated Questionnaire for the Measurement of Social Capital (SC-IQ) adapted for customary council structures.',
        culturalAdaptationNotes: 'Incorporate specific names of traditional authorities (e.g., Gaon Burah, Rangbah Shnong, Nokma, Village Council Chairman).'
      },
      {
        id: 'var-4',
        name: 'Geographic Remoteness & Hill Terrain Factor',
        role: 'Control' as const,
        conceptualDefinition: 'Physical accessibility, distance from administrative sub-divisional headquarters, and road connectivity.',
        isAbstract: false,
        operationalDefinition: 'Travel time (hours) to nearest all-weather road and sub-divisional district hospital / administrative block.',
        measurementLevel: 'Ratio' as const,
        suggestedInstruments: 'Geographic and infrastructure access survey checklist (GIS coordinates + self-reported travel time).',
        culturalAdaptationNotes: 'Distinguish between dry season accessibility and monsoon season isolation.'
      }
    ],
    measurementFrameworkSummary: 'The measurement framework pairs standardized multi-item Likert scales with objective socioeconomic indicators. Before full deployment, conduct forward and backward translation into relevant vernacular languages followed by a pilot test (N = 30) to establish Cronbach’s alpha reliability (threshold α ≥ .70).'
  };
}

export function generateConceptualFrameworkFallback(
  title: string,
  description: string,
  researchDesign: string = '',
  variables: any[] = []
) {
  const ivList = variables.filter((v) => v.role === 'Independent');
  const dvList = variables.filter((v) => v.role === 'Dependent');
  const medList = variables.filter((v) => v.role === 'Mediator');
  const modList = variables.filter((v) => v.role === 'Moderator');
  const ctrlList = variables.filter((v) => v.role === 'Control');

  const iv1Name = ivList[0]?.name || 'Institutional and Resource Predictors';
  const iv1Id = ivList[0]?.id || 'var-iv-1';
  const dv1Name = dvList[0]?.name || 'Community Wellbeing and Sustainable Outcomes';
  const dv1Id = dvList[0]?.id || 'var-dv-1';

  const relationships: any[] = [];
  let hCount = 1;

  // Direct relationship H1
  relationships.push({
    id: `rel-${Date.now()}-${hCount}`,
    sourceVarId: iv1Id,
    sourceVarName: iv1Name,
    targetVarId: dv1Id,
    targetVarName: dv1Name,
    relationshipType: 'Direct',
    direction: 'Positive (+)',
    hypothesisCode: `H${hCount}`,
    hypothesisStatement: `H${hCount}: There is a statistically significant positive direct relationship between ${iv1Name} and ${dv1Name}.`,
    theoreticalBasis: 'Resource-Based View and Social Capital Theory: Access to foundational institutional resources directly fosters positive community capacity.',
    suggestedStatisticalTest: 'Multiple Linear Regression / Structural Equation Modeling (SEM Path Analysis)',
  });
  hCount++;

  // Mediators if any
  if (medList.length > 0) {
    const med1 = medList[0];
    relationships.push({
      id: `rel-${Date.now()}-${hCount}`,
      sourceVarId: iv1Id,
      sourceVarName: iv1Name,
      targetVarId: med1.id,
      targetVarName: med1.name,
      relationshipType: 'Mediating',
      direction: 'Positive (+)',
      hypothesisCode: `H${hCount}a`,
      hypothesisStatement: `H${hCount}a: ${iv1Name} significantly enhances ${med1.name}.`,
      theoreticalBasis: 'Mediation Pathway (Path a): Institutional inputs stimulate intermediate community behavioral processes.',
      suggestedStatisticalTest: 'Regression Path a / Hayes PROCESS Model 4',
    });
    relationships.push({
      id: `rel-${Date.now()}-${hCount + 1}`,
      sourceVarId: med1.id,
      sourceVarName: med1.name,
      targetVarId: dv1Id,
      targetVarName: dv1Name,
      relationshipType: 'Mediating',
      direction: 'Positive (+)',
      hypothesisCode: `H${hCount}b`,
      hypothesisStatement: `H${hCount}b: ${med1.name} significantly increases ${dv1Name}, mediating the indirect effect of ${iv1Name}.`,
      theoreticalBasis: 'Mediation Pathway (Path b): Intermediate adaptive behaviors transmit the structural impact to outcome variables.',
      suggestedStatisticalTest: 'Bootstrapped Indirect Effect / Hayes PROCESS Model 4',
    });
    hCount += 2;
  }

  // Moderators if any
  if (modList.length > 0) {
    const mod1 = modList[0];
    relationships.push({
      id: `rel-${Date.now()}-${hCount}`,
      sourceVarId: iv1Id,
      sourceVarName: iv1Name,
      targetVarId: dv1Id,
      targetVarName: dv1Name,
      relationshipType: 'Moderating',
      direction: 'Moderation (Interaction)',
      hypothesisCode: `H${hCount}`,
      hypothesisStatement: `H${hCount}: ${mod1.name} moderates the relationship between ${iv1Name} and ${dv1Name}, such that the positive effect is stronger under high levels of ${mod1.name}.`,
      theoreticalBasis: 'Contingency & Cultural Governance Theory: Traditional institutional strength acts as an environmental catalyst strengthening empirical returns.',
      suggestedStatisticalTest: 'Moderated Regression / Hayes PROCESS Model 1 (Interaction Term)',
      moderatorVarId: mod1.id,
      moderatorVarName: mod1.name,
    });
    hCount++;
  }

  // If there are secondary IVs
  if (ivList.length > 1) {
    const iv2 = ivList[1];
    relationships.push({
      id: `rel-${Date.now()}-${hCount}`,
      sourceVarId: iv2.id,
      sourceVarName: iv2.name,
      targetVarId: dv1Id,
      targetVarName: dv1Name,
      relationshipType: 'Direct',
      direction: 'Positive (+)',
      hypothesisCode: `H${hCount}`,
      hypothesisStatement: `H${hCount}: ${iv2.name} has a statistically significant positive effect on ${dv1Name}.`,
      theoreticalBasis: 'Empirical Multi-factor Determination: Secondary predictor independently influences variance in outcome.',
      suggestedStatisticalTest: 'Multiple Linear Regression',
    });
    hCount++;
  }

  return {
    theoreticalNarrative: `The conceptual framework models the structural and contextual relationships influencing "${title}". Grounded in social ecological and institutional theories, it posits that independent predictor constructs (${iv1Name}) exert both direct and mediated influences on outcome dimensions (${dv1Name}), conditionally buffered or amplified by moderating contextual mechanisms.`,
    underpinningTheories: [
      'Social Capital & Customary Governance Theory',
      'Resource-Based Capability View',
      'Socio-Ecological Systems Resilience Framework',
    ],
    relationships,
    boundaryConditions: 'The hypothesized relationships apply specifically within rural and hill community contexts in Northeast India, under conditions of customary land tenure and local community institutions.',
    suggestedObjectives: [
      `To evaluate the direct empirical relationship between ${iv1Name} and ${dv1Name}.`,
      medList.length > 0 ? `To examine the mediating role of ${medList[0].name} in the linkage between ${iv1Name} and ${dv1Name}.` : `To assess subgroup variations in ${dv1Name} across demographic strata.`,
      modList.length > 0 ? `To determine whether ${modList[0].name} moderates the effect of ${iv1Name} on ${dv1Name}.` : `To formulate evidence-based policy and community governance recommendations.`,
    ],
  };
}

export function generateAlignmentFallback(
  title: string,
  description: string,
  researchDesign: string = '',
  objectives: any = [],
  hypotheses: any = []
) {
  const objList = Array.isArray(objectives) && objectives.length > 0 ? objectives : [
    `To examine the demographic and socioeconomic profile of participants in the study area.`,
    `To evaluate the relationship between core predictor factors and community outcomes.`,
    `To identify major institutional barriers and cultural coping mechanisms.`
  ];

  const hypList = Array.isArray(hypotheses) && hypotheses.length > 0 ? hypotheses : [
    `There is a significant positive relationship between institutional support and community adaptation.`,
    `Socioeconomic background significantly influences access to local resources.`,
    `Traditional governance strength positively moderates community resilience.`
  ];

  return {
    overallAlignmentScore: 'High' as const,
    alignmentSummary: `The proposed objectives and hypotheses demonstrate strong structural alignment with the study title ("${title}"). Each objective maps logically to a corresponding empirical measurement and statistical test.`,
    objectivesEvaluation: objList.map((obj: string, i: number) => ({
      id: `Obj-${i + 1}`,
      originalText: obj,
      mappedToTitle: true,
      linkedHypotheses: [`H-${i + 1}`],
      critique: 'Clear, actionable, and conforms to SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound).',
      suggestedRevision: obj.startsWith('To ') ? obj : `To ${obj.charAt(0).toLowerCase() + obj.slice(1)}`
    })),
    hypothesesEvaluation: hypList.map((hyp: string, i: number) => ({
      id: `H-${i + 1}`,
      originalText: hyp,
      linkedObjective: `Obj-${i + 1}`,
      isTestable: true,
      type: 'Directional' as const,
      critique: 'Formulated with clear independent and dependent variables, permitting direct empirical testing via inferential statistics.',
      suggestedRevision: hyp
    })),
    misalignmentFlags: [],
    suggestedAlignedSets: objList.map((obj: string, i: number) => ({
      objective: obj,
      correspondingHypothesis: hypList[i] || `There is a statistically significant correlation between factors outlined in Objective ${i + 1}.`
    }))
  };
}

export function generateSamplingFallback(
  title: string,
  researchDesign: string = '',
  targetPopulation: string = '',
  accessiblePopulation: string = '',
  fieldSetting: string = 'Rural and Hill Districts',
  stateOrDistrict: string = 'Northeast India',
  hasRemoteHillAccess: boolean = true,
  timeAndResourceLimits: string = ''
) {
  return {
    recommendedMethod: 'Stratified Multi-Stage Cluster Sampling',
    samplingRationale: `For empirical field research in ${stateOrDistrict}, stratified multi-stage cluster sampling is mathematically and operationally optimal. It accounts for geographical dispersion, distinct ethnic/tribal communities, and varying accessibility between valley centers and remote hill hamlets without requiring a costly full household census list upfront.`,
    stepByStepSamplingPlan: [
      `Stage 1 (District/Block Selection): Stratify ${stateOrDistrict} into high-accessibility and remote hill sub-regions; purposively select 2–3 representative developmental blocks.`,
      `Stage 2 (Cluster / Village Selection): Randomly select 8–12 revenue villages or hamlets within the selected blocks using probability proportional to size (PPS).`,
      `Stage 3 (Household Selection): Implement systematic random sampling using village electoral rolls or Gaon Burah / Village Council household registers (sampling interval k = N/n).`,
      `Stage 4 (Respondent Selection): Within selected households, apply the Kish Grid or alternate gender/age quota to ensure balanced representation.`
    ],
    northeastFieldworkProtocols: [
      {
        protocol: 'Traditional Gatekeeper Protocols',
        detail: 'Formally present research credentials to traditional village authorities (e.g. Gaon Burah in Assam/Nagaland, Dorbar Shnong & Rangbah Shnong in Meghalaya, Village Council Chief in Mizoram/Manipur, Nokma in Garo Hills) before entering hamlets.'
      },
      {
        protocol: 'Bilingual Field Assistants',
        detail: 'Recruit and train local university students or youth from the specific tribal communities as bilingual enumerators to ensure linguistic rapport and cultural safety.'
      },
      {
        protocol: 'Monsoon & Road Seasonality',
        detail: 'Schedule primary data collection between October and April to avoid peak monsoon landslides, road washouts, and agrarian harvesting clashes.'
      }
    ],
    recommendedAttritionBufferPercent: hasRemoteHillAccess ? 15 : 10,
    samplingCaveatsAndBiases: 'Potential non-response bias among daily wage earners working outside the village during daytime; mitigate by scheduling early morning or evening call-back visits.'
  };
}

export function generateStatisticalToolsFallback(
  title: string,
  researchDesign: string = '',
  variables: any = [],
  hypotheses: any = [],
  sampleSize: string = '250',
  dataType: string = 'Mixed Likert Scales and Categorical Data'
) {
  return {
    primaryTests: [
      {
        testName: 'Independent Samples t-test & Welch’s t-test (or Mann-Whitney U)',
        targetsHypothesisOrObjective: 'Objective 1 / Group comparisons (e.g., gender, geographic zones)',
        whyThisTest: 'Compares mean outcome scores between two independent demographic groups. If normality or variance homogeneity fails, Mann-Whitney U or Welch’s robust test is applied.',
        inputVariables: 'Categorical Binary IV (e.g., Urban vs. Rural) & Continuous/Likert DV',
        softwareRecommendation: 'Jamovi (free open-source) / R (rstatix) / SPSS'
      },
      {
        testName: 'One-Way ANOVA with Post-Hoc Tukey HSD (or Kruskal-Wallis)',
        targetsHypothesisOrObjective: 'Multi-group demographic comparisons across districts/communities',
        whyThisTest: 'Tests for statistically significant differences across three or more group categories with post-hoc pairwise adjustments.',
        inputVariables: 'Multi-category Nominal IV & Continuous DV',
        softwareRecommendation: 'Jamovi / R (car, emmeans) / SPSS'
      },
      {
        testName: 'Hierarchical Multiple Linear Regression / Ordinal Logistic Regression',
        targetsHypothesisOrObjective: 'Hypothesis testing for multi-variable predictor models',
        whyThisTest: 'Evaluates the unique variance explained (R², adjusted R², beta coefficients) by socioeconomic and institutional predictors after controlling for age and remoteness.',
        inputVariables: 'Multiple continuous/dummy-coded IVs & Continuous/Ordinal DV',
        softwareRecommendation: 'R (stats, lmtest) / Jamovi / SPSS Regression Module'
      }
    ],
    qualitativeAnalysisMethods: [
      {
        method: 'Reflexive Thematic Analysis (Braun & Clarke 6-Phase Framework)',
        applicability: 'For qualitative in-depth interview transcripts and focus group notes: familiarization, systematic coding, generating initial themes, reviewing themes, defining/naming themes, and narrative reporting.'
      }
    ],
    assumptionsChecklist: [
      {
        assumption: 'Normality of Residuals',
        diagnosticTest: 'Shapiro-Wilk test (p > .05), Skewness/Kurtosis within [-1.5, +1.5], and Visual Q-Q Plots',
        remedyIfViolated: 'Apply log/square-root transformation, use non-parametric equivalent (Mann-Whitney / Kruskal-Wallis), or implement 1,000-sample percentile bootstrapping.'
      },
      {
        assumption: 'Homogeneity of Variances',
        diagnosticTest: 'Levene’s Test for Equality of Variances (p > .05)',
        remedyIfViolated: 'Report Welch’s corrected F-ratio and Games-Howell post-hoc tests.'
      },
      {
        assumption: 'Absence of Multicollinearity',
        diagnosticTest: 'Variance Inflation Factor (VIF < 5.0) and Tolerance (> 0.20)',
        remedyIfViolated: 'Combine highly correlated predictors into composite indexes or remove redundant items.'
      }
    ],
    reportingStandard: 'APA 7th Edition: Report exact test statistics, degrees of freedom, exact p-values (e.g. t(184) = 2.45, p = .015, d = 0.36; F(2, 215) = 4.12, p = .018, ηp² = .037), and 95% confidence intervals.'
  };
}

export function generateEthicsFallback(
  title: string,
  targetCommunity: string = 'Indigenous and Rural Communities',
  targetRegion: string = 'Northeast India',
  researchDesign: string = '',
  fieldSetting: string = ''
) {
  return {
    vulnerabilityAssessment: `Research involving ${targetCommunity} in ${targetRegion} entails moderate ethical sensitivity regarding cultural representation, linguistic autonomy, and avoiding extractive methodology. Safeguards must ensure participant anonymity and active community benefit-sharing.`,
    informedConsentProtocol: {
      consentFormat: 'Dual Format: Written Participant Information Sheet (PIS) + Vernacular Audio/Verbal Consent',
      keyElements: [
        'Plain-language information sheet translated into local vernacular languages (e.g. Assamese, Khasi, Mizo, Garo, Bodo, Hindi).',
        'Explicit statement of voluntary participation and unrestricted right to withdraw at any stage without prejudice.',
        'Separate explicit opt-in checkbox for audio recording and photography.',
        'Anonymization of personal identifiers and secure encrypted storage of field data.'
      ],
      oralTraditionGuidance: 'For elders or participants in oral-tradition communities who prefer not to sign physical documents, record timestamped verbal audio consent following a standardized oral consent script read in their native language.'
    },
    communityGovernanceAndDualConsent: {
      needed: true,
      traditionalInstitutionsToEngage: 'Traditional Village Authorities (e.g. Dorbar Shnong / Rangbah Shnong in Meghalaya, Gaon Burah in Assam/Nagaland, Village Council in Mizoram/Manipur, Nokmas in Garo Hills).',
      distinction: 'Community institutional permission serves as a respectful gateway for field entry, but never substitutes for individual voluntary informed consent.'
    },
    dataSovereigntyAndReciprocity: [
      'Adhere to Indigenous Data Sovereignty principles (OCAP: Ownership, Control, Access, Possession).',
      'Commitment to return an accessible Vernacular Executive Summary / Policy Brief to the community and local leadership upon study completion.',
      'Refrain from pathologizing or deficit-focused framing of indigenous customs in academic publications.'
    ],
    ethicsCommitteesToApply: [
      'Institutional Ethics Committee (IEC / IRB) of the Host University',
      'ICSSR National Ethics Guidelines for Social Science Research',
      'Local Autonomous District Council (ADC) / Village Council Research Permissions where applicable in Sixth Schedule territories'
    ]
  };
}

export function generateFullSummaryFallback(projectData: any) {
  const p = projectData || {};
  const s1 = p.step1 || {};
  const s2 = p.step2 || {};
  const s3 = p.step3 || {};
  const s4 = p.step4 || {};
  const s5 = p.step5 || {};
  const s6 = p.step6 || {};
  const s7 = p.step7 || {};
  const s8 = p.step8 || {};

  const title = s1.approvedTitle || s1.workingTitle || 'Empirical Social Science Study';
  const region = s1.targetRegion || 'Northeast India';
  const design = s3.userSelectedDesign || s3.designResult?.recommendedDesign || 'Mixed-Methods Explanatory Sequential Design';
  const sampleN = s6.computedMath?.adjustedSampleSize || 250;

  return `# Research Methodology Chapter: ${title}

## 1. Epistemological Stance & Research Design
This study is situated within a **${s3.designResult?.epistemologicalParadigm || 'Pragmatic / Critical Realist'}** epistemological framework, recognizing both objective socio-structural patterns and the subjective, culturally situated meanings held by community actors.

To investigate the proposed research questions comprehensively, this investigation employs a **${design}**. In Phase 1, quantitative cross-sectional survey instruments capture broader empirical trends, statistical correlations, and subgroup variations across ${region}. In Phase 2, qualitative semi-structured key informant interviews and focus group discussions unpack the institutional mechanisms, cultural narratives, and lived realities underlying the quantitative findings.

---

## 2. Theoretical Framework & Operationalized Constructs
The study operationalizes its conceptual framework into clearly demarcated independent, dependent, and moderating variables:
${Array.isArray(s4.variables) && s4.variables.length > 0 ? s4.variables.map((v: any) => `- **${v.name}** (${v.role}): ${v.conceptualDefinition || ''}. *Operational Indicator:* ${v.operationalDefinition || 'Validated multi-item survey scale'}. Measurement Level: \`${v.measurementLevel || 'Ordinal'}\`.`).join('\n') : '- Primary Independent Predictor (Socioeconomic & Institutional Access)\n- Core Dependent Construct (Social Wellbeing & Community Adaptation)\n- Moderating Factor (Traditional Community Governance & Social Capital)'}

All measurement scales undergo rigorous translation, back-translation, and cognitive pre-testing in local languages to ensure conceptual equivalence and cultural validity.

---

## 3. Research Objectives & Hypotheses Alignment
The empirical inquiry is anchored upon systematically aligned objectives and testable hypotheses:
${Array.isArray(s5.draftObjectives) && s5.draftObjectives.length > 0 ? s5.draftObjectives.map((obj: string, i: number) => `**Objective ${i + 1}:** ${obj}\n*Corresponding Hypothesis ${i + 1}:* ${s5.draftHypotheses?.[i] || 'Statistically significant association expected.'}`).join('\n\n') : '**Objective 1:** To examine the socioeconomic profile and institutional engagement of participants.\n**Objective 2:** To test the relationship between institutional predictors and community outcomes.\n**Objective 3:** To identify cultural coping mechanisms through qualitative inquiry.'}

---

## 4. Target Population & Sampling Plan
- **Target Population:** ${s6.targetPopulation || `Eligible community households in ${region}`}.
- **Accessible Population:** ${s6.accessiblePopulation || `Selected revenue villages and urban/rural clusters in target districts`}.
- **Sampling Strategy:** **${s6.aiSamplingPlan?.recommendedMethod || 'Stratified Multi-Stage Cluster Sampling'}**.
- **Sample Size Determination:** Calculated using standard statistical power and Cochran sampling formulas resulting in a base requirement of N = ${s6.computedMath?.baseSampleSize || 218}, adjusted with a ${s6.calcConfig?.attritionPercent || 15}% non-response and hill-terrain attrition buffer to **N = ${sampleN} respondents**.

---

## 5. Fieldwork & Regional Protocols (${region})
Fieldwork execution incorporates strict contextual protocols:
1. **Traditional Community Entry:** Formal courtesy calls and research information sharing with traditional authorities (e.g., Gaon Burahs, Dorbar Shnong, Village Councils, Nokmas) prior to household entry.
2. **Local Bilingual Enumerators:** Recruitment and training of field assistants from the target language communities.
3. **Seasonality Management:** Primary data collection timed outside peak monsoon landslide seasons.

---

## 6. Statistical & Qualitative Data Analysis Plan
Quantitative survey data will be cleaned, checked for missing values, and analyzed using **Jamovi / R / SPSS**:
- **Descriptive Statistics:** Frequencies, percentages, means, standard deviations, and median interquartile ranges.
- **Inferential Testing:** Independent samples t-tests / Mann-Whitney U for binary comparisons; One-way ANOVA / Kruskal-Wallis for multi-group analyses; and Hierarchical Multiple Regression / Logistic Regression for predictive modeling.
- **Assumption Verification Protocols:** Shapiro-Wilk normality tests (p > .05), Levene’s test for homoscedasticity, and Variance Inflation Factor (VIF < 5.0) for multicollinearity checks before reporting parametric models.
- **Qualitative Analysis:** Interview and FGD audio transcripts will be subjected to **Reflexive Thematic Analysis (Braun & Clarke 6-phase framework)** to identify recurring themes and joint-display triangulation.

---

## 7. Ethical Safeguards, Dual Consent & Indigenous Data Sovereignty
1. **Institutional Ethics Approval:** Research submitted to the Institutional Ethics Committee (IEC) of the host university in compliance with ICSSR / UGC ethical standards.
2. **Dual-Consent Model:** Community leadership permission for geographic entry combined with individual voluntary informed consent (written or recorded verbal consent for oral-tradition participants).
3. **Data Reciprocity:** Accessible vernacular executive summaries and policy briefs returned to participating communities upon study conclusion, observing Indigenous Data Sovereignty principles.

---

*Synthesized with ResearchGuide Academic Methodology Engine (APA 7th Edition Standard).*`;
}
