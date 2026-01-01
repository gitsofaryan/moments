import { useState, useEffect, useCallback } from 'react';
import { JournalEntry, JournalMeta, DayStatus } from '@/types/journal';
import { 
  formatDate, 
  parseDate, 
  getDayIndex, 
  isEntryLocked, 
  getTodayString,
  addDays,
  isDateInFuture,
  isToday as checkIsToday
} from '@/lib/dateUtils';

const STORAGE_KEY = 'journey_entries';
const META_KEY = 'journey_meta';

export function useJournal() {
  const [entries, setEntries] = useState<Record<string, JournalEntry>>({});
  const [meta, setMeta] = useState<JournalMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize journey
  useEffect(() => {
    loadJournalData();
  }, []);

  const loadJournalData = useCallback(() => {
    try {
      const storedEntries = localStorage.getItem(STORAGE_KEY);
      const storedMeta = localStorage.getItem(META_KEY);

      if (storedEntries) {
        const parsed = JSON.parse(storedEntries);
        // Update lock status for all entries
        const updated: Record<string, JournalEntry> = {};
        Object.entries(parsed).forEach(([date, entry]) => {
          const e = entry as JournalEntry;
          updated[date] = {
            ...e,
            locked: isEntryLocked(e.createdAt)
          };
        });
        setEntries(updated);
      }

      if (storedMeta) {
        setMeta(JSON.parse(storedMeta));
      } else {
        // Initialize new journey
        const newMeta: JournalMeta = {
          startDate: getTodayString(),
          totalDays: 365,
          entriesCount: 0
        };
        setMeta(newMeta);
        localStorage.setItem(META_KEY, JSON.stringify(newMeta));
      }
    } catch (error) {
      console.error('Failed to load journal data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveEntry = useCallback((entry: JournalEntry) => {
    setEntries(prev => {
      const updated = { ...prev, [entry.date]: entry };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    // Update meta
    setMeta(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        entriesCount: Object.keys(entries).length + (entries[entry.date] ? 0 : 1)
      };
      localStorage.setItem(META_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [entries]);

  const getEntry = useCallback((date: string): JournalEntry | null => {
    const entry = entries[date];
    if (entry) {
      return {
        ...entry,
        locked: isEntryLocked(entry.createdAt)
      };
    }
    return null;
  }, [entries]);

  const createOrUpdateEntry = useCallback((date: string, title: string, contentHtml: string) => {
    const existing = entries[date];
    
    if (existing && existing.locked) {
      console.warn('Cannot update locked entry');
      return null;
    }

    const now = Date.now();
    const entry: JournalEntry = {
      date,
      dayIndex: meta ? getDayIndex(meta.startDate, date) : 1,
      title,
      contentHtml,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      locked: false
    };

    saveEntry(entry);
    return entry;
  }, [entries, meta, saveEntry]);

  const getDayStatus = useCallback((date: string): DayStatus => {
    const entry = entries[date];
    const dayIndex = meta ? getDayIndex(meta.startDate, date) : 1;
    
    return {
      date,
      dayIndex,
      hasEntry: !!entry && (entry.title.trim() !== '' || entry.contentHtml.trim() !== ''),
      isLocked: entry ? isEntryLocked(entry.createdAt) : false,
      isFuture: isDateInFuture(date),
      isToday: checkIsToday(date),
      wordCount: entry ? countWords(entry.contentHtml) : 0
    };
  }, [entries, meta]);

  const getAllDayStatuses = useCallback((): DayStatus[] => {
    if (!meta) return [];
    
    const statuses: DayStatus[] = [];
    const startDate = parseDate(meta.startDate);
    
    for (let i = 0; i < 365; i++) {
      const date = formatDate(addDays(startDate, i));
      statuses.push(getDayStatus(date));
    }
    
    return statuses;
  }, [meta, getDayStatus]);

  return {
    entries,
    meta,
    isLoading,
    getEntry,
    createOrUpdateEntry,
    getDayStatus,
    getAllDayStatuses,
    saveEntry
  };
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}
