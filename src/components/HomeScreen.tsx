import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, Lock } from 'lucide-react';
import { JournalEntry, JournalMeta, DayStatus } from '@/types/journal';
import { formatDisplayDate, getTodayString, formatDate, parseDate, addDays } from '@/lib/dateUtils';
import { getTimeBasedGreeting } from '@/lib/greetingUtils';
import { AIThoughtCard } from './AIThoughtCard';
import { TodayStatusCard } from './TodayStatusCard';
import { RecentEntryCard } from './RecentEntryCard';

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
  const greeting = getTimeBasedGreeting();
  const today = getTodayString();
  const displayDate = formatDisplayDate(today);
  const dayIndex = meta ? Math.min(
    Math.floor((Date.now() - parseDate(meta.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
    365
  ) : 1;

  return (
    <motion.div
      className="min-h-screen pb-28 safe-top"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
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
          className="mb-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-muted-foreground text-sm mb-1">{displayDate}</p>
          <h1 className="font-display text-4xl font-semibold text-foreground mb-1">
            {greeting}
          </h1>
          <p className="text-muted-foreground">
            Day {dayIndex} of 365
          </p>
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
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Recent days
            </h2>
            <div className="space-y-3">
              {recentEntries.map((entry, index) => (
                <motion.div
                  key={entry.date}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                >
                  <RecentEntryCard
                    entry={entry}
                    onClick={() => onViewEntry(entry.date)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </motion.div>
  );
}
