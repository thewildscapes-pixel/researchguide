import React, { useState, useEffect, useRef } from 'react';
import {
  FileEdit,
  X,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  Clock,
  Bold,
  List,
  CheckSquare,
  Sparkles,
  Maximize2,
  Minimize2,
  Search,
  BookOpen,
  StickyNote,
} from 'lucide-react';

export interface ScratchpadNote {
  id: string;
  title: string;
  category: 'General' | 'Fieldwork' | 'Literature' | 'Supervisor' | 'Methodology Idea';
  content: string;
  updatedAt: string;
}

const SCRATCHPAD_STORAGE_KEY = 'research_guide_scratchpad_notes_v1';

const DEFAULT_NOTES: ScratchpadNote[] = [
  {
    id: 'note-general-1',
    title: 'Research Log & Quick Thoughts',
    category: 'General',
    content: `# Research Scratchpad\n\n- Need to verify if the village council in East Khasi Hills requires written application 2 weeks prior to fieldwork.\n- Check if ICSSR grant deadline is end of month.\n- Remember to cite Creswell (2018) for Explanatory Sequential justification.`,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-lit-1',
    title: 'Literature Snippets & Citations',
    category: 'Literature',
    content: `Key citations to include in Literature Review:\n\n1. OCAP Principles (Schnarch, 2004) - Indigenous data governance.\n2. Braun & Clarke (2019) - Reflexive thematic analysis.\n3. Cochran (1977) - Sampling techniques for finite populations.`,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-field-1',
    title: 'Fieldwork Observations & Gatekeeper Notes',
    category: 'Fieldwork',
    content: `Field logistics reminder:\n- Local dialects vary across rural revenue blocks; ensure bilingual enumerators.\n- Contact Gaon Burah in the morning hours before daily farm shifts.\n- Bring laminated participant information sheets.`,
    updatedAt: new Date().toISOString(),
  },
];

interface ScratchpadProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({
  isOpen,
  onClose,
  onOpen,
}) => {
  const [notes, setNotes] = useState<ScratchpadNote[]>(() => {
    try {
      const saved = localStorage.getItem(SCRATCHPAD_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load scratchpad notes:', e);
    }
    return DEFAULT_NOTES;
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(() => {
    return notes[0]?.id || 'note-general-1';
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Persist notes independently whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(SCRATCHPAD_STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.warn('Failed to persist scratchpad notes:', e);
    }
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const updateActiveNote = (updates: Partial<ScratchpadNote>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNote?.id
          ? { ...n, ...updates, updatedAt: new Date().toISOString() }
          : n
      )
    );
  };

  const handleCreateNote = () => {
    const newNote: ScratchpadNote = {
      id: `note-${Date.now()}`,
      title: `Untitled Note ${notes.length + 1}`,
      category: 'General',
      content: '',
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (notes.length <= 1) {
      // Clear content instead of deleting last note
      updateActiveNote({ content: '', title: 'Untitled Note' });
      return;
    }
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    if (activeNoteId === id) {
      setActiveNoteId(remaining[0].id);
    }
  };

  const handleInsertText = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current || !activeNote) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);

    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const newContent = `${before}${replacement}${after}`;
    updateActiveNote({ content: newContent });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected.length || 4)
      );
    }, 0);
  };

  const handleInsertTimestamp = () => {
    const now = new Date();
    const stamp = `\n[${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] `;
    handleInsertText(stamp, '');
  };

  const handleCopyContent = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(activeNote.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!activeNote) return;
    const blob = new Blob([activeNote.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'research-notes'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories = ['All', 'General', 'Fieldwork', 'Literature', 'Supervisor', 'Methodology Idea'];

  const filteredNotes = notes.filter((n) => {
    const matchesCategory = filterCategory === 'All' || n.category === filterCategory;
    const matchesSearch =
      !searchTerm ||
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const wordCount = activeNote?.content.trim() ? activeNote.content.trim().split(/\s+/).length : 0;
  const charCount = activeNote?.content.length || 0;

  return (
    <>
      {/* Floating Action Button (Always Visible across all steps) */}
      {!isOpen && (
        <button
          id="floating-scratchpad-trigger-btn"
          onClick={onOpen}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-[#1E293B] hover:bg-slate-900 text-white rounded-full shadow-xl border border-slate-700/60 flex items-center gap-2.5 transition-all hover:scale-105 group cursor-pointer"
          title="Open Research Scratchpad (Notes saved independently)"
          aria-label="Open Scratchpad"
        >
          <div className="relative">
            <StickyNote className="w-5 h-5 text-amber-400 group-hover:rotate-6 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-black uppercase tracking-wider leading-none text-white">
              Scratchpad
            </div>
            <div className="text-[10px] text-slate-300 font-medium">
              {notes.length} {notes.length === 1 ? 'Note' : 'Notes'}
            </div>
          </div>
        </button>
      )}

      {/* Slide-over / Floating Drawer */}
      {isOpen && (
        <aside
          id="research-scratchpad-drawer"
          aria-label="Research Scratchpad"
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white shadow-2xl border border-slate-200 ${
            isExpanded
              ? 'inset-4 sm:inset-10 rounded-2xl'
              : 'bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[540px] h-[85vh] sm:h-[620px] sm:rounded-2xl rounded-t-2xl'
          }`}
        >
          {/* Drawer Top Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 via-[#1E293B] to-[#0F172A] text-white flex items-center justify-between shrink-0 sm:rounded-t-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <StickyNote className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                    Research Scratchpad
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Independent Storage
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  Jot down thoughts, citations, or fieldwork logs. Stored independently of the project.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer hidden sm:block"
                title={isExpanded ? 'Restore size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                id="close-scratchpad-btn"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Close scratchpad"
                aria-label="Close scratchpad"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2-Pane Layout (Notes List & Editor) */}
          <div className="flex-1 min-h-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-hidden">
            {/* Sidebar Notes Navigator */}
            <div className="w-full md:w-48 bg-slate-50/80 p-2.5 flex flex-col gap-2 shrink-0 border-b md:border-b-0">
              {/* Header & Add Button */}
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Notes ({filteredNotes.length})
                </span>
                <button
                  id="create-new-scratchpad-note-btn"
                  onClick={handleCreateNote}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>New</span>
                </button>
              </div>

              {/* Mini Search & Category */}
              <div className="space-y-1">
                <div className="relative">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search notes..."
                    className="w-full pl-6 pr-2 py-1 bg-white rounded border border-slate-200 text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full p-1 bg-white rounded border border-slate-200 text-[10px] font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === 'All' ? 'All Categories' : c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scrollable Note Items */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 max-h-24 md:max-h-none">
                {filteredNotes.map((note) => {
                  const isSelected = activeNote?.id === note.id;
                  return (
                    <div
                      key={note.id}
                      onClick={() => setActiveNoteId(note.id)}
                      className={`group p-2 rounded-lg text-left transition-all cursor-pointer border flex flex-col gap-0.5 ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-400 ring-1 ring-blue-400/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[11px] font-bold line-clamp-1 ${isSelected ? 'text-blue-900 font-black' : 'text-slate-700'}`}>
                          {note.title || 'Untitled Note'}
                        </span>
                        <button
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          title="Delete note"
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-opacity p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400">
                        <span>{note.category}</span>
                        <span>{new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Note Editor Pane */}
            <div className="flex-1 flex flex-col min-h-0 bg-white">
              {/* Note Metadata Bar */}
              <div className="p-3 bg-slate-50/60 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex-1 min-w-[140px] flex items-center gap-2">
                  <input
                    id="scratchpad-active-note-title"
                    type="text"
                    value={activeNote?.title || ''}
                    onChange={(e) => updateActiveNote({ title: e.target.value })}
                    placeholder="Note Title..."
                    className="w-full bg-transparent font-bold text-xs sm:text-sm text-slate-900 focus:outline-none border-b border-transparent focus:border-blue-500 pb-0.5"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={activeNote?.category || 'General'}
                    onChange={(e) => updateActiveNote({ category: e.target.value as any })}
                    className="text-[10px] font-bold bg-white border border-slate-300 rounded px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="General">General</option>
                    <option value="Fieldwork">Fieldwork</option>
                    <option value="Literature">Literature</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Methodology Idea">Methodology Idea</option>
                  </select>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="px-3 py-1.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0 text-slate-600 text-xs">
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleInsertTimestamp}
                    title="Insert current timestamp"
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-700 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Time</span>
                  </button>
                  <button
                    onClick={() => handleInsertText('**', '**')}
                    title="Bold text"
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-700 cursor-pointer font-bold"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleInsertText('\n- ', '')}
                    title="Bullet list"
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-700 cursor-pointer"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleInsertText('\n- [ ] ', '')}
                    title="Task checkbox"
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-700 cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleInsertText('> ', '')}
                    title="Blockquote citation"
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-700 cursor-pointer text-[11px] font-serif italic"
                  >
                    Quote
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopyContent}
                    title="Copy note text"
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-700 flex items-center gap-1 text-[11px] font-medium cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    title="Export markdown file"
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-700 flex items-center gap-1 text-[11px] font-medium cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </div>
              </div>

              {/* Main Textarea */}
              <div className="flex-1 min-h-0 p-3 flex flex-col">
                <textarea
                  id="scratchpad-note-textarea"
                  ref={textareaRef}
                  value={activeNote?.content || ''}
                  onChange={(e) => updateActiveNote({ content: e.target.value })}
                  placeholder="Type unstructured research notes, field observations, literature ideas, or supervisor feedback here..."
                  className="w-full flex-1 resize-none bg-transparent font-mono text-xs sm:text-sm text-slate-800 leading-relaxed focus:outline-none placeholder-slate-400 scrollbar-thin"
                />
              </div>

              {/* Editor Footer / Word Count */}
              <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 shrink-0 sm:rounded-b-2xl">
                <span>
                  {wordCount} {wordCount === 1 ? 'word' : 'words'} • {charCount} characters
                </span>
                <span className="flex items-center gap-1 text-slate-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Auto-saved to browser storage
                </span>
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  );
};
