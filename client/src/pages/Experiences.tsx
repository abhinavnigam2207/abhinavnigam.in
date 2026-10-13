import { ArrowLeft, ArrowUpRight, BookOpen, Globe, Minus, Plus } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { EraDoor, EraSwitch, StampBook } from "@/components/site/EraControls";
import type { Camera, Mark, MarkHit } from "@/components/site/ExpeditionMap";
import { Photo } from "@/components/site/Photo";
import { PageMeta, PillLink, SiteShell } from "@/components/site/SiteShell";
import { pageMeta } from "@/content/pageMeta";
import { bucketList, chest, countries, home, indiaPlaces, stories, travelsAreSample } from "@/content/travels";
import { useEra, type Era } from "@/lib/era";
import { addStamp, readStamps } from "@/lib/stamps";
import { TravelFonts, TravelTransitions } from "./TravelStory";

// The map engine is fetched only when this page is opened, so the rest of the site does not carry it.
const ExpeditionMap = lazy(() => import("@/components/site/ExpeditionMap").then(module => ({ default: module.ExpeditionMap })));

// Each era opens on the map that suits it (1826 a flat chart, 2026 a globe); the visitor can swap.
const views = [{ id: "flat", label: "Map" }, { id: "globe", label: "Globe" }] as const;
type View = (typeof views)[number]["id"];

const storyPath = (slug: string, city?: string) => `/bucket-list/${slug}${city ? `/${city}` : ""}`;
const uncharted = bucketList.filter(item => !item.done && item.lon !== undefined);
const two = (value: number) => String(value).padStart(2, "0");

// The passport, page by page. The section is tall and its stage stays pinned: each stretch of scrolling
// turns one page and stamps the next country, with that stop's note beside it. In 1826 the same pages are
// folios carrying wax seals. This is the travellers' own passport, so every page is stamped; the
// visitor's collection is the separate stamp book on the map.
function PassportTour({ era }: { era: Era }) {
  const section = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  useEffect(() => {
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
        <h2 className="tour-title">{modern ? "Every stamp in the passport." : "Every seal in the book."}</h2>
        <div className="passport" aria-hidden="true">
          {countries.map((item, i) => (
            <div className={`passport-page${i < index ? " is-turned" : ""}${i === index ? " is-open" : ""}`} key={item.code} style={{ zIndex: countries.length - i }}>
              <p className="passport-line"><span>{modern ? "Visa" : "Folio"}</span><span>{two(i + 1)}</span></p>
              <div className="stamp" style={{ rotate: `${((i * 37) % 17) - 8}deg` }}><span>{item.code}</span><strong>{item.name}</strong><span>{item.spot}</span></div>
              <p className="passport-line"><span>{modern ? "Arrival · Immigration" : "Entered in the log"}</span></p>
            </div>
          ))}
        </div>
        <div className="tour-card" key={place.code} aria-live="polite">
          <p className="tour-count">{two(index + 1)} <span>/ {two(countries.length)}</span></p>
          <h3>{place.name}</h3>
          <p className="tour-spot">{place.spot}</p>
          <p className="tour-note">{place.note}</p>
          {place.story && <a className="tour-link" href={storyPath(place.story)}>{modern ? "Open the story" : "Read the journal"} <ArrowUpRight size={15} aria-hidden="true" /></a>}
        </div>
        <p className="tour-hint" aria-hidden="true">Scroll</p>
      </div>
    </section>
  );
}

export default function Experiences() {
  const { era, chosen, setEra } = useEra();
  const modern = era === "2026";
  const [viewPick, setViewPick] = useState<View | null>(null);
  const view: View = viewPick ?? (modern ? "globe" : "flat");
  const [book, setBook] = useState(false);
  const [recenter, setRecenter] = useState(0);
  // The place the map has dived into: a country code, the home code, or nothing for the whole world.
  const [focus, setFocus] = useState<string | null>(null);
  const [zoomBy, setZoomBy] = useState(1);
  const [hover, setHover] = useState<MarkHit | null>(null);
  const [stamps, setStamps] = useState<string[]>([]);
  const [fresh, setFresh] = useState("");
  const [leaving, setLeaving] = useState<{ lon: number; lat: number } | null>(null);
  const [phone, setPhone] = useState(false);

  useEffect(() => {
    setStamps(readStamps());
    setPhone(window.innerWidth < 760);
    const asked = new URLSearchParams(window.location.search).get("view");
    if (views.some(item => item.id === asked)) setViewPick(asked as View);
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

  const camera: Camera = leaving
    ? { lon: leaving.lon, lat: leaving.lat, zoom: 22 }
    : atHome ? { lon: 81, lat: 22, zoom: (phone ? 5.2 : 4.2) * zoomBy }
    : story ? { lon: story.lon, lat: story.lat, zoom: 6.2 * zoomBy }
    : country ? { lon: country.lon, lat: country.lat, zoom: 5 * zoomBy }
    // A phone is too narrow for the whole world: it opens on Asia, and a drag shows the rest. The flat map
    // sits a little further east there, so India and Japan are both on screen.
    : { lon: phone ? (view === "flat" ? 108 : 84) : 48, lat: phone && view === "flat" ? 20 : 16, zoom: zoomBy };

  // Back to the whole world at its opening size, wherever the visitor has zoomed or dragged to.
  const wholeMap = () => { setFocus(null); setZoomBy(1); setFresh(""); setHover(null); setRecenter(value => value + 1); };
  // Zooming out steps back through the levels: a zoomed-in view returns to its normal size first, and from
  // there one more press leaves the country for the whole world.
  const zoomOut = () => {
    if (zoomBy > 1.01) setZoomBy(value => Math.max(1, value / 1.5));
    else if (focus) wholeMap();
    else setRecenter(value => value + 1);
  };
  const dive = (code: string) => {
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
      window.setTimeout(() => window.location.assign(storyPath(story.slug, city.slug)), 620);
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
    <SiteShell theme={modern ? undefined : "parchment"}>
      <PageMeta {...pageMeta.bucketList} />
      <TravelTransitions />
      <TravelFonts />
      <main className="travel-main">
        <section className={`expedition era-${era}${focus ? " is-dived" : ""}${leaving ? " is-leaving" : ""}`} aria-label="Map of places visited">
          <Suspense fallback={null}>
            <ExpeditionMap className="expedition-canvas" era={era} projection={view} spin={modern && !focus} camera={camera} recenter={recenter} marks={marks} home={[home.lon, home.lat]} onHover={setHover} onPick={pick} />
          </Suspense>

          <div className="cartouche">
            <p className="eyebrow">Bucket list · Experiences</p>
            <h1>A life outside the pull request.</h1>
            <p className="cartouche-lede">Fourteen countries, most of India, and a map that is far from finished. {modern ? "Spin the globe. Pick a pin." : "Follow the red line. Pick an X."}</p>
          </div>

          {focus && (
            <aside className="dive-panel" key={focus}>
              <button type="button" className="dive-back" onClick={wholeMap}><ArrowLeft size={16} aria-hidden="true" /> The whole map</button>
              <p className="dive-code">{focus}</p>
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
            <div className="map-zoom" role="group" aria-label="Zoom">
              <button type="button" aria-label="Zoom in" onClick={() => setZoomBy(value => Math.min(4, value * 1.5))}><Plus size={18} aria-hidden="true" /></button>
              <button type="button" aria-label="Zoom out" onClick={zoomOut}><Minus size={18} aria-hidden="true" /></button>
              <button type="button" aria-label="Show the whole map" title="Whole map" onClick={wholeMap}><Globe size={18} aria-hidden="true" /></button>
            </div>
          </div>

          <button type="button" className="map-tally" onClick={() => setBook(true)}>
            {modern ? <BookOpen size={18} aria-hidden="true" /> : <span className="tally-seal" aria-hidden="true" />}
            <span aria-live="polite">{found === countries.length ? "Expedition complete" : `${found} of ${countries.length} ${modern ? "stamps" : "discovered"}`}{stamps.includes("chest") && <em> · {modern ? "plane found" : "chest found"}</em>}</span>
          </button>

          {book && <StampBook era={era} entries={countries} stamps={stamps} onClose={() => setBook(false)} onGo={code => { setBook(false); dive(code); }} />}
        </section>
        {!chosen && <EraDoor onChoose={setEra} />}

        {travelsAreSample && <p className="sample-note wrap" role="note"><strong>Preview with sample places.</strong> These are stand-ins to show the design, not Abhinav’s real trips.</p>}

        <PassportTour era={era} />

        <section className="content-section wrap" aria-labelledby="ledger-title">
          <h2 className="statement" id="ledger-title">The ledger.</h2>
          <div className="ledger">
            <div>
              <h3>Countries</h3>
              <ol>{countries.map(item => <li key={item.code}>{item.story ? <a href={storyPath(item.story)}>{item.name}</a> : item.name}<span>{item.spot}</span></li>)}</ol>
            </div>
            <div>
              <h3>Across India</h3>
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
