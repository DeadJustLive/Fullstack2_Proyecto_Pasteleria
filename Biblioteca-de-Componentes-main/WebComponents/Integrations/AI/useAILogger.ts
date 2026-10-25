// @use(kind, contract, deps)
// @kind(hook)
// @contract(in: type, message -> out: void)
import { useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

export function useAILogger() {
  const logEvent = useCallback((type: string, message: string) => {
    // Check if running in Tauri environment
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      invoke('log_event', { eventType: type, message }).catch(console.error);
    } else {
      // Fire and forget log event to the local Vite dev server
      fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, message }),
      }).catch(err => console.error('Failed to log event', err));
    }
  }, []);

  return { logEvent };
}
