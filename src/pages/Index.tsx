import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navigation, Route } from '@/components/Navigation';
import { HomeScreen } from '@/components/HomeScreen';
import { WriteScreen } from '@/components/WriteScreen';
import { CalendarScreen } from '@/components/CalendarScreen';
import { useJournal } from '@/hooks/useJournal';
import { usePuterAuth } from '@/hooks/usePuterAuth';
import { getTodayString, parseDate, formatDate, addDays } from '@/lib/dateUtils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Index = () => {
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const { isAuthenticated, isLoading: authLoading, signIn } = usePuterAuth();

  const {
    entries,
    meta,
    isLoading,
    getEntry,
    createOrUpdateEntry,
    getDayStatus,
    getAllDayStatuses,
  } = useJournal();

  const todayEntry = getEntry(getTodayString());
  const dayStatus = getDayStatus(selectedDate);
  const currentEntry = getEntry(selectedDate);

  // Get recent entries (last 5-7 days with content, excluding today)
  const recentEntries = useMemo(() => {
    if (!meta) return [];

    const today = getTodayString();
    const result = [];
    const startDate = parseDate(meta.startDate);

    // Go back up to 14 days to find 5 entries
    for (let i = 1; i <= 14 && result.length < 5; i++) {
      const date = formatDate(addDays(new Date(), -i));
      const entry = entries[date];
      if (entry && (entry.title.trim() || entry.contentHtml.replace(/<[^>]*>/g, '').trim())) {
        result.push(entry);
      }
    }

    return result;
  }, [entries, meta]);

  const handleNavigate = useCallback((route: Route) => {
    if (route === 'write') {
      setSelectedDate(getTodayString());
    }
    setCurrentRoute(route);
  }, []);

  const handleDayClick = useCallback((date: string) => {
    setSelectedDate(date);
    setCurrentRoute('write');
  }, []);

  const handleSave = useCallback(
    (date: string, title: string, content: string) => {
      createOrUpdateEntry(date, title, content);
    },
    [createOrUpdateEntry]
  );

  const handleNavigateToWrite = useCallback(() => {
    setSelectedDate(getTodayString());
    setCurrentRoute('write');
  }, []);

  const handleViewEntry = useCallback((date: string) => {
    setSelectedDate(date);
    setCurrentRoute('write');
  }, []);

  // Show auth screen if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-pulse">
          <div className="w-12 h-12 rounded-full bg-primary/20 mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          className="text-center max-w-md px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="w-20 h-20 rounded-full bg-primary/20 mx-auto mb-6 flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-4xl">📖</span>
          </motion.div>
          <h1 className="font-display text-4xl font-semibold text-foreground mb-4">
            Journey
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Capture your 365-day journey. Sign in with Puter to begin.
          </p>
          <Button
            size="lg"
            onClick={signIn}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8"
          >
            Sign in to Start
          </Button>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-pulse">
          <div className="w-12 h-12 rounded-full bg-primary/20 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {currentRoute === 'home' && (
          <HomeScreen
            key="home"
            meta={meta}
            todayEntry={todayEntry}
            recentEntries={recentEntries}
            onNavigateToWrite={handleNavigateToWrite}
            onViewEntry={handleViewEntry}
          />
        )}

        {currentRoute === 'write' && (
          <WriteScreen
            key={`write-${selectedDate}`}
            date={selectedDate}
            dayIndex={dayStatus.dayIndex}
            entry={currentEntry}
            onSave={handleSave}
          />
        )}

        {currentRoute === 'calendar' && (
          <CalendarScreen
            key="calendar"
            days={getAllDayStatuses()}
            meta={meta}
            onDayClick={handleDayClick}
          />
        )}
      </AnimatePresence>

      <Navigation currentRoute={currentRoute} onNavigate={handleNavigate} />
    </div>
  );
};

export default Index;
