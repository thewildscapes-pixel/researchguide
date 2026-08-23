import React, { useState, useMemo } from 'react';
import { ACADEMIC_GLOSSARY_DATA, GlossaryTerm } from '../data/glossaryData';
import {
  BookOpen,
  Search,
  X,
  Filter,
  Layers,
  Sparkles,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  BarChart2,
  HelpCircle,
  Info,
} from 'lucide-react';
import { StepNumber } from '../types';

interface AcademicGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToStep?: (step: StepNumber) => void;
  initialCategory?: string;
  initialSearch?: string;
}

export const AcademicGlossaryModal: React.FC<AcademicGlossaryModalProps> = ({
  isOpen,
  onClose,
  onJumpToStep,
  initialCategory,
  initialSearch = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [selectedTermId, setSelectedTermId] = useState<string>(ACADEMIC_GLOSSARY_DATA[0]?.id || '');
  const [showInfoPopover, setShowInfoPopover] = useState(false);

  const categories = [
    'All',
    'Methodology & Design',
    'Customary & Community Governance',
    'Statistics & Measurement',
    'Ethics & Epistemology',
  ];

  const filteredTerms = useMemo(() => {
    return ACADEMIC_GLOSSARY_DATA.filter((term) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        term.category === selectedCategory ||
        (selectedCategory === 'Customary & Community Governance' && term.category.includes('Governance'));
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        term.term.toLowerCase().includes(query) ||
        term.definition.toLowerCase().includes(query) ||
        term.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        term.practicalExample.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const activeTerm = useMemo(() => {
    return (
      filteredTerms.find((t) => t.id === selectedTermId) ||
      filteredTerms[0] ||
      ACADEMIC_GLOSSARY_DATA[0]
    );
  }, [filteredTerms, selectedTermId]);

  if (!isOpen) return null;

  return (
    <div
      id="academic-glossary-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Backdrop click dismiss */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Modal Card */}
      <div className="relative w-full max-w-5xl h-[88vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-[#1E293B] to-[#0F172A] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="glossary-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Academic & Fieldwork Glossary
                </h2>
                {/* Info / Explanation Icon */}
                <div className="group relative cursor-pointer text-slate-400 hover:text-blue-300 transition-colors">
                  <HelpCircle className="w-4 h-4" />
                  <div className="absolute left-0 top-full mt-1.5 hidden group-hover:block w-72 p-3 bg-slate-950 text-slate-200 text-[11px] font-medium rounded-xl shadow-2xl border border-slate-800 z-50 text-left pointer-events-none">
                    <div className="font-bold text-blue-300 mb-1 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      <span>Academic Glossary Segment</span>
                    </div>
                    Authoritative reference definitions for social science inquiry, epistemological paradigms, quantitative and qualitative statistical models, and community fieldwork governance.
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {ACADEMIC_GLOSSARY_DATA.length} Terms
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Core definitions for social science research, statistical rigor, and community fieldwork protocols
              </p>
            </div>
          </div>

          <button
            id="close-glossary-modal-btn"
            onClick={onClose}
            aria-label="Close glossary modal"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="glossary-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search concepts, tests, gatekeeper protocols (e.g. 'Cochran', 'Thematic', 'Sovereignty', 'Cronbach')..."
              className="w-full pl-9 pr-8 py-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body: 2-Column Split (List on Left, Rich Definition on Right) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Term List */}
          <div className="w-full md:w-5/12 lg:w-4/12 border-b md:border-b-0 md:border-r border-slate-200 overflow-y-auto bg-slate-50/50 p-2 sm:p-3 space-y-1.5 scrollbar-thin">
            {filteredTerms.length > 0 ? (
              filteredTerms.map((term) => {
                const isActive = term.id === activeTerm?.id;
                return (
                  <button
                    key={term.id}
                    onClick={() => setSelectedTermId(term.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex flex-col gap-1 border ${
                      isActive
                        ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                        : 'bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-xs font-bold tracking-tight line-clamp-2 ${
                          isActive ? 'text-[#2563EB]' : 'text-slate-900'
                        }`}
                      >
                        {term.term}
                      </span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          isActive ? 'text-[#2563EB]' : 'text-slate-300'
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {term.category}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400">
                <p className="text-xs">No matching academic terms found.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                  }}
                  className="mt-2 text-xs text-[#2563EB] font-bold hover:underline cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Deep Detailed Term Definition Card */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white space-y-6 scrollbar-thin">
            {activeTerm ? (
              <div className="space-y-6">
                {/* Term Header */}
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-[#2563EB] border border-blue-200">
                      {activeTerm.category}
                    </span>
                    {activeTerm.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {activeTerm.term}
                  </h3>
                </div>

                {/* Definition Box */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Epistemological & Methodological Definition
                  </h4>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm leading-relaxed">
                    {activeTerm.definition}
                  </div>
                </div>

                {/* Fieldwork Practical Example */}
                {activeTerm.practicalExample && (
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Fieldwork Application & Practical Example
                    </h4>
                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-slate-800 text-xs sm:text-sm leading-relaxed">
                      {activeTerm.practicalExample}
                    </div>
                  </div>
                )}

                {/* Relevant Step Pipeline Jumper */}
                {activeTerm.relevantSteps && activeTerm.relevantSteps.length > 0 && onJumpToStep && (
                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Applies to Methodology Steps:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeTerm.relevantSteps.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            onJumpToStep(s as StepNumber);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#2563EB] border border-slate-200 hover:border-blue-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Step 0{s}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Select a term to view its detailed definition and fieldwork application.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
