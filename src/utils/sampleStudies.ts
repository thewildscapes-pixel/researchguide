import { ResearchProject } from '../types';
import { calculateSampleSize } from './sampleSizeMath';

export function createInitialProject(title?: string, region?: string, desc?: string): ResearchProject {
  const initialCalc = calculateSampleSize({
    formulaType: 'cochran_infinite',
    confidenceLevel: 95,
    marginOfErrorPercent: 5,
    populationProportion: 0.5,
    attritionPercent: 15,
  });

  return {
    id: 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    lastUpdated: new Date().toISOString(),
    currentStep: 1,
    completedSteps: [],
    step1: {
      workingTitle: title || '',
      description: desc || '',
      targetRegion: region || 'Northeast India (General)',
    },
    step2: {
      keyTerms: '',
    },
    step3: {},
    step4: {
      variables: [],
    },
    step5: {
      draftObjectives: [],
      draftHypotheses: [],
      conceptualFramework: undefined,
    },
    step6: {
      targetPopulation: '',
      accessiblePopulation: '',
      fieldSetting: 'Mixed Rural/Hill',
      stateOrDistrict: '',
      hasRemoteHillAccess: true,
      timeAndResourceLimits: 'Standard field duration',
      calcConfig: {
        formulaType: 'cochran_infinite',
        confidenceLevel: 95,
        marginOfErrorPercent: 5,
        populationProportion: 0.5,
        effectSize: 0.5,
        statisticalPower: 0.8,
        attritionPercent: 15,
      },
      computedMath: initialCalc,
    },
    step7: {
      dataTypePreference: 'Mixed (Categorical + Likert Continuous Scales)',
    },
    step8: {
      targetCommunity: '',
    },
    step9: {},
  };
}

export function getDefaultProjects(): ResearchProject[] {
  // Return empty list so researchers only generate and view their own studies
  return [];
}
