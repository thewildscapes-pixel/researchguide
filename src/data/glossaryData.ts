export interface GlossaryTerm {
  id: string;
  term: string;
  category: 'Methodology & Design' | 'Statistics & Measurement' | 'Northeast India & Governance' | 'Ethics & Epistemology';
  definition: string;
  practicalExample: string;
  relevantSteps: number[];
  tags: string[];
}

export const ACADEMIC_GLOSSARY_DATA: GlossaryTerm[] = [
  {
    id: 'explanatory-sequential',
    term: 'Explanatory Sequential Design (QUAN → qual)',
    category: 'Methodology & Design',
    definition: 'A two-phase mixed-methods design where quantitative data collection and statistical analysis occur first, followed by qualitative inquiry designed specifically to explain, deepen, or contextualize the quantitative findings.',
    practicalExample: 'Administering a survey to 300 farming households to measure adoption rates of climate-resilient seeds, followed by in-depth qualitative interviews with 15 outliers who rejected the seeds.',
    relevantSteps: [3, 7, 9],
    tags: ['Mixed-Methods', 'Creswell', 'Research Design']
  },
  {
    id: 'sixth-schedule',
    term: 'Sixth Schedule Autonomous District Councils (ADCs)',
    category: 'Northeast India & Governance',
    definition: 'A constitutional provision under Article 244(2) of the Indian Constitution granting legislative, judicial, and executive autonomy to designated tribal areas in Assam, Meghalaya, Tripura, and Mizoram. Fieldwork in these regions frequently involves coordination with ADC authorities.',
    practicalExample: 'Conducting livelihood studies in the Karbi Anglong Autonomous Council (KAAC) or Khasi Hills Autonomous District Council (KHADC) territories requiring protocol alignment with district council bylaws.',
    relevantSteps: [1, 6, 8, 9],
    tags: ['Governance', 'Constitutional Law', 'Northeast India']
  },
  {
    id: 'gaon-burah',
    term: 'Gaon Burah / Village Council Headman',
    category: 'Northeast India & Governance',
    definition: 'The traditional hereditary or appointed village headman in Assam, Nagaland, and neighboring regions who serves as the customary leader, dispute arbitrator, and primary community gatekeeper for village administrative entry.',
    practicalExample: 'Presenting institutional university credentials and project information to the Gaon Burah before distributing survey questionnaires across rural revenue hamlets.',
    relevantSteps: [6, 8],
    tags: ['Gatekeeper', 'Traditional Leadership', 'Fieldwork Protocol']
  },
  {
    id: 'dorbar-shnong',
    term: 'Dorbar Shnong & Rangbah Shnong',
    category: 'Northeast India & Governance',
    definition: 'The traditional grassroots indigenous governance institution of the Khasi people in Meghalaya, presided over by the Rangbah Shnong (elected village headman). It governs customary affairs, village welfare, and community consent.',
    practicalExample: 'Holding a preliminary consultation with the Dorbar Shnong in East Khasi Hills to brief community elders on the study aims prior to qualitative focus group sessions.',
    relevantSteps: [6, 8],
    tags: ['Customary Law', 'Meghalaya', 'Dual-Consent']
  },
  {
    id: 'nokma',
    term: 'Nokma (A’king Nokma)',
    category: 'Northeast India & Governance',
    definition: 'The traditional custodian of clan land (A’king land) in the matrilineal Garo community of Meghalaya and Assam, serving as both political leader and steward of customary community boundaries.',
    practicalExample: 'Consulting the A’king Nokma when conducting ecological land-use or agro-forestry resource mapping studies in the Garo Hills.',
    relevantSteps: [6, 8],
    tags: ['Matrilineal Society', 'Garo Hills', 'Land Rights']
  },
  {
    id: 'indigenous-data-sovereignty',
    term: 'Indigenous Data Sovereignty (OCAP Principles)',
    category: 'Ethics & Epistemology',
    definition: 'The right of Indigenous and tribal communities to govern the collection, ownership, application, and stewardship of data about their peoples, lands, cultural traditions, and resources (Ownership, Control, Access, Possession).',
    practicalExample: 'Returning vernacular executive summaries and policy briefs to village council archives rather than treating community knowledge solely as extractive material for distant journals.',
    relevantSteps: [2, 8, 9],
    tags: ['Data Ethics', 'OCAP', 'Decolonizing Methodologies']
  },
  {
    id: 'dual-consent-model',
    term: 'Dual-Consent Protocol',
    category: 'Ethics & Epistemology',
    definition: 'A two-tiered ethical consent framework required in customary tribal contexts where collective community gatekeeper permission (Tier 1) is respected for geographical entry, but never replaces individual, voluntary informed consent (Tier 2).',
    practicalExample: 'Securing village council approval to hold research sessions in the community hall, while ensuring every individual respondent independently signs or audio-records personal informed consent.',
    relevantSteps: [8, 9],
    tags: ['Research Ethics', 'Informed Consent', 'Field Protocols']
  },
  {
    id: 'operationalization',
    term: 'Operationalization of Constructs',
    category: 'Statistics & Measurement',
    definition: 'The process of strictly defining theoretical, abstract concepts into measurable, observable empirical variables and survey scale indicators.',
    practicalExample: 'Transforming the abstract construct "Social Cohesion" into a 5-item Likert scale measuring attendance at community festivals, neighbor mutual-aid frequency, and perceived trust.',
    relevantSteps: [4, 5, 7],
    tags: ['Measurement', 'Construct Validity', 'Variables']
  },
  {
    id: 'cronbach-alpha',
    term: 'Cronbach’s Alpha (Internal Consistency Reliability)',
    category: 'Statistics & Measurement',
    definition: 'A statistical coefficient (ranging from 0 to 1) evaluating whether multiple questionnaire items designed to measure the same underlying construct produce consistent, correlated responses. A value of α ≥ .70 is the accepted threshold.',
    practicalExample: 'Calculating α = .84 across an 8-item psychological resilience questionnaire after administering a bilingual pilot test with 30 respondents in Guwahati.',
    relevantSteps: [4, 6, 7],
    tags: ['Psychometrics', 'Reliability', 'Survey Design']
  },
  {
    id: 'kish-grid',
    term: 'Kish Grid Selection',
    category: 'Methodology & Design',
    definition: 'A probabilistic sampling technique used in household surveys where all eligible members of a visited household are enumerated, and a pre-assigned randomized selection matrix designates exactly which individual must be interviewed to eliminate selection bias.',
    practicalExample: 'Using a Kish grid in rural cluster sampling to ensure youth and women are interviewed with equal probability rather than defaulting only to household heads present at the front door.',
    relevantSteps: [6],
    tags: ['Sampling', 'Randomization', 'Field Survey']
  },
  {
    id: 'braun-clarke-thematic',
    term: 'Reflexive Thematic Analysis (Braun & Clarke)',
    category: 'Methodology & Design',
    definition: 'A 6-phase qualitative analytical framework for identifying, analyzing, and reporting patterns (themes) across interview transcripts and focus group qualitative data: (1) Familiarization, (2) Coding, (3) Generating initial themes, (4) Reviewing themes, (5) Defining themes, (6) Producing the report.',
    practicalExample: 'Coding 24 transcribed vernacular interviews with traditional weaving artisans to derive core structural themes regarding market access and cultural preservation.',
    relevantSteps: [3, 7, 9],
    tags: ['Qualitative', 'Thematic Analysis', 'Coding']
  },
  {
    id: 'homoscedasticity',
    term: 'Homoscedasticity (Equal Variances)',
    category: 'Statistics & Measurement',
    definition: 'The assumption in parametric statistical tests (like ANOVA and Linear Regression) that the error residuals or group variances are equal across all levels of the predictor variable, typically verified using Levene’s test.',
    practicalExample: 'Running Levene’s test before conducting a One-Way ANOVA comparing income across three districts; if p < .05, Welch’s robust ANOVA is reported instead.',
    relevantSteps: [3, 7],
    tags: ['Diagnostics', 'ANOVA', 'Regression Assumptions']
  },
  {
    id: 'shapiro-wilk',
    term: 'Shapiro-Wilk Normality Test',
    category: 'Statistics & Measurement',
    definition: 'A formal hypothesis test assessing whether a continuous sample distribution significantly deviates from a normal Gaussian distribution. If p < .05, the assumption of normality is violated, indicating the need for non-parametric tests or bootstrapping.',
    practicalExample: 'Testing survey score distributions in Jamovi or R; discovering severe skewness in rural travel times, leading the researcher to apply the Mann-Whitney U test.',
    relevantSteps: [3, 7],
    tags: ['Normality', 'Parametric Tests', 'Inferential Statistics']
  },
  {
    id: 'critical-realism',
    term: 'Critical Realism Epistemology',
    category: 'Ethics & Epistemology',
    definition: 'A philosophical stance asserting that an objective physical and social reality exists independently of human thought (the "real" domain), but our knowledge of that reality is socially conditioned and imperfectly understood through empirical observations and human experiences.',
    practicalExample: 'Recognizing that structural poverty exists as an empirical reality (measurable via survey indicators), while lived dignity and coping mechanisms are socially constructed and best understood qualitatively.',
    relevantSteps: [1, 3, 9],
    tags: ['Epistemology', 'Philosophy of Science', 'Social Theory']
  },
  {
    id: 'joint-display',
    term: 'Joint-Display Matrix (Mixed-Methods Integration)',
    category: 'Methodology & Design',
    definition: 'A visual tabular framework in mixed-methods manuscripts that arrays quantitative statistical findings side-by-side with qualitative narrative quotes and thematic codes to demonstrate explicit theoretical integration.',
    practicalExample: 'Presenting a table showing high survey ratings for government health centers on the left column alongside qualitative quotes detailing frequent medicine stockouts on the right column.',
    relevantSteps: [3, 7, 9],
    tags: ['Integration', 'Mixed-Methods', 'Data Visualization']
  }
];
