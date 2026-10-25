// @see BUG-006: Using global augmentation instead of `as any` for platform detection
declare global {
  interface Window {
    Capacitor?: { isNativePlatform?: () => boolean; [key: string]: unknown };
    __TAURI__?: { invoke?: (...args: unknown[]) => Promise<unknown>; [key: string]: unknown };
  }
}

export function isCapacitor(): boolean {
  return typeof window.Capacitor !== 'undefined';
}

export function isTauri(): boolean {
  return typeof window.__TAURI__ !== 'undefined';
}

export function isNative(): boolean {
  return isCapacitor() || isTauri();
}

export function isWeb(): boolean {
  return !isNative();
}

export function getPlatform(): 'web' | 'capacitor' | 'tauri' {
  if (isCapacitor()) return 'capacitor';
  if (isTauri()) return 'tauri';
  return 'web';
}
