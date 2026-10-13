import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";

// The travel pages can be read in two eras: 1826 (parchment, ink, wax) and 2026 (dotted globe, flight
// paths, passport). Same places, same words, different paint. The visitor's choice is kept in their
// browser and can be given in a link with ?era=1826 or ?era=2026.
export type Era = "1826" | "2026";
const KEY = "expedition-era";
const isEra = (value: unknown): value is Era => value === "1826" || value === "2026";

function stored(): Era | null {
  try {
    const asked = new URLSearchParams(window.location.search).get("era");
    if (isEra(asked)) return asked;
    const saved = window.localStorage.getItem(KEY);
    return isEra(saved) ? saved : null;
  } catch {
    return null;
  }
}

/**
 * `era` is what to paint now. `chosen` is false until the visitor has picked one (on this visit or an
 * earlier one), which is when the door is shown. Pages are pre-rendered in 2026, the site's own look.
 */
export function useEra() {
  // On the built site /travel/era.js has put the era on <html> before this code runs, so the very first
  // render is already in the right era (no pass through 2026 on the way to 1826). While pages are being
  // pre-built there is no document, and they come out as 2026.
  const [era, setEraState] = useState<Era>(() => typeof document !== "undefined" && document.documentElement.dataset.era === "1826" ? "1826" : "2026");
  const [chosen, setChosen] = useState(() => typeof document === "undefined" || !document.documentElement.hasAttribute("data-door"));

  useEffect(() => {
    const saved = stored();
    if (saved) setEraState(saved);
    setChosen(Boolean(saved));
    // On the built site /travel/era.js has already done this before the first paint; this covers
    // development, where that script is not in the page.
    document.documentElement.dataset.era = saved ?? "2026";
  }, []);

  // `quiet` applies the era with no reveal of its own (the door has just done its own animation).
  const setEra = useCallback((next: Era, origin?: { x: number; y: number }, quiet = false) => {
    // The attribute is what the stylesheet reads, so it changes in the same breath as the state.
    const apply = () => { document.documentElement.dataset.era = next; setEraState(next); setChosen(true); };
    try { window.localStorage.setItem(KEY, next); } catch { /* storage refused: the choice lasts for this page */ }
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    // Time travel: the new era spreads out in a circle from where the visitor pressed.
    if (!document.startViewTransition || still || quiet) return apply();
    root.style.setProperty("--flip-x", `${origin?.x ?? window.innerWidth / 2}px`);
    root.style.setProperty("--flip-y", `${origin?.y ?? window.innerHeight / 2}px`);
    root.dataset.eraFlip = "";
    const transition = document.startViewTransition(() => flushSync(apply));
    transition.finished.catch(() => {}).finally(() => { delete root.dataset.eraFlip; });
    transition.ready.catch(() => {});
  }, []);

  return { era, chosen, setEra };
}
