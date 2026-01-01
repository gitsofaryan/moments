import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, Lock } from 'lucide-react';
import { JournalEntry, JournalMeta, DayStatus } from '@/types/journal';
import { formatDisplayDate, getTodayString, formatDate, parseDate, addDays } from '@/lib/dateUtils';
import { getTimeBasedGreeting } from '@/lib/greetingUtils';
import { AIThoughtCard } from './AIThoughtCard';
import { TodayStatusCard } from './TodayStatusCard';
import { RecentEntryCard } from './RecentEntryCard';

import { useCurrentTime } from '@/hooks/useCurrentTime';

interface HomeScreenProps {
  meta: JournalMeta | null;
  todayEntry: JournalEntry | null;
  recentEntries: JournalEntry[];
  onNavigateToWrite: () => void;
  onViewEntry: (date: string) => void;
}

export function HomeScreen({
  meta,
  todayEntry,
  recentEntries,
  onNavigateToWrite,
  onViewEntry,
}: HomeScreenProps) {
  const now = useCurrentTime(); // updates every minute
  const greeting = getTimeBasedGreeting(now);
  const todayString = formatDate(now);
  const displayDate = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const displayTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const dayIndex = meta ? Math.min(
    Math.floor((now.getTime() - parseDate(meta.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
    365
  ) : 1;

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
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(35 85% 58% / 0.1), transparent 70%)',
        }}
      />

      <div className="max-w-lg mx-auto px-5 pt-12">
        {/* Header */}
        <motion.header
          className="mb-12"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >

          <h1 className="font-display text-5xl sm:text-6xl font-bold text-foreground mb-3 tracking-tight">
            {greeting}
          </h1>

          <div className="flex flex-col gap-1 pl-1">
            <p className="text-xl text-foreground/80 font-display italic">
              {displayDate}
            </p>
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-2">
              Day {dayIndex} of 365
              <span className="w-1 h-1 rounded-full bg-primary/40" />
              <span className="font-mono opacity-60">{displayTime}</span>
            </p>
          </div>
        </motion.header>

        {/* AI Thought Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <AIThoughtCard />
        </motion.div>

        {/* Today Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <TodayStatusCard
            entry={todayEntry}
            onWriteClick={onNavigateToWrite}
          />
        </motion.div>

        {/* Recent Entries */}
        {recentEntries.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6 px-1">
              Recent days
            </h2>
            <div className="grid grid-cols-2 gap-3 auto-rows-[160px]">
              {recentEntries.map((entry, index) => {
                // Irregular pattern: 1st is wide, then 2 squares, then wide...
                // index 0 -> span 2
                // index 1 -> span 1
                // index 2 -> span 1
                // index 3 -> span 2
                const isWide = index % 3 === 0;

                return (
                  <motion.div
                    key={entry.date}
                    className={isWide ? "col-span-2" : "col-span-1"}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      delay: 0.1 + index * 0.1,
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }}
                  >
                    <RecentEntryCard
                      entry={entry}
                      onClick={() => onViewEntry(entry.date)}
                      className="h-full"
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}
      </div>
    </motion.div>
  );
}
