import { useEffect, useState, type MouseEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Era } from "@/lib/era";

type Choose = (era: Era, origin?: { x: number; y: number }) => void;
const eras: Era[] = ["1826", "2026"];
const at = (event: MouseEvent) => ({ x: event.clientX, y: event.clientY });

/** The small time machine: flips the travel pages between the two eras. */
export function EraSwitch({ era, onChoose, className }: { era: Era; onChoose: Choose; className?: string }) {
  return (
    <div className={`era-switch${className ? ` ${className}` : ""}`} role="group" aria-label="Choose the era to read this in">
      {eras.map(item => <button type="button" key={item} aria-pressed={era === item} onClick={event => onChoose(item, at(event))}>{item}</button>)}
    </div>
  );
}

/** The door: shown once, to a visitor who has not yet chosen an era. The page is already there behind it. */
export function EraDoor({ onChoose }: { onChoose: Choose }) {
  return (
    <div className="era-door" role="dialog" aria-modal="true" aria-label="Choose how to read this journal">
      <p className="era-door-ask">Same journeys, two centuries apart. Choose yours.</p>
      <button type="button" className="era-half is-1826" onClick={event => onChoose("1826", at(event))}>
        <span className="era-year">1826</span>
        <span className="era-line">Parchment, red ink and an X to find.</span>
        <span className="era-go">Unroll the chart</span>
      </button>
      <button type="button" className="era-half is-2026" onClick={event => onChoose("2026", at(event))}>
        <span className="era-year">2026</span>
        <span className="era-line">A spinning globe, flight paths and a passport to fill.</span>
        <span className="era-go">Spin the globe</span>
      </button>
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

  const found = entries.filter(item => stamps.includes(item.code)).length;
  const current = entries[index];
  return (
    <div className="book-veil" onClick={onClose}>
      <div className="book" role="dialog" aria-modal="true" aria-label={era === "2026" ? "Your passport" : "Your book of seals"} onClick={event => event.stopPropagation()}>
        <header className="book-head">
          <p><strong>{era === "2026" ? "Passport" : "Book of seals"}</strong><span>{found} of {entries.length} collected</span></p>
          <button type="button" aria-label="Close" onClick={onClose}><X size={20} aria-hidden="true" /></button>
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
