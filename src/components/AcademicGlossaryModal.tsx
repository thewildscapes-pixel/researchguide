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
  const [selectedTermId, setSelectedTermId] = useState<string>(ACADEMIC_GLOSSARY_DATA[0].id);

  const categories = [
    'All',
    'Methodology & Design',
    'Northeast India & Governance',
    'Statistics & Measurement',
    'Ethics & Epistemology',
  ];

  const filteredTerms = useMemo(() => {
    return ACADEMIC_GLOSSARY_DATA.filter((term) => {
      const matchesCategory =
        selectedCategory === 'All' || term.category === selectedCategory;
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
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
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {ACADEMIC_GLOSSARY_DATA.length} Terms
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Core definitions for social science research, statistical rigor, and Northeast India fieldwork
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
              placeholder="Search concepts, tests, gatekeeper protocols (e.g. 'Sixth Schedule', 'Cochran', 'Thematic')..."
              className="w-full pl-9 pr-8 py-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Term Explorer */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-hidden">
          {/* Left Master List */}
          <div className="md:col-span-5 h-full overflow-y-auto p-3 space-y-2 bg-slate-50/50">
            {filteredTerms.length === 0 ? (
              <div className="text-center py-12 px-4">
                <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No glossary terms found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Try adjusting your search query or switching categories.
                </p>
              </div>
            ) : (
              filteredTerms.map((t) => {
                const isSelected = activeTerm?.id === t.id;
                let badgeColor = 'bg-slate-100 text-slate-600';
                if (t.category === 'Northeast India & Governance') badgeColor = 'bg-amber-50 text-amber-700 border border-amber-200';
                else if (t.category === 'Statistics & Measurement') badgeColor = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
                else if (t.category === 'Ethics & Epistemology') badgeColor = 'bg-purple-50 text-purple-700 border border-purple-200';
                else if (t.category === 'Methodology & Design') badgeColor = 'bg-blue-50 text-blue-700 border border-blue-200';

                return (
                  <button
                    key={t.id}
                    id={`glossary-item-${t.id}`}
                    onClick={() => setSelectedTermId(t.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 shadow-2xs ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/15'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${badgeColor}`}>
                        {t.category.split(' & ')[0]}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        Steps: {t.relevantSteps.map((s) => `0${s}`).join(', ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-blue-900 font-black' : 'text-slate-800'}`}>
                        {t.term}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`} />
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {t.definition}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Detailed Term View */}
          <div className="md:col-span-7 h-full overflow-y-auto p-5 sm:p-7 bg-white space-y-6">
            {activeTerm && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Term Header */}
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800">
                      {activeTerm.category}
                    </span>
                    {activeTerm.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {activeTerm.term}
                  </h3>
                </div>

                {/* Formal Academic Definition */}
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    Formal Academic Definition
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm leading-relaxed text-slate-800 font-medium">
                    {activeTerm.definition}
                  </div>
                </div>

                {/* Fieldwork Application & Practical Example */}
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Fieldwork Application & Exemplar Context
                  </h4>
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 text-xs sm:text-sm leading-relaxed text-amber-950">
                    <p className="font-medium">{activeTerm.practicalExample}</p>
                  </div>
                </div>

                {/* Where This Applies in ResearchGuide */}
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-blue-900 uppercase tracking-widest block">
                      Pipeline Integration
                    </span>
                    <span className="text-xs text-blue-700 font-medium">
                      Applied directly in Step{activeTerm.relevantSteps.length > 1 ? 's' : ''}:{' '}
                      <strong>{activeTerm.relevantSteps.map((s) => `Step 0${s}`).join(', ')}</strong>
                    </span>
                  </div>

                  {onJumpToStep && (
                    <div className="flex items-center gap-1.5">
                      {activeTerm.relevantSteps.map((step) => (
                        <button
                          key={step}
                          id={`glossary-jump-step-${step}`}
                          onClick={() => {
                            onJumpToStep(step as StepNumber);
                            onClose();
                          }}
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-all"
                        >
                          <span>Open Step 0{step}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="text-[11px]">
            Tip: Use this glossary to cite standard epistemological and customary governance references in your methodology chapter.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            Close Glossary
          </button>
        </div>
      </div>
    </div>
  );
};
