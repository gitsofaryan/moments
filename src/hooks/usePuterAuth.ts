import { useState, useEffect } from "react";
import { puterService } from "@/services/puter";

import { storageService } from "@/services/storage";

export function usePuterAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Wait for Puter to load
    const checkPuterAndAuth = async () => {
      let attempts = 0;
      while (!window.puter && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      if (window.puter) {
        await checkAuth();
      } else {
        console.error("Puter.js failed to load");
        setIsLoading(false);
      }
    };

    checkPuterAndAuth();
  }, []);

  async function checkAuth() {
    try {
      // Don't auto-trigger sign in on initial check
      await puterService.init();
      const isSignedIn = window.puter?.auth?.isSignedIn();

      if (isSignedIn) {
        const userData = await puterService.getUser();
        setUser(userData);
        storageService.setUserId(userData.id); // Set User ID for isolated storage
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        storageService.setUserId(null); // Ensure guest mode
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      storageService.setUserId(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn() {
    setIsLoading(true);
    try {
      const result = await window.puter.auth.signIn();
      if (result) {
        const userData = await puterService.getUser();
        setUser(userData);
        storageService.setUserId(userData.id); // Set User ID for isolated storage
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Sign in failed:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    setIsLoading(true);
    try {
      await puterService.signOut();
      setUser(null);
      storageService.setUserId(null); // Clear User ID
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isAuthenticated,
    isLoading,
    user,
    signIn,
    signOut,
  };
}
