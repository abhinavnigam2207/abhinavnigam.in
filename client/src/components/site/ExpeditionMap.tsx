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
  /** Let the globe turn slowly on its own until the visitor touches it. */
  spin?: boolean;
  camera: Camera;
  /** Change this number to send the map back to `camera` even when `camera` itself has not changed (after a drag). */
  recenter?: number;
  marks: Mark[];
  /** Red routes are drawn from this point to every "x" mark. */
  home: [number, number];
  onHover?: (hit: MarkHit | null) => void;
  onPick?: (hit: MarkHit) => void;
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

export function ExpeditionMap({ era, projection, spin, camera, recenter, marks, home, onHover, onPick, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // The drawing loop lives in one long effect; it reads the latest props from here.
  const live = useRef({ era, projection, spin, camera, marks, home, onHover, onPick });
  const wake = useRef<() => void>(() => {});
  const paintNow = useRef<() => void>(() => {});
  const goal = useRef<Camera>({ ...camera });

  live.current = { era, projection, spin, camera, marks, home, onHover, onPick };
  // A new camera from the parent (a dive, a step back) replaces wherever the visitor had dragged to.
  useEffect(() => { goal.current = { ...camera }; wake.current(); }, [camera.lon, camera.lat, camera.zoom, recenter]);
  useEffect(() => { wake.current(); }, [projection, spin, marks]);
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
    let coarse: Ring[] = [], fine: Ring[] | null = null, fineAsked = false;
    let spots: { id: string; x: number; y: number }[] = [];
    let hovered = "";
    // Set once the visitor uses the map; the idle spin stops for good.
    let touched = false;
    let dots: { pattern: CanvasPattern; ratio: number } | null = null;
    // Turned points of the ring being drawn, reused from frame to frame.
    let turned = new Float32Array(3 * 4096);
    // The opening shot: routes draw themselves out from home, one after another.
    // It starts once the coastlines have arrived, so the routes are drawn onto a map, not onto blank paper.
    let opened = Infinity;
    const INTRO = still ? 0 : 4200;
    const loadCoast = (file: string) => fetch(`/travel/${file}`).then(response => response.json()).then((data: number[][]) => toRings(data));
    loadCoast("coast-110.json").then(rings => { coarse = rings; opened = performance.now(); wake.current(); }).catch(() => {});

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth; height = canvas.clientHeight;
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (now: number): boolean => {
      const { projection: mode, marks: allMarks, home: from } = live.current;
      const modern = live.current.era === "2026";
      const ink = modern ? "43, 47, 49" : INK, red = modern ? "229, 72, 77" : RED;
      const serif = modern ? SANS : SERIF, caps = modern ? SANS : CAPS;
      const paper = modern ? "rgba(255, 255, 255, 0.92)" : "rgba(247, 236, 205, 0.9)";
      const seconds = Math.min((now - last) / 1000, 0.1); last = now;
      const spinning = Boolean(live.current.spin) && mode === "globe" && !touched && !still;
      if (spinning) goal.current = { ...goal.current, lon: wrap(goal.current.lon + 5 * seconds) };
      const target = goal.current;
      const rate = still ? 1 : 1 - Math.pow(0.0015, seconds);
      view.lon += wrap(target.lon - view.lon) * rate;
      view.lat += (target.lat - view.lat) * rate;
      view.zoom += (target.zoom - view.zoom) * rate;
      const moving = Math.abs(wrap(target.lon - view.lon)) > 0.01 || Math.abs(target.lat - view.lat) > 0.01 || Math.abs(target.zoom - view.zoom) > 0.002;
      const intro = !coarse.length ? 0 : INTRO ? Math.min(1, (now - opened) / INTRO) : 1;

      // Finer coastlines arrive once, the first time the map is zoomed into.
      if (view.zoom > 2.4 && !fineAsked) {
        fineAsked = true;
        loadCoast("coast-50.json").then(rings => { fine = rings; wake.current(); }).catch(() => {});
      }
      const land = view.zoom > 2.4 && fine ? fine : coarse;

      context.clearRect(0, 0, width, height);
      const cx = width / 2, cy = height / 2;
      const globe = mode === "globe";
      const radius = Math.min(width, height) * 0.43 * view.zoom;
      const scale = Math.max(width / 360, height / 150) * view.zoom;
      // A flat chart of the whole world keeps its familiar proportions; zoomed in, east-west distances are
      // narrowed by the latitude so countries keep their true shape.
      const squeeze = 1 + (Math.cos(view.lat * RAD) - 1) * smooth(1.2, 3, view.zoom);
      const sinLat = Math.sin(view.lat * RAD), cosLat = Math.cos(view.lat * RAD);

      // Globe: rotate the point to face the viewer. `u`, `v`, `z` are its position on the unit sphere as
      // seen from the front (z < 0 is the far side). Points on the far side are also given a place on the
      // rim, used when a coastline runs over the horizon.
      const onGlobe = (lon: number, lat: number, lift = 1) => {
        const l = (lon - view.lon) * RAD, p = lat * RAD, cosP = Math.cos(p);
        const x = cosP * Math.sin(l), z1 = cosP * Math.cos(l), y1 = Math.sin(p);
        const y = y1 * cosLat - z1 * sinLat, z = y1 * sinLat + z1 * cosLat;
        if (z >= 0) return { x: cx + x * radius * lift, y: cy - y * radius * lift, front: true, u: x, v: y, z };
        const reach = Math.hypot(x, y) || 1;
        return { x: cx + (x / reach) * radius, y: cy - (y / reach) * radius, front: false, u: x, v: y, z };
      };
      const point = (lon: number, lat: number) => globe ? onGlobe(lon, lat) : { x: cx + wrap(lon - view.lon) * scale * squeeze, y: cy - (lat - view.lat) * scale, front: true };

      // ---- Sea, graticule ----
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

      // ---- Land ----
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
        for (const [size, alpha] of [[13, 0.05], [8.5, 0.07], [4.5, 0.09]] as const) { context.lineWidth = size; context.strokeStyle = `rgba(${ink}, ${alpha})`; context.stroke(coast); }
        context.fillStyle = paper; context.fill(fill, "evenodd");
        context.lineWidth = 1.15; context.strokeStyle = `rgba(${ink}, 0.88)`; context.stroke(coast);
      }

      // ---- Lettering in the seas ----
      const wide = 1 - smooth(1.6, 2.6, view.zoom);
      context.textAlign = "center"; context.textBaseline = "middle";
      context.font = modern ? `500 ${Math.max(10, Math.min(12, width / 110))}px ${SANS}` : `italic ${Math.max(13, Math.min(22, width / 62))}px ${serif}`;
      (context as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0.32em";
      context.fillStyle = `rgba(${ink}, ${(modern ? 0.3 : 0.5) * (0.35 + 0.65 * wide)})`;
      for (const [name, lon, lat] of OCEANS) { const p = point(lon, lat); if (p.front && p.x > 40 && p.x < width - 40) context.fillText(name.toUpperCase(), p.x, p.y); }
      (context as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";

      // ---- Routes: dashed red ink from home to every place visited ----
      const visited = allMarks.filter(mark => mark.kind === "x");
      if (wide > 0.02 && visited.length) {
        // 1826: dashes of red ink. 2026: a clean flight path with the aircraft at its tip while it is drawn.
        context.lineWidth = modern ? 1.4 : 1.5; context.setLineDash(modern ? [] : [5, 5]); context.lineCap = modern ? "round" : "butt";
        visited.forEach((mark, order) => {
          const share = Math.min(1, Math.max(0, intro * visited.length * 1.15 - order));
          if (share <= 0) return;
          const span = wrap(mark.lon - from[0]);
          const steps = 40, upTo = Math.round(steps * share);
          context.beginPath(); let pen = false; let tip: { x: number; y: number } | null = null;
          for (let step = 0; step <= upTo; step++) {
            const t = step / steps, hop = Math.sin(Math.PI * t);
            const lon = from[0] + span * t, lat = from[1] + (mark.lat - from[1]) * t;
            const reach = Math.min(1, Math.hypot(span, mark.lat - from[1]) / 70);
            const p = globe ? onGlobe(lon, lat, 1 + hop * 0.1 * reach) : { x: cx + wrap(lon - view.lon) * scale * squeeze, y: cy - (lat - view.lat) * scale - hop * reach * Math.min(height * 0.1, 70), front: true };
            if (!p.front) { pen = false; continue; }
            pen ? context.lineTo(p.x, p.y) : context.moveTo(p.x, p.y); pen = true; tip = p;
          }
          context.strokeStyle = `rgba(${red}, ${(modern ? 0.55 : 0.8) * wide})`; context.stroke();
          if (modern && tip && share < 1) { context.fillStyle = `rgb(${red})`; context.beginPath(); context.arc(tip.x, tip.y, 3, 0, Math.PI * 2); context.fill(); }
        });
        context.setLineDash([]);
      }
      if (globe) {
        context.restore();
        if (modern) { context.lineWidth = 1; context.strokeStyle = `rgba(${ink}, 0.12)`; context.beginPath(); context.arc(cx, cy, radius, 0, Math.PI * 2); context.stroke(); }
        else {
          context.lineWidth = 2.2; context.strokeStyle = `rgba(${ink}, 0.75)`; context.beginPath(); context.arc(cx, cy, radius, 0, Math.PI * 2); context.stroke();
          context.lineWidth = 1; context.strokeStyle = `rgba(${ink}, 0.4)`; context.beginPath(); context.arc(cx, cy, radius + 7, 0, Math.PI * 2); context.stroke();
        }
      }

      // ---- Compass rose (flat chart, whole-world view) ----
      if (!modern && !globe && wide > 0.02) {
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
      }

      // ---- Marks ----
      spots = [];
      const taken: [number, number, number, number][] = [];
      const fits = (box: [number, number, number, number]) => { if (taken.some(t => box[0] < t[2] && box[2] > t[0] && box[1] < t[3] && box[3] > t[1])) return false; taken.push(box); return true; };
      const cross = (x: number, y: number, arm: number, weight: number, alpha: number) => {
        context.lineCap = "round"; context.lineWidth = weight; context.strokeStyle = `rgba(${red}, ${alpha})`;
        context.beginPath(); context.moveTo(x - arm, y - arm * 0.9); context.lineTo(x + arm, y + arm); context.moveTo(x + arm * 0.95, y - arm); context.lineTo(x - arm, y + arm * 0.92); context.stroke();
      };
      context.textAlign = "left";
      // Hovered and sealed marks claim their label space first.
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
          (context as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = modern && !big ? "0.06em" : "0px";
          const text = big ? mark.label : mark.label.toUpperCase();
          const w = context.measureText(text).width, x = p.x + 13, y = p.y;
          if (hot || fits([x - 2, y - 9, x + w + 2, y + 9])) {
            context.lineWidth = 3.5; context.strokeStyle = paper; context.lineJoin = "round"; context.strokeText(text, x, y);
            context.fillStyle = `rgba(${ink}, ${shown})`; context.fillText(text, x, y);
          }
        }
      }
      (context as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
      return moving || spinning || (coarse.length > 0 && intro < 1);
    };

    const loop = (now: number) => { running = draw(now) && !still; if (running) frame = requestAnimationFrame(loop); };
    wake.current = () => { if (running) return; running = true; last = performance.now(); frame = requestAnimationFrame(loop); };
    paintNow.current = () => { draw(performance.now()); };
    resize(); wake.current();
    const onResize = () => { resize(); running = false; cancelAnimationFrame(frame); wake.current(); };
    window.addEventListener("resize", onResize);
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
    let press: { x: number; y: number; lon: number; lat: number; moved: boolean } | null = null;
    const onDown = (event: PointerEvent) => { touched = true; press = { x: event.clientX, y: event.clientY, lon: goal.current.lon, lat: goal.current.lat, moved: false }; };
    const onMove = (event: PointerEvent) => {
      if (press) {
        const dx = event.clientX - press.x, dy = event.clientY - press.y;
        if (Math.hypot(dx, dy) > 5) press.moved = true;
        if (press.moved) {
          const perPixel = live.current.projection === "globe"
            ? 1 / (Math.min(width, height) * 0.43 * view.zoom * RAD)
            : 1 / (Math.max(width / 360, height / 150) * view.zoom);
          goal.current = { ...goal.current, lon: wrap(press.lon - dx * perPixel), lat: Math.max(-70, Math.min(78, press.lat + dy * perPixel)) };
          // A drag should stick to the finger, not ease after it.
          view.lon = goal.current.lon; view.lat = goal.current.lat;
          canvas.style.cursor = "grabbing";
          wake.current();
          return;
        }
      }
      if (event.pointerType === "mouse") { touched = true; setHover(hitAt(event)); }
    };
    const onUp = (event: PointerEvent) => {
      const dragged = press?.moved; press = null;
      if (dragged) { canvas.style.cursor = "grab"; return; }
      const hit = hitAt(event);
      if (hit) live.current.onPick?.(hit);
    };
    const onLeave = () => { press = null; setHover(null); };
    canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", onDown); canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp); canvas.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame); window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointerdown", onDown); canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp); canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // pan-y: a sideways swipe turns the map, an up-down swipe still scrolls the page.
  return <canvas ref={canvasRef} className={className} aria-hidden="true" style={{ touchAction: "pan-y" }} />;
}
