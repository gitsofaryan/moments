import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { JournalEntry } from '@/types/journal';
import { formatDisplayDate, isEntryLocked } from '@/lib/dateUtils';

interface RecentEntryCardProps {
  entry: JournalEntry;
  onClick: () => void;
}

export function RecentEntryCard({ entry, onClick }: RecentEntryCardProps) {
  const isLocked = isEntryLocked(entry.createdAt);
  const displayDate = formatDisplayDate(entry.date);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="entry-card w-full text-left"
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground">{displayDate}</span>
            {isLocked && (
              <Lock className="w-3 h-3 text-muted-foreground/60" />
            )}
          </div>
          
          {entry.title ? (
            <h4 className="text-sm font-medium text-foreground truncate">
              {entry.title}
            </h4>
          ) : (
            <h4 className="text-sm text-muted-foreground italic">
              Untitled
            </h4>
          )}
        </div>

        {/* Small indicator dot */}
        <div className="w-2 h-2 rounded-full bg-journal-dot-filled mt-2 flex-shrink-0" />
      </div>
    </motion.button>
  );
}
