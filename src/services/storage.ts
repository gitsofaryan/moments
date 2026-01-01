import { JournalEntry, JournalMeta } from "@/types/journal";

// Local Storage Service
class StorageService {
  private readonly STORAGE_KEYS = {
    ENTRIES: "journey_entries",
    META: "journey_meta",
    AI_THOUGHTS: "journey_ai_thoughts",
    WEEKLY_SUMMARIES: "journey_weekly_summaries"
  };

  // Helper to safe parse JSON
  private getFromStorage<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage`, e);
      return null;
    }
  }

  // Helper to save to storage
  private saveToStorage(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Error writing ${key} to localStorage`, e);
    }
  }

  // Entry Operations
  async getEntry(date: string): Promise<JournalEntry | null> {
    const entries = this.getFromStorage<Record<string, JournalEntry>>(this.STORAGE_KEYS.ENTRIES) || {};
    return entries[date] || null;
  }

  async saveEntry(entry: JournalEntry): Promise<void> {
    const entries = this.getFromStorage<Record<string, JournalEntry>>(this.STORAGE_KEYS.ENTRIES) || {};
    entries[entry.date] = entry;
    this.saveToStorage(this.STORAGE_KEYS.ENTRIES, entries);
  }

  async deleteEntry(date: string): Promise<void> {
    const entries = this.getFromStorage<Record<string, JournalEntry>>(this.STORAGE_KEYS.ENTRIES) || {};
    delete entries[date];
    this.saveToStorage(this.STORAGE_KEYS.ENTRIES, entries);
  }

  async getAllEntries(): Promise<Record<string, JournalEntry>> {
    return this.getFromStorage<Record<string, JournalEntry>>(this.STORAGE_KEYS.ENTRIES) || {};
  }

  // Meta Operations
  async getMeta(): Promise<JournalMeta | null> {
    return this.getFromStorage<JournalMeta>(this.STORAGE_KEYS.META);
  }

  async saveMeta(meta: JournalMeta): Promise<void> {
    this.saveToStorage(this.STORAGE_KEYS.META, meta);
  }

  // AI Thoughts Storage
  async getAIThought(date: string): Promise<{ thought: string; generatedAt: number } | null> {
    const thoughts = this.getFromStorage<Record<string, { thought: string; generatedAt: number }>>(this.STORAGE_KEYS.AI_THOUGHTS) || {};
    return thoughts[date] || null;
  }

  async saveAIThought(date: string, thought: string): Promise<void> {
    const thoughts = this.getFromStorage<Record<string, { thought: string; generatedAt: number }>>(this.STORAGE_KEYS.AI_THOUGHTS) || {};
    thoughts[date] = {
      thought,
      generatedAt: Date.now()
    };
    this.saveToStorage(this.STORAGE_KEYS.AI_THOUGHTS, thoughts);
  }

  async getWeeklySummary(week: number): Promise<any | null> {
    const summaries = this.getFromStorage<Record<number, any>>(this.STORAGE_KEYS.WEEKLY_SUMMARIES) || {};
    return summaries[week] || null;
  }

  async saveWeeklySummary(week: number, summary: string): Promise<void> {
    const summaries = this.getFromStorage<Record<number, any>>(this.STORAGE_KEYS.WEEKLY_SUMMARIES) || {};
    summaries[week] = {
      week,
      summary,
      generatedAt: Date.now()
    };
    this.saveToStorage(this.STORAGE_KEYS.WEEKLY_SUMMARIES, summaries);
  }
}

export const storageService = new StorageService();
