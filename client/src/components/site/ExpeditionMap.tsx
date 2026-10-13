import { useEffect, useLayoutEffect, useRef } from "react";

// The Expedition Map: the travel map, drawn on a transparent canvas (the paper behind it is CSS).
// One engine handles the camera, dragging, diving from the whole world down to a city, and finding the
// mark under the pointer. It paints in two eras: 1826 (an inked sea chart, red X marks, a compass rose)
// and 2026 (dotted land, flight paths, pins). Either can be a flat map or a globe.
// Coastlines are real (Natural Earth); no borders are drawn.
//
// The parent says where the camera should be and which marks exist; the map eases there, lets the visitor
// drag it, and reports which mark is under the pointer or was picked.

export type Mark = {
  id: string; lon: number; lat: number;
  /** x: a place visited · city: a stop inside a country · home · uncharted: still to find · chest: the hidden one */
  kind: "x" | "city" | "home" | "uncharted" | "chest";
  label?: string;
  /** A wax seal round the X: the visitor has already opened this one. */
  sealed?: boolean;
};
export type Camera = { lon: number; lat: number; zoom: number };
export type MarkHit = { id: string; x: number; y: number };

type Props = {
  era: "1826" | "2026";
  projection: "flat" | "globe";
  /** Let the globe turn slowly on its own. It waits while the visitor holds it, points at a mark or has zoomed in, then carries on. */
  spin?: boolean;
  camera: Camera;
  /** Change this number to send the map back to `camera` even when `camera` itself has not changed (after a drag). */
  recenter?: number;
  marks: Mark[];
  /** Red routes are drawn from this point to every "x" mark. */
  home: [number, number];
  onHover?: (hit: MarkHit | null) => void;
  onPick?: (hit: MarkHit) => void;
  /** Where the camera's centre sits on the canvas, as a fraction of its size away from the middle.
   *  Used to keep a country clear of a panel that covers part of the map. */
  shift?: [number, number];
  /** The visitor pinched far enough out of a dived-in view to mean "take me back". */
  onZoomOut?: () => void;
  className?: string;
};

const RAD = Math.PI / 180;
const INK = "74, 50, 28";
const RED = "166, 34, 30";
const SERIF = '"IM Fell English", "Iowan Old Style", Georgia, serif';
const SANS = 'Inter, ui-sans-serif, system-ui, sans-serif';
const CAPS = '"IM Fell English SC", "IM Fell English", Georgia, serif';
const OCEANS: [string, number, number][] = [["Indian Ocean", 76, -24], ["Atlantic Ocean", -34, 22], ["Pacific Ocean", -142, 12], ["Pacific Ocean", 168, 14], ["Southern Ocean", 20, -52], ["Arabian Sea", 63, 14], ["Bay of Bengal", 89, 13]];

// `centre` (a unit vector) and `reach` (radians) describe the smallest cap of the globe that holds the
// ring. They let the globe skip, in one comparison, every coastline that is out of sight.
// `xyz` holds every point as a unit vector (x, y, z, x, y, z, …), worked out once, so that turning the globe
// costs a few multiplications per point and no trigonometry.
type Ring = { points: number[]; xyz: Float32Array; west: number; east: number; south: number; north: number; centre: [number, number, number]; reach: number };
// A coastline that crosses the 180th meridian arrives with longitudes jumping between +180 and -180.
// Unwrapping them (letting values run past 180) keeps each ring one continuous outline.
const toRings = (data: number[][]): Ring[] => data.map(source => {
  const points = source.slice();
  let west = 999, east = -999, south = 90, north = -90, shift = 0;
  for (let i = 0; i < points.length; i += 2) {
    if (i > 0) { const jump = source[i] - source[i - 2]; if (jump > 180) shift -= 360; else if (jump < -180) shift += 360; }
    points[i] += shift;
    west = Math.min(west, points[i]); east = Math.max(east, points[i]);
    south = Math.min(south, points[i + 1]); north = Math.max(north, points[i + 1]);
  }
  const xyz = new Float32Array((points.length / 2) * 3);
  let x = 0, y = 0, z = 0;
  for (let i = 0, k = 0; i < points.length; i += 2, k += 3) {
    const cos = Math.cos(points[i + 1] * RAD);
    xyz[k] = cos * Math.sin(points[i] * RAD); xyz[k + 1] = Math.sin(points[i + 1] * RAD); xyz[k + 2] = cos * Math.cos(points[i] * RAD);
    x += xyz[k]; y += xyz[k + 1]; z += xyz[k + 2];
  }
  const size = Math.hypot(x, y, z) || 1;
  const centre: [number, number, number] = [x / size, y / size, z / size];
  let reach = 0;
  for (let k = 0; k < xyz.length; k += 3) reach = Math.max(reach, Math.acos(Math.max(-1, Math.min(1, xyz[k] * centre[0] + xyz[k + 1] * centre[1] + xyz[k + 2] * centre[2]))));
  return { points, xyz, west, east, south, north, centre, reach };
});

const wrap = (degrees: number) => ((((degrees + 180) % 360) + 360) % 360) - 180;
// Is this point inside the ring? Rings may run past 180 degrees (see toRings), so the point is tried at
// its own longitude and a full turn either side.
function holds(ring: Ring, lon: number, lat: number) {
  if (lat < ring.south || lat > ring.north) return false;
  const pts = ring.points;
  for (const turn of [-360, 0, 360]) {
    const x = lon + turn;
    if (x < ring.west || x > ring.east) continue;
    let inside = false;
    for (let i = 0, j = pts.length - 2; i < pts.length; j = i, i += 2) {
      if ((pts[i + 1] > lat) !== (pts[j + 1] > lat) && x < (pts[j] - pts[i]) * (lat - pts[i + 1]) / (pts[j + 1] - pts[i + 1]) + pts[i]) inside = !inside;
    }
    if (inside) return true;
  }
  return false;
}
const smooth = (from: number, to: number, value: number) => { const t = Math.min(1, Math.max(0, (value - from) / (to - from))); return t * t * (3 - 2 * t); };

// Everything one frame needs, worked out once by `advance` and handed to each painter.
type Point = { x: number; y: number; front: boolean };
type Scene = {
  modern: boolean; globe: boolean;
  ink: string; red: string; serif: string; caps: string; paper: string;
  /** Where the camera's centre falls on the canvas. */
  cx: number; cy: number;
  /** Globe: its radius in pixels. Flat: pixels per degree, and how far east-west is narrowed. */
  radius: number; scale: number; squeeze: number;
  sinLat: number; cosLat: number;
  land: Ring[];
  /** Something is moving: draw the cheaper version. */
  light: boolean;
  /** 0 to 1 through the opening shot. */
  intro: number;
  /** 1 at the whole-world view, 0 once dived into a country. */
  wide: number;
  marks: Mark[]; visited: Mark[]; from: [number, number];
  onGlobe: (lon: number, lat: number, lift?: number) => Point;
  point: (lon: number, lat: number) => Point;
  /** Another frame is wanted after this one. */
  busy: boolean;
};

export function ExpeditionMap({ era, projection, spin, camera, recenter, marks, home, onHover, onPick, shift, onZoomOut, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // The drawing loop lives in one long effect; it reads the latest props from here.
  const live = useRef({ era, projection, spin, camera, marks, home, onHover, onPick, shift, onZoomOut });
  const wake = useRef<() => void>(() => {});
  const paintNow = useRef<() => void>(() => {});
  const fly = useRef<() => void>(() => {});
  const goal = useRef<Camera>({ ...camera });

  live.current = { era, projection, spin, camera, marks, home, onHover, onPick, shift, onZoomOut };
  // A new camera from the parent (a dive, a step back) replaces wherever the visitor had dragged to.
  useEffect(() => { goal.current = { ...camera }; fly.current(); wake.current(); }, [camera.lon, camera.lat, camera.zoom, recenter]);
  useEffect(() => { wake.current(); }, [projection, spin, marks, shift?.[0], shift?.[1]]);
  // An era flip is repainted before the browser shows the next frame, so the old ink is never seen on
  // the new paper.
  useLayoutEffect(() => { paintNow.current(); wake.current(); }, [era]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const view: Camera = { ...goal.current };
    let width = 0, height = 0, frame = 0, running = false, last = 0;
    // Three grades of coastline: `coarse` for the whole world, `fine` for a country at rest, and `mid`
    // (the fine one thinned out) for a country while the map is moving, when the eye cannot see the
    // difference and the phone can feel it.
    let coarse: Ring[] = [], fine: Ring[] | null = null, mid: Ring[] | null = null, fineAsked = false;
    // A move ordered by the page (a dive, a step back, a zoom button) is flown as one timed glide.
    let flight: { from: Camera; to: Camera; start: number; span: number } | null = null;
    // True while a finger is dragging or pinching.
    let handling = false;
    let spots: { id: string; x: number; y: number }[] = [];
    let hovered = "";
    // True while a finger or the mouse button is down on the map; the idle spin waits for it to lift.
    let held = false;
    // The centre's offset on the canvas, eased like the camera.
    const offset = { x: live.current.shift?.[0] ?? 0, y: live.current.shift?.[1] ?? 0 };
    let dots: { pattern: CanvasPattern; ratio: number } | null = null;
    // Turned points of the ring being drawn, reused from frame to frame.
    let turned = new Float32Array(3 * 4096);
    // The opening shot: routes draw themselves out from home, one after another.
    // It starts once the coastlines have arrived, so the routes are drawn onto a map, not onto blank paper.
    let opened = Infinity;
    const INTRO = still ? 0 : 4200;
    // Until the coastline arrives the canvas is kept clear, then the finished map fades in as one piece
    // (marks and a grid on bare paper, a moment before the land, read as a broken page).
    canvas.style.opacity = "0";
    if (!still) canvas.style.transition = "opacity 500ms ease";
    const fetchCoast = (file: string) => fetch(`/travel/${file}`).then(response => response.json() as Promise<number[][]>);
    // The fine coastline is large. It is prepared a slice at a time, between frames, so that getting it
    // ready never makes the map stutter; and it is fetched as soon as the page is idle, so it is already
    // there when the visitor first dives in.
    const prepare = async (data: number[][]) => {
      // A slice is measured in points, not rings: one continent's outline is as much work as a thousand islands.
      const out: Ring[] = [];
      let from = 0, weight = 0;
      for (let i = 0; i < data.length; i++) {
        weight += data[i].length;
        if (weight < 5000 && i < data.length - 1) continue;
        out.push(...toRings(data.slice(from, i + 1)));
        from = i + 1; weight = 0;
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      return out;
    };
    const thin = (ring: number[]) => { const out: number[] = []; for (let i = 0; i < ring.length - 2; i += 6) out.push(ring[i], ring[i + 1]); out.push(ring[ring.length - 2], ring[ring.length - 1]); return out; };
    const loadFine = () => {
      if (fineAsked) return;
      fineAsked = true;
      fetchCoast("coast-50.json").then(async data => {
        const thinned = await prepare(data.filter(ring => ring.length >= 40).map(thin));
        const full = await prepare(data);
        mid = thinned; fine = full; wake.current();
      }).catch(() => { fineAsked = false; });
    };
    const loadWorld = (retry: boolean) => fetchCoast("coast-110.json").then(data => {
      coarse = toRings(data); opened = performance.now(); canvas.style.opacity = "1"; wake.current();
      const saving = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
      if (!saving) window.setTimeout(loadFine, INTRO + 400);
    }).catch(() => { if (retry) window.setTimeout(() => loadWorld(false), 2500); });
    loadWorld(true);
    fly.current = () => {
      if (still) return;
      const from = { ...view }, to = goal.current;
      // Longer journeys take a little longer, within limits, so near and far both feel unhurried.
      const turn = Math.hypot(wrap(to.lon - from.lon), to.lat - from.lat), scale = Math.abs(Math.log(to.zoom / from.zoom));
      flight = { from, to, start: performance.now(), span: Math.max(650, Math.min(1500, 600 + turn * 5 + scale * 320)) };
    };

    // Returns false when nothing changed. Phones fire "resize" whenever the address bar slides in or out;
    // rebuilding the canvas for those would flicker the map while the page scrolls.
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * ratio), h = Math.round(canvas.clientHeight * ratio);
      if (w === canvas.width && h === canvas.height && width > 0) return false;
      width = canvas.clientWidth; height = canvas.clientHeight;
      canvas.width = w; canvas.height = h;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      return true;
    };

    const spacing = (value: string) => { (context as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = value; };

    // A frame is made in two parts. `advance` moves the camera one step and measures everything the frame
    // needs (the Scene); the painters below then lay the map down, one layer each, in the order they are
    // called from `draw`.
    const advance = (now: number): Scene => {
      const { projection: mode, marks: allMarks, home: from } = live.current;
      const modern = live.current.era === "2026";
      const ink = modern ? "43, 47, 49" : INK, red = modern ? "229, 72, 77" : RED;
      const serif = modern ? SANS : SERIF, caps = modern ? SANS : CAPS;
      const paper = modern ? "rgba(255, 255, 255, 0.92)" : "rgba(247, 236, 205, 0.9)";
      const seconds = Math.min((now - last) / 1000, 0.1); last = now;
      // The globe turns on its own, from wherever it was left. It holds still under a finger, while a mark
      // is pointed at (so it can be read and pressed), and while the visitor has zoomed in for a closer look.
      const spinning = Boolean(live.current.spin) && mode === "globe" && !still && !held && !hovered && goal.current.zoom <= live.current.camera.zoom * 1.15;
      if (spinning) goal.current = { ...goal.current, lon: wrap(goal.current.lon + 5 * seconds) };
      const target = goal.current;
      const rate = still ? 1 : 1 - Math.pow(0.0015, seconds);
      if (flight && flight.to === target) {
        // Ease in, ease out; zoom is blended as a ratio so that it feels even all the way down.
        const t = Math.min(1, (now - flight.start) / flight.span);
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        view.lon = flight.from.lon + wrap(flight.to.lon - flight.from.lon) * e;
        view.lat = flight.from.lat + (flight.to.lat - flight.from.lat) * e;
        view.zoom = flight.from.zoom * Math.pow(flight.to.zoom / flight.from.zoom, e);
        if (t >= 1) flight = null;
      } else {
        flight = null;
        view.lon += wrap(target.lon - view.lon) * rate;
        view.lat += (target.lat - view.lat) * rate;
        view.zoom *= Math.pow(target.zoom / view.zoom, rate);
      }
      // Spinning and dragging can carry the longitude many turns round; everything below assumes -180..180.
      view.lon = wrap(view.lon);
      const wantX = live.current.shift?.[0] ?? 0, wantY = live.current.shift?.[1] ?? 0;
      offset.x += (wantX - offset.x) * rate; offset.y += (wantY - offset.y) * rate;
      const moving = Math.abs(wrap(target.lon - view.lon)) > 0.01 || Math.abs(target.lat - view.lat) > 0.01 || Math.abs(target.zoom - view.zoom) > 0.002
        || Math.abs(wantX - offset.x) > 0.001 || Math.abs(wantY - offset.y) > 0.001 || flight !== null;
      // While anything is in motion the map is drawn in a lighter way; the frame after it comes to rest is
      // drawn in full.
      const light = moving || spinning || handling;
      const intro = !coarse.length ? 0 : INTRO ? Math.min(1, (now - opened) / INTRO) : 1;

      if (view.zoom > 1.8) loadFine();
      const land = view.zoom > 1.8 && fine ? (light && mid ? mid : fine) : coarse;

      const cx = width * (0.5 + offset.x), cy = height * (0.5 + offset.y);
      const globe = mode === "globe";
      const radius = Math.min(width, height) * 0.43 * view.zoom;
      const scale = Math.max(width / 360, height / 150) * view.zoom;
      // A flat chart of the whole world keeps its familiar proportions; zoomed in, east-west distances are
      // narrowed by the latitude so countries keep their true shape.
      const squeeze = 1 + (Math.cos(view.lat * RAD) - 1) * smooth(1.2, 3, view.zoom);
      const sinLat = Math.sin(view.lat * RAD), cosLat = Math.cos(view.lat * RAD);

      // Globe: where a single point (a mark, a route, a grid line) falls on screen, and whether it is on
      // the near side. `lift` raises it off the surface, for routes. Coastlines do not come through here:
      // they are turned in bulk further down.
      const onGlobe = (lon: number, lat: number, lift = 1) => {
        const l = (lon - view.lon) * RAD, p = lat * RAD, cosP = Math.cos(p);
        const x = cosP * Math.sin(l), z1 = cosP * Math.cos(l), y1 = Math.sin(p);
        const y = y1 * cosLat - z1 * sinLat, z = y1 * sinLat + z1 * cosLat;
        return { x: cx + x * radius * lift, y: cy - y * radius * lift, front: z >= 0 };
      };
      const point = (lon: number, lat: number) => globe ? onGlobe(lon, lat) : { x: cx + wrap(lon - view.lon) * scale * squeeze, y: cy - (lat - view.lat) * scale, front: true };
      const visited = allMarks.filter(mark => mark.kind === "x");
      // 1 at the whole-world view, 0 once dived into a country: fades the routes, sea names and compass.
      const wide = 1 - smooth(1.4, 2.1, view.zoom);
      const busy = moving || spinning || (coarse.length > 0 && intro < 1);
      return { modern, globe, ink, red, serif, caps, paper, cx, cy, radius, scale, squeeze, sinLat, cosLat, land, light, intro, wide, marks: allMarks, visited, from, onGlobe, point, busy };
    };

    // The sea and its grid. On a globe the sea is a shaded ball, and everything drawn from here until
    // paintRim is cut to its outline.
    const paintSea = ({ modern, globe, ink, cx, cy, radius, scale, squeeze, onGlobe }: Scene) => {
      if (globe) {
        const shade = context.createRadialGradient(cx - radius * 0.35, cy - radius * 0.4, radius * 0.05, cx, cy, radius);
        if (modern) { shade.addColorStop(0, "#ffffff"); shade.addColorStop(0.8, "#f1f2f3"); shade.addColorStop(1, "#e3e5e7"); }
        else { shade.addColorStop(0, "rgba(246, 233, 198, 0.95)"); shade.addColorStop(0.75, "rgba(226, 204, 158, 0.95)"); shade.addColorStop(1, "rgba(190, 160, 112, 0.98)"); }
        context.beginPath(); context.arc(cx, cy, radius, 0, Math.PI * 2); context.fillStyle = shade; context.fill();
        context.save(); context.beginPath(); context.arc(cx, cy, radius, 0, Math.PI * 2); context.clip();
      }
      context.lineWidth = 0.7; context.strokeStyle = `rgba(${ink}, ${modern ? 0.06 : 0.13})`;
      context.beginPath();
      if (globe) {
        for (let lon = -180; lon < 180; lon += 20) { let pen = false; for (let lat = -84; lat <= 84; lat += 4) { const p = onGlobe(lon, lat); if (!p.front) { pen = false; continue; } pen ? context.lineTo(p.x, p.y) : context.moveTo(p.x, p.y); pen = true; } }
        for (let lat = -80; lat <= 80; lat += 20) { let pen = false; for (let lon = -180; lon <= 180; lon += 4) { const p = onGlobe(lon, lat); if (!p.front) { pen = false; continue; } pen ? context.lineTo(p.x, p.y) : context.moveTo(p.x, p.y); pen = true; } }
      } else {
        const step = view.zoom > 3 ? 10 : 30;
        const first = Math.floor((view.lon - 200) / step) * step;
        for (let lon = first; lon < view.lon + 200; lon += step) { const x = cx + (lon - view.lon) * scale * squeeze; if (x > -2 && x < width + 2) { context.moveTo(x, 0); context.lineTo(x, height); } }
        for (let lat = -80; lat <= 80; lat += step) { const y = cy - (lat - view.lat) * scale; if (y > -2 && y < height + 2) { context.moveTo(0, y); context.lineTo(width, y); } }
      }
      context.stroke();
    };

    // The land. Its outline is traced once, as a globe or as a flat chart, then inked in the era's manner.
    const paintLand = ({ modern, globe, ink, paper, cx, cy, radius, scale, squeeze, sinLat, cosLat, land, light }: Scene) => {
      const fill = new Path2D(), coast = new Path2D();
      if (globe) {
        // How much of the globe is on screen: a whole hemisphere at world zoom, a small cap when zoomed in.
        // Coastlines further from the centre of view than that (plus their own size) are skipped.
        const cap = Math.asin(Math.min(1, Math.hypot(width, height) / 2 / radius));
        const sinLon = Math.sin(view.lon * RAD), cosLon = Math.cos(view.lon * RAD);
        const near = cap >= Math.PI / 2 - 0.01 ? 0 : Math.cos(Math.min(Math.PI / 2, cap * 1.2));
        const eye: [number, number, number] = [cosLat * sinLon, sinLat, cosLat * cosLon];
        for (const ring of land) {
          const apart = Math.acos(Math.max(-1, Math.min(1, ring.centre[0] * eye[0] + ring.centre[1] * eye[1] + ring.centre[2] * eye[2])));
          if (apart > cap + ring.reach) continue;
          // Turn every point of the ring to face the viewer: u, v across and up the face, z towards the eye.
          const xyz = ring.xyz, count = xyz.length / 3;
          if (turned.length < xyz.length) turned = new Float32Array(xyz.length);
          // `near` is how far towards the eye a point must be to fall inside the part of the globe on
          // screen (0 when the whole face is in view).
          let any = false;
          for (let k = 0; k < xyz.length; k += 3) {
            const u = xyz[k] * cosLon - xyz[k + 2] * sinLon, depth = xyz[k] * sinLon + xyz[k + 2] * cosLon;
            const z = xyz[k + 1] * sinLat + depth * cosLat;
            turned[k] = u; turned[k + 1] = xyz[k + 1] * cosLat - depth * sinLat; turned[k + 2] = z;
            if (z >= near) any = true;
          }
          if (!any) {
            // None of this coast is on screen. Either the land is elsewhere, or the view is zoomed into
            // its interior with every shore out of sight, in which case the whole view is land.
            if (near > 0 && holds(ring, view.lon, view.lat)) fill.rect(0, 0, width, height);
            continue;
          }
          // Fill only the part of the outline on the near side. Where the coast goes behind the globe, the
          // shape follows the rim instead: each hidden point is slid outwards to the rim and joined to the
          // next by an arc (never a straight cut across the face).
          const along = (from: number, to: number) => {
            const sweep = Math.atan2(Math.sin(to - from), Math.cos(to - from));
            if (Math.abs(sweep) > 1e-4) fill.arc(cx, cy, radius, from, from + sweep, sweep < 0);
          };
          let rim = 0, pen = false;
          for (let n = 0, k = 0; n < count; n++, k += 3) {
            const u = turned[k], v = turned[k + 1], z = turned[k + 2];
            const x = cx + u * radius, y = cy - v * radius;
            if (z >= 0) {
              if (n === 0) fill.moveTo(x, y);
              else if (turned[k - 1] < 0) {
                // Coming back over the horizon: finish the arc at the exact crossing point.
                const t = z / (z - turned[k - 1]);
                along(rim, Math.atan2(-(v + (turned[k - 2] - v) * t), u + (turned[k - 3] - u) * t));
                fill.lineTo(x, y);
              } else fill.lineTo(x, y);
              pen ? coast.lineTo(x, y) : coast.moveTo(x, y); pen = true;
            } else {
              const here = Math.atan2(-v, u);
              if (n === 0) fill.moveTo(cx + Math.cos(here) * radius, cy + Math.sin(here) * radius);
              else if (turned[k - 1] >= 0) {
                // Going over the horizon: run out to the crossing point, then along the rim.
                const pu = turned[k - 3], pv = turned[k - 2], pz = turned[k - 1], t = pz / (pz - z);
                const edge = Math.atan2(-(pv + (v - pv) * t), pu + (u - pu) * t);
                fill.lineTo(cx + Math.cos(edge) * radius, cy + Math.sin(edge) * radius); along(edge, here);
              } else {
                // Both ends are hidden. Most such steps barely move round the rim and are left to add up;
                // only a real move draws an arc. A big jump means the coast is passing near the far pole,
                // so it is taken in quarters to be sure of turning the right way.
                const turn = Math.abs(Math.atan2(Math.sin(here - rim), Math.cos(here - rim)));
                if (turn < 0.03 && n < count - 1) { pen = false; continue; }
                if (turn > 0.6) {
                  const pu = turned[k - 3], pv = turned[k - 2];
                  for (let step = 1; step < 4; step++) { const part = Math.atan2(-(pv + (v - pv) * step / 4), pu + (u - pu) * step / 4); along(rim, part); rim = part; }
                }
                along(rim, here);
              }
              rim = here; pen = false;
            }
          }
          // If the point directly behind the globe is inside this land, its hidden coast has gone all the
          // way round the rim and the shape above is inside-out. Adding the whole disc turns it back
          // (the fill rule is even-odd), so land is filled and sea is left clear.
          if (holds(ring, wrap(view.lon + 180), -view.lat)) { fill.closePath(); fill.moveTo(cx + radius, cy); fill.arc(cx, cy, radius, 0, Math.PI * 2); }
          fill.closePath();
        }
      } else {
        const halfLon = width / 2 / (scale * squeeze), halfLat = height / 2 / scale;
        for (const ring of land) {
          // The far south is left off the flat chart: it would stretch into a bar along the bottom.
          if (ring.north < -60 || ring.south > view.lat + halfLat || ring.north < view.lat - halfLat) continue;
          for (const turn of [-720, -360, 0, 360]) {
            if (ring.east + turn < view.lon - halfLon || ring.west + turn > view.lon + halfLon) continue;
            const pts = ring.points;
            let pen = false;
            for (let i = 0; i < pts.length; i += 2) {
              const x = cx + (pts[i] + turn - view.lon) * scale * squeeze, y = cy - (pts[i + 1] - view.lat) * scale;
              i ? fill.lineTo(x, y) : fill.moveTo(x, y);
              pen ? coast.lineTo(x, y) : coast.moveTo(x, y); pen = true;
            }
            fill.closePath();
          }
        }
      }
      context.lineJoin = "round";
      if (modern) {
        // 2026: land is a field of dots with the faintest outline. The dots are a screen pattern cut to
        // the land's shape, so they stay crisp at every zoom.
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        if (!dots || dots.ratio !== ratio) {
          const tile = document.createElement("canvas"); tile.width = tile.height = Math.round(7 * ratio);
          const pen = tile.getContext("2d")!; pen.fillStyle = "rgba(43, 47, 49, 0.5)";
          pen.beginPath(); pen.arc(tile.width / 2, tile.height / 2, 1.15 * ratio, 0, Math.PI * 2); pen.fill();
          const pattern = context.createPattern(tile, "repeat")!; pattern.setTransform(new DOMMatrix().scale(1 / ratio));
          dots = { pattern, ratio };
        }
        context.fillStyle = "rgba(43, 47, 49, 0.035)"; context.fill(fill, "evenodd");
        context.save(); context.clip(fill, "evenodd"); context.fillStyle = dots.pattern; context.fillRect(0, 0, width, height); context.restore();
        context.lineWidth = 0.8; context.strokeStyle = `rgba(${ink}, 0.2)`; context.stroke(coast);
      } else {
        // 1826: an engraved shoreline. Soft bands of ink in the water, which the land covers on its own side.
        // The three wide bands are the costliest strokes on the page, so in motion one stands in for them.
        for (const [size, alpha] of (light ? [[8.5, 0.11]] : [[13, 0.05], [8.5, 0.07], [4.5, 0.09]]) as [number, number][]) { context.lineWidth = size; context.strokeStyle = `rgba(${ink}, ${alpha})`; context.stroke(coast); }
        context.fillStyle = paper; context.fill(fill, "evenodd");
        context.lineWidth = 1.15; context.strokeStyle = `rgba(${ink}, 0.88)`; context.stroke(coast);
      }
    };

    const paintSeaNames = ({ modern, serif, ink, wide, point }: Scene) => {
      context.textAlign = "center"; context.textBaseline = "middle";
      context.font = modern ? `500 ${Math.max(10, Math.min(12, width / 110))}px ${SANS}` : `italic ${Math.max(13, Math.min(22, width / 62))}px ${serif}`;
      spacing("0.32em");
      context.fillStyle = `rgba(${ink}, ${(modern ? 0.3 : 0.5) * (0.35 + 0.65 * wide)})`;
      for (const [name, lon, lat] of OCEANS) { const p = point(lon, lat); if (p.front && p.x > 40 && p.x < width - 40) context.fillText(name.toUpperCase(), p.x, p.y); }
      spacing("0px");
    };

    // Routes from home to every place visited. 1826: dashes of red ink. 2026: a clean flight path with the
    // aircraft at its tip while it is drawn.
    const paintRoutes = ({ modern, globe, red, cx, cy, scale, squeeze, intro, wide, visited, from, onGlobe }: Scene) => {
      if (wide <= 0.02 || !visited.length) return;
      context.lineWidth = modern ? 1.4 : 1.5; context.setLineDash(modern ? [] : [5, 5]); context.lineCap = modern ? "round" : "butt";
      visited.forEach((mark, order) => {
        const share = Math.min(1, Math.max(0, intro * visited.length * 1.15 - order));
        if (share <= 0) return;
        const span = wrap(mark.lon - from[0]);
        // Measured from the start of the route, so a line that crosses the edge of the map does not jump
        // back across the whole screen.
        const startX = wrap(from[0] - view.lon);
        const steps = 40, upTo = Math.round(steps * share);
        context.beginPath(); let pen = false; let tip: { x: number; y: number } | null = null;
        for (let step = 0; step <= upTo; step++) {
          const t = step / steps, hop = Math.sin(Math.PI * t);
          const lon = from[0] + span * t, lat = from[1] + (mark.lat - from[1]) * t;
          const reach = Math.min(1, Math.hypot(span, mark.lat - from[1]) / 70);
          const p = globe ? onGlobe(lon, lat, 1 + hop * 0.1 * reach) : { x: cx + (startX + span * t) * scale * squeeze, y: cy - (lat - view.lat) * scale - hop * reach * Math.min(height * 0.1, 70), front: true };
          if (!p.front) { pen = false; continue; }
          pen ? context.lineTo(p.x, p.y) : context.moveTo(p.x, p.y); pen = true; tip = p;
        }
        context.strokeStyle = `rgba(${red}, ${(modern ? 0.55 : 0.8) * wide})`; context.stroke();
        if (modern && tip && share < 1) { context.fillStyle = `rgb(${red})`; context.beginPath(); context.arc(tip.x, tip.y, 3, 0, Math.PI * 2); context.fill(); }
      });
      context.setLineDash([]);
    };

    // The edge of the globe. Ends the cut made in paintSea, so marks and their labels can overhang it.
    const paintRim = ({ modern, globe, ink, cx, cy, radius }: Scene) => {
      if (!globe) return;
      context.restore();
      if (modern) { context.lineWidth = 1; context.strokeStyle = `rgba(${ink}, 0.12)`; context.beginPath(); context.arc(cx, cy, radius, 0, Math.PI * 2); context.stroke(); }
      else {
        context.lineWidth = 2.2; context.strokeStyle = `rgba(${ink}, 0.75)`; context.beginPath(); context.arc(cx, cy, radius, 0, Math.PI * 2); context.stroke();
        context.lineWidth = 1; context.strokeStyle = `rgba(${ink}, 0.4)`; context.beginPath(); context.arc(cx, cy, radius + 7, 0, Math.PI * 2); context.stroke();
      }
    };

    // The compass rose belongs to the 1826 flat chart, at its whole-world view.
    const paintCompass = ({ modern, globe, ink, paper, caps, wide }: Scene) => {
      if (modern || globe || wide <= 0.02) return;
      // Top right, clear of the title block (bottom left) and the menu button.
      const size = Math.max(30, Math.min(58, width * 0.045)), rx = width - Math.max(size + 34, width * 0.075), ry = size + Math.max(120, height * 0.2);
      context.save(); context.globalAlpha = wide; context.translate(rx, ry);
      context.strokeStyle = `rgba(${ink}, 0.1)`; context.lineWidth = 0.7; context.beginPath();
      for (let i = 0; i < 32; i++) { const a = (i / 32) * Math.PI * 2; context.moveTo(0, 0); context.lineTo(Math.sin(a) * width * 1.4, -Math.cos(a) * width * 1.4); }
      context.stroke();
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2, long = i % 4 === 0 ? size : i % 2 === 0 ? size * 0.66 : size * 0.4, half = long * 0.14;
        for (const side of [-1, 1]) {
          context.beginPath(); context.moveTo(0, 0); context.lineTo(Math.sin(a) * long, -Math.cos(a) * long);
          context.lineTo(Math.sin(a + side * Math.PI / 2) * half, -Math.cos(a + side * Math.PI / 2) * half); context.closePath();
          context.fillStyle = side < 0 ? `rgba(${ink}, 0.82)` : paper; context.fill();
          context.strokeStyle = `rgba(${ink}, 0.8)`; context.lineWidth = 0.7; context.stroke();
        }
      }
      context.strokeStyle = `rgba(${ink}, 0.6)`; context.lineWidth = 1; context.beginPath(); context.arc(0, 0, size * 1.12, 0, Math.PI * 2); context.stroke();
      context.fillStyle = `rgb(${ink})`; context.font = `${size * 0.36}px ${caps}`; context.textAlign = "center"; context.fillText("N", 0, -size * 1.34);
      context.restore();
    };

    // Marks and their labels. Also records where each mark fell (`spots`), for the pointer to find.
    const paintMarks = ({ modern, ink, red, serif, caps, paper, intro, marks: allMarks, visited, point }: Scene) => {
      spots = [];
      const taken: [number, number, number, number][] = [];
      const fits = (box: [number, number, number, number]) => { if (taken.some(t => box[0] < t[2] && box[2] > t[0] && box[1] < t[3] && box[3] > t[1])) return false; taken.push(box); return true; };
      const cross = (x: number, y: number, arm: number, weight: number, alpha: number) => {
        context.lineCap = "round"; context.lineWidth = weight; context.strokeStyle = `rgba(${red}, ${alpha})`;
        context.beginPath(); context.moveTo(x - arm, y - arm * 0.9); context.lineTo(x + arm, y + arm); context.moveTo(x + arm * 0.95, y - arm); context.lineTo(x - arm, y + arm * 0.92); context.stroke();
      };
      context.textAlign = "left";
      // The mark under the pointer claims its label space first; the rest are labelled only where there is room.
      const ordered = [...allMarks].sort((a, b) => Number(b.id === hovered) - Number(a.id === hovered));
      for (const mark of ordered) {
        const p = point(mark.lon, mark.lat);
        if (!p.front || p.x < -20 || p.x > width + 20 || p.y < -20 || p.y > height + 20) continue;
        const hot = mark.id === hovered;
        const shown = mark.kind === "x" ? Math.min(1, Math.max(0, intro * visited.length * 1.15 - visited.indexOf(mark) - 0.6) * 3) : 1;
        if (shown <= 0) continue;
        spots.push({ id: mark.id, x: p.x, y: p.y });
        if (modern) {
          // 2026 marks: pins. A visited place is a red dot, a discovered one wears a ring, home is dark.
          const base = mark.kind === "x" ? 5.5 : mark.kind === "city" ? 4.5 : mark.kind === "home" ? 5 : 4;
          const size = base * (hot ? 1.3 : 1) * (mark.kind === "x" ? 1.8 - 0.8 * shown : 1);
          if (mark.kind === "chest") {
            // The hidden find, drawn as a small paper plane.
            context.globalAlpha = hot ? 1 : 0.4; context.fillStyle = `rgb(${ink})`; context.beginPath();
            context.moveTo(p.x + 8, p.y - 5); context.lineTo(p.x - 7, p.y); context.lineTo(p.x - 2, p.y + 2); context.lineTo(p.x, p.y + 7); context.closePath(); context.fill(); context.globalAlpha = 1;
          } else if (mark.kind === "uncharted") {
            context.setLineDash([3, 3]); context.lineWidth = 1.3; context.strokeStyle = `rgba(${ink}, ${hot ? 0.8 : 0.45})`; context.beginPath(); context.arc(p.x, p.y, hot ? 10 : 8, 0, Math.PI * 2); context.stroke(); context.setLineDash([]);
            context.fillStyle = `rgba(${ink}, 0.5)`; context.beginPath(); context.arc(p.x, p.y, 2, 0, Math.PI * 2); context.fill();
          } else {
            if (hot) { context.fillStyle = `rgba(${mark.kind === "home" ? ink : red}, 0.16)`; context.beginPath(); context.arc(p.x, p.y, size + 9, 0, Math.PI * 2); context.fill(); }
            context.beginPath(); context.arc(p.x, p.y, size, 0, Math.PI * 2);
            context.fillStyle = mark.kind === "home" ? `rgb(${ink})` : `rgba(${red}, ${shown})`; context.fill();
            context.lineWidth = 2; context.strokeStyle = "#fff"; context.stroke();
            if (mark.sealed) { context.lineWidth = 1.4; context.strokeStyle = `rgba(${ink}, 0.7)`; context.beginPath(); context.arc(p.x, p.y, size + 5, 0, Math.PI * 2); context.stroke(); }
          }
        } else if (mark.kind === "x" || mark.kind === "city") {
          const arm = (mark.kind === "x" ? 6 : 5) * (hot ? 1.35 : 1) * (1.6 - 0.6 * shown);
          cross(p.x, p.y, arm, mark.kind === "x" ? 2.6 : 2.2, 0.95 * shown);
          if (mark.sealed) { context.lineWidth = 1.6; context.strokeStyle = `rgba(${red}, 0.85)`; context.beginPath(); context.arc(p.x, p.y, 12, 0, Math.PI * 2); context.stroke(); context.setLineDash([2, 3]); context.beginPath(); context.arc(p.x, p.y, 15.5, 0, Math.PI * 2); context.stroke(); context.setLineDash([]); }
        } else if (mark.kind === "home") {
          context.fillStyle = `rgb(${ink})`; context.beginPath();
          for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, r = i % 2 ? 3.2 : 7.5; i ? context.lineTo(p.x + Math.sin(a) * r, p.y - Math.cos(a) * r) : context.moveTo(p.x + Math.sin(a) * r, p.y - Math.cos(a) * r); }
          context.closePath(); context.fill();
        } else if (mark.kind === "uncharted") {
          context.setLineDash([3, 3]); context.lineWidth = 1.3; context.strokeStyle = `rgba(${ink}, ${hot ? 0.9 : 0.6})`; context.beginPath(); context.arc(p.x, p.y, hot ? 12 : 10, 0, Math.PI * 2); context.stroke(); context.setLineDash([]);
          context.fillStyle = `rgba(${ink}, 0.8)`; context.font = `italic 15px ${serif}`; context.textAlign = "center"; context.fillText("?", p.x, p.y + 1); context.textAlign = "left";
        } else {
          // The chest is drawn small and faint on purpose. It is there to be found.
          context.globalAlpha = hot ? 1 : 0.5; context.fillStyle = `rgb(${ink})`; context.fillRect(p.x - 6, p.y - 2, 12, 7);
          context.beginPath(); context.arc(p.x, p.y - 2, 6, Math.PI, 0); context.fill(); context.fillStyle = "rgb(214, 170, 72)"; context.fillRect(p.x - 1.2, p.y - 1, 2.4, 3.4); context.globalAlpha = 1;
        }
        if (mark.label && mark.kind !== "chest" && (mark.kind !== "uncharted" || hot)) {
          const big = mark.kind === "city" || view.zoom > 2.4;
          context.font = modern ? `${big ? 500 : 600} ${big ? 14 : 11}px ${SANS}` : `${big ? 17 : 13}px ${big ? serif : caps}`;
          spacing(modern && !big ? "0.06em" : "0px");
          const text = big ? mark.label : mark.label.toUpperCase();
          const w = context.measureText(text).width, x = p.x + 13, y = p.y;
          const room = width < 760 ? 8 : 2;
          if (hot || fits([x - room, y - 9 - room, x + w + room, y + 9 + room])) {
            context.lineWidth = 3.5; context.strokeStyle = paper; context.lineJoin = "round"; context.strokeText(text, x, y);
            context.fillStyle = `rgba(${ink}, ${shown})`; context.fillText(text, x, y);
          }
        }
      }
      spacing("0px");
    };

    // Returns whether another frame is wanted.
    const draw = (now: number): boolean => {
      const scene = advance(now);
      context.clearRect(0, 0, width, height);
      if (!coarse.length) return scene.busy;
      paintSea(scene); paintLand(scene); paintSeaNames(scene); paintRoutes(scene); paintRim(scene);
      paintCompass(scene); paintMarks(scene);
      return scene.busy;
    };

    // The loop runs only while something is changing, and only while the map can be seen: scrolled out of
    // view or in a background tab, the spinning globe would otherwise go on drawing for nobody.
    let onScreen = true;
    const loop = (now: number) => { running = onScreen && draw(now) && !still; if (running) frame = requestAnimationFrame(loop); };
    wake.current = () => { if (running || !onScreen) return; running = true; last = performance.now(); frame = requestAnimationFrame(loop); };
    paintNow.current = () => { draw(performance.now()); };
    resize(); wake.current();
    const onResize = () => { if (!resize()) return; running = false; cancelAnimationFrame(frame); wake.current(); };
    window.addEventListener("resize", onResize);
    let inView = true;
    const seen = () => { onScreen = inView && !document.hidden; if (onScreen) wake.current(); };
    const watcher = new IntersectionObserver(entries => { inView = entries[entries.length - 1].isIntersecting; seen(); });
    watcher.observe(canvas);
    document.addEventListener("visibilitychange", seen);
    document.fonts?.ready.then(() => wake.current());

    // ---- Pointer: hover, pick, drag to pan or turn ----
    const hitAt = (event: PointerEvent): MarkHit | null => {
      const box = canvas.getBoundingClientRect();
      const x = event.clientX - box.left, y = event.clientY - box.top;
      let best: MarkHit | null = null, nearest = event.pointerType === "mouse" ? 16 : 26;
      for (const spot of spots) { const d = Math.hypot(spot.x - x, spot.y - y); if (d < nearest) { nearest = d; best = spot; } }
      return best;
    };
    const setHover = (hit: MarkHit | null) => {
      if ((hit?.id ?? "") === hovered) return;
      hovered = hit?.id ?? "";
      canvas.style.cursor = hit ? "pointer" : "grab";
      live.current.onHover?.(hit);
      wake.current();
    };
    // One finger (or the mouse) drags the map. Two fingers pinch to zoom and move it in any direction.
    // A double tap zooms in.
    const perPixel = () => live.current.projection === "globe"
      ? 1 / (Math.min(width, height) * 0.43 * view.zoom * RAD)
      : 1 / (Math.max(width / 360, height / 150) * view.zoom);
    const fingers = new Map<number, { x: number; y: number }>();
    let press: { x: number; y: number; lon: number; lat: number; moved: boolean } | null = null;
    let pinch: { spread: number; x: number; y: number; zoom: number; lon: number; lat: number } | null = null;
    let lastTap = { time: 0, x: 0, y: 0 };
    const twoFingers = () => {
      const [a, b] = [...fingers.values()];
      return { spread: Math.hypot(a.x - b.x, a.y - b.y) || 1, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    };
    // Dived into a country, the map may be pinched out to less than half its size before it lets go.
    const dived = () => live.current.camera.zoom > 1.5;
    const onDown = (event: PointerEvent) => {
      held = true; flight = null;
      fingers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (fingers.size === 2) { press = null; handling = true; pinch = { ...twoFingers(), zoom: goal.current.zoom, lon: goal.current.lon, lat: goal.current.lat }; return; }
      press = { x: event.clientX, y: event.clientY, lon: goal.current.lon, lat: goal.current.lat, moved: false };
    };
    const onMove = (event: PointerEvent) => {
      if (fingers.has(event.pointerId)) fingers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pinch && fingers.size >= 2) {
        const now = twoFingers();
        const least = dived() ? live.current.camera.zoom * 0.4 : 1;
        const zoom = Math.max(least, Math.min(40, pinch.zoom * (now.spread / pinch.spread)));
        view.zoom = zoom;
        const step = perPixel();
        goal.current = { zoom, lon: wrap(pinch.lon - (now.x - pinch.x) * step), lat: Math.max(-70, Math.min(78, pinch.lat + (now.y - pinch.y) * step)) };
        view.lon = goal.current.lon; view.lat = goal.current.lat;
        wake.current();
        return;
      }
      if (press) {
        const dx = event.clientX - press.x, dy = event.clientY - press.y;
        if (Math.hypot(dx, dy) > 5) press.moved = true;
        if (press.moved) {
          handling = true;
          const step = perPixel();
          goal.current = { ...goal.current, lon: wrap(press.lon - dx * step), lat: Math.max(-70, Math.min(78, press.lat + dy * step)) };
          // A drag should stick to the finger, not ease after it.
          view.lon = goal.current.lon; view.lat = goal.current.lat;
          canvas.style.cursor = "grabbing";
          wake.current();
          return;
        }
      }
      if (event.pointerType === "mouse") setHover(hitAt(event));
    };
    const onUp = (event: PointerEvent) => {
      fingers.delete(event.pointerId);
      if (fingers.size === 0) { held = false; wake.current(); }
      if (pinch) {
        // The second finger lifting ends the pinch; whichever finger is left does not start a drag or a tap.
        if (fingers.size < 2) {
          if (dived() && goal.current.zoom < live.current.camera.zoom * 0.6) live.current.onZoomOut?.();
          if (fingers.size === 0) { pinch = null; handling = false; wake.current(); }
        }
        press = null;
        return;
      }
      const dragged = press?.moved; press = null;
      if (dragged) { canvas.style.cursor = "grab"; handling = false; wake.current(); return; }
      const hit = hitAt(event);
      if (hit) { live.current.onPick?.(hit); return; }
      const now = performance.now();
      if (now - lastTap.time < 320 && Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) < 30) {
        goal.current = { ...goal.current, zoom: Math.min(40, goal.current.zoom * 1.8) };
        wake.current();
        lastTap = { time: 0, x: 0, y: 0 };
      } else lastTap = { time: now, x: event.clientX, y: event.clientY };
    };
    // The browser cancels a touch when it takes it over itself, to scroll the page.
    const onCancel = (event: PointerEvent) => { fingers.delete(event.pointerId); press = null; if (fingers.size === 0) { pinch = null; handling = false; held = false; wake.current(); } };
    const onLeave = (event: PointerEvent) => { if (event.pointerType === "mouse") { fingers.delete(event.pointerId); press = null; held = false; handling = false; setHover(null); wake.current(); } };
    // With two fingers down the gesture is the map's: stop the browser from also scrolling the page with it,
    // which would cancel the pinch half way.
    const onTouchMove = (event: TouchEvent) => { if (event.touches.length >= 2) event.preventDefault(); };
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", onDown); canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp); canvas.addEventListener("pointercancel", onCancel); canvas.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame); window.removeEventListener("resize", onResize); canvas.removeEventListener("touchmove", onTouchMove);
      watcher.disconnect(); document.removeEventListener("visibilitychange", seen);
      canvas.removeEventListener("pointerdown", onDown); canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp); canvas.removeEventListener("pointercancel", onCancel); canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // pan-y: with one finger, a sideways swipe turns the map and an up-down swipe still scrolls the page.
  // Two fingers always belong to the map (pinch and move), since the browser's own pinch is switched off here.
  return <canvas ref={canvasRef} className={className} aria-hidden="true" style={{ touchAction: "pan-y" }} />;
}
