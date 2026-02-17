import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

// Toast store
function createToastStore() {
  const { subscribe, update } = writable<ToastItem[]>([]);

  let idCounter = 0;

  function add(message: string, type: ToastType = 'info', duration = 3000) {
    const id = `toast-${++idCounter}-${Date.now()}`;
    const toast: ToastItem = { id, message, type, duration };

    update((toasts) => [...toasts, toast]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }

    return id;
  }

  function remove(id: string) {
    update((toasts) => toasts.filter((t) => t.id !== id));
  }

  function clear() {
    update(() => []);
  }

  return {
    subscribe,
    add,
    remove,
    clear
  };
}

export const toasts = createToastStore();

// Helper functions - simple API like vanilla JS!
export const toast = {
  success: (message: string, duration?: number) => toasts.add(message, 'success', duration),
  error: (message: string, duration?: number) => toasts.add(message, 'error', duration),
  warning: (message: string, duration?: number) => toasts.add(message, 'warning', duration),
  info: (message: string, duration?: number) => toasts.add(message, 'info', duration),
  remove: (id: string) => toasts.remove(id),
  clear: () => toasts.clear()
};

// For direct store access if needed
export { toasts as toastStore };
