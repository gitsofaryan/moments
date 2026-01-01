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

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`floating-card transition-all duration-300 w-full p-5 flex flex-col justify-between group hover:border-white/20 hover:shadow-glow hover:-translate-y-1 ${className}`}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div className="flex justify-between items-start w-full">
        <span className="text-xl font-display font-bold text-white/90 group-hover:text-primary transition-colors">
          {displayDate.split(' ')[0]}
          <span className="block text-xs font-sans font-normal text-muted-foreground uppercase tracking-wider mt-1">
            {displayDate.split(' ').slice(1).join(' ')}
          </span>
        </span>
        {isLocked && (
          <Lock className="w-4 h-4 text-white/40" />
        )}
      </div>

      <div className="w-full text-left">
        {entry.title ? (
          <h4 className="text-sm font-medium text-white/80 line-clamp-3 leading-snug group-hover:text-white transition-colors">
            {entry.title}
          </h4>
        ) : (
          <h4 className="text-sm text-white/40 italic">
            Untitled
          </h4>
        )}
      </div>
    </motion.button>
  );
}
