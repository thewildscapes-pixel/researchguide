import { SampleSizeCalculationResult } from '../types';

export const Z_CRITICAL: Record<number, number> = {
  90: 1.645,
  95: 1.96,
  99: 2.576,
};

export function calculateSampleSize(config: {
  formulaType: 'cochran_infinite' | 'cochran_finite' | 'yamane' | 'power_ttest' | 'power_anova' | 'power_regression';
  confidenceLevel: 90 | 95 | 99;
  marginOfErrorPercent: number;
  populationProportion: number;
  populationSize?: number;
  effectSize?: number;
  statisticalPower?: number; // e.g. 0.80 or 0.95
  attritionPercent: number;
  numGroups?: number;
  numPredictors?: number;
}): SampleSizeCalculationResult {
  const {
    formulaType,
    confidenceLevel = 95,
    marginOfErrorPercent = 5,
    populationProportion = 0.5,
    populationSize,
    effectSize = 0.5,
    statisticalPower = 0.80,
    attritionPercent = 15,
    numGroups = 3,
    numPredictors = 3,
  } = config;

  const z = Z_CRITICAL[confidenceLevel] || 1.96;
  const e = Math.max(0.01, marginOfErrorPercent / 100);
  const p = Math.min(0.99, Math.max(0.01, populationProportion));
  const q = 1 - p;

  let baseN = 0;
  let formulaUsed = '';
  let formulaExplanation = '';

  if (formulaType === 'cochran_infinite') {
    // n0 = (Z^2 * p * q) / e^2
    const n0 = (Math.pow(z, 2) * p * q) / Math.pow(e, 2);
    baseN = Math.ceil(n0);
    formulaUsed = "Cochran's Formula for Large/Unknown Populations";
    formulaExplanation = `n₀ = (Z² · p · q) / e² = (${z}² · ${p} · ${q.toFixed(2)}) / (${e}²) = ${n0.toFixed(2)} → ${baseN} respondents. Assuming maximum variance (p = ${p}) at a ${confidenceLevel}% confidence interval with a ±${marginOfErrorPercent}% margin of error.`;
  } else if (formulaType === 'cochran_finite') {
    const N = populationSize && populationSize > 0 ? populationSize : 1000;
    const n0 = (Math.pow(z, 2) * p * q) / Math.pow(e, 2);
    const nFinite = n0 / (1 + (n0 - 1) / N);
    baseN = Math.ceil(nFinite);
    formulaUsed = "Cochran's Finite Population Correction";
    formulaExplanation = `n = n₀ / [1 + (n₀ - 1) / N] where n₀ = ${n0.toFixed(2)} and N = ${N.toLocaleString()}. Yields ${nFinite.toFixed(2)} → ${baseN} respondents needed for a bounded population of ${N.toLocaleString()}.`;
  } else if (formulaType === 'yamane') {
    const N = populationSize && populationSize > 0 ? populationSize : 1000;
    // Yamane: n = N / (1 + N * e^2)
    const nYamane = N / (1 + N * Math.pow(e, 2));
    baseN = Math.ceil(nYamane);
    formulaUsed = "Taro Yamane's Simplified Formula";
    formulaExplanation = `n = N / (1 + N · e²) = ${N} / (1 + ${N} · ${e}²) = ${nYamane.toFixed(2)} → ${baseN} respondents at ±${marginOfErrorPercent}% margin of error for population N = ${N.toLocaleString()}.`;
  } else if (formulaType === 'power_ttest') {
    // Power calculation for two independent groups: n per group ~ 2 * ((Z_alpha + Z_beta) / d)^2
    const zAlpha = z;
    const zBeta = statisticalPower >= 0.95 ? 1.645 : statisticalPower >= 0.90 ? 1.282 : 0.842; // for 80% power
    const d = Math.max(0.1, effectSize);
    const nPerGroup = Math.ceil(2 * Math.pow((zAlpha + zBeta) / d, 2));
    baseN = nPerGroup * 2;
    formulaUsed = 'Statistical Power Analysis for Independent Samples t-test';
    formulaExplanation = `Estimated for Cohen's d = ${d} (medium effect), Power (1 - β) = ${(statisticalPower * 100).toFixed(0)}%, α = ${(100 - confidenceLevel) / 100}. Requires ${nPerGroup} per group × 2 groups = ${baseN} total participants.`;
  } else if (formulaType === 'power_anova') {
    // One-Way ANOVA sample size approximation
    const k = Math.max(2, numGroups);
    const f = Math.max(0.1, effectSize);
    const zAlpha = z;
    const zBeta = statisticalPower >= 0.9 ? 1.282 : 0.842;
    const lambda = Math.pow(zAlpha + zBeta, 2);
    const totalN = Math.ceil(lambda / Math.pow(f, 2) + k * 2);
    baseN = Math.max(k * 15, totalN);
    const perGroup = Math.ceil(baseN / k);
    baseN = perGroup * k;
    formulaUsed = `Statistical Power Analysis for One-Way ANOVA (${k} Groups)`;
    formulaExplanation = `Calculated for Cohen's f = ${f}, Power = ${(statisticalPower * 100).toFixed(0)}%, ${k} groups. Recommended ${perGroup} participants per group (Total N = ${baseN}).`;
  } else if (formulaType === 'power_regression') {
    // Multiple regression approximation: Green's rule / Cohen power
    const m = Math.max(1, numPredictors);
    const f2 = Math.max(0.02, effectSize);
    // Green (1991): N >= 50 + 8m for R^2, N >= 104 + m for individual predictors
    const greenN = Math.max(50 + 8 * m, 104 + m);
    baseN = Math.ceil(greenN * (0.15 / f2));
    formulaUsed = `Statistical Power for Multiple Regression (${m} Predictors)`;
    formulaExplanation = `Based on Green's standard formula adjusted for effect size f² = ${f2}, α = 0.05, and ${m} predictor variables. Minimum recommended N = ${baseN}.`;
  }

  // Adjust for attrition / non-response rate (especially important in remote / hill fieldwork)
  const attritionRate = Math.min(0.5, Math.max(0, attritionPercent / 100));
  const adjustedSampleSize = Math.ceil(baseN / (1 - attritionRate));

  return {
    baseSampleSize: baseN,
    adjustedSampleSize,
    formulaUsed,
    formulaExplanation,
    details: {
      zScore: z,
      marginOfError: marginOfErrorPercent,
      proportion: p,
      populationSize,
      power: statisticalPower,
      effectSize,
      attritionBufferRate: attritionPercent,
    },
  };
}
