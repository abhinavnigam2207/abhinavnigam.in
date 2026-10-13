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
  const [era, setEraState] = useState<Era>("2026");
  const [chosen, setChosen] = useState(true);

  useEffect(() => {
    const saved = stored();
    if (saved) setEraState(saved);
    setChosen(Boolean(saved));
  }, []);

  const setEra = useCallback((next: Era, origin?: { x: number; y: number }) => {
    const apply = () => { setEraState(next); setChosen(true); };
    try { window.localStorage.setItem(KEY, next); } catch { /* storage refused: the choice lasts for this page */ }
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    // Time travel: the new era spreads out in a circle from where the visitor pressed.
    if (!document.startViewTransition || still) return apply();
    root.style.setProperty("--flip-x", `${origin?.x ?? window.innerWidth / 2}px`);
    root.style.setProperty("--flip-y", `${origin?.y ?? window.innerHeight / 2}px`);
    root.dataset.eraFlip = "";
    const transition = document.startViewTransition(() => flushSync(apply));
    transition.finished.catch(() => {}).finally(() => { delete root.dataset.eraFlip; });
    transition.ready.catch(() => {});
  }, []);

  return { era, chosen, setEra };
}
