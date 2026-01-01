import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { TodayScreen } from '@/components/TodayScreen';
import { YearScreen } from '@/components/YearScreen';
import { useJournal } from '@/hooks/useJournal';
import { ViewMode } from '@/types/journal';
import { getTodayString, formatDate, parseDate, addDays, isDateInFuture } from '@/lib/dateUtils';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('today');
  const [currentDate, setCurrentDate] = useState(getTodayString());
  
  const { 
    meta, 
    isLoading, 
    getEntry, 
    createOrUpdateEntry, 
    getDayStatus,
    getAllDayStatuses 
  } = useJournal();

  const dayStatus = getDayStatus(currentDate);
  const entry = getEntry(currentDate);

  const handleViewChange = useCallback((view: ViewMode) => {
    if (view === 'today') {
      setCurrentDate(getTodayString());
    }
    setCurrentView(view);
  }, []);

  const handleDayClick = useCallback((date: string) => {
    setCurrentDate(date);
    setCurrentView('entry');
  }, []);

  const handleSave = useCallback((date: string, title: string, content: string) => {
    createOrUpdateEntry(date, title, content);
  }, [createOrUpdateEntry]);

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    const current = parseDate(currentDate);
    const newDate = addDays(current, direction === 'next' ? 1 : -1);
    const newDateString = formatDate(newDate);
    
    // Don't navigate to future dates
    if (direction === 'next' && isDateInFuture(newDateString)) {
      return;
    }
    
    // Don't navigate before journey start
    if (meta && direction === 'prev') {
      const startDate = parseDate(meta.startDate);
      if (newDate < startDate) {
        return;
      }
    }
    
    setCurrentDate(newDateString);
  }, [currentDate, meta]);

  // Calculate navigation availability
  const canGoBack = meta ? currentDate !== meta.startDate : false;
  const canGoForward = !isDateInFuture(formatDate(addDays(parseDate(currentDate), 1)));
  const isToday = currentDate === getTodayString();

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
      {/* Ambient glow effect */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(38 92% 60% / 0.15), transparent 70%)'
        }}
      />

      <AnimatePresence mode="wait">
        {currentView === 'year' ? (
          <YearScreen 
            key="year"
            days={getAllDayStatuses()}
            meta={meta}
            onDayClick={handleDayClick}
          />
        ) : (
          <TodayScreen 
            key={currentDate}
            date={currentDate}
            dayIndex={dayStatus.dayIndex}
            entry={entry}
            onSave={handleSave}
            isToday={isToday}
          />
        )}
      </AnimatePresence>

      <Navigation 
        currentView={currentView}
        onViewChange={handleViewChange}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onNavigate={handleNavigate}
        showDayNav={currentView !== 'year'}
      />
    </div>
  );
};

export default Index;
