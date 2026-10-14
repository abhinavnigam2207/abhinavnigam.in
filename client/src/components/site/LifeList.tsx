import { ArrowUpRight, Check, MapPin, Shuffle } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { EraText } from "@/components/site/EraControls";
import { Photo } from "@/components/site/Photo";
import { chapters, lifeItems, lifeListIsSample, moments, nextUp, numbers, principles, type ChapterId, type LifeItem } from "@/content/lifeList";
import { countries, home, stories } from "@/content/travels";

// The lower half of the bucket list page: the numbers so far, the life list (travel is one chapter of it),
// what is next, a wall of moments, how the list is chosen, and a way for visitors to add to it.
// Everything that can be shown on the map calls `onShowOnMap` with its id; the page flies the map there.

const inBrowser = typeof window !== "undefined";
const pad = (value: number) => String(value).padStart(2, "0");
const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

export function TheNumbers() {
  const items: { value: string; label: string; old: string }[] = [
    { value: String(numbers.countries), label: "countries", old: "countries" },
    { value: String(numbers.cities), label: "cities", old: "cities" },
    { value: `${numbers.continents}/7`, label: "continents", old: "continents" },
    { value: `${numbers.worldShare}%`, label: "of the world", old: "of the known world" },
  ];
  return (
    <section className="numbers wrap" aria-labelledby="numbers-title">
      <h2 className="numbers-title" id="numbers-title"><EraText old="The tally, so far." now="So far." /></h2>
      <dl className="numbers-grid">
        {items.map(item => <div key={item.label}><dt><EraText old={item.old} now={item.label} /></dt><dd>{item.value}</dd></div>)}
        <div className="numbers-wide">
          <dt><EraText old="leagues of red line from home" now="km of routes from home" /></dt>
          <dd><EraText old={numbers.routeLeagues.toLocaleString("en-IN")} now={numbers.routeKm.toLocaleString("en-IN")} /></dd>
        </div>
      </dl>
    </section>
  );
}

type Tab = { id: ChapterId; title: string; old: string; line: string; done: number; total: number };

export function LifeList({ onShowOnMap }: { onShowOnMap: (id: string) => void }) {
  const tabs: Tab[] = chapters.map(chapter => chapter.id === "places"
    ? { ...chapter, done: countries.length, total: countries.length }
    : { ...chapter, done: lifeItems.filter(item => item.chapter === chapter.id && item.done).length, total: lifeItems.filter(item => item.chapter === chapter.id).length });
  // The open chapter is kept in the address (?chapter=food), so a reload or a shared link opens the same one.
  const [active, setActive] = useState<ChapterId>(() => {
    if (!inBrowser) return "places";
    const asked = new URLSearchParams(window.location.search).get("chapter");
    return tabs.some(tab => tab.id === asked) ? asked as ChapterId : "places";
  });
  const [expanded, setExpanded] = useState(false);
  // The panel's entrance plays when the visitor switches chapter, not when the page first appears.
  const [switched, setSwitched] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Arriving from elsewhere in the app (no page load, so /travel/era.js has not run), put the chapter on <html>.
  useEffect(() => {
    if (active === "places") delete document.documentElement.dataset.chapter; else document.documentElement.dataset.chapter = active;
  }, []);

  const choose = (id: ChapterId, focusTab = false) => {
    setActive(id); setExpanded(false); setSwitched(true);
    // The stylesheet reads the chapter from <html> (see /travel/era.js), so the two never disagree.
    if (id === "places") delete document.documentElement.dataset.chapter; else document.documentElement.dataset.chapter = id;
    const url = new URL(window.location.href);
    if (id === "places") url.searchParams.delete("chapter"); else url.searchParams.set("chapter", id);
    window.history.replaceState(window.history.state, "", url);
    if (focusTab) tabRefs.current[tabs.findIndex(tab => tab.id === id)]?.focus();
  };
  // Arrow keys move between chapters, as tabs do everywhere else.
  const onKey = (event: KeyboardEvent) => {
    const index = tabs.findIndex(tab => tab.id === active);
    const next = event.key === "ArrowRight" ? index + 1 : event.key === "ArrowLeft" ? index - 1 : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    choose(tabs[(next + tabs.length) % tabs.length].id, true);
  };
  const located = lifeItems.filter(item => item.place);
  const surprise = () => onShowOnMap(located[Math.floor(Math.random() * located.length)].id);

  return (
    <section className="life wrap" id="life-list" aria-labelledby="life-title">
      <div className="life-head">
        <h2 className="statement" id="life-title"><EraText old="The book of intentions." now="The life list." /></h2>
        <p className="life-lede"><EraText old="Travel is but one chapter. Here are the others, kept in the same hand." now="Travel is one chapter of it. Here are the others." /></p>
        <button type="button" className="life-surprise" onClick={surprise}><Shuffle size={16} aria-hidden="true" /> <EraText old="Spin the compass" now="Surprise me" /></button>
      </div>

      <div className="life-tabs" role="tablist" aria-label="Chapters of the life list" onKeyDown={onKey}>
        {tabs.map((item, index) => (
          <button
            type="button" role="tab" key={item.id} id={`tab-${item.id}`} data-for={item.id} aria-controls={`panel-${item.id}`} aria-selected={item.id === active} tabIndex={item.id === active ? 0 : -1}
            ref={node => { tabRefs.current[index] = node; }} onClick={() => choose(item.id)}
          >
            <Ring done={item.done} total={item.total} />
            <span><EraText old={item.old} now={item.title} /><small>{item.id === "places" ? `${item.total} countries` : `${item.done} of ${item.total} done`}</small></span>
          </button>
        ))}
      </div>

      {/* Every chapter is in the pre-built page. Before the script runs the stylesheet shows the one named on
          <html>; after, the hidden attribute does. Either way the first frame is already the right chapter. Once
          running, only the open chapter's content is kept, which keeps the page light to start. */}
      {tabs.map(item => (
        <div
          className={`life-panel${switched && item.id === active ? " is-switched" : ""}`} id={`panel-${item.id}`} role="tabpanel" aria-labelledby={`tab-${item.id}`}
          data-for={item.id} key={switched && item.id === active ? `${item.id}-open` : item.id} hidden={inBrowser ? item.id !== active : undefined}
        >
          {(!inBrowser || item.id === active) && <>
          <p className="life-line">{item.line}{item.id !== "places" && lifeListIsSample && <span className="life-sample">Sample entries</span>}</p>
          {item.id === "places" ? <Places expanded={expanded && active === "places"} /> : <Items items={lifeItems.filter(entry => entry.chapter === item.id)} expanded={expanded} onShowOnMap={onShowOnMap} />}
          {(item.id === "places" ? countries.length + 1 : item.total) > 6 && (
            <button type="button" className="life-more" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>
              {expanded ? "Show fewer" : `Show all ${item.id === "places" ? countries.length + 1 : item.total}`}
            </button>
          )}
          </>}
        </div>
      ))}
    </section>
  );
}

// A small progress ring: how much of a chapter is done.
function Ring({ done, total }: { done: number; total: number }) {
  const share = total ? done / total : 0, r = 15, length = 2 * Math.PI * r;
  return (
    <svg className="progress-ring" viewBox="0 0 36 36" aria-hidden="true">
      <circle cx="18" cy="18" r={r} />
      <circle cx="18" cy="18" r={r} className="progress-done" strokeDasharray={`${length * share} ${length}`} transform="rotate(-90 18 18)" />
    </svg>
  );
}

// The Places chapter: home first, then every country, each with its journal and its place on the map.
function Places({ expanded }: { expanded: boolean }) {
  const cards = [
    { code: home.code, name: home.name, cities: "Home ground. Where every route begins.", href: undefined as string | undefined },
    ...countries.map(item => {
      const story = stories.find(entry => entry.slug === item.story);
      return { code: item.code, name: item.name, cities: story ? story.cities.map(city => city.name).join(" · ") : item.spot, href: story ? `/bucket-list/${story.slug}` : undefined };
    }),
  ];
  return (
    <ul className={`places-grid${expanded ? " is-expanded" : ""}`}>
      {cards.map((card, index) => (
        <li key={card.code} className="place-card">
          <span className="place-stamp" aria-hidden="true" style={{ rotate: `${((index * 37) % 13) - 6}deg` }}>{card.code}</span>
          <h3>{card.name}</h3>
          <p>{card.cities}</p>
          <div className="place-actions">
            {card.href && <a href={card.href}>Journal <ArrowUpRight size={15} aria-hidden="true" /></a>}
            <a href={`#${card.code.toLowerCase()}`} aria-label={`Show ${card.name} on the map`}><MapPin size={15} aria-hidden="true" /> Map</a>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Items({ items, expanded, onShowOnMap }: { items: LifeItem[]; expanded: boolean; onShowOnMap: (id: string) => void }) {
  // Done first, newest first; then what is still to do.
  const sorted = [...items].sort((a, b) => (b.done ?? 0) - (a.done ?? 0));
  return (
    <ul className={`life-items${expanded ? " is-expanded" : ""}`}>
      {sorted.map(item => (
        <li key={item.id} className={`life-item${item.done ? " is-done" : ""}`}>
          <span className="life-mark" aria-hidden="true">{item.done ? <Check size={16} strokeWidth={2.6} /> : null}</span>
          <div className="life-copy">
            <h3>{item.title}</h3>
            <p className="life-meta">
              <span>{item.done ? <><EraText old="Done in" now="Done ·" /> {item.done}</> : <EraText old="Yet to be done" now="Still on the list" />}</span>
              {item.together && <span className="life-together">Together</span>}
              {item.place && <span>{item.place.name}</span>}
            </p>
            {item.why && <p className="life-why">{item.why}</p>}
            {(item.place || item.story) && (
              <div className="life-actions">
                {item.place && <button type="button" onClick={() => onShowOnMap(item.id)}><MapPin size={15} aria-hidden="true" /> On the map</button>}
                {item.story && <a href={item.story}>The story <ArrowUpRight size={15} aria-hidden="true" /></a>}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function NextUp({ onShowOnMap }: { onShowOnMap: (id: string) => void }) {
  return (
    <section className="content-section wrap next" aria-labelledby="next-title">
      <h2 className="statement" id="next-title"><EraText old="Voyages in preparation." now="Next up." /></h2>
      <ul className="next-grid">
        {nextUp.map(trip => (
          <li key={trip.code} className="next-pass">
            <p className="ticket-route"><span>{home.code}</span><i aria-hidden="true" /><span>{trip.code}</span></p>
            <h3>{trip.place}</h3>
            <p className="next-what">{trip.what}</p>
            <p className="next-foot"><span>{trip.when}</span><button type="button" onClick={() => onShowOnMap(`next-${trip.code.toLowerCase()}`)}><MapPin size={15} aria-hidden="true" /> On the map</button></p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Moments() {
  return (
    <section className="content-section wrap moments" aria-labelledby="moments-title">
      <h2 className="statement" id="moments-title"><EraText old="Kept in the album." now="Moments." /></h2>
      <ul className="moments-grid">
        {moments.map((moment, index) => (
          <li key={moment.href} style={{ rotate: `${((index * 29) % 9) - 4}deg` }}>
            <a href={moment.href}>
              <Photo photo={moment.photo} />
              <span>{moment.title} <ArrowUpRight size={14} aria-hidden="true" /></span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HowWeChoose() {
  return (
    <section className="content-section wrap choose" aria-labelledby="choose-title">
      <h2 className="statement" id="choose-title"><EraText old="Articles of the expedition." now="How we choose." /></h2>
      {lifeListIsSample && <p className="life-sample is-block">Sample wording. In their own words, to come.</p>}
      <ol className="choose-list">
        {principles.map((item, index) => (
          <li key={item.title}>
            <span className="choose-number" aria-hidden="true"><EraText old={romans[index]} now={pad(index + 1)} /></span>
            <div><h3>{item.title}</h3><p>{item.text}</p></div>
          </li>
        ))}
      </ol>
    </section>
  );
}

// Visitors can suggest something for the list. Netlify Forms keeps the submissions: the form is in the
// pre-built page, where Netlify finds it when the site is deployed; `company` is a trap field for bots.
const FORM_NAME = "life-list-suggestion";
export function AddToOurList() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [count, setCount] = useState(0);
  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setState("sending");
    try {
      const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>);
      const response = await fetch(window.location.pathname, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() });
      if (!response.ok) throw new Error(String(response.status));
      form.reset(); setCount(0); setState("sent");
    } catch {
      setState("failed");
    }
  };
  useEffect(() => { if (state === "sent") document.getElementById("suggest-done")?.focus(); }, [state]);

  return (
    <section className="content-section wrap suggest" aria-labelledby="suggest-title">
      <div className="suggest-copy">
        <h2 className="statement" id="suggest-title"><EraText old="Send word." now="Add to our list." /></h2>
        <p><EraText old="Know of a place, a dish or a deed that belongs in this book? Write it down and it will reach us." now="Know a place, a dish or a thing we should do? Tell us, and why. We read every one." /></p>
      </div>
      {state === "sent" ? (
        <div className="suggest-done" id="suggest-done" tabIndex={-1} role="status">
          <span className="suggest-seal" aria-hidden="true"><EraText old="Received" now="Received" /></span>
          <p><strong>Thank you.</strong> It is on our desk.</p>
          <button type="button" className="suggest-again" onClick={() => setState("idle")}>Suggest another</button>
        </div>
      ) : (
        <form className="suggest-form" name={FORM_NAME} method="POST" data-netlify="true" netlify-honeypot="company" onSubmit={send}>
          <input type="hidden" name="form-name" value={FORM_NAME} />
          <p className="suggest-trap" aria-hidden="true"><label>Company <input name="company" tabIndex={-1} autoComplete="off" /></label></p>
          <label className="suggest-field">
            <span>Your suggestion</span>
            <input name="suggestion" required maxLength={140} placeholder="Swim in a bioluminescent bay" onChange={event => setCount(event.target.value.length)} />
            <small aria-live="polite">{count}/140</small>
          </label>
          <label className="suggest-field">
            <span>Why it belongs here <em>optional</em></span>
            <textarea name="why" rows={3} maxLength={600} />
          </label>
          <div className="suggest-row">
            <label className="suggest-field"><span>Your name <em>optional</em></span><input name="name" maxLength={80} autoComplete="name" /></label>
            <label className="suggest-field"><span>Email <em>optional, for a reply</em></span><input name="email" type="email" maxLength={120} autoComplete="email" /></label>
          </div>
          <div className="suggest-send">
            <button type="submit" className="button" disabled={state === "sending"}>{state === "sending" ? "Sending…" : <>Send it <ArrowUpRight size={16} aria-hidden="true" /></>}</button>
            {state === "failed" && <p className="suggest-error" role="alert">That did not go through. Try again, or email it to <a href="mailto:abhinavnigam2207@gmail.com">abhinavnigam2207@gmail.com</a>.</p>}
          </div>
        </form>
      )}
    </section>
  );
}
