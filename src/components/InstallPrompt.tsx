import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Download, Share } from 'lucide-react';

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIosDevice);

        // Handle Android/Desktop Install Prompt
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Trigger toast immediately when event is captured
            toast("Install Moments", {
                description: "Get the best experience with offline access.",
                action: {
                    label: "Install",
                    onClick: () => {
                        // We need to trigger the prompt here, but we can't pass args to onClick easily in some toast libs
                        // So we'll trigger a custom event or just rely on state if we could.
                        // Actually, let's just use a custom toast ID to find it or just simple logic.
                        // Wait, we need to call prompt() on the specific event instance stored in state.
                        // We'll dispatch a custom event or handle it via a separate UI if toast is limited.
                        // Sonner actions are simple callbacks, so this works:
                        e.prompt();
                        (e as any).userChoice.then((choiceResult: any) => {
                            if (choiceResult.outcome === 'accepted') {
                                console.log('User accepted the install prompt');
                            }
                            setDeferredPrompt(null);
                        });
                    }
                },
                duration: 8000,
                icon: <Download className="w-4 h-4" />
            });
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Handle iOS Instructions (One-time check could be better, but on load is fine for now)
        // Only show if not in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (isIosDevice && !isStandalone) {
            // Small delay to not overwhelm
            setTimeout(() => {
                toast("Install on iOS", {
                    description: "Tap Share 'box with arrow' then 'Add to Home Screen'",
                    duration: 8000,
                    icon: <Share className="w-4 h-4" />
                });
            }, 2000);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    return null; // Headless component
}
