import { ArrowLeft, ArrowUpRight, BookOpen, Globe, Map as MapIcon, Minus, Plus, RotateCcw } from "lucide-react";
import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { EraDoor, EraSwitch, EraText, StampBook } from "@/components/site/EraControls";
import type { Camera, Mark, MarkHit } from "@/components/site/ExpeditionMap";
import { Photo } from "@/components/site/Photo";
import { PageMeta, PillLink, SiteShell } from "@/components/site/SiteShell";
import { pageMeta } from "@/content/pageMeta";
import { bucketList, chest, countries, home, indiaPlaces, stories, travelsAreSample } from "@/content/travels";
import { useEra, type Era } from "@/lib/era";
import { addStamp, readStamps } from "@/lib/stamps";
import { TravelFonts } from "./TravelStory";

// The map engine is fetched only when this page is opened, so the rest of the site does not carry it.
const ExpeditionMap = lazy(() => import("@/components/site/ExpeditionMap").then(module => ({ default: module.ExpeditionMap })));

// Each era opens on the map that suits it (1826 a flat chart, 2026 a globe); the visitor can swap.
const views = [{ id: "flat", label: "Map" }, { id: "globe", label: "Globe" }] as const;
type View = (typeof views)[number]["id"];

const storyPath = (slug: string, city?: string) => `/bucket-list/${slug}${city ? `/${city}` : ""}`;
const uncharted = bucketList.filter(item => !item.done && item.lon !== undefined);
const two = (value: number) => String(value).padStart(2, "0");
// False while the pages are being pre-built, where there is no visitor to ask.
const inBrowser = typeof window !== "undefined";

// The passport, page by page. The section is tall and its stage stays pinned: each stretch of scrolling
// turns one page and stamps the next country, with that stop's note beside it. In 1826 the same pages are
// folios carrying wax seals. This is the travellers' own passport, so every page is stamped; the
// visitor's collection is the separate stamp book on the map.
function PassportTour({ era }: { era: Era }) {
  const section = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  // Measured before the first frame is shown: a page reloaded half way down opens at that stop.
  useLayoutEffect(() => {
    const measure = () => {
      const el = section.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      const travel = box.height - window.innerHeight;
      const progress = travel > 0 ? Math.min(1, Math.max(0, -box.top / travel)) : 0;
      setIndex(Math.min(countries.length - 1, Math.floor(progress * countries.length)));
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => { window.removeEventListener("scroll", measure); window.removeEventListener("resize", measure); };
  }, []);
  const place = countries[index];
  const modern = era === "2026";
  return (
    <section className="tour" ref={section} style={{ height: `${(countries.length + 1) * 70}svh` }} aria-label={modern ? "The passport, page by page" : "The book of seals, page by page"}>
      <div className="tour-stage">
        <h2 className="tour-title"><EraText old="Every seal in the book." now="Every stamp in the passport." /></h2>
        <div className="passport" aria-hidden="true">
          {countries.map((item, i) => (
            <div className={`passport-page${i < index ? " is-turned" : ""}${i === index ? " is-open" : ""}`} key={item.code} style={{ zIndex: countries.length - i }}>
              <p className="passport-line"><EraText old="Folio" now="Visa" /><span>{two(i + 1)}</span></p>
              <div className="stamp" style={{ rotate: `${((i * 37) % 17) - 8}deg` }}><span>{item.code}</span><strong>{item.name}</strong><span>{item.spot}</span></div>
              <p className="passport-line"><EraText old="Entered in the log" now="Arrival · Immigration" /></p>
            </div>
          ))}
        </div>
        {/* In 2026 the card is a boarding pass; the stylesheet shapes it and shows the route line. */}
        <div className="tour-card" key={place.code} aria-live="polite">
          <p className="tour-count"><span className="only-2026">Boarding pass · </span>{two(index + 1)} <span>/ {two(countries.length)}</span></p>
          <p className="ticket-route only-2026"><span>{home.code}</span><i aria-hidden="true" /><span>{place.code}</span></p>
          <h3>{place.name}</h3>
          <p className="tour-spot">{place.spot}</p>
          <p className="tour-note">{place.note}</p>
          {place.story && <a className="tour-link" href={storyPath(place.story)}><EraText old="Read the journal" now="Open the story" /> <ArrowUpRight size={15} aria-hidden="true" /></a>}
        </div>
        <p className="tour-hint" aria-hidden="true">Scroll</p>
      </div>
    </section>
  );
}

export default function Experiences() {
  const { era, chosen, setEra } = useEra();
  const modern = era === "2026";
  // The address, the saved stamps and the screen's width are all read for the very first render, so the
  // page opens as it will stay: nothing is corrected a moment after it appears.
  const [viewPick, setViewPick] = useState<View | null>(() => {
    if (!inBrowser) return null;
    const asked = new URLSearchParams(window.location.search).get("view");
    return views.some(item => item.id === asked) ? asked as View : null;
  });
  const view: View = viewPick ?? (modern ? "globe" : "flat");
  const [book, setBook] = useState(() => inBrowser && Boolean((window.history.state as { book?: boolean } | null)?.book));
  const [recenter, setRecenter] = useState(0);
  // The place the map has dived into: a country code, the home code, or nothing for the whole world.
  // Read from the address on the first render, so a link to a country (or coming back to one from a city
  // page) opens already there, rather than opening on the world and flying in.
  const [focus, setFocus] = useState<string | null>(() => {
    if (!inBrowser) return null;
    const code = window.location.hash.slice(1).toUpperCase();
    return code === home.code || countries.some(item => item.code === code) ? code : null;
  });
  const [zoomBy, setZoomBy] = useState(1);
  const [hover, setHover] = useState<MarkHit | null>(null);
  const [stamps, setStamps] = useState<string[]>(() => inBrowser ? readStamps() : []);
  const [fresh, setFresh] = useState("");
  const [leaving, setLeaving] = useState<{ lon: number; lat: number } | null>(null);
  const [phone, setPhone] = useState(() => inBrowser && window.innerWidth < 760);

  // The door stays mounted through its own leaving animation, after the era has been chosen.
  const [door, setDoor] = useState(!chosen);
  useEffect(() => { if (!chosen) setDoor(true); }, [chosen]);
  // Once the real door is drawn, the stand-in that covered the page before the script ran can go.
  useEffect(() => { if (door || chosen) document.documentElement.removeAttribute("data-door"); }, [door, chosen]);
  // Likewise the mark that kept the title block hidden on a page opened straight into a country.
  useEffect(() => { document.documentElement.removeAttribute("data-dived"); }, []);
  // How many of this page's steps (a dive, the open stamp book) are on the browser's history, so that
  // closing one from the page can go "back" instead of leaving a stray entry behind.
  const steps = useRef(0);

  useEffect(() => {
    const measure = () => setPhone(window.innerWidth < 760);
    window.addEventListener("resize", measure);
    // Coming back with the browser's back button can bring this page out of its cache exactly as it was
    // left: mid-plunge into a city, with the controls faded out. Put it back as a visitor expects.
    const onShow = (event: PageTransitionEvent) => { if (event.persisted) { setLeaving(null); setStamps(readStamps()); } };
    window.addEventListener("pageshow", onShow);
    // Where the map is dived to lives in the address (#jpn) and the open stamp book in the history
    // state. So the phone's back button or swipe steps out of the book, then out of the country, and only
    // then leaves the page; and coming back from a city page returns to the country it was opened from.
    const sync = () => {
      const code = window.location.hash.slice(1).toUpperCase();
      const known = code === home.code || countries.some(item => item.code === code);
      setFocus(known ? code : null); setZoomBy(1); setHover(null);
      if (known && code !== home.code) setStamps(addStamp(code).stamps);
      // The ledger further down the page links to countries this way; show the map they asked for.
      if (known && window.scrollY > window.innerHeight * 0.5) window.scrollTo({ top: 0 });
      if (!known) { setFresh(""); setRecenter(value => value + 1); }
      setBook(Boolean((window.history.state as { book?: boolean } | null)?.book));
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => { window.removeEventListener("popstate", sync); window.removeEventListener("resize", measure); window.removeEventListener("pageshow", onShow); };
  }, []);
  const chooseView = (next: View) => {
    setViewPick(next);
    const url = new URL(window.location.href);
    url.searchParams.set("view", next);
    window.history.replaceState(null, "", url);
  };

  const country = countries.find(item => item.code === focus);
  const story = country?.story ? stories.find(item => item.slug === country.story) : undefined;
  const atHome = focus === home.code;

  const marks = useMemo<Mark[]>(() => {
    const list: Mark[] = [{ id: home.code, lon: home.lon, lat: home.lat, kind: "home", label: focus ? undefined : home.name }];
    for (const item of countries) {
      if (item.code === focus) continue;
      list.push({ id: item.code, lon: item.lon, lat: item.lat, kind: "x", label: item.name, sealed: stamps.includes(item.code) });
    }
    for (const [index, item] of uncharted.entries()) list.push({ id: `uncharted:${index}`, lon: item.lon!, lat: item.lat!, kind: "uncharted", label: item.where });
    list.push({ id: "chest", lon: chest.lon, lat: chest.lat, kind: "chest" });
    // Inside a country, its stops take the place of its single X.
    if (story) for (const city of story.cities) list.push({ id: `city:${city.slug}`, lon: city.lon, lat: city.lat, kind: "city", label: city.name });
    else if (country) list.push({ id: `spot:${country.code}`, lon: country.lon, lat: country.lat, kind: "city", label: country.spot });
    if (atHome) for (const place of indiaPlaces) list.push({ id: `india:${place.code}`, lon: place.lon, lat: place.lat, kind: "city", label: place.name });
    return list;
  }, [focus, stamps, story, country, atHome]);

  // Zoom levels are set for a wide screen. A phone is narrow, and the flat map there is sized by its
  // height, so the same country needs a good deal less zoom to fit; the globe needs a little less.
  const fit = phone ? (view === "flat" ? 0.55 : 0.95) : 1;
  const camera: Camera = leaving
    ? { lon: leaving.lon, lat: leaving.lat, zoom: 22 * fit }
    : atHome ? { lon: 81, lat: 22, zoom: 4.2 * fit * zoomBy }
    : story ? { lon: story.lon, lat: story.lat, zoom: 6.2 * fit * zoomBy }
    : country ? { lon: country.lon, lat: country.lat, zoom: 5 * fit * zoomBy }
    // A phone is too narrow for the whole world: it opens on Asia, and a drag shows the rest. The flat map
    // sits a little further east there, so India and Japan are both on screen.
    : { lon: phone ? (view === "flat" ? 108 : 84) : 48, lat: phone && view === "flat" ? 20 : 16, zoom: zoomBy };

  // Back to the whole world at its opening size, wherever the visitor has zoomed or dragged to. If the dive
  // was a step on the history, undo that step (the popstate handler above does the rest).
  const wholeMap = () => {
    if (focus && steps.current > 0) { steps.current -= 1; window.history.back(); return; }
    if (window.location.hash) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    setFocus(null); setZoomBy(1); setFresh(""); setHover(null); setRecenter(value => value + 1);
  };
  const openBook = () => { window.history.pushState({ book: true }, ""); steps.current += 1; setBook(true); };
  const closeBook = () => {
    if ((window.history.state as { book?: boolean } | null)?.book && steps.current > 0) { steps.current -= 1; window.history.back(); }
    else setBook(false);
  };
  // Zooming out steps back through the levels: a zoomed-in view returns to its normal size first, and from
  // there one more press leaves the country for the whole world.
  const zoomOut = () => {
    if (zoomBy > 1.01) setZoomBy(value => Math.max(1, value / 1.5));
    else if (focus) wholeMap();
    else setRecenter(value => value + 1);
  };
  // `fromBook` turns the stamp book's own history step into the dive, rather than adding one on top.
  const dive = (code: string, fromBook = false) => {
    if (fromBook) window.history.replaceState(null, "", `#${code.toLowerCase()}`);
    else if (code !== focus) { window.history.pushState(null, "", `#${code.toLowerCase()}`); steps.current += 1; }
    setBook(false);
    setFocus(code); setZoomBy(1); setHover(null);
    if (code !== home.code) { const result = addStamp(code); setStamps(result.stamps); setFresh(result.fresh ? code : ""); }
  };
  const pick = (hit: MarkHit) => {
    if (hit.id === home.code || countries.some(item => item.code === hit.id)) return dive(hit.id);
    if (hit.id === "chest") { setStamps(addStamp("chest").stamps); setHover(hit); return; }
    if (hit.id.startsWith("city:") && story) {
      const city = story.cities.find(item => `city:${item.slug}` === hit.id);
      if (!city) return;
      // Plunge into the city, then let the page take over from the middle of the zoom.
      setLeaving({ lon: city.lon, lat: city.lat });
      window.setTimeout(() => window.location.assign(storyPath(story.slug, city.slug)), 560);
      return;
    }
    setHover(hit);
  };

  // What the preview card says about the mark under the pointer.
  const preview = (() => {
    if (!hover) return null;
    const [kind, key] = hover.id.split(":");
    if (hover.id === "chest") return stamps.includes("chest") ? { title: chest.title, text: chest.line } : { title: "What's this?", text: modern ? "Something is circling here. Click it." : "Something is buried here. Click it." };
    if (kind === "uncharted") { const item = uncharted[Number(key)]; return { title: item.title, text: `${item.where} · still to find` }; }
    if (kind === "city" && story) { const city = story.cities.find(item => item.slug === key); return city ? { title: city.name, text: city.tagline, photo: city.cover, action: "Open the journal" } : null; }
    if (kind === "india") { const place = indiaPlaces.find(item => item.code === key); return place ? { title: place.name, text: place.spot } : null; }
    if (kind === "spot") return country ? { title: country.spot, text: "Journal not written yet" } : null;
    if (hover.id === home.code) return { title: home.name, text: "Home. Every route starts here.", action: "Explore" };
    const place = countries.find(item => item.code === hover.id);
    return place ? { title: place.name, text: place.note, route: `${home.code} → ${place.code}`, action: stamps.includes(place.code) ? "Explore again" : "Explore" } : null;
  })();

  const found = countries.filter(item => stamps.includes(item.code)).length;
  const focusName = atHome ? home.name : country?.name;

  return (
    <SiteShell>
      <PageMeta {...pageMeta.bucketList} />
      <TravelFonts />
      <main className="travel-main">
        <section className={`expedition era-${era}${inBrowser ? " is-live" : ""}${focus ? " is-dived" : ""}${leaving ? " is-leaving" : ""}`} aria-label="Map of places visited">
          <Suspense fallback={null}>
            <ExpeditionMap className="expedition-canvas" era={era} projection={view} spin={!focus} camera={camera} recenter={recenter} marks={marks} home={[home.lon, home.lat]} onHover={setHover} onPick={pick}
              shift={!focus ? undefined : phone ? [0, -0.2] : [0.13, 0]} onZoomOut={wholeMap} />
          </Suspense>

          <div className="cartouche">
            <p className="eyebrow">Bucket list · Experiences</p>
            <h1>A life outside the pull request.</h1>
            <p className="cartouche-lede">Fourteen countries, most of India, and a map that is far from finished. <EraText old="Follow the red line. Pick an X." now="Spin the globe. Pick a pin." /></p>
          </div>

          {/* On a phone, back is always top left, where the site name was. */}
          {focus && <button type="button" className="back-pill" onClick={wholeMap}><ArrowLeft size={18} aria-hidden="true" /> World</button>}

          {focus && (
            <aside className="dive-panel" key={focus}>
              <button type="button" className="dive-back" onClick={wholeMap}><ArrowLeft size={16} aria-hidden="true" /> The whole map</button>
              {modern && !atHome ? <p className="ticket-route"><span>{home.code}</span><i aria-hidden="true" /><span>{focus}</span></p> : <p className="dive-code">{focus}</p>}
              <h2>{focusName}</h2>
              <p className="dive-note">{atHome ? "Home ground. The places below are where the map is most worn." : story?.tagline ?? country?.note}</p>
              {fresh === focus && <p className="seal" role="status"><span>Discovered</span></p>}
              {story ? (
                <>
                  <ul className="dive-stops">
                    {story.cities.map(city => (
                      <li key={city.slug}><a href={storyPath(story.slug, city.slug)}><Photo photo={city.cover} shared={`city-${city.slug}`} /><span><strong>{city.name}</strong><small>{city.tagline}</small></span></a></li>
                    ))}
                  </ul>
                  <a className="button" href={storyPath(story.slug)}>Read the {story.name} journal <ArrowUpRight size={16} aria-hidden="true" /></a>
                </>
              ) : atHome ? (
                <ul className="dive-places">{indiaPlaces.map(place => <li key={place.code}>{place.name}<span>{place.spot}</span></li>)}</ul>
              ) : <p className="dive-empty">The journal for this one is not written yet.</p>}
            </aside>
          )}

          {hover && preview && (
            <div className={`map-card${preview.photo ? " has-photo" : ""}`} style={{ left: hover.x, top: hover.y }} key={hover.id}>
              {preview.photo && <Photo photo={preview.photo} />}
              <span className="map-card-copy">{modern && "route" in preview && <b className="map-card-route">{preview.route}</b>}<strong>{preview.title}</strong><span>{preview.text}</span>{preview.action && <em>{preview.action}</em>}</span>
            </div>
          )}

          <div className="map-tools">
            <EraSwitch era={era} onChoose={setEra} />
            <div className="map-switch" role="group" aria-label="Draw the map as">
              {views.map(item => <button type="button" key={item.id} aria-pressed={view === item.id} onClick={() => chooseView(item.id)}>{item.label}</button>)}
            </div>
            {/* The same choice as one button, for a phone's narrower bar. */}
            <button type="button" className="map-swap" aria-label={view === "globe" ? "Show as a flat map" : "Show as a globe"} onClick={() => chooseView(view === "globe" ? "flat" : "globe")}>
              {view === "globe" ? <MapIcon size={18} aria-hidden="true" /> : <Globe size={18} aria-hidden="true" />}
            </button>
            <div className="map-zoom" role="group" aria-label="Zoom">
              <button type="button" aria-label="Zoom in" onClick={() => setZoomBy(value => Math.min(4, value * 1.5))}><Plus size={18} aria-hidden="true" /></button>
              <button type="button" aria-label="Zoom out" onClick={zoomOut}><Minus size={18} aria-hidden="true" /></button>
              <button type="button" className="map-reset" aria-label="Show the whole map" title="Reset the view" onClick={wholeMap}><RotateCcw size={17} aria-hidden="true" /></button>
            </div>
          </div>

          <button type="button" className="map-tally" aria-label={`Open your ${modern ? "passport" : "book of seals"}: ${found} of ${countries.length} collected`} onClick={openBook}>
            {modern ? <BookOpen size={18} aria-hidden="true" /> : <span className="tally-seal" aria-hidden="true" />}
            <span className="tally-long" aria-live="polite">{found === countries.length ? "Expedition complete" : `${found} of ${countries.length} ${modern ? "stamps" : "discovered"}`}{stamps.includes("chest") && <em> · {modern ? "plane found" : "chest found"}</em>}</span>
            <span className="tally-short" aria-hidden="true">{found}/{countries.length}</span>
          </button>

          {book && <StampBook era={era} entries={countries} stamps={stamps} onClose={closeBook} onGo={code => dive(code, true)} />}
        </section>
        {door && <EraDoor onChoose={next => setEra(next, undefined, true)} onDone={() => setDoor(false)} />}

        {travelsAreSample && <p className="sample-note wrap" role="note"><strong>Preview with sample places.</strong> These are stand-ins to show the design, not Abhinav’s real trips.</p>}

        <PassportTour era={era} />

        <section className="content-section wrap" aria-labelledby="ledger-title">
          <h2 className="statement" id="ledger-title">The ledger.</h2>
          <div className="ledger">
            <div>
              <h3>Countries</h3>
              <ol>{countries.map(item => <li key={item.code}><a href={`#${item.code.toLowerCase()}`} aria-label={`Show ${item.name} on the map`}>{item.name}</a><span>{item.story ? <a href={storyPath(item.story)}>Journal</a> : item.spot}</span></li>)}</ol>
            </div>
            <div>
              <h3><a href={`#${home.code.toLowerCase()}`} aria-label="Show India on the map">Across India</a></h3>
              <ol>{indiaPlaces.map(item => <li key={item.code}>{item.name}<span>{item.spot}</span></li>)}</ol>
            </div>
            <div>
              <h3>Still to find</h3>
              <ol>{bucketList.map(item => <li key={item.title} className={item.done ? "is-done" : undefined}>{item.title}<span>{item.where}{item.done ? " · done" : ""}</span></li>)}</ol>
            </div>
          </div>
        </section>

        <section className="content-section wrap travel-close">
          <h2 className="statement">Been somewhere I should go?</h2>
          <PillLink href="/knowme">Tell me</PillLink>
        </section>
      </main>
    </SiteShell>
  );
}
