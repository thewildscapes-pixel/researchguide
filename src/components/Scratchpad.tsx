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
  Info,
  HelpCircle,
} from 'lucide-react';

export interface ScratchpadNote {
  id: string;
  title: string;
  category: 'General' | 'Fieldwork' | 'Literature' | 'Supervisor' | 'Methodology Idea';
  content: string;
  updatedAt: string;
}

const SCRATCHPAD_STORAGE_KEY = 'research_guide_scratchpad_notes_v2';

// Clean initial empty note with zero default/dummy text
const EMPTY_INITIAL_NOTES: ScratchpadNote[] = [
  {
    id: 'note-1',
    title: 'Research Note 1',
    category: 'General',
    content: '',
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
    return EMPTY_INITIAL_NOTES;
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(() => {
    return notes[0]?.id || 'note-1';
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [showInfoBanner, setShowInfoBanner] = useState(true);
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
      title: `Research Note ${notes.length + 1}`,
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
      // Clear content instead of leaving 0 notes
      updateActiveNote({ content: '', title: 'Research Note 1' });
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
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = activeNote.content.substring(start, end);
    const replacement = prefix + selected + suffix;
    const newContent =
      activeNote.content.substring(0, start) +
      replacement +
      activeNote.content.substring(end);

    updateActiveNote({ content: newContent });

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          start + prefix.length,
          start + prefix.length + selected.length
        );
      }
    }, 50);
  };

  const handleCopyNote = () => {
    if (!activeNote?.content) return;
    navigator.clipboard.writeText(activeNote.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadNote = () => {
    if (!activeNote) return;
    const blob = new Blob([activeNote.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      searchTerm === '' ||
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === 'All' || n.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <div
      id="scratchpad-drawer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scratchpad-title"
      className={`fixed top-0 right-0 z-50 h-screen bg-white shadow-2xl border-l border-slate-200 transition-all duration-300 flex flex-col ${
        isExpanded ? 'w-full sm:w-4/5 md:w-3/5 lg:w-1/2' : 'w-full sm:w-[460px]'
      }`}
    >
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <StickyNote className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="scratchpad-title" className="text-sm font-bold text-white tracking-tight">
                Fieldwork Scratchpad
              </h2>
              {/* Segment Info / Help Icon */}
              <div
                className="group relative cursor-pointer text-slate-400 hover:text-amber-300 transition-colors"
                title="About this segment"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 hidden group-hover:block w-64 p-2.5 bg-slate-950 text-slate-200 text-[11px] font-medium rounded-xl shadow-2xl border border-slate-800 z-50 text-left pointer-events-none">
                  <div className="font-bold text-amber-300 mb-1 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    <span>Fieldwork & Research Scratchpad</span>
                  </div>
                  A private notebook to jot down fieldwork reminders, supervisor discussions, qualitative notes, and methodology thoughts while working through your proposal.
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              Auto-saved locally • {notes.length} {notes.length === 1 ? 'Note' : 'Notes'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse panel' : 'Expand panel'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            id="close-scratchpad-btn"
            onClick={onClose}
            aria-label="Close scratchpad"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info Segment Bar */}
      {showInfoBanner && (
        <div className="p-3 bg-amber-50/80 border-b border-amber-200/60 flex items-start justify-between gap-2 text-xs text-amber-950 shrink-0">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-amber-900">
              <span className="font-bold">Segment Guide:</span> Use this scratchpad to draft raw thoughts, supervisor remarks, and interview notes. Click <strong>+ New Note</strong> to start a new record.
            </p>
          </div>
          <button
            onClick={() => setShowInfoBanner(false)}
            className="text-amber-500 hover:text-amber-800 text-xs font-bold p-0.5 cursor-pointer"
            title="Dismiss notice"
          >
            ✕
          </button>
        </div>
      )}

      {/* Note Switcher & Controls */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your notes..."
              className="w-full pl-8 pr-3 py-1.5 bg-white rounded-lg border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <button
            id="create-new-scratchpad-note-btn"
            onClick={handleCreateNote}
            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors shrink-0 cursor-pointer shadow-xs"
            title="Create new blank note"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        </div>

        {/* Note Tab Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {filteredNotes.map((note) => {
            const isActive = note.id === activeNote?.id;
            return (
              <button
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span className="max-w-[120px] truncate">{note.title || 'Untitled Note'}</span>
                {notes.length > 1 && (
                  <span
                    onClick={(e) => handleDeleteNote(note.id, e)}
                    className={`hover:text-red-400 transition-colors p-0.5 rounded ${
                      isActive ? 'text-slate-400' : 'text-slate-300 hover:text-red-600'
                    }`}
                    title="Delete note"
                  >
                    ×
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Note Active Editor */}
      {activeNote ? (
        <div className="flex-1 flex flex-col p-4 overflow-hidden bg-white">
          {/* Note Metadata Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 shrink-0">
            <input
              type="text"
              value={activeNote.title}
              onChange={(e) => updateActiveNote({ title: e.target.value })}
              placeholder="Note title..."
              className="text-sm sm:text-base font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0 flex-1 min-w-[140px]"
            />

            <div className="flex items-center gap-2">
              <select
                value={activeNote.category}
                onChange={(e) =>
                  updateActiveNote({
                    category: e.target.value as ScratchpadNote['category'],
                  })
                }
                className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="General">General</option>
                <option value="Fieldwork">Fieldwork</option>
                <option value="Literature">Literature</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Methodology Idea">Methodology Idea</option>
              </select>

              <button
                onClick={handleCopyNote}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Copy note content"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleDownloadNote}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Download as Markdown"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={(e) => handleDeleteNote(activeNote.id, e)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Markdown Formatting Toolbar */}
          <div className="flex items-center gap-1 pb-2 border-b border-slate-100 text-slate-600 text-xs shrink-0">
            <button
              onClick={() => handleInsertText('**', '**')}
              className="px-2 py-1 hover:bg-slate-100 rounded font-bold cursor-pointer"
              title="Bold"
            >
              B
            </button>
            <button
              onClick={() => handleInsertText('*', '*')}
              className="px-2 py-1 hover:bg-slate-100 rounded italic cursor-pointer"
              title="Italic"
            >
              I
            </button>
            <button
              onClick={() => handleInsertText('### ')}
              className="px-2 py-1 hover:bg-slate-100 rounded font-bold cursor-pointer text-[11px]"
              title="Heading 3"
            >
              H3
            </button>
            <button
              onClick={() => handleInsertText('- ')}
              className="px-2 py-1 hover:bg-slate-100 rounded cursor-pointer"
              title="Bullet list"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleInsertText('- [ ] ')}
              className="px-2 py-1 hover:bg-slate-100 rounded cursor-pointer"
              title="Checkbox task"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main Textarea */}
          <textarea
            ref={textareaRef}
            id="scratchpad-textarea"
            value={activeNote.content}
            onChange={(e) => updateActiveNote({ content: e.target.value })}
            placeholder="Type your fieldwork observations, researcher ideas, interview reminders, or notes here..."
            className="flex-1 w-full p-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent border-none focus:outline-none focus:ring-0 resize-none font-mono leading-relaxed mt-2"
          />

          {/* Editor Footer Status */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
            <span>
              {activeNote.content.length} characters • {activeNote.content.split(/\s+/).filter(Boolean).length} words
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Saved {new Date(activeNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
          <StickyNote className="w-12 h-12 text-slate-300 mb-2" />
          <p className="text-xs font-semibold text-slate-600">No note selected</p>
          <button
            onClick={handleCreateNote}
            className="mt-3 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold uppercase cursor-pointer"
          >
            Create New Note
          </button>
        </div>
      )}
    </div>
  );
};
