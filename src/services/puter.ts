// Puter.js Service - No Backend Required
// Using Puter's cloud services for storage and AI

declare global {
  interface Window {
    puter: any;
  }
}

class PuterService {
  private initialized = false;
  private authChecked = false;

  async init() {
    if (this.initialized) return;

    // Puter.js will be loaded via script tag in index.html
    if (typeof window.puter === "undefined") {
      throw new Error("Puter.js not loaded. Add script tag to index.html");
    }

    this.initialized = true;
  }

  // Check and ensure authentication
  async ensureAuth(attemptSignIn = true): Promise<boolean> {
    await this.init();

    try {
      const isSignedIn = window.puter.auth.isSignedIn();

      if (!isSignedIn) {
        // If we shouldn't attempt sign-in (e.g. on initial load), just return false
        if (!attemptSignIn) {
          return false;
        }

        // Trigger Puter authentication flow
        const result = await window.puter.auth.signIn();
        this.authChecked = true;
        return result !== null;
      }

      this.authChecked = true;
      return true;
    } catch (error) {
      console.error("Auth failed:", error);
      return false;
    }
  }

  // Get current user info
  async getUser() {
    await this.ensureAuth();
    try {
      return await window.puter.auth.getUser();
    } catch (error) {
      return null;
    }
  }

  // File System Operations (require auth)
  async readFile(path: string): Promise<any> {
    const auth = await this.ensureAuth();
    if (!auth) throw new Error("Not authenticated");
    try {
      const content = await window.puter.fs.read(path);
      // Handle both string and blob responses
      if (typeof content === "string") {
        return JSON.parse(content);
      }
      const text = await content.text();
      return JSON.parse(text);
    } catch (error: any) {
      // Only log if not a "file not found" error
      if (error?.code !== "subject_does_not_exist") {
        console.error("Read file failed:", error);
      }
      return null;
    }
  }

  async writeFile(path: string, data: any): Promise<void> {
    const auth = await this.ensureAuth();
    if (!auth) throw new Error("Not authenticated");
    try {
      // Ensure parent directory exists
      const pathParts = path.split("/").filter(Boolean);
      if (pathParts.length > 1) {
        // Reconstruct directory path preserving relative/absolute nature
        const isAbsolute = path.startsWith('/');
        const dirPath = (isAbsolute ? '/' : '') + pathParts.slice(0, -1).join("/");
        await this.ensureDirectory(dirPath);
      }
      await window.puter.fs.write(path, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Write file failed:", error);
      throw error;
    }
  }

  async ensureDirectory(path: string): Promise<void> {
    try {
      await window.puter.fs.stat(path);
    } catch {
      // Directory doesn't exist, create it
      try {
        await window.puter.fs.mkdir(path, { recursive: true });
      } catch (error) {
        console.error("Create directory failed:", error);
        throw error;
      }
    }
  }

  async deleteFile(path: string): Promise<void> {
    const auth = await this.ensureAuth();
    if (!auth) throw new Error("Not authenticated");
    try {
      await window.puter.fs.delete(path);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  }

  async listFiles(path: string): Promise<string[]> {
    const auth = await this.ensureAuth();
    if (!auth) return [];
    try {
      const files = await window.puter.fs.readdir(path);
      return files.map((f: any) => f.name);
    } catch (error) {
      console.error("List files failed:", error);
      // Try to create directory if it doesn't exist
      try {
        await this.ensureDirectory(path);
        return [];
      } catch {
        return [];
      }
    }
  }

  // AI Chat Operations (require auth)
  async chat(
    prompt: string,
    options: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
    } = {}
  ): Promise<string> {
    const auth = await this.ensureAuth(false);
    if (!auth) throw new Error("Not authenticated");
    try {
      const response = await window.puter.ai.chat(prompt, {
        model: options.model || "gpt-4o-mini",
        temperature: options.temperature ?? 0.6,
        max_tokens: options.max_tokens || 100,
      });

      return response.message?.content || response.text || "";
    } catch (error) {
      console.error("AI chat failed:", error);
      throw error;
    }
  }

  // Get available AI models
  async listModels(): Promise<string[]> {
    await this.ensureAuth();
    try {
      const models = await window.puter.ai.listModels();
      return models;
    } catch (error) {
      console.error("List models failed:", error);
      return [];
    }
  }

  // Sign out
  async signOut() {
    await this.init();
    try {
      await window.puter.auth.signOut();
      this.authChecked = false;
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }
}

export const puterService = new PuterService();
