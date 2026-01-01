
import { useEffect, useState } from "react";
import { puterService } from "@/services/puter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        setIsChecking(true);
        try {
            // Small delay to ensure Puter.js is loaded
            await new Promise(resolve => setTimeout(resolve, 500));
            // Don't auto-trigger sign in on load (prevents popup blocker errors)
            const auth = await puterService.ensureAuth(false);
            setIsAuthenticated(auth);
        } catch (error) {
            console.error("Auth check failed", error);
            setIsAuthenticated(false);
        } finally {
            setIsChecking(false);
        }
    };

    const handleSignIn = async () => {
        setIsChecking(true);
        try {
            const result = await window.puter.auth.signIn();
            if (result) {
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error("Sign in failed", error);
        } finally {
            setIsChecking(false);
        }
    };

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Connecting to Puter...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="max-w-md w-full p-8 space-y-6 bg-card border-border/50">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-display font-bold">Welcome Back</h1>
                        <p className="text-muted-foreground">
                            Sign in with Puter to enable AI features and sync your journey.
                        </p>
                    </div>

                    <Button
                        onClick={handleSignIn}
                        className="w-full h-12 text-lg font-medium"
                        size="lg"
                    >
                        Sign in with Puter
                    </Button>

                    <p className="text-xs text-center text-muted-foreground/50">
                        Your journal entries are stored locally on this device.
                        Puter is used for AI generation.
                    </p>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}
