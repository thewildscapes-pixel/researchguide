import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import {
  generateTitleFallback,
  generateLiteratureFallback,
  generateResearchDesignFallback,
  generateConstructsVariablesFallback,
  generateConceptualFrameworkFallback,
  generateAlignmentFallback,
  generateSamplingFallback,
  generateStatisticalToolsFallback,
  generateEthicsFallback,
  generateFullSummaryFallback,
} from './src/server/offlineFallbackEngines';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Google GenAI client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is missing.');
    }
    genAIClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Supported models for text & reasoning tasks in Google AI Studio
const FALLBACK_MODELS = [
  'gemini-3.7-flash',
  'gemini-flash-latest',
];

interface GenerateOptions {
  responseMimeType?: string;
  tools?: any[];
  temperature?: number;
}

// Centralized resilient AI generator with automatic model fallback & retry
async function generateWithFallback(
  prompt: string,
  options: GenerateOptions = {}
): Promise<{ text?: string; candidates?: any[] }> {
  const ai = getGenAI();
  let lastError: any = null;

  for (let i = 0; i < FALLBACK_MODELS.length; i++) {
    const model = FALLBACK_MODELS[i];
    try {
      const config: any = {};
      if (options.responseMimeType) {
        config.responseMimeType = options.responseMimeType;
      }
      if (options.tools) {
        config.tools = options.tools;
      }
      if (options.temperature !== undefined) {
        config.temperature = options.temperature;
      }

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      return response;
    } catch (err: any) {
      lastError = err;
      const errString = String(err?.message || err || '');
      const isQuotaOrRateLimit =
        err?.status === 429 ||
        err?.code === 429 ||
        errString.includes('429') ||
        errString.includes('RESOURCE_EXHAUSTED') ||
        errString.includes('Quota exceeded') ||
        errString.includes('rate_limit');

      const isUnavailable =
        err?.status === 503 ||
        err?.code === 503 ||
        errString.includes('503') ||
        errString.includes('UNAVAILABLE') ||
        errString.includes('overloaded');

      // If search tool was passed and failed, try again immediately without search tools
      if (options.tools && options.tools.length > 0) {
        try {
          console.warn(`Search tool generation failed on ${model}. Retrying standard generation without search tool...`);
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: options.responseMimeType ? { responseMimeType: options.responseMimeType } : undefined,
          });
          return response;
        } catch (retryErr: any) {
          lastError = retryErr;
        }
      }

      if (isQuotaOrRateLimit || isUnavailable) {
        console.warn(`Model ${model} returned quota/rate-limit. Trying next fallback model...`);
        await new Promise((resolve) => setTimeout(resolve, 300));
        continue;
      }

      console.warn(`Model ${model} failed:`, errString);
      continue;
    }
  }

  // If all models failed, construct clean error message
  const rawMsg = lastError?.message || String(lastError || 'Service temporarily unavailable');
  let cleanMsg = rawMsg;
  try {
    const jsonMatch = rawMsg.match(/\{[\s\S]*"error"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed?.error?.message) {
        cleanMsg = parsed.error.message;
      }
    }
  } catch {
    // Keep raw message
  }

  if (
    cleanMsg.includes('Quota exceeded') ||
    cleanMsg.includes('RESOURCE_EXHAUSTED') ||
    cleanMsg.includes('429')
  ) {
    cleanMsg =
      'Gemini API Free Tier rate limit reached. Please wait 15-30 seconds and click retry, or attach a billing account in Google Cloud / AI Studio for unlimited quota.';
  }

  throw new Error(cleanMsg);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasApiKey: !!process.env.GEMINI_API_KEY });
});

// Helper to safely parse JSON from Gemini response
function safeParseJson(text: string | undefined, defaultVal: any) {
  if (!text) return defaultVal;
  try {
    const cleaned = text
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '');
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse JSON from Gemini:', text, err);
    return defaultVal;
  }
}

// STEP 1: Title & Topic Bias/Validity Analysis
app.post('/api/analyze-title', async (req, res) => {
  const { workingTitle, description, targetRegion } = req.body;
  if (!workingTitle || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  try {
    const prompt = `You are a senior social science methodologist and academic reviewer with expertise in high-impact international journals and specific sensitivity to research in Northeast India (Assam, Meghalaya, Nagaland, Manipur, Mizoram, Tripura, Arunachal Pradesh, Sikkim) as well as global indigenous and marginalized contexts.

Analyze this working research title and description:
Working Title: "${workingTitle}"
Description: "${description}"
Target Geographic/Community Scope: "${targetRegion || 'Northeast India / General'}"

Thoroughly evaluate:
1. Loaded, leading, or culturally biased language (e.g. deficit framing like "backwardness", "tribal mindset", "lack of modern awareness", "insurgency-ridden", framing that "others" a community, ethnocentric assumptions from mainland-India or Western literature applied uncritically to Northeast Indian or indigenous contexts).
2. Vague, non-researchable, or colloquial phrasing (e.g. "problems faced by", "study on how to fix").
3. Clarity and specificity of geographic, demographic, and temporal scope.

Return a valid JSON object matching this exact structure:
{
  "overallAssessment": "Brief high-level constructive assessment (2-3 sentences)",
  "issuesFound": [
    {
      "category": "Cultural/Framing Bias" | "Non-Researchable Phrasing" | "Vague Scope" | "Deficit Framing",
      "flaggedText": "the specific problematic words or phrasing",
      "whatTheProblemIs": "Clear explanation of what the bias/problem is",
      "whyItMatters": "Why this matters for research validity, peer review, and ethical representation of the community",
      "alternatives": ["Alternative phrasing 1", "Alternative phrasing 2", "Alternative phrasing 3"]
    }
  ],
  "scopeEvaluation": {
    "geographicClarity": "Well Defined" | "Somewhat Vague" | "Missing",
    "demographicClarity": "Well Defined" | "Somewhat Vague" | "Missing",
    "recommendations": "Specific advice on geographic/community precision"
  },
  "suggestedTitles": [
    {
      "title": "Clear, publishable revised title option 1",
      "focus": "Academic & balanced focus",
      "rationale": "Why this title is stronger and publication-ready"
    },
    {
      "title": "Clear, publishable revised title option 2",
      "focus": "Empirical/Community-grounded focus",
      "rationale": "Why this title is stronger"
    },
    {
      "title": "Clear, publishable revised title option 3",
      "focus": "Policy/Socio-ecological focus",
      "rationale": "Why this title is stronger"
    }
  ]
}`;

    const response = await generateWithFallback(prompt, {
      responseMimeType: 'application/json',
    });

    const result = safeParseJson(response.text, null);
    if (result && result.overallAssessment) {
      return res.json(result);
    }
    throw new Error('Incomplete response received from model');
  } catch (error: any) {
    console.warn('Falling back to local academic heuristic engine for title analysis:', error.message);
    const fallback = generateTitleFallback(workingTitle, description, targetRegion);
    res.json(fallback);
  }
});

// STEP 2: Literature Context with Search Grounding
app.post('/api/literature-context', async (req, res) => {
  const { title, description, targetRegion, keyTerms } = req.body;

  try {
    const prompt = `You are a research literature specialist helping a social science researcher map the academic landscape.
Research Title: "${title}"
Description: "${description}"
Geographic Focus: "${targetRegion || 'Northeast India'}"
Key Terms: "${keyTerms || ''}"

Perform a targeted search of academic literature. Pay special attention to peer-reviewed studies, international social science journals, and reputable Northeast India research bodies (such as North-Eastern Hill University [NEHU], Tezpur University, IIT Guwahati, ICSSR-NERC, Omeo Kumar Das Institute of Social Change and Development [OKDISCD], Gauhati University, Rajiv Gandhi University).

Analyze and organize your findings into:
1. What has already been published / studied on this or adjacent topics (synthesize key empirical findings).
2. Existing or recent studies in Northeast India, South Asia, or global indigenous/marginalized contexts.
3. Identify the specific literature gap that this proposed study can fill (especially where Northeast India or regional empirical evidence is underrepresented in the pan-India or global literature).
4. How this study's proposed angle differs and makes an original contribution.

Provide clear, honest assessment. Do not fabricate citations; cite genuine works and research themes.

Format your response in structured JSON with:
{
  "summary": "2-3 paragraph synthesis of current literature state",
  "existingStudies": [
    {
      "theme": "Theme or subfield",
      "keyFindings": "What current research shows",
      "regionalRelevance": "How this relates to Northeast India or similar contexts",
      "notableWorks": "Representative authors, journals, or research institutions"
    }
  ],
  "regionalInstitutionsActive": [
    "List of 3-5 relevant research institutes, departments, or journals (e.g. OKDISCD, ICSSR-NERC, NEHU Journal of Social Sciences & Humanities, etc.)"
  ],
  "identifiedGaps": [
    {
      "gapType": "Geographic Underrepresentation" | "Methodological Gap" | "Theoretical Disconnect" | "Policy/Empirical Gap",
      "description": "Precise articulation of what is missing in current literature",
      "whyItPersists": "Why this gap exists (e.g. lack of localized data, uncritical application of Western frameworks)"
    }
  ],
  "uniqueContributionAngle": "How the researcher's study specifically addresses the gap and builds a novel contribution",
  "searchTakeaways": "Key advice for the researcher's literature review chapter"
}`;

    const response = await generateWithFallback(prompt, {
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
    });

    const parsed = safeParseJson(response.text, {});
    if (parsed && parsed.summary && parsed.existingStudies) {
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const webSources = groundingChunks
        .filter((chunk: any) => chunk.web && chunk.web.uri)
        .map((chunk: any) => ({
          title: chunk.web.title || chunk.web.uri,
          url: chunk.web.uri,
        }));

      return res.json({
        ...parsed,
        groundingSources: webSources.length > 0 ? webSources : [
          { title: 'ICSSR North-Eastern Regional Centre', url: 'https://icssr-nerc.org' },
          { title: 'OKD Institute of Social Change and Development', url: 'https://okd.res.in' }
        ],
      });
    }
    throw new Error('Incomplete response from literature model');
  } catch (error: any) {
    console.warn('Falling back to local academic heuristic engine for literature context:', error.message);
    const fallback = generateLiteratureFallback(title, description, targetRegion, keyTerms);
    res.json(fallback);
  }
});

// STEP 3: Research Type & Design Recommendation
app.post('/api/research-design', async (req, res) => {
  const { title, description, literatureGap, targetRegion } = req.body;

  try {
    const prompt = `You are a social science research methodologist.
Recommend the optimal research design, paradigm, and statistical approach for this study:
Title: "${title}"
Description: "${description}"
Literature Gap: "${literatureGap || ''}"
Field Context: "${targetRegion || 'Northeast India (may involve small accessible populations, hill terrain, tribal/rural communities, multilingual contexts)'}"

Provide a thorough, pedagogically rich recommendation considering field realities in social sciences (including when sample sizes in remote hill/tribal districts may be modest, data distributions may be skewed/non-normal, or mixed-methods are required for deep cultural validity).

Format as JSON:
{
  "recommendedDesign": "Exploratory" | "Descriptive" | "Explanatory" | "Causal-Comparative" | "Mixed-Methods (Explanatory Sequential)" | "Mixed-Methods (Convergent Parallel)" | "Phenomenological / Qualitative",
  "methodologyFit": "Quantitative" | "Qualitative" | "Mixed-Methods",
  "designRationale": "Clear, educational explanation of why this design is best suited to the research problem",
  "parametricVsNonParametric": {
    "recommendation": "Parametric" | "Non-Parametric" | "Both / Context-Dependent",
    "reasoning": "Why this approach is recommended given data types (nominal, ordinal, interval), likely distribution shapes, and sample accessibility in Northeast India social research",
    "cautions": "What assumption tests (Shapiro-Wilk, Levene's) must precede the choice"
  },
  "epistemologicalParadigm": "Post-Positivist / Constructivist / Transformative / Pragmatic",
  "strengthsAndTradeoffs": [
    { "aspect": "Strength", "detail": "..." },
    { "aspect": "Limitation / Challenge to Mitigate", "detail": "..." }
  ],
  "keyMethodologicalSteps": [
    "Step 1...",
    "Step 2...",
    "Step 3...",
    "Step 4..."
  ]
}`;

    const response = await generateWithFallback(prompt, {
      responseMimeType: 'application/json',
    });

    const parsed = safeParseJson(response.text, null);
    if (parsed && parsed.recommendedDesign) {
      return res.json(parsed);
    }
    throw new Error('Incomplete response from research design model');
  } catch (error: any) {
    console.warn('Falling back to local academic heuristic engine for research design:', error.message);
    const fallback = generateResearchDesignFallback(title, description, literatureGap, targetRegion);
    res.json(fallback);
  }
});

// STEP 4: Constructs, Variables & Operational Definitions
app.post('/api/constructs-variables', async (req, res) => {
  const { title, description, researchDesign } = req.body;

  try {
    const prompt = `You are a measurement and construct operationalization expert in social sciences.
Help the researcher define and operationalize their variables for:
Title: "${title}"
Description: "${description}"
Design: "${researchDesign || ''}"

Identify:
1. Independent Variables (IVs), Dependent Variables (DVs), Mediators, Moderators, and Control Variables (or Key Phenomenological Themes for qualitative studies).
2. Flag abstract or vague constructs (e.g. "wellbeing", "empowerment", "indigenous resilience", "social harmony") that need explicit operational definitions and measurement indicators.
3. Suggest existing validated scales or standard measurement tools (e.g., Likert-type scales, socioeconomic indices, WHO/UNDP standardized instruments).
4. Flag cultural and linguistic adaptation requirements (such as forward and back-translation into Assamese, Khasi, Mizo, Nagamese, Bodo, Meiteilon, etc., cognitive pre-testing, and local idiom checks).

Format as JSON:
{
  "variables": [
    {
      "name": "Variable Name",
      "role": "Independent" | "Dependent" | "Mediator" | "Moderator" | "Control" | "Qualitative Theme",
      "conceptualDefinition": "Theoretical meaning of the construct",
      "isAbstract": true | false,
      "abstractWarning": "Why this construct is too abstract as stated and how to specify it",
      "operationalDefinition": "Concrete, observable indicators and measurement method",
      "measurementLevel": "Nominal" | "Ordinal" | "Interval" | "Ratio" | "Qualitative / Narrative",
      "suggestedInstruments": "Established scale, survey items, or indicator matrix",
      "culturalAdaptationNotes": "Specific advice on vernacular translation, cognitive interviews, or local cultural validity in Northeast India"
    }
  ],
  "measurementFrameworkSummary": "Advice on constructing the final survey instrument or interview protocol"
}`;

    const response = await generateWithFallback(prompt, {
      responseMimeType: 'application/json',
    });

    const parsed = safeParseJson(response.text, null);
    if (parsed && Array.isArray(parsed.variables) && parsed.variables.length > 0) {
      return res.json(parsed);
    }
    throw new Error('Incomplete response from constructs model');
  } catch (error: any) {
    console.warn('Falling back to local academic heuristic engine for constructs:', error.message);
    const fallback = generateConstructsVariablesFallback(title, description, researchDesign);
    res.json(fallback);
  }
});

// STEP 5: Conceptual Framework & Hypotheses Generation & Relational Mapping
app.post('/api/conceptual-framework', async (req, res) => {
  const { title, description, researchDesign, variables } = req.body;

  try {
    const prompt = `You are an expert social science research methodologist specializing in conceptual model building, path diagrams, and hypothesis formulation.
Study Title: "${title}"
Description: "${description}"
Design: "${researchDesign || 'Empirical Social Science'}"

Identified Constructs & Variables from Step 4:
${Array.isArray(variables) && variables.length > 0
  ? JSON.stringify(variables.map((v: any) => ({ name: v.name, role: v.role, level: v.measurementLevel, def: v.operationalDefinition })))
  : 'Variables: Independent Predictor, Dependent Outcome, Contextual Moderator, Mediating Process.'}

Develop a comprehensive Conceptual Framework that clearly specifies:
1. The theoretical narrative connecting these constructs.
2. 2-3 Underpinning theories (e.g., Social Capital Theory, Theory of Planned Behavior, Institutional Adaptation Theory).
3. The exact relational paths connecting the variables, with hypothesis codes (H1, H2, H3...), path directions (Positive (+), Negative (-), Moderation (Interaction), or Non-directional), theoretical rationale, and recommended statistical test (e.g. Multiple Regression, SEM, Hayes PROCESS Model 1/4).
4. Suggested matching Research Objectives (RO1, RO2, RO3).
5. Boundary conditions / contextual scope.

Format as JSON:
{
  "theoreticalNarrative": "A structured academic narrative explaining how the independent variables drive outcomes through mediating mechanisms, moderated by contextual factors.",
  "underpinningTheories": ["Theory 1 (Author/Year)", "Theory 2 (Author/Year)"],
  "relationships": [
    {
      "id": "rel-1",
      "sourceVarId": "var-1",
      "sourceVarName": "Name of Independent Variable",
      "targetVarId": "var-2",
      "targetVarName": "Name of Dependent Variable",
      "relationshipType": "Direct" | "Mediating" | "Moderating" | "Correlational",
      "direction": "Positive (+)" | "Negative (-)" | "Non-directional" | "Moderation (Interaction)",
      "hypothesisCode": "H1",
      "hypothesisStatement": "Full testable hypothesis sentence",
      "theoreticalBasis": "Why this path is justified theoretically",
      "suggestedStatisticalTest": "e.g. Multiple Linear Regression / SEM",
      "moderatorVarId": "optional-var-id",
      "moderatorVarName": "optional-var-name"
    }
  ],
  "suggestedObjectives": [
    "To analyze the direct effect of...",
    "To assess the mediating role of..."
  ],
  "boundaryConditions": "Contextual limits (e.g., rural hill communities, customary governance tenure)"
}`;

    const response = await generateWithFallback(prompt, {
      responseMimeType: 'application/json',
    });

    const parsed = safeParseJson(response.text, null);
    if (parsed && Array.isArray(parsed.relationships) && parsed.relationships.length > 0) {
      return res.json(parsed);
    }
    throw new Error('Incomplete response from conceptual framework model');
  } catch (error: any) {
    console.warn('Falling back to local academic heuristic engine for conceptual framework:', error.message);
    const fallback = generateConceptualFrameworkFallback(title, description, researchDesign, variables);
    res.json(fallback);
  }
});

// STEP 5: Objectives & Hypotheses Alignment Check
app.post('/api/check-alignment', async (req, res) => {
  const { title, description, researchDesign, objectives, hypotheses } = req.body;

  try {
    const prompt = `You are a dissertation and grant committee reviewer evaluating research alignment.
Research Title: "${title}"
Description: "${description}"
Design: "${researchDesign || 'Empirical Social Science'}"

Draft Objectives provided by researcher:
${Array.isArray(objectives) ? objectives.map((obj: string, i: number) => `Objective ${i + 1}: ${obj}`).join('\n') : objectives}

Draft Hypotheses / Research Questions provided by researcher:
${Array.isArray(hypotheses) ? hypotheses.map((hyp: string, i: number) => `Hypothesis ${i + 1}: ${hyp}`).join('\n') : hypotheses}

Perform a rigorous alignment audit:
1. Does each objective map directly back to the title and research scope?
2. Does each hypothesis explicitly map to one or more objectives?
3. Is each hypothesis formulated in testable, directional or non-directional form appropriate to the design (or research questions for exploratory/qualitative)?
4. Explicitly flag any misalignments (e.g. "Objective 3 is not reflected in any hypothesis" or "Hypothesis 2 does not trace to an objective").

Format as JSON:
{
  "overallAlignmentScore": "High" | "Moderate" | "Needs Revision",
  "alignmentSummary": "2-3 sentences evaluating overall logical coherence",
  "objectivesEvaluation": [
    {
      "id": "Obj-1",
      "originalText": "...",
      "mappedToTitle": true | false,
      "linkedHypotheses": ["H1"],
      "critique": "Assessment of clarity, researchability, and SMART criteria",
      "suggestedRevision": "Sharpened, actionable phrasing if needed"
    }
  ],
  "hypothesesEvaluation": [
    {
      "id": "H-1",
      "originalText": "...",
      "linkedObjective": "Obj-1",
      "isTestable": true | false,
      "type": "Directional" | "Non-Directional" | "Null" | "Qualitative Research Question",
      "critique": "Assessment of statistical/empirical testability",
      "suggestedRevision": "Improved testable formulation"
    }
  ],
  "misalignmentFlags": [
    {
      "type": "Unmapped Objective" | "Orphan Hypothesis" | "Untestable Statement" | "Scope Drift",
      "severity": "Warning" | "Critical",
      "message": "Clear explanation of the misalignment",
      "remedy": "Concrete actionable step to resolve"
    }
  ],
  "suggestedAlignedSets": [
    {
      "objective": "Polished Objective 1",
      "correspondingHypothesis": "Properly aligned Hypothesis 1"
    }
  ]
}`;

    const response = await generateWithFallback(prompt, {
      responseMimeType: 'application/json',
    });

    const parsed = safeParseJson(response.text, null);
    if (parsed && parsed.overallAlignmentScore) {
      return res.json(parsed);
    }
    throw new Error('Incomplete response from alignment model');
  } catch (error: any) {
    console.warn('Falling back to local academic heuristic engine for alignment check:', error.message);
    const fallback = generateAlignmentFallback(title, description, researchDesign, objectives, hypotheses);
    res.json(fallback);
  }
});

// STEP 6: Sampling Recommendation (with Regional Field Nuance)
app.post('/api/sampling-recommendation', async (req, res) => {
  const {
    title,
    researchDesign,
    targetPopulation,
    accessiblePopulation,
    fieldSetting,
    stateOrDistrict,
    hasRemoteHillAccess,
    timeAndResourceLimits,
  } = req.body;

  try {
    const prompt = `You are a social science sampling and fieldwork methodologist specializing in field research in Northeast India.
Study: "${title}"
Design: "${researchDesign}"
Target Population: "${targetPopulation}"
Accessible Population: "${accessiblePopulation}"
Field Setting: "${fieldSetting || 'Mixed Rural/Urban/Hill'}"
Specific Geography/District: "${stateOrDistrict || 'Northeast India'}"
Remote / Hill Terrain Involved: ${hasRemoteHillAccess ? 'Yes' : 'No'}
Constraints: "${timeAndResourceLimits || 'Standard academic master/doctoral timeline'}"

Provide an expert sampling recommendation that balances statistical rigor with Northeast India field realities:
- Dispersed rural/hill hamlets, seasonal monsoon road blockages.
- Multilingual and multi-ethnic composition.
- Crucial community entry and gatekeeper protocols (e.g., Gaon Burah in Assam/Nagaland, Dorbar Shnong / Rangbah Shnong in Meghalaya, Village Councils in Mizoram/Manipur, Nokmas in Garo Hills, Student Unions, Church bodies).
- Recommendations for sampling methods (Multi-stage stratified cluster, Purposive quota, Snowballing for hidden/vulnerable groups).
- Practical advice on non-response buffer percentages for remote field conditions.

Format as JSON:
{
  "recommendedMethod": "Stratified Multi-Stage Cluster Sampling" | "Purposive Quota Sampling" | "Snowball Sampling" | "Systematic Sampling" | "Convenience with Post-Stratification",
  "samplingRationale": "Detailed pedagogical explanation of why this method fits the research question and geographic reality",
  "stepByStepSamplingPlan": [
    "Step 1: Frame definition...",
    "Step 2: Stratification criteria (e.g., district, tribal community, urban/rural)...",
    "Step 3: Cluster selection...",
    "Step 4: Household/individual respondent selection..."
  ],
  "northeastFieldworkProtocols": [
    {
      "protocol": "Community Gatekeeper Entry",
      "detail": "Actionable steps for approaching traditional authorities (Gaon Burahs, Dorbar Shnong, Village Council Chiefs)"
    },
    {
      "protocol": "Language & Field Assistant Strategy",
      "detail": "Recruitment of local bilingual enumerators/translators from the target community"
    },
    {
      "protocol": "Seasonality & Road Accessibility",
      "detail": "Timing fieldwork to avoid peak monsoon landslides or flood seasons"
    }
  ],
  "recommendedAttritionBufferPercent": 15,
  "samplingCaveatsAndBiases": "Potential sampling biases to document and mitigate"
}`;

    const response = await generateWithFallback(prompt, {
      responseMimeType: 'application/json',
    });

    const parsed = safeParseJson(response.text, null);
    if (parsed && parsed.recommendedMethod) {
      return res.json(parsed);
    }
    throw new Error('Incomplete response from sampling model');
  } catch (error: any) {
    console.warn('Falling back to local academic heuristic engine for sampling plan:', error.message);
    const fallback = generateSamplingFallback(
      title,
      researchDesign,
      targetPopulation,
      accessiblePopulation,
      fieldSetting,
      stateOrDistrict,
      hasRemoteHillAccess,
      timeAndResourceLimits
    );
    res.json(fallback);
  }
});

// STEP 7: Statistical Tools & Assumptions
app.post('/api/statistical-tools', async (req, res) => {
  const { title, researchDesign, variables, hypotheses, sampleSize, dataType } = req.body;

  try {
    const prompt = `You are a senior statistical consultant for social science research.
Recommend specific statistical tests, qualitative analysis techniques, and assumption verification protocols for:
Title: "${title}"
Design: "${researchDesign}"
Variables: ${JSON.stringify(variables || [])}
Hypotheses: ${JSON.stringify(hypotheses || [])}
Estimated Sample Size: ${sampleSize || '150-300'}
Data Type: "${dataType || 'Mixed categorical and continuous Likert scales'}"

Provide an exact, publication-ready analytical plan:
1. Specific primary and secondary statistical tests (e.g., Independent Samples t-test / Welch's t-test, Mann-Whitney U, One-way ANOVA, Kruskal-Wallis, Chi-square test of independence, Multiple Linear Regression, Binary/Ordinal Logistic Regression, Structural Equation Modeling / PLS-SEM, or Thematic Analysis / Braun & Clarke).
2. Exact reasoning explaining why each test matches the variable measurement levels and hypotheses.
3. Crucial assumption checks (Normality, Homoscedasticity, Multicollinearity, Independence) and specific remediation steps if assumptions are violated (e.g. Bootstrapping, non-parametric alternatives, robust standard errors).
4. Recommended software syntax/tools (R, SPSS, Jamovi, JASP, Python, NVivo, MAXQDA).

Format as JSON:
{
  "primaryTests": [
    {
      "testName": "Exact Name of Test",
      "targetsHypothesisOrObjective": "Which H or Obj it tests",
      "whyThisTest": "Clear mathematical/methodological justification",
      "inputVariables": "IVs and DVs involved with measurement scale",
      "softwareRecommendation": "e.g. Jamovi (free/open-source), R (car, lavaan), SPSS"
    }
  ],
  "qualitativeAnalysisMethods": [
    {
      "method": "Thematic Analysis (Braun & Clarke 6-phase) / Content Analysis / Grounded Theory",
      "applicability": "How qualitative interview/narrative data will be coded and verified (inter-coder reliability, member checking)"
    }
  ],
  "assumptionsChecklist": [
    {
      "assumption": "Normality of Residuals",
      "diagnosticTest": "Shapiro-Wilk test (p > .05) & Q-Q plots",
      "remedyIfViolated": "Use non-parametric equivalent (e.g. Mann-Whitney U) or 1000-sample bootstrap"
    },
    {
      "assumption": "Homogeneity of Variances",
      "diagnosticTest": "Levene's Test (p > .05)",
      "remedyIfViolated": "Apply Welch's correction or robust standard errors"
    },
    {
      "assumption": "Multicollinearity",
      "diagnosticTest": "Variance Inflation Factor (VIF < 5.0, Tolerance > 0.2)",
      "remedyIfViolated": "Remove or combine collinear predictors via PCA"
    }
  ],
  "reportingStandard": "APA 7th Edition style guidance for test statistics (e.g. F(df1, df2) = X.XX, p = .XXX, eta_p^2 = .XX)"
}`;

    const response = await generateWithFallback(prompt, {
      responseMimeType: 'application/json',
    });

    const parsed = safeParseJson(response.text, null);
    if (parsed && Array.isArray(parsed.primaryTests) && parsed.primaryTests.length > 0) {
      return res.json(parsed);
    }
    throw new Error('Incomplete response from statistical tools model');
  } catch (error: any) {
    console.warn('Falling back to local academic heuristic engine for statistical tools:', error.message);
    const fallback = generateStatisticalToolsFallback(title, researchDesign, variables, hypotheses, sampleSize, dataType);
    res.json(fallback);
  }
});

// STEP 8: Ethics & Cultural Context Protocol
app.post('/api/ethics-check', async (req, res) => {
  const { title, targetCommunity, targetRegion, researchDesign, fieldSetting } = req.body;

  try {
    const prompt = `You are an institutional ethics committee (IEC) chair and indigenous research ethics specialist.
Review the ethical dimensions of this social science study:
Title: "${title}"
Community/Participants: "${targetCommunity || 'Indigenous and local communities in Northeast India'}"
Geographic Region: "${targetRegion || 'Northeast India (Sixth Schedule / ADC areas / Tribal Hill Tracts)'}"
Research Design: "${researchDesign || ''}"
Field Context: "${fieldSetting || ''}"

Identify critical ethical considerations and protocols:
1. Special considerations for Scheduled Tribes / Indigenous communities, minors, or historically vulnerable populations.
2. Informed consent protocols suited to multilingual or oral-tradition communities (e.g. vernacular translated information sheets, audio-recorded verbal consent, pictographic consent guides).
3. Community-level consent (approaching traditional councils/village leadership) alongside voluntary individual consent.
4. Indigenous Data Sovereignty and avoiding extractive research (giving findings back to the community in vernacular summaries, benefit-sharing, non-stigmatizing representation).
5. Relevant Institutional Ethics Review Bodies (e.g. University IEC, ICSSR National Ethics Committee, UGC guidelines, local ADC clearance where applicable).

Format as JSON:
{
  "vulnerabilityAssessment": "Assessment of vulnerability levels and protective requirements",
  "informedConsentProtocol": {
    "consentFormat": "Written + Vernacular Audio / Verbal option",
    "keyElements": [
      "Explicit right to withdraw without consequence",
      "Bilingual Participant Information Sheet (PIS) in local language (e.g. Assamese, Khasi, Mizo, Garo, Bodo, Hindi)",
      "Audio recording consent as separate optional checkbox"
    ],
    "oralTraditionGuidance": "How to ethically handle consent when participants prefer verbal or non-written agreement"
  },
  "communityGovernanceAndDualConsent": {
    "needed": true,
    "traditionalInstitutionsToEngage": "List of traditional bodies (e.g., Dorbar Shnong, Village Council, Gaon Burah, Clan Elders)",
    "distinction": "Why community permission facilitates access but never overrides an individual's personal right to decline"
  },
  "dataSovereigntyAndReciprocity": [
    "Commitment to share executive summaries / policy briefs with the community",
    "Anonymization and secure encrypted storage of audio/transcripts",
    "Avoiding deficit-based portrayal of indigenous cultures in final publications"
  ],
  "ethicsCommitteesToApply": [
    "Institutional Ethics Committee (IEC) of Host University",
    "ICSSR / ICMR Ethics Guidelines compliance",
    "Local District / ADC Research Permissions if required in Sixth Schedule areas"
  ]
}`;

    const response = await generateWithFallback(prompt, {
      responseMimeType: 'application/json',
    });

    const parsed = safeParseJson(response.text, null);
    if (parsed && parsed.vulnerabilityAssessment) {
      return res.json(parsed);
    }
    throw new Error('Incomplete response from ethics model');
  } catch (error: any) {
    console.warn('Falling back to local academic heuristic engine for ethics check:', error.message);
    const fallback = generateEthicsFallback(title, targetCommunity, targetRegion, researchDesign, fieldSetting);
    res.json(fallback);
  }
});

// STEP 9: Full Publication-Ready Methodology Synthesis
app.post('/api/generate-full-summary', async (req, res) => {
  const { projectData } = req.body;

  try {
    const prompt = `You are a high-level academic editor and methodologist. Synthesize all 8 steps of this research project into a comprehensive, publication-grade Methodology Chapter / Research Proposal section (APA 7th Edition style).

Project Data:
${JSON.stringify(projectData, null, 2)}

Produce a rigorous academic text structured with clear Markdown headers:
1. # Research Methodology: [Approved Title]
2. ## 1. Epistemological Stance & Research Design
3. ## 2. Theoretical Framework & Operationalized Constructs
4. ## 3. Research Objectives & Hypotheses Alignment Matrix
5. ## 4. Target Population & Sampling Plan (Include Mathematical Sample Size Justification & Attrition Buffer)
6. ## 5. Instrumentation & Cultural-Linguistic Adaptation Protocol
7. ## 6. Data Collection Fieldwork & Regional Protocols (Northeast India Context)
8. ## 7. Statistical & Qualitative Data Analysis Plan (With Assumption Tests)
9. ## 8. Ethical Safeguards, Dual Consent & Indigenous Data Sovereignty
10. ## 9. Methodological Limitations & Mitigation Strategies

Ensure high scholarly tone, clear academic rationale ("why"), no generic filler, and ready for inclusion in a thesis or journal manuscript.`;

    const response = await generateWithFallback(prompt);
    if (response && response.text) {
      return res.json({ markdownSummary: response.text });
    }
    throw new Error('Empty summary returned from model');
  } catch (error: any) {
    console.warn('Falling back to local academic heuristic engine for methodology synthesis:', error.message);
    const fallbackSummary = generateFullSummaryFallback(projectData);
    res.json({ markdownSummary: fallbackSummary });
  }
});

// Production static serving and development Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ResearchGuide server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
