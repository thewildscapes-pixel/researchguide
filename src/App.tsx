import React, { useState, useEffect } from 'react';
import {
  ResearchProject,
  StepNumber,
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
  Step6Data,
  Step7Data,
  Step8Data,
} from './types';
import { createInitialProject, getDefaultProjects } from './utils/sampleStudies';
import { Header } from './components/Header';
import { StepProgressBar } from './components/StepProgressBar';
import { DownstreamAlertBanner } from './components/DownstreamAlertBanner';
import { DashboardOverview } from './components/DashboardOverview';
import { ProjectsDashboard } from './components/ProjectsDashboard';
import { Step1TitleIntake } from './components/steps/Step1TitleIntake';
import { Step2LiteratureContext } from './components/steps/Step2LiteratureContext';
import { Step3ResearchDesign } from './components/steps/Step3ResearchDesign';
import { Step4ConstructsVariables } from './components/steps/Step4ConstructsVariables';
import { Step5ObjectivesHypotheses } from './components/steps/Step5ObjectivesHypotheses';
import { Step6SamplingCalculator } from './components/steps/Step6SamplingCalculator';
import { Step7StatisticalTools } from './components/steps/Step7StatisticalTools';
import { Step8EthicsContext } from './components/steps/Step8EthicsContext';
import { Step9SummaryExport } from './components/steps/Step9SummaryExport';
import { AcademicGlossaryModal } from './components/AcademicGlossaryModal';
import { Scratchpad } from './components/Scratchpad';
import { LandingPage, UserSession } from './components/LandingPage';

const PROJECTS_STORAGE_KEY = 'research_guide_projects_v2';
const SESSION_STORAGE_KEY = 'research_guide_user_session_v1';
const ACTIVE_PROJECT_STORAGE_KEY = 'research_guide_active_project_id_v1';

export default function App() {
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [glossaryInitialSearch, setGlossaryInitialSearch] = useState('');
  const [glossaryInitialCategory, setGlossaryInitialCategory] = useState<string | undefined>(undefined);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);

  // Page 1: User Authentication / Session State
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        return JSON.parse(savedSession);
      }
    } catch (e) {
      console.warn('Failed to load user session:', e);
    }
    return null;
  });

  // Page 2 & 3: Multi-Project Repository
  const [projects, setProjects] = useState<ResearchProject[]>(() => {
    try {
      const saved = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load projects from storage:', e);
    }
    return getDefaultProjects();
  });

  // Active Project ID (null = Page 2 Dashboard, string = Page 3 Step Workspace)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY);
    } catch (e) {
      return null;
    }
  });

  const [downstreamAlert, setDownstreamAlert] = useState<{
    show: boolean;
    fromStep: StepNumber;
  }>({ show: false, fromStep: 1 });

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.warn('Failed to persist projects list:', e);
    }
  }, [projects]);

  // Save active project ID to localStorage
  useEffect(() => {
    try {
      if (activeProjectId) {
        localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, activeProjectId);
      } else {
        localStorage.removeItem(ACTIVE_PROJECT_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to save active project ID:', e);
    }
  }, [activeProjectId]);

  // Find active project
  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  // Helper to update active project in multi-project state
  const updateActiveProject = (updater: (prev: ResearchProject) => ResearchProject) => {
    if (!activeProjectId) return;
    setProjects((prevProjects) =>
      prevProjects.map((p) => (p.id === activeProjectId ? updater(p) : p))
    );
  };

  // Step Completion Handler
  const handleCompleteStep = (completedStep: StepNumber) => {
    if (!activeProject) return;
    const nextStep = Math.min(completedStep + 1, 9) as StepNumber;
    const completedSet = new Set(activeProject.completedSteps);
    completedSet.add(completedStep);

    updateActiveProject((prev) => ({
      ...prev,
      currentStep: nextStep,
      completedSteps: Array.from(completedSet) as StepNumber[],
      lastUpdated: new Date().toISOString(),
    }));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    updateActiveProject((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1) as StepNumber,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepSelect = (step: StepNumber) => {
    updateActiveProject((prev) => ({
      ...prev,
      currentStep: step,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markStepDirty = (stepNum: StepNumber) => {
    if (!activeProject) return;
    const hasDownstream = activeProject.completedSteps.some((s) => s > stepNum);
    if (hasDownstream) {
      setDownstreamAlert({ show: true, fromStep: stepNum });
    }
  };

  // Step Updaters
  const updateStep1 = (data: Partial<Step1Data>) => {
    markStepDirty(1);
    updateActiveProject((prev) => ({
      ...prev,
      step1: { ...prev.step1, ...data },
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateStep2 = (data: Partial<Step2Data>) => {
    markStepDirty(2);
    updateActiveProject((prev) => ({
      ...prev,
      step2: { ...prev.step2, ...data },
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateStep3 = (data: Partial<Step3Data>) => {
    markStepDirty(3);
    updateActiveProject((prev) => ({
      ...prev,
      step3: { ...prev.step3, ...data },
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateStep4 = (data: Partial<Step4Data>) => {
    markStepDirty(4);
    updateActiveProject((prev) => ({
      ...prev,
      step4: { ...prev.step4, ...data },
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateStep5 = (data: Partial<Step5Data>) => {
    markStepDirty(5);
    updateActiveProject((prev) => ({
      ...prev,
      step5: { ...prev.step5, ...data },
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateStep6 = (data: Partial<Step6Data>) => {
    markStepDirty(6);
    updateActiveProject((prev) => ({
      ...prev,
      step6: { ...prev.step6, ...data },
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateStep7 = (data: Partial<Step7Data>) => {
    markStepDirty(7);
    updateActiveProject((prev) => ({
      ...prev,
      step7: { ...prev.step7, ...data },
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateStep8 = (data: Partial<Step8Data>) => {
    markStepDirty(8);
    updateActiveProject((prev) => ({
      ...prev,
      step8: { ...prev.step8, ...data },
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateStep9Summary = (markdown: string) => {
    updateActiveProject((prev) => ({
      ...prev,
      step9: { ...prev.step9, finalMarkdownSummary: markdown },
      lastUpdated: new Date().toISOString(),
    }));
  };

  // Multi-Project Dashboard Operations
  const handleOpenProject = (projectId: string, stepToOpen?: StepNumber) => {
    setActiveProjectId(projectId);
    if (stepToOpen) {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, currentStep: stepToOpen } : p))
      );
    }
    setDownstreamAlert({ show: false, fromStep: 1 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateProject = (projectData: {
    workingTitle: string;
    targetRegion: string;
    description: string;
  }) => {
    const newProj = createInitialProject(
      projectData.workingTitle,
      projectData.targetRegion,
      projectData.description
    );
    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
    setDownstreamAlert({ show: false, fromStep: 1 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicateProject = (projectId: string) => {
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;
    const duplicated: ResearchProject = {
      ...JSON.parse(JSON.stringify(target)),
      id: 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      lastUpdated: new Date().toISOString(),
      step1: {
        ...target.step1,
        workingTitle: `${target.step1.workingTitle || 'Study'} (Copy)`,
        approvedTitle: target.step1.approvedTitle ? `${target.step1.approvedTitle} (Copy)` : '',
      },
    };
    setProjects((prev) => [duplicated, ...prev]);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
    }
  };

  const handleImportProject = (imported: ResearchProject) => {
    const importedWithId: ResearchProject = {
      ...imported,
      id: imported.id || 'proj-' + Date.now(),
      lastUpdated: new Date().toISOString(),
    };
    setProjects((prev) => [importedWithId, ...prev.filter((p) => p.id !== importedWithId.id)]);
    setActiveProjectId(importedWithId.id);
    setDownstreamAlert({ show: false, fromStep: 1 });
  };

  const handleExportProjectJson = (projectToExport?: ResearchProject) => {
    const target = projectToExport || activeProject;
    if (!target) return;
    const dataStr = JSON.stringify(target, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const titleClean = (target.step1.approvedTitle || target.step1.workingTitle || 'research_study')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .slice(0, 30);
    link.href = url;
    link.download = `${titleClean}_backup.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleResetActiveProject = () => {
    if (!activeProject) return;
    const fresh = createInitialProject(activeProject.step1.workingTitle, activeProject.step1.targetRegion);
    fresh.id = activeProject.id;
    updateActiveProject(() => fresh);
    setDownstreamAlert({ show: false, fromStep: 1 });
  };

  const handleOpenGlossary = (term?: string, category?: string) => {
    setGlossaryInitialSearch(term || '');
    setGlossaryInitialCategory(category);
    setIsGlossaryOpen(true);
  };

  const handleLogin = (session: UserSession) => {
    setUserSession(session);
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('Failed to save user session:', e);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setUserSession(null);
    setActiveProjectId(null);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(ACTIVE_PROJECT_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear session:', e);
    }
  };

  // PAGE 1: Authentication / Landing Page
  if (!userSession) {
    return <LandingPage onLogin={handleLogin} />;
  }

  // PAGE 2: Researcher Multi-Project Dashboard (when no active project is opened)
  if (!activeProjectId || !activeProject) {
    return (
      <>
        <ProjectsDashboard
          projects={projects}
          userSession={userSession}
          onOpenProject={handleOpenProject}
          onCreateProject={handleCreateProject}
          onDuplicateProject={handleDuplicateProject}
          onDeleteProject={handleDeleteProject}
          onImportProject={handleImportProject}
          onExportProject={handleExportProjectJson}
          onLogout={handleLogout}
          onOpenGlossary={() => handleOpenGlossary()}
          onOpenScratchpad={() => setIsScratchpadOpen(true)}
        />

        <AcademicGlossaryModal
          isOpen={isGlossaryOpen}
          onClose={() => setIsGlossaryOpen(false)}
          onJumpToStep={(step) => {
            setIsGlossaryOpen(false);
            if (projects.length > 0) {
              handleOpenProject(projects[0].id, step);
            }
          }}
          initialSearch={glossaryInitialSearch}
          initialCategory={glossaryInitialCategory}
        />

        <Scratchpad
          isOpen={isScratchpadOpen}
          onOpen={() => setIsScratchpadOpen(true)}
          onClose={() => setIsScratchpadOpen(false)}
        />
      </>
    );
  }

  // PAGE 3 & Methodology Steps Workspace (Step 1: Title Intake & Bias Analysis, etc.)
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-[#2563EB]">
      {/* Top Academic Header */}
      <Header
        project={activeProject}
        allProjects={projects}
        userSession={userSession}
        onLogout={handleLogout}
        onReturnToDashboard={() => setActiveProjectId(null)}
        onSwitchProject={(id) => handleOpenProject(id)}
        onResetProject={handleResetActiveProject}
        onExportJson={() => handleExportProjectJson()}
        onImportJson={handleImportProject}
        onJumpToStep={handleStepSelect}
        onOpenGlossary={() => handleOpenGlossary()}
        onOpenScratchpad={() => setIsScratchpadOpen(true)}
      />

      {/* 9-Step Progress Navigation */}
      <StepProgressBar
        currentStep={activeProject.currentStep}
        completedSteps={activeProject.completedSteps}
        onSelectStep={handleStepSelect}
        hasDownstreamAlert={downstreamAlert.show}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Dashboard Overview with Recharts Progress Pie */}
        <DashboardOverview
          project={activeProject}
          onSelectStep={handleStepSelect}
          onOpenGlossary={() => handleOpenGlossary()}
          onOpenScratchpad={() => setIsScratchpadOpen(true)}
        />

        {/* Downstream Consistency Alert Banner */}
        {downstreamAlert.show && (
          <DownstreamAlertBanner
            fromStep={downstreamAlert.fromStep}
            currentStep={activeProject.currentStep}
            onReverifyDownstream={() => {
              setDownstreamAlert({ show: false, fromStep: 1 });
              handleStepSelect(Math.min(downstreamAlert.fromStep + 1, 9) as StepNumber);
            }}
            onDismiss={() => setDownstreamAlert({ show: false, fromStep: 1 })}
          />
        )}

        {/* Active Step Content Container */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6 sm:p-8 md:p-10 transition-all relative overflow-hidden">
          {/* Subtle Watermark Step Indicator */}
          <div className="absolute bottom-0 right-0 p-4 opacity-[0.035] pointer-events-none select-none z-0">
            <span className="text-[130px] md:text-[160px] font-black leading-none uppercase tracking-tighter">
              0{activeProject.currentStep}
            </span>
          </div>

          <div className="relative z-10">
            {/* Step 1: Title Intake and Bias Analysis */}
            {activeProject.currentStep === 1 && (
              <Step1TitleIntake
                data={activeProject.step1}
                onUpdate={updateStep1}
                onComplete={() => handleCompleteStep(1)}
              />
            )}

            {/* Step 2: Literature Context */}
            {activeProject.currentStep === 2 && (
              <Step2LiteratureContext
                data={activeProject.step2}
                step1={activeProject.step1}
                onUpdate={updateStep2}
                onComplete={() => handleCompleteStep(2)}
                onPrev={handlePrevStep}
              />
            )}

            {/* Step 3: Research Design Matrix */}
            {activeProject.currentStep === 3 && (
              <Step3ResearchDesign
                data={activeProject.step3}
                step1={activeProject.step1}
                step2={activeProject.step2}
                onUpdate={updateStep3}
                onComplete={() => handleCompleteStep(3)}
                onPrev={handlePrevStep}
              />
            )}

            {/* Step 4: Constructs and Variables */}
            {activeProject.currentStep === 4 && (
              <Step4ConstructsVariables
                data={activeProject.step4}
                step1={activeProject.step1}
                step3={activeProject.step3}
                onUpdate={updateStep4}
                onComplete={() => handleCompleteStep(4)}
                onPrev={handlePrevStep}
              />
            )}

            {/* Step 5: Objectives and Hypotheses */}
            {activeProject.currentStep === 5 && (
              <Step5ObjectivesHypotheses
                data={activeProject.step5}
                step1={activeProject.step1}
                step3={activeProject.step3}
                step4={activeProject.step4}
                onUpdate={updateStep5}
                onComplete={() => handleCompleteStep(5)}
                onPrev={handlePrevStep}
              />
            )}

            {/* Step 6: Sampling and Power Calculator */}
            {activeProject.currentStep === 6 && (
              <Step6SamplingCalculator
                data={activeProject.step6}
                step1={activeProject.step1}
                step3={activeProject.step3}
                onUpdate={updateStep6}
                onComplete={() => handleCompleteStep(6)}
                onPrev={handlePrevStep}
              />
            )}

            {/* Step 7: Statistical Tools and Qualitative Analysis */}
            {activeProject.currentStep === 7 && (
              <Step7StatisticalTools
                data={activeProject.step7}
                step1={activeProject.step1}
                step3={activeProject.step3}
                step4={activeProject.step4}
                step5={activeProject.step5}
                step6={activeProject.step6}
                onUpdate={updateStep7}
                onComplete={() => handleCompleteStep(7)}
                onPrev={handlePrevStep}
              />
            )}

            {/* Step 8: Ethics, Customary Governance & Dual Consent */}
            {activeProject.currentStep === 8 && (
              <Step8EthicsContext
                data={activeProject.step8}
                step1={activeProject.step1}
                step3={activeProject.step3}
                step6={activeProject.step6}
                onUpdate={updateStep8}
                onComplete={() => handleCompleteStep(8)}
                onPrev={handlePrevStep}
              />
            )}

            {/* Step 9: Methodology Summary & Academic Citations */}
            {activeProject.currentStep === 9 && (
              <Step9SummaryExport
                project={activeProject}
                onUpdateSummary={updateStep9Summary}
                onPrev={handlePrevStep}
                onJumpToStep={handleStepSelect}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#E5E7EB] bg-[#F8F9FA] py-6 mt-12 print:hidden text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-bold text-xs uppercase tracking-wider text-slate-700 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span>Research<span className="text-[#2563EB]">Guide</span> — Precision Social Science Methodology Engine</span>
            <span className="text-[10px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-300">
              Copyright © Dr. Deborshee Gogoi
            </span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Assam • Meghalaya • Nagaland • Manipur • Mizoram • Tripura • Arunachal • Sikkim
          </div>
        </div>
      </footer>

      {/* Academic Glossary Overlay Modal */}
      <AcademicGlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        onJumpToStep={handleStepSelect}
        initialSearch={glossaryInitialSearch}
        initialCategory={glossaryInitialCategory}
      />

      {/* Floating & Expandable Research Scratchpad */}
      <Scratchpad
        isOpen={isScratchpadOpen}
        onOpen={() => setIsScratchpadOpen(true)}
        onClose={() => setIsScratchpadOpen(false)}
      />
    </div>
  );
}
