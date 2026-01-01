import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navigation, Route } from '@/components/Navigation';
import { HomeScreen } from '@/components/HomeScreen';
import { WriteScreen } from '@/components/WriteScreen';
import { CalendarScreen } from '@/components/CalendarScreen';
import { useJournal } from '@/hooks/useJournal';
import { getTodayString, parseDate, formatDate, addDays } from '@/lib/dateUtils';

const Index = () => {
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [selectedDate, setSelectedDate] = useState(getTodayString());

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
