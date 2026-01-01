import { motion } from 'framer-motion';
import { PenLine, ChevronRight, Clock } from 'lucide-react';
import { JournalEntry } from '@/types/journal';
import { isEntryLocked, getTimeUntilLock, formatTimeRemaining, formatDisplayDate } from '@/lib/dateUtils';

interface TodayStatusCardProps {
  entry: JournalEntry | null;
  onWriteClick: () => void;
}

export function TodayStatusCard({ entry, onWriteClick }: TodayStatusCardProps) {
  const hasWritten = entry && (entry.title.trim() || entry.contentHtml.replace(/<[^>]*>/g, '').trim());
  const isLocked = entry ? isEntryLocked(entry.createdAt) : false;
  const timeRemaining = entry ? getTimeUntilLock(entry.createdAt) : 0;

  const displayDate = entry ? formatDisplayDate(entry.date) : formatDisplayDate(new Date().toISOString().split('T')[0]);

  if (!hasWritten) {
    return (
      <motion.button
        type="button"
        onClick={onWriteClick}
        className="status-card w-full text-left group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-muted/50 group-hover:bg-primary/10 transition-colors">
              <PenLine className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
              <p className="text-foreground font-medium">You haven't written today</p>
              <p className="text-sm text-muted-foreground">Capture this moment</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </motion.button>
    );
  }

  // Has written today
  const previewText = entry.contentHtml
    .replace(/<[^>]*>/g, ' ')
    .trim()
    .slice(0, 80);

  return (
    <motion.button
      type="button"
      onClick={onWriteClick}
      className="status-card w-full text-left group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary uppercase tracking-wider">{displayDate}</span>
            {!isLocked && timeRemaining > 0 && timeRemaining < 14400000 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatTimeRemaining(timeRemaining)}
              </span>
            )}
          </div>

          {entry.title && (
            <h3 className="font-display text-lg text-foreground mb-1 truncate">
              {entry.title}
            </h3>
          )}

          {previewText && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {previewText}...
            </p>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-1" />
      </div>
    </motion.button>
  );
}
