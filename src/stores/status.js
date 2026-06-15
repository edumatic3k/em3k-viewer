// src/stores/status.js
import { signal } from '@preact/signals';

// Core signals
export const statusMessage = signal(null);     // Can be string or JSX (for icons, etc.)
export const progressPercent = signal(0);      // 0 to 100

// Helper to update status (works with both strings and JSX)
export function showStatus(message, percent = 0) {
  statusMessage.value = message;
  progressPercent.value = percent;
}

// Clear everything
export function clearStatus() {
  statusMessage.value = null;
  progressPercent.value = 0;
}

// Convenience helpers
export function showSuccess(message) {
  showStatus(message);
}

export function showError(message) {
  showStatus(message);
}

export function showInfo(message) {
  showStatus(message);
}