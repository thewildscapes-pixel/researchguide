import React from 'react';
import {
  BookOpen,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  Compass,
  FileText,
  StickyNote,
  LogOut,
  User,
  ArrowLeft,
  FolderKanban,
  ShieldCheck,
} from 'lucide-react';
import { ResearchProject, StepNumber } from '../types';
import { ResearchGuideLogo } from './ResearchGuideLogo';
import { UserSession, isUserAdmin } from '../utils/auth';

interface HeaderProps {
  project: ResearchProject;
  allProjects?: ResearchProject[];
  userSession?: UserSession | null;
  onLogout?: () => void;
  onReturnToDashboard?: () => void;
  onSwitchProject?: (projectId: string) => void;
  onResetProject: () => void;
  onExportJson: () => void;
  onImportJson: (imported: ResearchProject) => void;
  onJumpToStep: (step: StepNumber) => void;
  onOpenGlossary: () => void;
  onOpenScratchpad: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  allProjects = [],
  userSession,
  onLogout,
  onReturnToDashboard,
  onSwitchProject,
  onResetProject,
  onExportJson,
  onImportJson,
  onJumpToStep,
  onOpenGlossary,
  onOpenScratchpad,
}) => {
  const [showProjectPicker, setShowProjectPicker] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isAdmin = isUserAdmin(userSession);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed && (parsed.step1 || parsed.id)) {
          onImportJson(parsed);
        }
      } catch (err) {
        alert('Invalid project JSON file');
      }
    };
    reader.readAsText(file);
  };

  const activeTitle = project.step1.approvedTitle || project.step1.workingTitle || 'Untitled Study';

  return (
    <header className="border-b border-[#E5E7EB] bg-[#F8F9FA]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Section: Back to Dashboard + Brand */}
        <div className="flex items-center gap-3">
          {onReturnToDashboard && (
            <button
              onClick={onReturnToDashboard}
              id="back-to-projects-dashboard-btn"
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 shadow-2xs text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Return to Projects Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">All Projects</span>
            </button>
          )}

          <ResearchGuideLogo
            size="md"
            showText={true}
            showTagline={true}
            showCopyright={true}
            allowUpload={isAdmin}
            isAdmin={isAdmin}
            className="cursor-pointer"
          />
        </div>

        {/* Center / Right Section: Active Project Switcher & Controls */}
        <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
          {/* Active Project Dropdown Switcher */}
          {allProjects.length > 1 && onSwitchProject && (
            <div className="relative">
              <button
                onClick={() => setShowProjectPicker(!showProjectPicker)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 cursor-pointer max-w-[200px] truncate"
                title={`Active Study: ${activeTitle}`}
              >
                <FolderKanban className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                <span className="truncate">{activeTitle}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {showProjectPicker && (
                <div className="absolute right-0 mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 mb-1">
                    Switch Active Project
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {allProjects.map((p) => {
                      const pTitle = p.step1.approvedTitle || p.step1.workingTitle || 'Untitled Study';
                      const isCurrent = p.id === project.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            onSwitchProject(p.id);
                            setShowProjectPicker(false);
                          }}
                          className={`w-full text-left p-2 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                            isCurrent
                              ? 'bg-blue-50 text-[#2563EB] font-black'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate pr-2">{pTitle}</span>
                          <span className="text-[10px] text-slate-400 shrink-0 font-semibold">
                            {p.completedSteps.length}/9
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Session Badge - Strictly shows only the currently logged in researcher's info */}
          {userSession && (
            <div
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs shadow-2xs ${
                isAdmin
                  ? 'bg-gradient-to-r from-blue-900 to-slate-900 text-white border-blue-800'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
              title={
                isAdmin
                  ? 'System Administrator Account'
                  : `Logged in as ${userSession.name || userSession.email}`
              }
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                  isAdmin ? 'bg-amber-400 text-slate-950' : 'bg-[#2563EB] text-white'
                }`}
              >
                {isAdmin ? '★' : (userSession.name?.[0] || userSession.email[0] || 'U').toUpperCase()}
              </div>

              <div className="hidden lg:block text-left leading-tight">
                <div className="flex items-center gap-1">
                  <span
                    className={`font-bold block text-[11px] max-w-[120px] truncate ${
                      isAdmin ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {userSession.name || userSession.email}
                  </span>
                  {isAdmin && (
                    <span className="px-1 py-0.2 bg-amber-400 text-slate-950 text-[8px] font-black uppercase rounded tracking-wider">
                      Admin
                    </span>
                  )}
                </div>
                <span
                  className={`text-[9px] font-medium block truncate ${
                    isAdmin ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {userSession.mobile}
                </span>
              </div>

              {onLogout && (
                <button
                  id="user-logout-btn"
                  onClick={onLogout}
                  title="Sign out of research session"
                  className={`p-1 rounded transition-colors cursor-pointer ml-0.5 ${
                    isAdmin
                      ? 'text-slate-400 hover:text-white hover:bg-white/10'
                      : 'text-slate-400 hover:text-red-600 hover:bg-white'
                  }`}
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Academic Glossary Trigger */}
          <button
            id="open-glossary-btn"
            onClick={onOpenGlossary}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg text-slate-700 bg-white hover:bg-slate-100 hover:text-black transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            title="Search Academic Glossary & Epistemological Terms"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="hidden sm:inline">Glossary</span>
          </button>

          {/* Research Scratchpad */}
          <button
            id="open-scratchpad-btn"
            onClick={onOpenScratchpad}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg text-slate-700 bg-white hover:bg-slate-100 hover:text-black transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            title="Open Fieldwork Scratchpad & Interview Notes"
          >
            <StickyNote className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Notes</span>
          </button>

          {/* Export JSON */}
          <button
            id="export-project-btn"
            onClick={onExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg text-slate-700 bg-white hover:bg-slate-100 hover:text-black transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            title="Download full project JSON state"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Hidden File Input for Import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg text-slate-700 bg-white hover:bg-slate-100 hover:text-black transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            title="Import project JSON file"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* Reset Project */}
          <button
            id="reset-project-btn"
            onClick={() => {
              if (window.confirm('Reset all fields in this research project to blank state?')) {
                onResetProject();
              }
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-[#E5E7EB] cursor-pointer"
            title="Reset active study to blank state"
            aria-label="Reset active study"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
