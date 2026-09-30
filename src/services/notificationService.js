import { parsePaymentNotification } from "../utils/notificationParser";

const SETTING_KEY = "splitmate_smart_detection_enabled";
const DISMISSED_TX_KEY = "splitmate_dismissed_tx_ids";
const DETECTED_EVENT_NAME = "splitmate:expense-detected";

export const notificationService = {
  // Check if Smart Detection is enabled by user
  isEnabled() {
    try {
      return localStorage.getItem(SETTING_KEY) === "true";
    } catch {
      return false;
    }
  },

  // Toggle or set Smart Detection
  setEnabled(enabled) {
    try {
      localStorage.setItem(SETTING_KEY, enabled ? "true" : "false");
      window.dispatchEvent(
        new CustomEvent("splitmate:smart-detection-toggled", {
          detail: { enabled },
        })
      );
    } catch (e) {
      console.error("Failed to save smart detection setting", e);
    }
  },

  // Check browser notification permission status
  getPermissionStatus() {
    if (!("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission;
  },

  // Request platform notification permission
  async requestPermission() {
    if (!("Notification" in window)) {
      return { supported: false, status: "unsupported" };
    }

    try {
      const permission = await Notification.requestPermission();
      return { supported: true, status: permission };
    } catch (e) {
      console.error("Error requesting notification permission:", e);
      return { supported: true, status: "denied" };
    }
  },

  // Check if transaction has been dismissed/processed
  isTransactionDismissed(transactionId) {
    if (!transactionId) return false;
    try {
      const dismissed = JSON.parse(
        localStorage.getItem(DISMISSED_TX_KEY) || "[]"
      );
      return dismissed.includes(transactionId);
    } catch {
      return false;
    }
  },

  // Mark transaction as dismissed/processed
  dismissTransaction(transactionId) {
    if (!transactionId) return;
    try {
      const dismissed = JSON.parse(
        localStorage.getItem(DISMISSED_TX_KEY) || "[]"
      );
      if (!dismissed.includes(transactionId)) {
        dismissed.push(transactionId);
        // Keep last 100 IDs to avoid unbounded storage
        if (dismissed.length > 100) dismissed.shift();
        localStorage.setItem(DISMISSED_TX_KEY, JSON.stringify(dismissed));
      }
      window.dispatchEvent(
        new CustomEvent("splitmate:expense-dismissed", {
          detail: { transactionId },
        })
      );
    } catch (e) {
      console.error("Failed to save dismissed transaction", e);
    }
  },

  // Process incoming raw notification text (from push / listener / manual test)
  processIncomingNotification(text, title = "") {
    if (!this.isEnabled()) {
      return null;
    }

    const parsed = parsePaymentNotification(text, title);
    if (!parsed || !parsed.isPayment) {
      return null;
    }

    // Check duplicate protection
    if (this.isTransactionDismissed(parsed.transactionId)) {
      return null;
    }

    // Dispatch event to app listeners
    window.dispatchEvent(
      new CustomEvent(DETECTED_EVENT_NAME, {
        detail: parsed,
      })
    );

    return parsed;
  },

  // Subscribe to detected payment notifications
  subscribe(callback) {
    const handler = (event) => {
      if (callback && event.detail) {
        callback(event.detail);
      }
    };
    window.addEventListener(DETECTED_EVENT_NAME, handler);
    return () => window.removeEventListener(DETECTED_EVENT_NAME, handler);
  },
};

export default notificationService;
