import React, { useState } from 'react';
import { ResearchProject, StepNumber } from '../types';
import { MethodologyPipelineStubs } from './MethodologyPipelineStubs';
import { ResearchGuideLogo } from './ResearchGuideLogo';
import { UserSession, isUserAdmin } from '../utils/auth';
import {
  Plus,
  Search,
  FolderKanban,
  CheckCircle2,
  Clock,
  Trash2,
  Copy,
  Download,
  Upload,
  ArrowRight,
  Sparkles,
  MapPin,
  Layers,
  BookOpen,
  Filter,
  StickyNote,
  LogOut,
  Calendar,
  AlertCircle,
  X,
  Globe,
  Edit3,
  ShieldCheck,
} from 'lucide-react';

interface ProjectsDashboardProps {
  projects: ResearchProject[];
  userSession: UserSession;
  onOpenProject: (projectId: string, stepToOpen?: StepNumber) => void;
  onCreateProject: (projectData: { workingTitle: string; targetRegion: string; description: string }) => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onImportProject: (imported: ResearchProject) => void;
  onExportProject: (project: ResearchProject) => void;
  onLogout: () => void;
  onOpenGlossary: () => void;
  onOpenScratchpad: () => void;
}

export const GLOBAL_REGION_PRESETS = [
  'East Khasi Hills & Jaintia, Meghalaya',
  'Kohima & Mokokchung, Nagaland',
  'Dibrugarh, Tinsukia & Majuli, Assam',
  'Imphal Valley & Hill Districts, Manipur',
  'Aizawl & Lunglei, Mizoram',
  'Papum Pare & West Siang, Arunachal Pradesh',
  'West Tripura & Dhalai, Tripura',
  'East & South Districts, Sikkim',
  'Delhi NCR & Northern Gangetic Plains',
  'Bengaluru, Karnataka & Southern India',
  'Mumbai, Pune & Western Maharashtra',
  'Kolkata & Eastern India Coastal Zone',
  'Himalayan & Mountain Agro-Ecosystems',
  'Central Tribal Belt (Jharkhand, Odisha, CG)',
  'Global / International Comparative Fieldwork',
  'Custom Fieldwork Region / Community Area',
];

export const ProjectsDashboard: React.FC<ProjectsDashboardProps> = ({
  projects,
  userSession,
  onOpenProject,
  onCreateProject,
  onDuplicateProject,
  onDeleteProject,
  onImportProject,
  onExportProject,
  onLogout,
  onOpenGlossary,
  onOpenScratchpad,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newRegionPreset, setNewRegionPreset] = useState('East Khasi Hills & Jaintia, Meghalaya');
  const [customRegionText, setCustomRegionText] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isAdmin = isUserAdmin(userSession);

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const title = (p.step1.approvedTitle || p.step1.workingTitle || '').toLowerCase();
    const region = (p.step1.targetRegion || '').toLowerCase();
    const desc = (p.step1.description || '').toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = title.includes(query) || region.includes(query) || desc.includes(query);

    const isComplete = p.completedSteps.length === 9;
    if (statusFilter === 'completed') return matchesSearch && isComplete;
    if (statusFilter === 'in_progress') return matchesSearch && !isComplete;
    return matchesSearch;
  });

  const totalStepsCompletedAcross = projects.reduce((acc, curr) => acc + curr.completedSteps.length, 0);
  const totalCompletedProjects = projects.filter((p) => p.completedSteps.length === 9).length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Please provide a working research title.');
      return;
    }

    const resolvedRegion =
      newRegionPreset === 'Custom Fieldwork Region / Community Area'
        ? customRegionText.trim() || 'Open Community / Custom Fieldwork Area'
        : customRegionText.trim()
        ? `${newRegionPreset} (${customRegionText.trim()})`
        : newRegionPreset;

    onCreateProject({
      workingTitle: newTitle.trim(),
      targetRegion: resolvedRegion,
      description: newDescription.trim(),
    });
    setNewTitle('');
    setCustomRegionText('');
    setNewDescription('');
    setIsNewProjectModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed && (parsed.step1 || parsed.id)) {
          onImportProject(parsed);
        } else {
          alert('Invalid research project format.');
        }
      } catch (err) {
        alert('Could not read JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] flex flex-col font-sans selection:bg-blue-100 selection:text-[#2563EB]">
      {/* Top Academic Header */}
      <header className="border-b border-[#E5E7EB] bg-[#F8F9FA]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <ResearchGuideLogo
            size="md"
            showTagline={true}
            showCopyright={true}
            allowUpload={isAdmin}
            isAdmin={isAdmin}
          />

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick Tools */}
            <button
              onClick={onOpenGlossary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg text-slate-700 bg-white hover:bg-slate-100 transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Glossary</span>
            </button>

            <button
              onClick={onOpenScratchpad}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg text-slate-700 bg-white hover:bg-slate-100 transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <StickyNote className="w-3.5 h-3.5 text-amber-500" />
              <span>Scratchpad</span>
            </button>

            {/* Hidden JSON file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg text-slate-700 bg-white hover:bg-slate-100 transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
              title="Import saved project JSON"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Import</span>
            </button>

            {/* Researcher Profile Badge */}
            <div
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs shadow-2xs ${
                isAdmin
                  ? 'bg-gradient-to-r from-blue-900 to-slate-900 text-white border-blue-800'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
              title={isAdmin ? 'Administrator' : `Researcher Session: ${userSession.email}`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                  isAdmin ? 'bg-amber-400 text-slate-950' : 'bg-[#2563EB] text-white'
                }`}
              >
                {isAdmin ? '★' : (userSession.name?.[0] || userSession.email[0] || 'U').toUpperCase()}
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <div className="flex items-center gap-1">
                  <span
                    className={`font-bold block text-[11px] max-w-[130px] truncate ${
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
                  className={`text-[9px] block truncate ${
                    isAdmin ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {userSession.mobile}
                </span>
              </div>

              <button
                onClick={onLogout}
                className={`p-1 rounded transition-colors cursor-pointer ml-1 ${
                  isAdmin
                    ? 'text-slate-400 hover:text-white hover:bg-white/10'
                    : 'text-slate-400 hover:text-red-600 hover:bg-white'
                }`}
                title="Sign out of research session"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Banner with Stats & New Project Action */}
        <div className="bg-gradient-to-br from-slate-900 via-[#1E293B] to-[#0F172A] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Ambient Glow */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Institutional Methodology Workspace
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-slate-300 text-xs font-semibold">
                {projects.length} {projects.length === 1 ? 'Research Project' : 'Research Projects'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Scholar Research Projects Dashboard
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
              Manage multiple social science research studies across quantitative sampling,
              mixed-methods frameworks, and field ethics. Click any study or its step icons to jump
              directly to that step.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 relative z-10">
            <button
              id="create-new-study-hero-btn"
              onClick={() => setIsNewProjectModalOpen(true)}
              className="px-5 py-3 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Research Project</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search studies by title, fieldwork region, or construct..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Studies ({projects.length})
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'in_progress'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              In Progress ({projects.filter((p) => p.completedSteps.length < 9).length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Completed ({totalCompletedProjects})
            </button>
          </div>
        </div>

        {/* Projects Grid / List */}
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto shadow-inner">
                <FolderKanban className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">
                  {searchTerm ? 'No matching studies found' : 'No research projects yet'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {searchTerm
                    ? `No research projects matched your query "${searchTerm}". Try resetting your filter.`
                    : 'Get started by creating your first social science inquiry or import an existing project JSON.'}
                </p>
              </div>
              <button
                onClick={() => {
                  if (searchTerm) setSearchTerm('');
                  else setIsNewProjectModalOpen(true);
                }}
                className="px-4 py-2 bg-[#2563EB] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
              >
                {searchTerm ? 'Clear Search Filter' : 'Create New Project'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {filteredProjects.map((project) => {
                const title = project.step1.approvedTitle || project.step1.workingTitle || 'Untitled Study';
                const completedCount = project.completedSteps.length;
                const percent = Math.round((completedCount / 9) * 100);
                const isComplete = completedCount === 9;

                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all p-5 sm:p-6 space-y-5 group relative"
                  >
                    {/* Project Header Bar */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Title & Region */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isComplete
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-blue-50 text-[#2563EB] border border-blue-200'
                            }`}
                          >
                            {isComplete ? '9/9 Complete' : `Step 0${project.currentStep} Active`}
                          </span>

                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{project.step1.targetRegion || 'Open Fieldwork Community'}</span>
                          </span>

                          {project.step3?.designResult?.methodologyFit && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              {project.step3.designResult.methodologyFit}
                            </span>
                          )}
                        </div>

                        {/* Title link */}
                        <h2
                          onClick={() => onOpenProject(project.id)}
                          className="text-base sm:text-lg font-black text-slate-900 hover:text-[#2563EB] transition-colors cursor-pointer tracking-tight leading-snug"
                        >
                          {title}
                        </h2>

                        {project.step1.description && (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                            {project.step1.description}
                          </p>
                        )}
                      </div>

                      {/* Progress Bar & Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0">
                        {/* Progress Meter */}
                        <div className="w-full sm:w-48 text-right space-y-1">
                          <div className="flex items-between justify-between text-[11px] font-bold">
                            <span className="text-slate-500">Methodology Progress</span>
                            <span className={isComplete ? 'text-emerald-600' : 'text-[#2563EB]'}>
                              {percent}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className={`h-full transition-all duration-500 ${
                                isComplete
                                  ? 'bg-emerald-500'
                                  : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        {/* Quick Study Actions */}
                        <div className="flex items-center gap-1.5 self-end">
                          <button
                            onClick={() => onExportProject(project)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                            title="Export Study JSON"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDuplicateProject(project.id)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                            title="Duplicate Study"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setProjectToDelete(project.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                            title="Delete Study"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Interactive 9-Step Methodology Pipeline Stubs */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Methodology Pipeline Stubs (Click step icon to jump directly)
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Updated {new Date(project.lastUpdated || Date.now()).toLocaleDateString()}
                        </span>
                      </div>

                      <MethodologyPipelineStubs
                        currentStep={project.currentStep}
                        completedSteps={project.completedSteps}
                        onSelectStep={(stepNum) => onOpenProject(project.id, stepNum)}
                      />
                    </div>

                    {/* Bottom Open Workspace Bar */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Last active {new Date(project.lastUpdated || Date.now()).toLocaleDateString()}</span>
                      </div>

                      <button
                        onClick={() => onOpenProject(project.id)}
                        className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                      >
                        <span>Open Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#E5E7EB] bg-[#F8F9FA] py-6 mt-12 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-bold text-xs uppercase tracking-wider text-slate-700 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span>Research<span className="text-[#2563EB]">Guide</span> — Multi-Project Social Science Methodology Engine</span>
            <span className="text-[10px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-300">
              Copyright © Dr. Deborshee Gogoi
            </span>
          </div>
          <div className="text-[10px] font-bold text-slate-500">
            Open Regional & Global Research Protocols • ICSSR & UGC Guidelines
          </div>
        </div>
      </footer>

      {/* Create New Project Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-[#2563EB] rounded-xl">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    Create New Research Project
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Initialize a fresh 9-step institutional methodology pipeline.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Working Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Working Research Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Traditional Ecological Knowledge and Climate Adaptation..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>

              {/* Target Region Presets + Open Custom Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Target Fieldwork Region / Community Area <span className="text-slate-400 font-normal text-[10px]">(Open & Flexible)</span>
                </label>

                <select
                  value={newRegionPreset}
                  onChange={(e) => setNewRegionPreset(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium cursor-pointer"
                >
                  {GLOBAL_REGION_PRESETS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <Edit3 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customRegionText}
                    onChange={(e) => setCustomRegionText(e.target.value)}
                    placeholder="Specify exact district, tribe, village council, city, or community..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Problem Formulation & Scope Summary
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Provide a 2-3 sentence overview of the core inquiry, population, and research gap..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/25 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start Title & Bias Analysis</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-50 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                Delete Research Study?
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to delete this research study? This action cannot be undone. You may want to export a JSON backup first.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setProjectToDelete(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Keep Study
              </button>
              <button
                onClick={() => {
                  onDeleteProject(projectToDelete);
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
