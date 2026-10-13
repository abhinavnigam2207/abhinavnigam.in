import { ArrowLeft, ArrowUpRight, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ExpeditionMap, type Camera, type Mark, type MarkHit } from "@/components/site/ExpeditionMap";
import { Photo } from "@/components/site/Photo";
import { PageMeta, PillLink, SiteShell } from "@/components/site/SiteShell";
import { pageMeta } from "@/content/pageMeta";
import { bucketList, chest, countries, home, indiaPlaces, stories, travelsAreSample } from "@/content/travels";
import { addStamp, readStamps } from "@/lib/stamps";
import { TravelFonts, TravelTransitions } from "./TravelStory";

// Two ways to draw the same expedition, kept side by side for the client to choose between: a flat sea
// chart and an old globe. Once one is chosen, remove the other and this switch.
const views = [{ id: "flat", label: "Chart" }, { id: "globe", label: "Globe" }] as const;
type View = (typeof views)[number]["id"];

const storyPath = (slug: string, city?: string) => `/bucket-list/${slug}${city ? `/${city}` : ""}`;
const uncharted = bucketList.filter(item => !item.done && item.lon !== undefined);

export default function Experiences() {
  const [view, setView] = useState<View>("flat");
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
    if (views.some(item => item.id === asked)) setView(asked as View);
  }, []);
  const chooseView = (next: View) => {
    setView(next);
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
    // A phone is too narrow for the whole world: it opens on Asia, and a drag shows the rest.
    : { lon: phone ? 84 : 48, lat: 16, zoom: zoomBy };

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
    if (hover.id === "chest") return stamps.includes("chest") ? { title: chest.title, text: chest.line } : { title: "What's this?", text: "Something is buried here. Click it." };
    if (kind === "uncharted") { const item = uncharted[Number(key)]; return { title: item.title, text: `${item.where} · still to find` }; }
    if (kind === "city" && story) { const city = story.cities.find(item => item.slug === key); return city ? { title: city.name, text: city.tagline, photo: city.cover, action: "Open the journal" } : null; }
    if (kind === "india") { const place = indiaPlaces.find(item => item.code === key); return place ? { title: place.name, text: place.spot } : null; }
    if (kind === "spot") return country ? { title: country.spot, text: "Journal not written yet" } : null;
    if (hover.id === home.code) return { title: home.name, text: "Home. Every route starts here.", action: "Explore" };
    const place = countries.find(item => item.code === hover.id);
    return place ? { title: place.name, text: place.note, action: stamps.includes(place.code) ? "Explore again" : "Explore" } : null;
  })();

  const found = countries.filter(item => stamps.includes(item.code)).length;
  const focusName = atHome ? home.name : country?.name;

  return (
    <SiteShell theme="parchment">
      <PageMeta {...pageMeta.bucketList} />
      <TravelTransitions />
      <TravelFonts />
      <main className="travel-main">
        <section className={`expedition${focus ? " is-dived" : ""}${leaving ? " is-leaving" : ""}`} aria-label="Map of places visited">
          <ExpeditionMap className="expedition-canvas" projection={view} camera={camera} marks={marks} home={[home.lon, home.lat]} onHover={setHover} onPick={pick} />

          <div className="cartouche">
            <p className="eyebrow">Bucket list · Experiences</p>
            <h1>A life outside the pull request.</h1>
            <p className="cartouche-lede">Fourteen countries, most of India, and a map that is far from finished. Follow the red line. Pick an X.</p>
          </div>

          {focus && (
            <aside className="dive-panel" key={focus}>
              <button type="button" className="dive-back" onClick={() => { setFocus(null); setZoomBy(1); setFresh(""); }}><ArrowLeft size={16} aria-hidden="true" /> The whole map</button>
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
              <span className="map-card-copy"><strong>{preview.title}</strong><span>{preview.text}</span>{preview.action && <em>{preview.action}</em>}</span>
            </div>
          )}

          <div className="map-tools">
            <div className="map-switch" role="group" aria-label="Draw the map as">
              {views.map(item => <button type="button" key={item.id} aria-pressed={view === item.id} onClick={() => chooseView(item.id)}>{item.label}</button>)}
            </div>
            <div className="map-zoom" role="group" aria-label="Zoom">
              <button type="button" aria-label="Zoom in" onClick={() => setZoomBy(value => Math.min(4, value * 1.5))}><Plus size={18} aria-hidden="true" /></button>
              <button type="button" aria-label="Zoom out" onClick={() => setZoomBy(value => Math.max(focus ? 0.5 : 1, value / 1.5))}><Minus size={18} aria-hidden="true" /></button>
            </div>
          </div>

          <p className="map-tally" aria-live="polite">
            <span className="tally-seal" aria-hidden="true" />
            {found === countries.length ? "Expedition complete" : `${found} of ${countries.length} discovered`}
            {stamps.includes("chest") && <em> · chest found</em>}
          </p>
        </section>

        {travelsAreSample && <p className="sample-note wrap" role="note"><strong>Preview with sample places.</strong> These are stand-ins to show the design, not Abhinav’s real trips.</p>}

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
