export interface JournalEntry {
  date: string; // YYYY-MM-DD format
  dayIndex: number; // 1-365
  title: string;
  contentHtml: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
  locked: boolean;
}

export interface JournalMeta {
  startDate: string; // YYYY-MM-DD - the day the journey began
  totalDays: number;
  entriesCount: number;
}

export interface JournalSettings {
  aiReflectionsEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface AIReflection {
  date: string;
  observation: string;
  question: string;
  generatedAt: number;
}

export type ViewMode = 'today' | 'year' | 'entry';

export interface DayStatus {
  date: string;
  dayIndex: number;
  hasEntry: boolean;
  isLocked: boolean;
  isFuture: boolean;
  isToday: boolean;
  wordCount?: number;
  sentiment?: 'positive' | 'neutral' | 'reflective' | 'challenging';
}
