// Notification Utility for PWA and Mobile Alerts
import { checkNotificationPermission } from "./notificationPermissionState";

export function showNativeNotification(title: string, message: string) {
  console.log(`[Notification Triggered] Title: "${title}", Message: "${message}"`);

  // 1. Device Haptic Vibration (Double tap vibration for alerts)
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch (e) {
      console.warn("Device vibration not supported or blocked by user guest policy:", e);
    }
  }

  // 2. Trigger standard browser system notification (if granted)
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted") {
      try {
        const options: NotificationOptions = {
          body: message,
          icon: "/favicon.jpg",
          badge: "/favicon.jpg",
          tag: "bato-sam-job-alert",
          requireInteraction: true,
          silent: false
        };

        // If service worker is ready, use registration to show a solid PWA notification
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(title, options);
          }).catch(() => {
            new Notification(title, options);
          });
        } else {
          new Notification(title, options);
        }
      } catch (err) {
        console.warn("System level Notification creation failed:", err);
      }
    }
  }

  // 3. Dispatch custom window event to trigger the high-end in-app top-popup dropdown toast
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("bato_native_toast", {
        detail: { title, message }
      })
    );
  }
}
