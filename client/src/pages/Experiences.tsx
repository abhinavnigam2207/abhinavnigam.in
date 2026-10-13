import { useEffect, useRef, useState, type RefObject } from "react";
import { ArrowUpRight } from "lucide-react";
import { Atlas, type PinHit, type Scene } from "@/components/site/Atlas";
import { Photo } from "@/components/site/Photo";
import { PageMeta, PillLink, SiteShell } from "@/components/site/SiteShell";
import { pageMeta } from "@/content/pageMeta";
import { bucketList, countries, home, indiaPlaces, stories, travelsAreSample } from "@/content/travels";
import { TravelTransitions } from "./TravelStory";

// Four ways to tell the world tour. Kept side by side so the client can compare them on the real page;
// once one is chosen, delete the other three and the switcher.
const views = [
  { id: "globe", label: "Globe" },
  { id: "map", label: "Map" },
  { id: "passport", label: "Passport" },
  { id: "flight", label: "Flight log" },
] as const;
type View = (typeof views)[number]["id"];

const two = (value: number) => String(value).padStart(2, "0");
const homePoint: [number, number] = [home.lon, home.lat];
const storyPath = (slug: string) => `/bucket-list/${slug}`;

// The hero globe: drag it, hover a pin for a preview, click to open that country's page. On a touch
// screen the first tap shows the preview and the preview itself is the link.
function ExploreGlobe() {
  const scene = useRef<Scene>({
    projection: "globe", lon: 60, lat: 12, spin: 5,
    pins: [{ lon: home.lon, lat: home.lat, lit: true }, ...countries.map(item => ({ lon: item.lon, lat: item.lat, lit: true, ring: Boolean(item.story) }))],
  });
  const [hit, setHit] = useState<(PinHit & { pinned: boolean }) | null>(null);
  // Pin 0 is home; the countries follow in order.
  const place = hit && hit.index > 0 ? countries[hit.index - 1] : null;
  const story = place?.story ? stories.find(item => item.slug === place.story) : undefined;
  const open = (target: PinHit, touch: boolean) => {
    const picked = target.index > 0 ? countries[target.index - 1] : null;
    if (touch || !picked?.story) setHit({ ...target, pinned: touch });
    else window.location.assign(storyPath(picked.story));
  };
  return (
    <div className="explore">
      <Atlas scene={scene} className="travel-hero-globe" drag onHover={target => setHit(current => target ? { ...target, pinned: false } : current?.pinned ? current : null)} onPick={open} />
      {hit && (place ? (
        <a className={`pin-card${story ? " has-story" : ""}${hit.pinned ? " is-pinned" : ""}`} href={story ? storyPath(story.slug) : undefined} style={{ left: hit.x, top: hit.y }} key={place.code}>
          {story && <Photo photo={story.cover} shared={`story-${story.slug}`} />}
          <span className="pin-card-copy">
            <strong>{place.name}</strong>
            <span>{story ? place.note : `${place.spot} · story coming soon`}</span>
            {story && <em>Open the story <ArrowUpRight size={14} aria-hidden="true" /></em>}
          </span>
        </a>
      ) : <span className="pin-card" style={{ left: hit.x, top: hit.y }}><span className="pin-card-copy"><strong>{home.name}</strong><span>Home. Every trip starts here.</span></span></span>)}
      <p className="explore-hint" aria-hidden="true">Drag to spin · pick a pin</p>
    </div>
  );
}

// Calls back with how far the page has scrolled through a tall section: 0 at its top, 1 at its end.
function useScrollProgress(section: RefObject<HTMLElement | null>, onProgress: (progress: number) => void) {
  const callback = useRef(onProgress);
  callback.current = onProgress;
  useEffect(() => {
    const measure = () => {
      const el = section.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      const travel = box.height - window.innerHeight;
      callback.current(travel > 0 ? Math.min(1, Math.max(0, -box.top / travel)) : 0);
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => { window.removeEventListener("scroll", measure); window.removeEventListener("resize", measure); };
  }, [section]);
}

function WorldTour({ view }: { view: View }) {
  const section = useRef<HTMLElement>(null);
  const scene = useRef<Scene>({ projection: "globe", lon: countries[0].lon, lat: countries[0].lat });
  const [index, setIndex] = useState(0);
  const place = countries[index];

  const apply = (progress: number) => {
    const position = Math.min(countries.length - 0.001, progress * countries.length);
    const current = Math.floor(position);
    const within = position - current;
    const target = countries[current];
    const phone = window.innerWidth < 760;
    const pins = [
      { lon: home.lon, lat: home.lat, lit: true },
      ...countries.map((item, i) => ({ lon: item.lon, lat: item.lat, lit: i < current, active: i === current })),
    ];
    const arcTo = (item: (typeof countries)[number], amount: number) => ({ from: homePoint, to: [item.lon, item.lat] as [number, number], progress: amount });
    const landing = Math.min(1, within * 2.5);
    if (view === "globe") {
      scene.current = { projection: "globe", lon: target.lon, lat: target.lat * 0.7, pins, arcs: [arcTo(target, landing)] };
    } else {
      // A phone is too narrow for the whole world, so the map follows each stop instead.
      const frame = phone ? { lon: target.lon, lat: target.lat, span: 150 } : { lon: 40, lat: 18, span: 340 };
      const arcs = view === "flight" ? countries.slice(0, current + 1).map((item, i) => arcTo(item, i < current ? 1 : landing)) : [arcTo(target, landing)];
      scene.current = { projection: "flat", ...frame, pins, arcs };
    }
    setIndex(current);
  };
  useScrollProgress(section, apply);
  // Re-frame at once when the view is switched, without waiting for the next scroll.
  useEffect(() => { window.dispatchEvent(new Event("scroll")); }, [view]);

  return (
    <section className={`tour is-${view}`} ref={section} style={{ height: `${(countries.length + 1) * 75}svh` }} aria-label="Countries visited">
      <div className="tour-stage">
        {view === "passport" ? (
          <div className="passport" aria-hidden="true">
            {countries.map((item, i) => (
              <div className={`passport-page${i < index ? " is-turned" : ""}${i === index ? " is-open" : ""}`} key={item.code} style={{ zIndex: countries.length - i }}>
                <p className="passport-head"><span>Visa</span><span>{two(i + 1)}</span></p>
                <div className="stamp" style={{ rotate: `${((i * 37) % 17) - 8}deg` }}>
                  <span>{item.code}</span>
                  <strong>{item.name}</strong>
                  <span>{item.spot}</span>
                </div>
                <p className="passport-foot">Arrival · Immigration</p>
              </div>
            ))}
          </div>
        ) : <Atlas scene={scene} className="tour-canvas" />}
        <div className="tour-card" key={view === "passport" ? "book" : place.code} aria-live="polite">
          <p className="tour-count">{two(index + 1)} <span>/ {two(countries.length)}</span></p>
          {view === "flight" && <p className="ticket-route"><span>{home.code}</span><i aria-hidden="true" /><span>{place.code}</span></p>}
          <h3>{place.name}</h3>
          <p className="tour-spot">{place.spot}</p>
          <p className="tour-note">{place.note}</p>
          {place.story && <a className="tour-link" href={storyPath(place.story)}>Open the story <ArrowUpRight size={15} aria-hidden="true" /></a>}
        </div>
        <p className="tour-hint" aria-hidden="true">Scroll</p>
      </div>
    </section>
  );
}

function IndiaChapter() {
  const section = useRef<HTMLElement>(null);
  const scene = useRef<Scene>({ projection: "flat", lon: 82, lat: 22, span: 200 });
  const [shown, setShown] = useState(0);

  useScrollProgress(section, progress => {
    // The first fifth of the scroll is the zoom; pins then light up one at a time.
    const zoom = Math.min(1, progress / 0.2);
    const count = Math.round(Math.max(0, (progress - 0.2) / 0.75) * indiaPlaces.length);
    const lit = Math.min(indiaPlaces.length, count);
    const phone = window.innerWidth < 760;
    scene.current = {
      projection: "flat", lon: 82, lat: 21.5, span: 200 - zoom * 156,
      pins: indiaPlaces.map((item, i) => ({ lon: item.lon, lat: item.lat, lit: i < lit, active: i === lit - 1, label: phone ? undefined : item.name })),
    };
    setShown(lit);
  });

  return (
    <section className="tour is-india" ref={section} style={{ height: `${indiaPlaces.length * 32 + 140}svh` }} aria-labelledby="india-title">
      <div className="tour-stage">
        <Atlas scene={scene} className="tour-canvas" />
        <div className="india-copy">
          <p className="eyebrow">Closer to home</p>
          <h2 id="india-title">And most of India.</h2>
          <ol className="india-list">
            {indiaPlaces.map((item, i) => <li key={item.code} className={i < shown ? "is-lit" : undefined}>{item.name}<span>{item.spot}</span></li>)}
          </ol>
        </div>
      </div>
    </section>
  );
}

export default function Experiences() {
  const [view, setView] = useState<View>("globe");

  // The chosen view lives in the address (?view=map) so a link to one option can be shared.
  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get("view");
    if (views.some(item => item.id === asked)) setView(asked as View);
  }, []);
  const choose = (next: View) => {
    setView(next);
    const url = new URL(window.location.href);
    url.searchParams.set("view", next);
    window.history.replaceState(null, "", url);
  };

  const stillToDo = bucketList.filter(item => !item.done).length;

  return (
    <SiteShell>
      <PageMeta {...pageMeta.bucketList} />
      <TravelTransitions />
      <main className="travel-main">
        <section className="travel-hero wrap">
          <div className="travel-hero-copy">
            <p className="eyebrow">Bucket list · Experiences</p>
            <h1>A life outside the pull request.</h1>
            <p className="travel-lede">Fourteen countries, most of India, and a list that keeps getting longer.</p>
            <dl className="travel-stats">
              <div><dt>Countries</dt><dd>{countries.length}</dd></div>
              <div><dt>Across India</dt><dd>{indiaPlaces.length}</dd></div>
              <div><dt>Still on the list</dt><dd>{stillToDo}</dd></div>
            </dl>
          </div>
          <ExploreGlobe />
        </section>

        {travelsAreSample && <p className="sample-note wrap" role="note"><strong>Preview with sample places.</strong> These are stand-ins to show the design, not Abhinav’s real trips.</p>}

        <WorldTour view={view} />

        <section className="content-section wrap" aria-labelledby="stops-title">
          <h2 className="statement" id="stops-title">Every stop so far.</h2>
          <ul className="stop-list">
            {countries.map(item => <li key={item.code}>{item.story ? <a href={storyPath(item.story)}>{item.name}</a> : item.name}</li>)}
          </ul>
        </section>

        <IndiaChapter />

        <section className="content-section wrap" aria-labelledby="list-title">
          <h2 className="statement" id="list-title">Still on the list.</h2>
          <ul className="bucket">
            {bucketList.map(item => (
              <li key={item.title} className={item.done ? "is-done" : undefined}>
                <span className="bucket-mark" aria-hidden="true" />
                <span><strong>{item.title}</strong><small>{item.where}{item.done ? " · done" : ""}</small></span>
              </li>
            ))}
          </ul>
        </section>

        <section className="content-section wrap travel-close">
          <h2 className="statement">Been somewhere I should go?</h2>
          <PillLink href="/knowme">Tell me</PillLink>
        </section>

        <div className="view-switch" role="group" aria-label="Preview a style for the world tour">
          <span>Style</span>
          {views.map(item => <button type="button" key={item.id} aria-pressed={view === item.id} onClick={() => choose(item.id)}>{item.label}</button>)}
        </div>
      </main>
    </SiteShell>
  );
}
