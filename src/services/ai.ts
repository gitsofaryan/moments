import { puterService } from "./puter";
import { storageService } from "./storage";
import { JournalEntry } from "@/types/journal";
import { toast } from "sonner";

// AI Service using puter.ai.chat() - No external backend
class AIService {
  // Generate daily home thought
  async generateHomeThought(recentEntries: JournalEntry[]): Promise<string> {
    // Combine recent entries into text
    const recentEntriesText = recentEntries
      .map((entry) => {
        const text = entry.contentHtml.replace(/<[^>]*>/g, " ").trim();
        return `${entry.title}\n${text}`;
      })
      .join("\n\n");

    const prompt = `
You are a sarcastic, dry-witted observer of my life.

Based on the following journal text, write ONE short, witty, slightly roasty comment.
Don't be mean, just dry and funny.
Poke fun at my patterns or complaints to make me laugh.

Journal:
${recentEntriesText}

Output only one short sentence.`;

    try {
      const thought = await puterService.chat(prompt, {
        model: "grok-4-fast",
        temperature: 0.6,
        max_tokens: 60,
      });

      return thought;
    } catch (error) {
      console.error("Failed to generate home thought:", error);
      toast.error("AI Service Error: Please ensure you are signed in to Puter.");
      return "Your journey continues...";
    }
  }

  // Generate weekly summary
  async generateWeeklySummary(entries: JournalEntry[]): Promise<string> {
    const entriesText = entries
      .map((entry) => {
        const text = entry.contentHtml.replace(/<[^>]*>/g, " ").trim();
        return `Day ${entry.dayIndex}: ${entry.title}\n${text}`;
      })
      .join("\n\n");

    const prompt = `
You are analyzing a week's worth of personal journal entries.

Write a short narrative summary.
Do not give advice.
Do not judge.
Do not suggest actions.

Just describe patterns, tone shifts, or recurring themes.

Entries:
${entriesText}

Output 2-3 sentences.`;

    try {
      const summary = await puterService.chat(prompt, {
        model: "grok-4-fast",
        temperature: 0.5,
        max_tokens: 150,
      });

      return summary;
    } catch (error) {
      console.error("Failed to generate weekly summary:", error);
      return "A week of thoughts captured.";
    }
  }

  // Generate monthly reflection
  async generateMonthlyReflection(entries: JournalEntry[]): Promise<string> {
    const entriesText = entries
      .slice(0, 30) // Take first 30 for context
      .map(
        (entry) =>
          `${entry.title}: ${entry.contentHtml
            .replace(/<[^>]*>/g, " ")
            .slice(0, 100)}`
      )
      .join("\n");

    const prompt = `
You are reflecting on a month of journal entries.

Identify the main themes and emotional patterns.
Do not give advice.
Do not judge.
Do not analyze deeply.

Just observe what emerged this month.

Entries:
${entriesText}

Output 3-4 sentences.`;

    try {
      const reflection = await puterService.chat(prompt, {
        model: "grok-4-fast",
        temperature: 0.5,
        max_tokens: 200,
      });

      return reflection;
    } catch (error) {
      console.error("Failed to generate monthly reflection:", error);
      return "Another month documented.";
    }
  }

  // Generate gentle notification thought
  async generateNotificationThought(): Promise<string> {
    const prompt = `
Write one short, sarcastic notification to get my attention.
Be dry. Be witty.
Maybe imply I'm procrastinating or forgetting something.

Output one short sentence.`;

    try {
      const thought = await puterService.chat(prompt, {
        model: "grok-4-fast",
        temperature: 0.7,
        max_tokens: 40,
      });

      return thought;
    } catch (error) {
      return "You haven't said anything about today yet.";
    }
  }

  // Check and generate today's thought if needed
  async ensureTodayThought(
    date: string,
    recentEntries: JournalEntry[]
  ): Promise<string> {
    // Check if today's thought exists
    const existing = await storageService.getAIThought(date);

    if (existing) {
      return existing.thought;
    }

    // Generate new thought
    if (recentEntries.length > 0) {
      const thought = await this.generateHomeThought(recentEntries);
      await storageService.saveAIThought(date, thought);
      return thought;
    }

    return "Your journey begins today.";
  }

  // Force regenerate today's thought (e.g., after a new entry)
  async regenerateTodayThought(
    date: string,
    recentEntries: JournalEntry[]
  ): Promise<string> {
    if (recentEntries.length > 0) {
      const thought = await this.generateHomeThought(recentEntries);
      await storageService.saveAIThought(date, thought);
      
      // Dispatch event to update UI
      window.dispatchEvent(new CustomEvent('ai-thought-updated', { 
        detail: { date, thought } 
      }));
      
      return thought;
    }
    return "Your journey begins today.";
  }
}

export const aiService = new AIService();
