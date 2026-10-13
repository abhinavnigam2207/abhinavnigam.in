import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Era } from "@/lib/era";

type Choose = (era: Era, origin?: { x: number; y: number }) => void;
const eras: Era[] = ["1826", "2026"];
const at = (event: MouseEvent) => ({ x: event.clientX, y: event.clientY });

/**
 * Words that differ between the eras. Both are put in the page and the stylesheet shows the one for the
 * era on <html>, so a pre-built page reads right from its first frame, whichever era the visitor chose.
 */
export function EraText({ old, now }: { old: ReactNode; now: ReactNode }) {
  return <><span className="only-1826">{old}</span><span className="only-2026">{now}</span></>;
}

/** The small time machine: flips the travel pages between the two eras. */
export function EraSwitch({ era, onChoose, className }: { era: Era; onChoose: Choose; className?: string }) {
  return (
    <div className={`era-switch${className ? ` ${className}` : ""}`} role="group" aria-label="Choose the era to read this in">
      {eras.map(item => <button type="button" key={item} data-era={item} aria-pressed={era === item} onClick={event => onChoose(item, at(event))}>{item}</button>)}
    </div>
  );
}

const doorHalves: { era: Era; line: string; go: string }[] = [
  { era: "1826", line: "Parchment, red ink and an X to find.", go: "Unroll the chart" },
  { era: "2026", line: "A spinning globe, flight paths and a passport to fill.", go: "Spin the globe" },
];

/**
 * The door: shown once, to a visitor who has not yet chosen an era. The page is already there behind it.
 * Pressing a half makes it swell to three quarters of the screen; letting go lets it take the whole
 * screen, and then the door fades away onto the map. `onChoose` is called when the half has filled the
 * screen, `onDone` when the door has gone.
 */
export function EraDoor({ onChoose, onDone }: { onChoose: (era: Era) => void; onDone: () => void }) {
  const [held, setHeld] = useState<Era | null>(null);
  const [picked, setPicked] = useState<Era | null>(null);
  const [leaving, setLeaving] = useState(false);
  // The door itself takes the focus, so the keyboard's next Tab lands on the first choice. Focusing a
  // half directly would ring it as if it had been picked.
  const door = useRef<HTMLDivElement>(null);
  useEffect(() => { door.current?.focus({ preventScroll: true }); }, []);
  const pick = (era: Era) => {
    if (picked) return;
    setPicked(era);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => { onChoose(era); setLeaving(true); window.setTimeout(onDone, still ? 0 : 480); }, still ? 0 : 620);
  };
  return (
    <div className={`era-door${picked ? " is-picked" : ""}${leaving ? " is-leaving" : ""}`} role="dialog" aria-modal="true" aria-label="Choose how to read this journal" ref={door} tabIndex={-1}>
      <p className="era-door-ask">Same journeys, two centuries apart. Choose yours.</p>
      {doorHalves.map(half => (
        <button
          type="button" key={half.era}
          className={`era-half is-${half.era}${held === half.era ? " is-held" : ""}${picked === half.era ? " is-chosen" : ""}${picked && picked !== half.era ? " is-out" : ""}`}
          onPointerDown={() => setHeld(half.era)} onPointerUp={() => setHeld(null)} onPointerLeave={() => setHeld(null)} onPointerCancel={() => setHeld(null)}
          onContextMenu={event => event.preventDefault()}
          onClick={() => pick(half.era)}
        >
          <span className="era-year">{half.era}</span>
          <span className="era-line">{half.line}</span>
          <span className="era-go">{half.go}</span>
        </button>
      ))}
    </div>
  );
}

type Entry = { code: string; name: string; spot: string };

/**
 * The visitor's collection: one page per country, stamped once they have opened it. In 2026 it is a
 * passport, in 1826 a book of wax seals; the pages turn the same way in both.
 */
export function StampBook({ era, entries, stamps, onClose, onGo }: { era: Era; entries: Entry[]; stamps: string[]; onClose: () => void; onGo: (code: string) => void }) {
  const firstFound = Math.max(0, entries.findIndex(item => stamps.includes(item.code)));
  const [index, setIndex] = useState(firstFound);
  const turn = (by: number) => setIndex(value => Math.min(entries.length - 1, Math.max(0, value + by)));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") turn(1);
      if (event.key === "ArrowLeft") turn(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Focus moves into the book while it is open and returns to whatever opened it.
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeButton.current?.focus({ preventScroll: true });
    return () => opener?.focus?.({ preventScroll: true });
  }, []);

  const found = entries.filter(item => stamps.includes(item.code)).length;
  const current = entries[index];
  return (
    <div className="book-veil" onClick={onClose}>
      <div className="book" role="dialog" aria-modal="true" aria-label={era === "2026" ? "Your passport" : "Your book of seals"} onClick={event => event.stopPropagation()}>
        <header className="book-head">
          <p><strong>{era === "2026" ? "Passport" : "Book of seals"}</strong><span>{found} of {entries.length} collected</span></p>
          <button type="button" aria-label="Close" ref={closeButton} onClick={onClose}><X size={20} aria-hidden="true" /></button>
        </header>
        <div className="book-pages">
          {entries.map((item, i) => {
            const has = stamps.includes(item.code);
            return (
              <div className={`book-page${i < index ? " is-turned" : ""}${i === index ? " is-open" : ""}${has ? " is-stamped" : ""}`} key={item.code} style={{ zIndex: entries.length - i }} aria-hidden={i !== index}>
                <p className="book-line"><span>{era === "2026" ? "Visa" : "Folio"}</span><span>{String(i + 1).padStart(2, "0")}</span></p>
                <div className="book-stamp" style={{ rotate: `${((i * 37) % 17) - 8}deg` }}>
                  {has ? <><span>{item.code}</span><strong>{item.name}</strong><span>{item.spot}</span></> : <span className="book-blank">Not found yet</span>}
                </div>
                <p className="book-line"><span>{has ? "Discovered" : "Open it on the map to collect"}</span></p>
              </div>
            );
          })}
        </div>
        <footer className="book-nav">
          <button type="button" aria-label="Previous page" disabled={index === 0} onClick={() => turn(-1)}><ChevronLeft size={20} aria-hidden="true" /></button>
          <button type="button" className="book-go" onClick={() => onGo(current.code)}>{stamps.includes(current.code) ? `Back to ${current.name}` : `Find ${current.name}`}</button>
          <button type="button" aria-label="Next page" disabled={index === entries.length - 1} onClick={() => turn(1)}><ChevronRight size={20} aria-hidden="true" /></button>
        </footer>
      </div>
    </div>
  );
}
