import React from 'react';
import { HelpCircle, BookOpen } from 'lucide-react';

interface GlossaryInlineBadgeProps {
  term: string;
  category?: string;
  onClick: (term: string) => void;
  className?: string;
}

export const GlossaryInlineBadge: React.FC<GlossaryInlineBadgeProps> = ({
  term,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={() => onClick(term)}
      className={`inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50/80 hover:bg-blue-100 hover:text-blue-900 border border-blue-200 px-2 py-0.5 rounded-md transition-all cursor-pointer shadow-2xs group ${className}`}
      title={`Click to view academic definition for "${term}"`}
    >
      <BookOpen className="w-3 h-3 text-blue-500 group-hover:text-blue-700" />
      <span>{term}</span>
    </button>
  );
};
