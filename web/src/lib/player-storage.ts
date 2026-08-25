/**
 * Tiny localStorage wrapper for player preferences.
 *
 * Every call is guarded — Safari private mode throws on access and a
 * half-written value should never take the player down. Reads may only happen
 * after mount: the lesson page is statically prerendered, so touching storage
 * during render would desync hydration.
 */

/** Bump the `:vN` suffix whenever a stored shape stops being readable */
export const SETTINGS_KEY = "hwk-ep05:settings:v1";
export const POSITION_KEY = "hwk-ep05:position:v1";
export const SPEED_KEY = "hwk-ep05:speed:v1";

export function readStored<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or quota — preferences are a nice-to-have */
  }
}
