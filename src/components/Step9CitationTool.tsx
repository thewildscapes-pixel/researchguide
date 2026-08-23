import React, { useState, useMemo } from 'react';
import {
  AcademicReference,
  extractReferencesFromStep2,
  formatAPA,
  formatMLA,
  getFoundationalMethodologyReferences,
} from '../utils/citationFormatter';
import {
  BookOpen,
  Copy,
  Check,
  Download,
  Plus,
  Search,
  ExternalLink,
  Filter,
  FileText,
  Sparkles,
  BookMarked,
  ArrowUpRight,
  Layers,
  Trash2,
  ListPlus,
} from 'lucide-react';
import { Step2Data } from '../types';

interface Step9CitationToolProps {
  step2Data: Step2Data;
  studyTitle?: string;
  onAppendToProposal: (formattedBibliographyText: string) => void;
  onJumpToStep2?: () => void;
}

export const Step9CitationTool: React.FC<Step9CitationToolProps> = ({
  step2Data,
  studyTitle = '',
  onAppendToProposal,
  onJumpToStep2,
}) => {
  // Sourced references state
  const initialReferences = useMemo(() => {
    return extractReferencesFromStep2(
      step2Data.searchResult?.existingStudies || [],
      step2Data.searchResult?.groundingSources || [],
      studyTitle
    );
  }, [step2Data, studyTitle]);

  const [references, setReferences] = useState<AcademicReference[]>(initialReferences);
  const [formatMode, setFormatMode] = useState<'APA' | 'MLA' | 'INTEXT'>('APA');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [insertedToDoc, setInsertedToDoc] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Reference Form State
  const [newAuthors, setNewAuthors] = useState('');
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());
  const [newTitle, setNewTitle] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newVolume, setNewVolume] = useState('');
  const [newIssue, setNewIssue] = useState('');
  const [newPages, setNewPages] = useState('');
  const [newDoi, setNewDoi] = useState('');
  const [newType, setNewType] = useState<'journal' | 'book' | 'report'>('journal');
  const [newTheme, setNewTheme] = useState('Custom Reference');

  const categories = useMemo(() => {
    const set = new Set<string>();
    references.forEach((r) => {
      if (r.themeOrCategory) set.add(r.themeOrCategory);
    });
    return ['All', ...Array.from(set)];
  }, [references]);

  const filteredReferences = useMemo(() => {
    return references.filter((r) => {
      const matchCat = selectedCategory === 'All' || r.themeOrCategory === selectedCategory;
      const search = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        r.title.toLowerCase().includes(search) ||
        r.authors.some((a) => a.toLowerCase().includes(search)) ||
        r.sourceOrJournal.toLowerCase().includes(search) ||
        (r.themeOrCategory && r.themeOrCategory.toLowerCase().includes(search));
      return matchCat && matchSearch;
    });
  }, [references, selectedCategory, searchTerm]);

  // Copy single reference
  const handleCopySingle = (ref: AcademicReference, e: React.MouseEvent) => {
    e.stopPropagation();
    let text = '';
    if (formatMode === 'APA') {
      text = formatAPA(ref).replace(/\*/g, ''); // strip markdown asterisks for plain clipboard
    } else if (formatMode === 'MLA') {
      text = formatMLA(ref).replace(/\*/g, '');
    } else {
      text = `${ref.inTextCitation.parenthetical} | ${ref.inTextCitation.narrative}`;
    }
    navigator.clipboard.writeText(text);
    setCopiedId(ref.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy entire bibliography
  const handleCopyAll = () => {
    const lines = filteredReferences.map((ref, idx) => {
      if (formatMode === 'APA') {
        return formatAPA(ref).replace(/\*/g, '');
      } else if (formatMode === 'MLA') {
        return formatMLA(ref).replace(/\*/g, '');
      } else {
        return `${idx + 1}. Parenthetical: ${ref.inTextCitation.parenthetical}\n   Narrative: ${ref.inTextCitation.narrative}\n   Source: ${ref.title} (${ref.year})`;
      }
    });

    const header =
      formatMode === 'APA'
        ? 'References (APA 7th Edition)'
        : formatMode === 'MLA'
        ? 'Works Cited (MLA 9th Edition)'
        : 'In-Text Citation Guide';

    const fullText = `${header}\n\n${lines.join('\n\n')}`;
    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // Download bibliography file
  const handleDownloadBib = () => {
    const lines = references.map((ref) => {
      return formatMode === 'APA' ? formatAPA(ref) : formatMLA(ref);
    });
    const header = formatMode === 'APA' ? '# References (APA 7th Edition)' : '# Works Cited (MLA 9th Edition)';
    const content = `${header}\n\n${lines.join('\n\n')}`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bibliography_${formatMode.toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Append or replace References section inside the Step 9 proposal
  const handleInsertIntoProposal = () => {
    const formattedLines = references.map((ref) => {
      return formatMode === 'APA' ? formatAPA(ref) : formatMLA(ref);
    });

    const header = formatMode === 'APA' ? '## References (APA 7th Edition)' : '## Works Cited (MLA 9th Edition)';
    const bibBlock = `\n\n---\n\n${header}\n\n${formattedLines.map((line) => `- ${line}`).join('\n\n')}`;

    onAppendToProposal(bibBlock);
    setInsertedToDoc(true);
    setTimeout(() => setInsertedToDoc(false), 3000);
  };

  const handleAddCustomReference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const authorArray = newAuthors
      .split(/;|, and|&|\n/)
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const firstSurname = authorArray[0]?.split(/\s+/).pop() || 'Author';
    const secondSurname = authorArray[1]?.split(/\s+/).pop() || '';

    const parenthetical =
      authorArray.length === 1
        ? `(${firstSurname}, ${newYear})`
        : authorArray.length === 2
        ? `(${firstSurname} & ${secondSurname}, ${newYear})`
        : `(${firstSurname} et al., ${newYear})`;

    const narrative =
      authorArray.length === 1
        ? `${firstSurname} (${newYear})`
        : authorArray.length === 2
        ? `${firstSurname} and ${secondSurname} (${newYear})`
        : `${firstSurname} et al. (${newYear})`;

    const newRef: AcademicReference = {
      id: `custom-${Date.now()}`,
      authors: authorArray.length > 0 ? authorArray : ['Scholar, A.'],
      year: newYear || '2023',
      title: newTitle.trim(),
      sourceOrJournal: newSource.trim() || 'Academic Press',
      volume: newVolume.trim() || undefined,
      issue: newIssue.trim() || undefined,
      pages: newPages.trim() || undefined,
      doiOrUrl: newDoi.trim() || undefined,
      referenceType: newType,
      themeOrCategory: newTheme.trim() || 'User Reference',
      inTextCitation: {
        parenthetical,
        narrative,
      },
    };

    setReferences([newRef, ...references]);
    setShowAddModal(false);
    // Reset form
    setNewAuthors('');
    setNewTitle('');
    setNewSource('');
    setNewVolume('');
    setNewIssue('');
    setNewPages('');
    setNewDoi('');
  };

  const handleDeleteReference = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReferences(references.filter((r) => r.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0 print:hidden">
      {/* Top Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-[#1E293B] to-[#0F172A] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <BookMarked className="w-4 h-4" />
            </div>
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
              Academic Citation & Bibliography Engine
            </h3>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Automatically generated from the literature gap mapping in Step 02. Formats all regional studies,
            methodological anchors, and journal articles in compliant APA 7th & MLA 9th styles.
          </p>
        </div>

        {/* Format Selector Pills */}
        <div className="flex bg-slate-800/90 p-1.5 rounded-xl border border-slate-700 text-xs shrink-0">
          <button
            id="citation-format-apa-btn"
            onClick={() => setFormatMode('APA')}
            className={`px-3.5 py-1.5 rounded-lg font-black uppercase tracking-wider text-xs transition-colors cursor-pointer ${
              formatMode === 'APA' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            APA 7th Edition
          </button>
          <button
            id="citation-format-mla-btn"
            onClick={() => setFormatMode('MLA')}
            className={`px-3.5 py-1.5 rounded-lg font-black uppercase tracking-wider text-xs transition-colors cursor-pointer ${
              formatMode === 'MLA' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            MLA 9th Edition
          </button>
          <button
            id="citation-format-intext-btn"
            onClick={() => setFormatMode('INTEXT')}
            className={`px-3.5 py-1.5 rounded-lg font-black uppercase tracking-wider text-xs transition-colors cursor-pointer ${
              formatMode === 'INTEXT' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            In-Text Guide
          </button>
        </div>
      </div>

      {/* Control / Filter Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
          {/* Search */}
          <div className="relative min-w-[180px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search author, title, journal..."
              className="w-full pl-8.5 pr-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Themes / Sources' : c}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Add Citation</span>
          </button>
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="copy-all-citations-btn"
            onClick={handleCopyAll}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy All ({formatMode})</span>
              </>
            )}
          </button>

          <button
            id="download-bib-btn"
            onClick={handleDownloadBib}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Download formatted bibliography as markdown"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">.MD</span>
          </button>

          <button
            id="insert-bib-to-proposal-btn"
            onClick={handleInsertIntoProposal}
            className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Appends this formatted bibliography section directly to your Step 9 Markdown chapter"
          >
            {insertedToDoc ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Appended to Proposal!</span>
              </>
            ) : (
              <>
                <ListPlus className="w-3.5 h-3.5" />
                <span>Insert in Proposal</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bibliography Entries List */}
      <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto divide-y divide-slate-100">
        {filteredReferences.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No citations found matching filter.</p>
            <p className="text-xs text-slate-500">
              Clear your search filter or click &quot;Add Citation&quot; to manually insert a paper.
            </p>
          </div>
        ) : (
          filteredReferences.map((ref, idx) => {
            const apaFormatted = formatAPA(ref);
            const mlaFormatted = formatMLA(ref);
            const isCopied = copiedId === ref.id;

            return (
              <div
                key={ref.id}
                className="pt-4 first:pt-0 group flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-blue-50/40 p-2.5 rounded-xl transition-all"
              >
                {/* Reference Content */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                      {ref.themeOrCategory || 'Literature'}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 uppercase">
                      {ref.referenceType}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">#{idx + 1}</span>
                  </div>

                  {/* Formatted Output with Academic Hanging Indent */}
                  <div className="pl-6 -indent-6 text-xs sm:text-sm text-slate-900 leading-relaxed font-serif">
                    {formatMode === 'APA' ? (
                      <div>
                        {ref.authors.join(', ')} ({ref.year}). {ref.referenceType === 'book' ? (
                          <span className="italic">{ref.title}</span>
                        ) : (
                          <span>{ref.title}.</span>
                        )}{' '}
                        <span className="italic">{ref.sourceOrJournal}</span>
                        {ref.volume && <span className="italic">, {ref.volume}</span>}
                        {ref.issue && <span>({ref.issue})</span>}
                        {ref.pages && <span>, {ref.pages}.</span>}
                        {ref.doiOrUrl && (
                          <a
                            href={ref.doiOrUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-0.5 ml-1 not-italic font-sans text-xs"
                          >
                            <span>{ref.doiOrUrl}</span>
                            <ExternalLink className="w-3 h-3 inline" />
                          </a>
                        )}
                      </div>
                    ) : formatMode === 'MLA' ? (
                      <div>
                        {ref.authors[0]}
                        {ref.authors.length > 1 ? `, et al.` : '.'}{' '}
                        {ref.referenceType === 'book' ? (
                          <span className="italic">&ldquo;{ref.title}&rdquo;.</span>
                        ) : (
                          <span>&ldquo;{ref.title}.&rdquo;</span>
                        )}{' '}
                        <span className="italic">{ref.sourceOrJournal}</span>
                        {ref.volume && <span>, vol. {ref.volume}</span>}
                        {ref.issue && <span>, no. {ref.issue}</span>}
                        <span>, {ref.year}</span>
                        {ref.pages && <span>, pp. {ref.pages}.</span>}
                        {ref.doiOrUrl && (
                          <a
                            href={ref.doiOrUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-0.5 ml-1 not-italic font-sans text-xs"
                          >
                            <span>{ref.doiOrUrl}</span>
                            <ExternalLink className="w-3 h-3 inline" />
                          </a>
                        )}
                      </div>
                    ) : (
                      /* In-text guide view */
                      <div className="font-sans space-y-1 not-italic">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700 text-xs">Parenthetical Citation:</span>
                          <code className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-mono text-xs font-bold border border-blue-200">
                            {ref.inTextCitation.parenthetical}
                          </code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700 text-xs">Narrative Citation:</span>
                          <code className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-xs font-bold border border-emerald-200">
                            {ref.inTextCitation.narrative}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Single Row Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    onClick={(e) => handleCopySingle(ref, e)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title={`Copy single ${formatMode} entry`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 text-[11px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={(e) => handleDeleteReference(ref.id, e)}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-400 transition-colors cursor-pointer"
                    title="Remove from list"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info & Step 2 Link */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>
            Displaying <strong>{filteredReferences.length}</strong> academic citations for proposal synthesis.
          </span>
        </div>

        {onJumpToStep2 && (
          <button
            onClick={onJumpToStep2}
            className="text-[#2563EB] hover:text-blue-800 font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Need to add more literature themes? Jump to Step 02</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Modal: Add Custom Reference */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-black text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Add Literature Reference
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomReference} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Author(s) (e.g. &quot;Goswami, P.; Saikia, D.&quot;)
                </label>
                <input
                  type="text"
                  required
                  value={newAuthors}
                  onChange={(e) => setNewAuthors(e.target.value)}
                  placeholder="e.g. Karlsson, B. G. or Bordoloi, N."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Year of Publication
                  </label>
                  <input
                    type="text"
                    required
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    placeholder="2023"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Reference Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  >
                    <option value="journal">Journal Article</option>
                    <option value="book">Book / Monograph</option>
                    <option value="report">Policy / Institutional Report</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Article / Book Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Customary institutions and micro-credit penetration in tribal Assam"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Journal / Publisher / Organization
                </label>
                <input
                  type="text"
                  required
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="e.g. Economic and Political Weekly or Oxford University Press"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Volume
                  </label>
                  <input
                    type="text"
                    value={newVolume}
                    onChange={(e) => setNewVolume(e.target.value)}
                    placeholder="e.g. 58"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Issue
                  </label>
                  <input
                    type="text"
                    value={newIssue}
                    onChange={(e) => setNewIssue(e.target.value)}
                    placeholder="e.g. 4"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Pages
                  </label>
                  <input
                    type="text"
                    value={newPages}
                    onChange={(e) => setNewPages(e.target.value)}
                    placeholder="e.g. 45-58"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  DOI or Web URL (Optional)
                </label>
                <input
                  type="text"
                  value={newDoi}
                  onChange={(e) => setNewDoi(e.target.value)}
                  placeholder="e.g. https://doi.org/10.1080/..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Research Theme / Topic Tag
                </label>
                <input
                  type="text"
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  placeholder="e.g. Customary Governance or SHG Dynamics"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold uppercase text-[10px] hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-bold uppercase text-[10px] tracking-wider cursor-pointer shadow-xs"
                >
                  Add Citation to List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
