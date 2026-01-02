import { JournalEntry, JournalMeta } from "@/types/journal";
import { puterService } from "./puter";
import { isToday, isDateInFuture } from "@/lib/dateUtils";

// Local Storage Service
class StorageService {
  private currentUserId: string | null = null;
  
  private readonly BASE_STORAGE_KEYS = {
    ENTRIES: "journey_entries",
    META: "journey_meta",
    AI_THOUGHTS: "journey_ai_thoughts",
    WEEKLY_SUMMARIES: "journey_weekly_summaries",
    LAST_SYNC: "journey_last_sync"
  };

  setUserId(userId: string | null) {
    console.log("Setting user ID:", userId);
    this.currentUserId = userId;
    
    // If we have a user ID, we might need to migrate "guest" data if this is their first time
    if (userId) {
      this.migrateGuestData(userId);
    }
  }

  private get STORAGE_KEYS() {
    const suffix = this.currentUserId ? `_${this.currentUserId}` : '';
    return {
      ENTRIES: `${this.BASE_STORAGE_KEYS.ENTRIES}${suffix}`,
      META: `${this.BASE_STORAGE_KEYS.META}${suffix}`,
      AI_THOUGHTS: `${this.BASE_STORAGE_KEYS.AI_THOUGHTS}${suffix}`,
      WEEKLY_SUMMARIES: `${this.BASE_STORAGE_KEYS.WEEKLY_SUMMARIES}${suffix}`,
      LAST_SYNC: `${this.BASE_STORAGE_KEYS.LAST_SYNC}${suffix}`
    };
  }
  
  private migrateGuestData(userId: string) {
    // Check if user has any existing data
    const userKeys = {
      ENTRIES: `${this.BASE_STORAGE_KEYS.ENTRIES}_${userId}`,
      META: `${this.BASE_STORAGE_KEYS.META}_${userId}`
    };
    
    const hasUserData = localStorage.getItem(userKeys.ENTRIES) || localStorage.getItem(userKeys.META);
    
    if (!hasUserData) {
        console.log("New user detected. Checking for guest data to migrate...");
        // Check for guest data
        const guestEntries = localStorage.getItem(this.BASE_STORAGE_KEYS.ENTRIES);
        
        if (guestEntries) {
            console.log("Migrating guest data to user", userId);
            try {
                // Copy all guest data to user keys
                Object.keys(this.BASE_STORAGE_KEYS).forEach(key => {
                    const guestKey = this.BASE_STORAGE_KEYS[key as keyof typeof this.BASE_STORAGE_KEYS];
                    const userKey = `${guestKey}_${userId}`;
                    const data = localStorage.getItem(guestKey);
                    
                    if (data) {
                        localStorage.setItem(userKey, data);
                        // Optional: Clear guest data after migration to ensure privacy for next user
                        localStorage.removeItem(guestKey);
                    }
                });
                console.log("Migration complete.");
            } catch (e) {
                console.error("Migration failed", e);
            }
        }
    }
  }

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

  // Puter Sync Operations
  async archiveEntryToPuter(entry: JournalEntry) {
    try {
      // Structure: /journey/entries/2024/01/2024-01-01.json
      const date = new Date(entry.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const path = `journey/entries/${year}/${month}/${entry.date}.json`;
      
      await puterService.writeFile(path, entry);
      console.log(`Archived entry for ${entry.date} to Puter`);
      return true;
    } catch (error) {
      console.error(`Failed to archive entry for ${entry.date} to Puter`, error);
      return false;
    }
  }

  async syncPastEntries() {
    // Rate limit: Run max once every 12 hours
    const SYNC_INTERVAL = 12 * 60 * 60 * 1000;
    const lastSync = parseInt(localStorage.getItem(this.STORAGE_KEYS.LAST_SYNC) || '0');
    const now = Date.now();

    if (now - lastSync < SYNC_INTERVAL) {
      console.log(`Skipping Puter sync (Last sync was ${(now - lastSync) / 1000 / 60}m ago)`);
      return;
    }

    console.log("Starting sync of past entries to Puter...");
    const entries = await this.getAllEntries();
    
    // Process sequentially to avoid overwhelming Puter or browser
    for (const date in entries) {
      const entry = entries[date];
      
      // Check if entry is from a past day
      // We skip today and future dates
      if (!isToday(date) && !isDateInFuture(date)) {
        await this.archiveEntryToPuter(entry);
      }
    }
    
    // Update last sync timestamp
    localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC, now.toString());
    console.log("Completed sync of past entries");
  }

  async getEntryFromPuter(dateStr: string): Promise<JournalEntry | null> {
    try {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const path = `journey/entries/${year}/${month}/${dateStr}.json`;

      const exists = await puterService.readFile(path);
      if (exists) {
        // Evaluate it just in case it's returned as string
        const entry = typeof exists === 'string' ? JSON.parse(exists) : exists;
        
        // Restore to local storage so we don't have to fetch again
        await this.saveEntry(entry);
        return entry;
      }
      return null;
    } catch (error) {
      console.log(`No entry found on Puter for ${dateStr}`);
      return null;
    }
  }
}

export const storageService = new StorageService();
