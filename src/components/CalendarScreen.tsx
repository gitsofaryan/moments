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
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
          className="mb-12 text-center sm:text-left"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="font-display text-5xl sm:text-6xl font-bold text-foreground tracking-tight">
                2026
              </h1>
              <p className="text-muted-foreground text-lg mt-1 font-display italic">
                {entriesCount} moments captured
              </p>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-4xl font-display font-medium text-primary">{Math.round((entriesCount / 365) * 100)}%</span>
              <span className="text-muted-foreground ml-1 text-sm">completed</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-secondary/50 rounded-full overflow-hidden w-full ring-1 ring-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-journal-amber to-journal-amber-glow"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
