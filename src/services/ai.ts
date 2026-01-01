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
You are an observant AI system.
Based on the most recent journal entry, extract the key sentiment and theme.

Data:
${recentEntriesText}

Strict Rules:
- NEVER give advice
- NEVER judge behavior
- NEVER diagnose emotions
- NEVER motivate
- DO NOT act like a therapist or coach
- JUST OBSERVE and REFLECT

Output:
ONE short, observational sentence describing the sentiment or theme found.
`;

    try {
      const thought = await puterService.chat(prompt, {
        model: "grok-4-fast",
        temperature: 0.5,
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
You are an observant AI system analyzing a week of journal entries.

Goal:
Detect patterns and create a narrative summary (not statistics).

Data:
${entriesText}

Strict Rules:
- NEVER give advice
- NEVER judge behavior
- NEVER diagnose emotions
- NEVER motivate
- DO NOT act like a therapist or coach
- JUST OBSERVE and REFLECT

Output:
2-3 sentences summarizing the narrative arc and patterns.
`;

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
      .slice(0, 30)
      .map(
        (entry) =>
          `${entry.title}: ${entry.contentHtml
            .replace(/<[^>]*>/g, " ")
            .slice(0, 100)}`
      )
      .join("\n");

    const prompt = `
You are an observant AI system reflecting on a month of entries.

Goal:
Identify emotional trends and evolution in language.

Data:
${entriesText}

Strict Rules:
- NEVER give advice
- NEVER judge behavior
- NEVER diagnose emotions
- NEVER motivate
- DO NOT act like a therapist or coach
- JUST OBSERVE and REFLECT

Output:
3-4 sentences describing the evolution and trends.
`;

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

  // Generate full narrative arc (Yearly)
  async generateYearlyReflection(entries: JournalEntry[]): Promise<string> {
      // Logic for yearly (potentially large context, might need summarization strategy later)
      // For now, sampling
      const entriesText = entries
      .filter((_, i) => i % 5 === 0) // Sample every 5th entry to fit context
      .map(
        (entry) =>
          `${entry.title}: ${entry.contentHtml
            .replace(/<[^>]*>/g, " ")
            .slice(0, 100)}`
      )
      .join("\n");
      
      const prompt = `
You are an observant AI system analyzing a year of entries.

Goal:
Describe the full narrative arc and compare "You at the beginning vs now".

Data:
${entriesText}

Strict Rules:
- NEVER give advice
- NEVER judge behavior
- NEVER diagnose emotions
- NEVER motivate
- DO NOT act like a therapist or coach
- JUST OBSERVE and REFLECT

Output:
A concise paragraph describing the arc.
`;

      try {
      const reflection = await puterService.chat(prompt, {
        model: "grok-4-fast", // Using fast model for larger context handling might need care
        temperature: 0.5,
        max_tokens: 300,
      });

      return reflection;
    } catch (error) {
      console.error("Failed to generate yearly reflection:", error);
      return "A year of growth.";
    }
  }

  // Generate gentle notification thought
  async generateNotificationThought(): Promise<string> {
    const prompt = `
You are an observant AI system.
Write a short notification to prompt reflection.

Strict Rules:
- NEVER give advice
- NEVER judge
- Be observational

Output one short sentence.`;

    try {
      const thought = await puterService.chat(prompt, {
        model: "grok-4-fast",
        temperature: 0.7,
        max_tokens: 40,
      });

      return thought;
    } catch (error) {
      return "A moment to reflect.";
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
  // Transform text for Editor AI features
  async transformText(text: string, instruction: string = "Improve clarity and flow"): Promise<string> {
    const prompt = `
You are an expert editor.
Task: ${instruction}

Input Text:
"${text}"

Rules:
- Return ONLY the transformed text.
- Do not add explanations or quotes.
- Maintain the original voice but enhance according to instruction.
`;

    try {
      const result = await puterService.chat(prompt, {
        model: "grok-4-fast",
        temperature: 0.3, 
        max_tokens: 500,
      });
      return result.trim();
    } catch (error) {
      console.error("Failed to transform text:", error);
      toast.error("AI Transform failed.");
      return text; // Return original on fail
    }
  }
}

export const aiService = new AIService();
