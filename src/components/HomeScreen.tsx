import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Lock, PenLine, Search, Settings } from 'lucide-react';
import { JournalEntry, JournalMeta } from '@/types/journal';
import { formatDisplayDate, getTodayString, formatDate, parseDate, addDays } from '@/lib/dateUtils';
import { getTimeBasedGreeting } from '@/lib/greetingUtils';
import { Button } from '@/components/ui/button';
import { AIThoughtCard } from '@/components/AIThoughtCard';
import { TodayStatusCard } from '@/components/TodayStatusCard';
import { RecentEntryCard } from '@/components/RecentEntryCard';
import { notificationService } from '@/services/notifications';
import { toast } from 'sonner';

import { useCurrentTime } from '@/hooks/useCurrentTime';

interface HomeScreenProps {
  meta: JournalMeta | null;
  todayEntry: JournalEntry | undefined;
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
  const navigate = useNavigate();

  const handleEnableNotifications = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      toast.success("You're all set notified!");
    }
  };
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
          className="mb-8 flex items-start justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2 tracking-tight">
              {greeting}
            </h1>
            <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
              {displayDate}
              <span className="w-1 h-1 rounded-full bg-primary/40" />
              Day {dayIndex}
            </p>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={handleEnableNotifications}
              title="Enable Notifications"
            >
              <Bell className="w-5 h-5" />
            </Button>
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
              Recent Moments
            </h2>
            <div className="columns-2 gap-4 space-y-4">
              {recentEntries.map((entry, index) => (
                <motion.div
                  key={entry.date}
                  className="break-inside-avoid"
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
                    className={index % 3 === 0 ? "min-h-[160px]" : "min-h-[120px]"}
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
