import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { JournalEntry } from '@/types/journal';
import { formatDisplayDate, isEntryLocked } from '@/lib/dateUtils';

interface RecentEntryCardProps {
  entry: JournalEntry;
  onClick: () => void;
}

export function RecentEntryCard({ entry, onClick, className = "" }: RecentEntryCardProps & { className?: string }) {
  const isLocked = isEntryLocked(entry.createdAt);
  const displayDate = formatDisplayDate(entry.date);

  // Extract preview text
  const previewText = entry.contentHtml
    ? entry.contentHtml.replace(/<[^>]*>/g, ' ').trim().slice(0, 60)
    : '';

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`floating-card relative transition-all duration-300 w-full p-5 flex flex-col justify-between items-start text-left group hover:border-white/20 hover:shadow-glow hover:-translate-y-1 ${className}`}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Header: Date + Lock */}
      <div className="w-full flex justify-between items-start mb-3">
        <span className="text-xs font-sans font-medium text-primary uppercase tracking-wider opacity-90">
          {displayDate}
        </span>
        {isLocked && (
          <Lock className="w-3.5 h-3.5 text-white/30" />
        )}
      </div>

      {/* Content */}
      <div className="w-full">
        {entry.title ? (
          <h4 className="font-display text-lg leading-tight text-white/95 group-hover:text-white transition-colors mb-2 line-clamp-2">
            {entry.title}
          </h4>
        ) : (
          <h4 className="font-display text-lg text-white/40 italic mb-2">
            Untitled
          </h4>
        )}

        {previewText && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed opacity-80">
            {previewText}...
          </p>
        )}
      </div>
    </motion.button>
  );
}
