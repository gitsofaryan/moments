import { motion } from 'framer-motion';
import { YearGrid } from './YearGrid';
import { DayStatus, JournalMeta } from '@/types/journal';

interface YearScreenProps {
  days: DayStatus[];
  meta: JournalMeta | null;
  onDayClick: (date: string) => void;
}

export function YearScreen({ days, meta, onDayClick }: YearScreenProps) {
  const entriesCount = days.filter(d => d.hasEntry).length;
  const progress = Math.round((entriesCount / 365) * 100);

  return (
    <motion.div 
      className="min-h-screen pb-24 safe-top"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-2xl mx-auto px-4 pt-8 sm:pt-12">
        {/* Header */}
        <motion.header 
          className="mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-foreground mb-2">
            Your Year
          </h1>
          <p className="text-muted-foreground">
            {entriesCount} of 365 days recorded
          </p>

          {/* Progress bar */}
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            />
          </div>
        </motion.header>

        {/* Year Grid */}
        <YearGrid days={days} onDayClick={onDayClick} />

        {/* Legend */}
        <motion.div 
          className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-journal-dot-empty" />
            <span>Empty</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-journal-dot-filled" />
            <span>Written</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary ring-2 ring-primary/50" />
            <span>Today</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
