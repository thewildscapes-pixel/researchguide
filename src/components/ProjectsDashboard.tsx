import React, { useState } from 'react';
import { ResearchProject, StepNumber } from '../types';
import { MethodologyPipelineStubs } from './MethodologyPipelineStubs';
import { ResearchGuideLogo } from './ResearchGuideLogo';
import { UserSession } from './LandingPage';
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

const REGION_PRESETS = [
  'East Khasi Hills, Meghalaya',
  'Kohima & Mokokchung, Nagaland',
  'Dibrugarh & Tinsukia, Assam',
  'Imphal Valley & Hill Districts, Manipur',
  'Aizawl & Lunglei, Mizoram',
  'Papum Pare & West Siang, Arunachal Pradesh',
  'West Tripura & Dhalai, Tripura',
  'East & South Districts, Sikkim',
  'General Northeast India (Comparative)',
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
  const [newRegion, setNewRegion] = useState('East Khasi Hills, Meghalaya');
  const [newDescription, setNewDescription] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
    onCreateProject({
      workingTitle: newTitle.trim(),
      targetRegion: newRegion,
      description: newDescription.trim(),
    });
    setNewTitle('');
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
          <ResearchGuideLogo size="md" showTagline={true} />

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
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-slate-700 text-xs shadow-2xs">
              <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                {(userSession.name?.[0] || userSession.email[0] || 'U').toUpperCase()}
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <span className="font-bold text-slate-900 block text-[11px] max-w-[130px] truncate">
                  {userSession.name || userSession.email}
                </span>
                <span className="text-[9px] text-slate-500 font-medium block truncate max-w-[130px]">
                  {userSession.institution || userSession.mobile}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Sign out"
                className="p-1 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors cursor-pointer ml-1"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome & Dashboard Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-[#1E293B] to-[#0F172A] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border border-slate-800">
          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-black uppercase tracking-wider">
              <FolderKanban className="w-3 h-3" />
              <span>Researcher Workspace • Multi-Project Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white uppercase">
              Social Science Research Projects
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Maintain independent methodology pipelines for doctoral dissertations, funded grants,
              and fieldwork monographs. Select any project to continue or click a step icon stub to jump directly.
            </p>
          </div>

          {/* New Project Call-to-Action */}
          <div className="shrink-0 relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <button
              id="dashboard-new-project-btn"
              onClick={() => setIsNewProjectModalOpen(true)}
              className="px-6 py-3.5 bg-[#2563EB] hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>New Research Project</span>
            </button>
          </div>

          {/* Subtle Ambient Background Watermark */}
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none select-none text-[180px] font-black leading-none -mr-10 -mb-10 text-white">
            RG
          </div>
        </div>

        {/* Aggregate Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Total Studies
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {projects.length}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Active research portfolios
            </span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Finalized Proposals
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">
              {totalCompletedProjects}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Full 9-step synthesis ready
            </span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Total Steps Finalized
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#2563EB]">
              {totalStepsCompletedAcross}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Across all methodology matrices
            </span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Methodology Pipeline
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-600">
              9 Stages
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Title to APA/MLA Citations
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search research projects by title, region, or keywords..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start md:self-auto shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({projects.length})
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'in_progress'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Progress ({projects.filter((p) => p.completedSteps.length < 9).length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Finalized ({totalCompletedProjects})
            </button>
          </div>
        </div>

        {/* Projects Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
              <span>Your Research Projects</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {filteredProjects.length}
              </span>
            </h2>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Click any step icon below to open directly to that methodology phase
            </span>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
              <FolderKanban className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-slate-800">No matching projects found</h3>
                <p className="text-xs text-slate-500">
                  {searchTerm
                    ? 'No studies match your search criteria. Try a different query or clear filters.'
                    : 'Create your first research project to start structuring your institutional methodology.'}
                </p>
              </div>
              <button
                onClick={() => setIsNewProjectModalOpen(true)}
                className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Project</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {filteredProjects.map((p) => {
                const title = p.step1.approvedTitle || p.step1.workingTitle || 'Untitled Research Study';
                const region = p.step1.targetRegion || 'Northeast India';
                const completedCount = p.completedSteps.length;
                const progressPct = Math.round((completedCount / 9) * 100);
                const isComplete = completedCount === 9;
                const lastUpdatedDate = new Date(p.lastUpdated).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all p-5 sm:p-6 space-y-5 group relative"
                  >
                    {/* Project Top Metadata Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-[#2563EB] text-[11px] font-bold border border-blue-100">
                          <MapPin className="w-3 h-3" />
                          <span>{region}</span>
                        </span>

                        {p.step3.userSelectedDesign && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-100">
                            <Layers className="w-3 h-3" />
                            <span>{p.step3.userSelectedDesign}</span>
                          </span>
                        )}

                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3" />
                          <span>Updated {lastUpdatedDate}</span>
                        </span>
                      </div>

                      {/* Progress Badge */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className="text-xs font-black text-slate-700">
                          {progressPct}% ({completedCount}/9 Steps)
                        </span>
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isComplete ? 'bg-emerald-500' : 'bg-[#2563EB]'
                            }`}
                            style={{ width: `${Math.max(5, progressPct)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Main Title & Description */}
                    <div
                      onClick={() => onOpenProject(p.id, 1)}
                      className="cursor-pointer space-y-2 group-hover:text-blue-700 transition-colors"
                    >
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug group-hover:text-[#2563EB] transition-colors">
                        {title}
                      </h3>
                      {p.step1.description && (
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed font-normal">
                          {p.step1.description}
                        </p>
                      )}
                    </div>

                    {/* Interactive Methodology Pipeline Stubs in Icons */}
                    <div className="bg-slate-50/80 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-[#2563EB]" />
                          <span>Methodology Pipeline Stubs (Click to Jump)</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          Step 01 to 09
                        </span>
                      </div>

                      {/* Pipeline Icon Stubs */}
                      <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 pt-1 overflow-x-auto">
                        <MethodologyPipelineStubs
                          currentStep={p.currentStep}
                          completedSteps={p.completedSteps}
                          onSelectStep={(step) => onOpenProject(p.id, step)}
                          size="md"
                          showLabels={true}
                        />
                      </div>
                    </div>

                    {/* Bottom Action Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      {/* Left Quick Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onDuplicateProject(p.id)}
                          className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer border border-transparent hover:border-slate-200"
                          title="Duplicate this project"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span className="hidden sm:inline">Duplicate</span>
                        </button>

                        <button
                          onClick={() => onExportProject(p)}
                          className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer border border-transparent hover:border-slate-200"
                          title="Export Project JSON backup"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-400" />
                          <span className="hidden sm:inline">Export</span>
                        </button>

                        <button
                          onClick={() => setProjectToDelete(p.id)}
                          className="px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="Delete study"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>

                      {/* Right Primary Action */}
                      <button
                        onClick={() => onOpenProject(p.id, p.currentStep || 1)}
                        className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
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
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Assam • Meghalaya • Nagaland • Manipur • Mizoram • Tripura • Arunachal • Sikkim
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
                  placeholder="e.g. Traditional Land Tenure Transitions and Food Security..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>

              {/* Target Region */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Target Fieldwork Region / Community
                </label>
                <select
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium cursor-pointer"
                >
                  {REGION_PRESETS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
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
