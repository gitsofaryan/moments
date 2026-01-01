import { motion } from 'framer-motion';
import { YearGrid } from './YearGrid';
import { DayStatus, JournalMeta } from '@/types/journal';

interface CalendarScreenProps {
  days: DayStatus[];
  meta: JournalMeta | null;
  onDayClick: (date: string) => void;
}

export function CalendarScreen({ days, meta, onDayClick }: CalendarScreenProps) {
  const entriesCount = days.filter((d) => d.hasEntry).length;
  const progress = Math.round((entriesCount / 365) * 100);

  return (
    <motion.div
      className="min-h-screen pb-28 safe-top"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* Ambient glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(35 85% 58% / 0.1), transparent 70%)',
        }}
      />

      <div className="max-w-2xl mx-auto px-5 pt-10 sm:pt-12">
        {/* Header */}
        <motion.header
          className="mb-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-foreground mb-2">
            Your Year
          </h1>
          <p className="text-muted-foreground">{entriesCount} of 365 days recorded</p>

          {/* Progress bar */}
          <div className="mt-5 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, hsl(35 85% 58%), hsl(28 80% 52%))',
              }}
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
