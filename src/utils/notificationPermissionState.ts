// Safe helper to check standard browser notification permission states
export function checkNotificationPermission(): "granted" | "denied" | "default" | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}
