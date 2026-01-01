import { puterService } from "./puter";
import { JournalEntry, JournalMeta } from "@/types/journal";

// All storage using Puter FS - No backend
class StorageService {
  private readonly ENTRIES_PATH = "/journey/entries";
  private readonly META_PATH = "/journey/meta.json";
  private readonly AI_PATH = "/journey/ai";

  // Entry Operations
  async getEntry(date: string): Promise<JournalEntry | null> {
    try {
      return await puterService.readFile(`${this.ENTRIES_PATH}/${date}.json`);
    } catch (error) {
      console.error("Failed to get entry:", error);
      return null;
    }
  }

  async saveEntry(entry: JournalEntry): Promise<void> {
    try {
      await puterService.writeFile(
        `${this.ENTRIES_PATH}/${entry.date}.json`,
        entry
      );
    } catch (error) {
      console.error("Failed to save entry:", error);
      throw error;
    }
  }

  async deleteEntry(date: string): Promise<void> {
    try {
      await puterService.deleteFile(`${this.ENTRIES_PATH}/${date}.json`);
    } catch (error) {
      console.error("Failed to delete entry:", error);
      throw error;
    }
  }

  async getAllEntries(): Promise<Record<string, JournalEntry>> {
    try {
      const files = await puterService.listFiles(this.ENTRIES_PATH);
      const entries: Record<string, JournalEntry> = {};

      for (const file of files) {
        if (file.endsWith(".json")) {
          const date = file.replace(".json", "");
          const entry = await this.getEntry(date);
          if (entry) {
            entries[date] = entry;
          }
        }
      }

      return entries;
    } catch (error) {
      console.error("Failed to get all entries:", error);
      return {};
    }
  }

  // Meta Operations
  async getMeta(): Promise<JournalMeta | null> {
    try {
      return await puterService.readFile(this.META_PATH);
    } catch (error) {
      return null;
    }
  }

  async saveMeta(meta: JournalMeta): Promise<void> {
    try {
      await puterService.writeFile(this.META_PATH, meta);
    } catch (error) {
      console.error("Failed to save meta:", error);
      throw error;
    }
  }

  // AI Thoughts Storage
  async getAIThought(
    date: string
  ): Promise<{ thought: string; generatedAt: number } | null> {
    try {
      return await puterService.readFile(`${this.AI_PATH}/home/${date}.json`);
    } catch (error) {
      return null;
    }
  }

  async saveAIThought(date: string, thought: string): Promise<void> {
    try {
      await puterService.writeFile(`${this.AI_PATH}/home/${date}.json`, {
        date,
        thought,
        generatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Failed to save AI thought:", error);
    }
  }

  async getWeeklySummary(week: number): Promise<any | null> {
    try {
      return await puterService.readFile(
        `${this.AI_PATH}/weekly/week-${week}.json`
      );
    } catch (error) {
      return null;
    }
  }

  async saveWeeklySummary(week: number, summary: string): Promise<void> {
    try {
      await puterService.writeFile(`${this.AI_PATH}/weekly/week-${week}.json`, {
        week,
        summary,
        generatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Failed to save weekly summary:", error);
    }
  }
}

export const storageService = new StorageService();
