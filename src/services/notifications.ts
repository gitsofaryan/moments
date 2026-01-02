import { toast } from "sonner";

export const notificationService = {
  isSupported: () => 'Notification' in window,

  hasPermission: () => {
    if (!('Notification' in window)) return false;
    return Notification.permission === 'granted';
  },

  async requestPermission() {
    if (!this.isSupported()) {
      toast.error("Notifications not supported on this device.");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.send("Notifications Enabled!", "We'll remind you to capture your journey.");
        return true;
      } else {
        toast.info("Notifications blocked.");
        return false;
      }
    } catch (error) {
      console.error("Error asking for permission:", error);
      return false;
    }
  },

  send(title: string, body?: string) {
    if (!this.isSupported() || Notification.permission !== 'granted') return;

    try {
      // Try Service Worker first (better for mobile)
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            body,
            icon: '/android-chrome-192x192.png',
            badge: '/android-chrome-192x192.png',
            vibrate: [200, 100, 200]
          } as any);
        });
      } else {
        // Fallback to standard API
        new Notification(title, {
          body,
          icon: '/android-chrome-192x192.png'
        });
      }
    } catch (e) {
      console.error("Notification trigger failed", e);
    }
  }
};
