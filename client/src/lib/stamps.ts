// The visitor's own expedition: which places they have opened on the map. Kept in their browser only
// (localStorage); nothing is sent anywhere. Private-mode browsers that refuse storage simply start fresh
// on every visit.
const KEY = "expedition-stamps";

export function readStamps(): string[] {
  try {
    const stored = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(stored) ? stored.filter(item => typeof item === "string") : [];
  } catch {
    return [];
  }
}

/** Adds a stamp. Returns the full list and whether this one is new. */
export function addStamp(id: string): { stamps: string[]; fresh: boolean } {
  const stamps = readStamps();
  if (stamps.includes(id)) return { stamps, fresh: false };
  const next = [...stamps, id];
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage refused: keep it for this page only */ }
  return { stamps: next, fresh: true };
}
