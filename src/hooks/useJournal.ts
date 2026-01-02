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

import { storageService } from '@/services/storage';

export function useJournal() {
  const [entries, setEntries] = useState<Record<string, JournalEntry>>({});
  const [meta, setMeta] = useState<JournalMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize journey
  useEffect(() => {
    loadJournalData();
    // Background sync of past entries to Puter
    storageService.syncPastEntries().catch(console.error);
  }, []);

  const loadJournalData = useCallback(async () => {
    try {
      const storedEntries = await storageService.getAllEntries();
      const storedMeta = await storageService.getMeta();

      if (storedEntries) {
        // Update lock status for all entries
        const updated: Record<string, JournalEntry> = {};
        Object.entries(storedEntries).forEach(([date, entry]) => {
          const e = entry as JournalEntry;
          updated[date] = {
            ...e,
            locked: isEntryLocked(e.createdAt)
          };
        });
        setEntries(updated);
      }

      if (storedMeta) {
        setMeta(storedMeta);
      } else {
        // Initialize new journey
        const newMeta: JournalMeta = {
          startDate: getTodayString(),
          totalDays: 365,
          entriesCount: 0
        };
        setMeta(newMeta);
        await storageService.saveMeta(newMeta);
      }
    } catch (error) {
      console.error('Failed to load journal data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveEntry = useCallback(async (entry: JournalEntry) => {
    setEntries(prev => {
      const updated = { ...prev, [entry.date]: entry };
      return updated;
    });
    
    // Persist to storage
    await storageService.saveEntry(entry);

    // Update meta
    if (meta) {
      const updatedMeta = {
        ...meta,
        entriesCount: Object.keys(entries).length + (entries[entry.date] ? 0 : 1)
      };
      setMeta(updatedMeta);
      await storageService.saveMeta(updatedMeta);
    }

    // Background AI Trigger (Fire and forget)
    import('@/services/ai').then(({ aiService }) => {
      setTimeout(() => {
        const recentEntries = Object.values(entries)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        aiService.regenerateTodayThought(entry.date, recentEntries).catch(console.error);
      }, 2000);
    });
  }, [entries, meta]);

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

    // Check if content actually changed to avoid spurious timestamp updates
    if (existing && existing.title === title && existing.contentHtml === contentHtml) {
      return existing;
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
