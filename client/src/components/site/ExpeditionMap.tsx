import { useEffect, useRef } from "react";

// The Expedition Map: an antique chart drawn in ink on a transparent canvas (the parchment behind it is
// CSS). One engine draws it two ways, as a flat sea chart or as an old globe, and both can fly from the
// whole world down to a single city. Coastlines are real (Natural Earth); no borders are drawn.
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
  projection: "flat" | "globe";
  camera: Camera;
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
const CAPS = '"IM Fell English SC", "IM Fell English", Georgia, serif';
const OCEANS: [string, number, number][] = [["Indian Ocean", 76, -24], ["Atlantic Ocean", -34, 22], ["Pacific Ocean", -142, 12], ["Pacific Ocean", 168, 14], ["Southern Ocean", 20, -52], ["Arabian Sea", 63, 14], ["Bay of Bengal", 89, 13]];

type Ring = { points: number[]; west: number; east: number; south: number; north: number };
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
  return { points, west, east, south, north };
});

const wrap = (degrees: number) => ((((degrees + 180) % 360) + 360) % 360) - 180;
const smooth = (from: number, to: number, value: number) => { const t = Math.min(1, Math.max(0, (value - from) / (to - from))); return t * t * (3 - 2 * t); };

export function ExpeditionMap({ projection, camera, marks, home, onHover, onPick, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // The drawing loop lives in one long effect; it reads the latest props from here.
  const live = useRef({ projection, camera, marks, home, onHover, onPick });
  const wake = useRef<() => void>(() => {});
  const goal = useRef<Camera>({ ...camera });

  live.current = { projection, camera, marks, home, onHover, onPick };
  // A new camera from the parent (a dive, a step back) replaces wherever the visitor had dragged to.
  useEffect(() => { goal.current = { ...camera }; wake.current(); }, [camera.lon, camera.lat, camera.zoom]);
  useEffect(() => { wake.current(); }, [projection, marks]);

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
      const target = goal.current;
      const seconds = Math.min((now - last) / 1000, 0.1); last = now;
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

      // Globe: rotate the point to face the viewer. Points on the far side are slid to the rim, so a
      // coastline that runs over the horizon still closes into a fillable shape.
      const onGlobe = (lon: number, lat: number, lift = 1) => {
        const l = (lon - view.lon) * RAD, p = lat * RAD, cosP = Math.cos(p);
        const x = cosP * Math.sin(l), z1 = cosP * Math.cos(l), y1 = Math.sin(p);
        const y = y1 * cosLat - z1 * sinLat, z = y1 * sinLat + z1 * cosLat;
        if (z >= 0) return { x: cx + x * radius * lift, y: cy - y * radius * lift, front: true };
        const reach = Math.hypot(x, y) || 1;
        return { x: cx + (x / reach) * radius, y: cy - (y / reach) * radius, front: false };
      };
      const point = (lon: number, lat: number) => globe ? onGlobe(lon, lat) : { x: cx + wrap(lon - view.lon) * scale * squeeze, y: cy - (lat - view.lat) * scale, front: true };

      // ---- Sea, graticule ----
      if (globe) {
        const shade = context.createRadialGradient(cx - radius * 0.35, cy - radius * 0.4, radius * 0.05, cx, cy, radius);
        shade.addColorStop(0, "rgba(246, 233, 198, 0.95)"); shade.addColorStop(0.75, "rgba(226, 204, 158, 0.95)"); shade.addColorStop(1, "rgba(190, 160, 112, 0.98)");
        context.beginPath(); context.arc(cx, cy, radius, 0, Math.PI * 2); context.fillStyle = shade; context.fill();
        context.save(); context.beginPath(); context.arc(cx, cy, radius, 0, Math.PI * 2); context.clip();
      }
      context.lineWidth = 0.7; context.strokeStyle = `rgba(${INK}, 0.13)`;
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
        for (const ring of land) {
          const pts = ring.points;
          let any = false; const projected: { x: number; y: number; front: boolean }[] = [];
          for (let i = 0; i < pts.length; i += 2) { const p = onGlobe(pts[i], pts[i + 1]); if (p.front) any = true; projected.push(p); }
          if (!any) continue;
          projected.forEach((p, i) => i ? fill.lineTo(p.x, p.y) : fill.moveTo(p.x, p.y)); fill.closePath();
          let pen = false;
          for (const p of projected) { if (!p.front) { pen = false; continue; } pen ? coast.lineTo(p.x, p.y) : coast.moveTo(p.x, p.y); pen = true; }
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
      // Engraved shoreline: soft bands of ink in the water that the land then covers on its own side.
      context.lineJoin = "round";
      for (const [size, alpha] of [[13, 0.05], [8.5, 0.07], [4.5, 0.09]] as const) { context.lineWidth = size; context.strokeStyle = `rgba(${INK}, ${alpha})`; context.stroke(coast); }
      context.fillStyle = "rgba(247, 236, 205, 0.9)"; context.fill(fill, "evenodd");
      context.lineWidth = 1.15; context.strokeStyle = `rgba(${INK}, 0.88)`; context.stroke(coast);

      // ---- Lettering in the seas ----
      const wide = 1 - smooth(1.6, 2.6, view.zoom);
      context.textAlign = "center"; context.textBaseline = "middle";
      context.font = `italic ${Math.max(13, Math.min(22, width / 62))}px ${SERIF}`;
      (context as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0.32em";
      context.fillStyle = `rgba(${INK}, ${0.5 * (0.35 + 0.65 * wide)})`;
      for (const [name, lon, lat] of OCEANS) { const p = point(lon, lat); if (p.front && p.x > 40 && p.x < width - 40) context.fillText(name.toUpperCase(), p.x, p.y); }
      (context as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";

      // ---- Routes: dashed red ink from home to every place visited ----
      const visited = allMarks.filter(mark => mark.kind === "x");
      if (wide > 0.02 && visited.length) {
        context.lineWidth = 1.5; context.setLineDash([5, 5]); context.lineCap = "butt";
        visited.forEach((mark, order) => {
          const share = Math.min(1, Math.max(0, intro * visited.length * 1.15 - order));
          if (share <= 0) return;
          const span = wrap(mark.lon - from[0]);
          const steps = 40, upTo = Math.round(steps * share);
          context.beginPath(); let pen = false;
          for (let step = 0; step <= upTo; step++) {
            const t = step / steps, hop = Math.sin(Math.PI * t);
            const lon = from[0] + span * t, lat = from[1] + (mark.lat - from[1]) * t;
            const reach = Math.min(1, Math.hypot(span, mark.lat - from[1]) / 70);
            const p = globe ? onGlobe(lon, lat, 1 + hop * 0.1 * reach) : { x: cx + wrap(lon - view.lon) * scale * squeeze, y: cy - (lat - view.lat) * scale - hop * reach * Math.min(height * 0.1, 70), front: true };
            if (!p.front) { pen = false; continue; }
            pen ? context.lineTo(p.x, p.y) : context.moveTo(p.x, p.y); pen = true;
          }
          context.strokeStyle = `rgba(${RED}, ${0.8 * wide})`; context.stroke();
        });
        context.setLineDash([]);
      }
      if (globe) {
        context.restore();
        context.lineWidth = 2.2; context.strokeStyle = `rgba(${INK}, 0.75)`; context.beginPath(); context.arc(cx, cy, radius, 0, Math.PI * 2); context.stroke();
        context.lineWidth = 1; context.strokeStyle = `rgba(${INK}, 0.4)`; context.beginPath(); context.arc(cx, cy, radius + 7, 0, Math.PI * 2); context.stroke();
      }

      // ---- Compass rose (flat chart, whole-world view) ----
      if (!globe && wide > 0.02) {
        // Top right, clear of the title block (bottom left) and the menu button.
        const size = Math.max(30, Math.min(58, width * 0.045)), rx = width - Math.max(size + 34, width * 0.075), ry = size + Math.max(120, height * 0.2);
        context.save(); context.globalAlpha = wide; context.translate(rx, ry);
        context.strokeStyle = `rgba(${INK}, 0.1)`; context.lineWidth = 0.7; context.beginPath();
        for (let i = 0; i < 32; i++) { const a = (i / 32) * Math.PI * 2; context.moveTo(0, 0); context.lineTo(Math.sin(a) * width * 1.4, -Math.cos(a) * width * 1.4); }
        context.stroke();
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2, long = i % 4 === 0 ? size : i % 2 === 0 ? size * 0.66 : size * 0.4, half = long * 0.14;
          for (const side of [-1, 1]) {
            context.beginPath(); context.moveTo(0, 0); context.lineTo(Math.sin(a) * long, -Math.cos(a) * long);
            context.lineTo(Math.sin(a + side * Math.PI / 2) * half, -Math.cos(a + side * Math.PI / 2) * half); context.closePath();
            context.fillStyle = side < 0 ? `rgba(${INK}, 0.82)` : "rgba(247, 236, 205, 0.95)"; context.fill();
            context.strokeStyle = `rgba(${INK}, 0.8)`; context.lineWidth = 0.7; context.stroke();
          }
        }
        context.strokeStyle = `rgba(${INK}, 0.6)`; context.lineWidth = 1; context.beginPath(); context.arc(0, 0, size * 1.12, 0, Math.PI * 2); context.stroke();
        context.fillStyle = `rgb(${INK})`; context.font = `${size * 0.36}px ${CAPS}`; context.textAlign = "center"; context.fillText("N", 0, -size * 1.34);
        context.restore();
      }

      // ---- Marks ----
      spots = [];
      const taken: [number, number, number, number][] = [];
      const fits = (box: [number, number, number, number]) => { if (taken.some(t => box[0] < t[2] && box[2] > t[0] && box[1] < t[3] && box[3] > t[1])) return false; taken.push(box); return true; };
      const cross = (x: number, y: number, arm: number, weight: number, alpha: number) => {
        context.lineCap = "round"; context.lineWidth = weight; context.strokeStyle = `rgba(${RED}, ${alpha})`;
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
        if (mark.kind === "x" || mark.kind === "city") {
          const arm = (mark.kind === "x" ? 6 : 5) * (hot ? 1.35 : 1) * (1.6 - 0.6 * shown);
          cross(p.x, p.y, arm, mark.kind === "x" ? 2.6 : 2.2, 0.95 * shown);
          if (mark.sealed) { context.lineWidth = 1.6; context.strokeStyle = `rgba(${RED}, 0.85)`; context.beginPath(); context.arc(p.x, p.y, 12, 0, Math.PI * 2); context.stroke(); context.setLineDash([2, 3]); context.beginPath(); context.arc(p.x, p.y, 15.5, 0, Math.PI * 2); context.stroke(); context.setLineDash([]); }
        } else if (mark.kind === "home") {
          context.fillStyle = `rgb(${INK})`; context.beginPath();
          for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, r = i % 2 ? 3.2 : 7.5; i ? context.lineTo(p.x + Math.sin(a) * r, p.y - Math.cos(a) * r) : context.moveTo(p.x + Math.sin(a) * r, p.y - Math.cos(a) * r); }
          context.closePath(); context.fill();
        } else if (mark.kind === "uncharted") {
          context.setLineDash([3, 3]); context.lineWidth = 1.3; context.strokeStyle = `rgba(${INK}, ${hot ? 0.9 : 0.6})`; context.beginPath(); context.arc(p.x, p.y, hot ? 12 : 10, 0, Math.PI * 2); context.stroke(); context.setLineDash([]);
          context.fillStyle = `rgba(${INK}, 0.8)`; context.font = `italic 15px ${SERIF}`; context.textAlign = "center"; context.fillText("?", p.x, p.y + 1); context.textAlign = "left";
        } else {
          // The chest is drawn small and faint on purpose. It is there to be found.
          context.globalAlpha = hot ? 1 : 0.5; context.fillStyle = `rgb(${INK})`; context.fillRect(p.x - 6, p.y - 2, 12, 7);
          context.beginPath(); context.arc(p.x, p.y - 2, 6, Math.PI, 0); context.fill(); context.fillStyle = "rgb(214, 170, 72)"; context.fillRect(p.x - 1.2, p.y - 1, 2.4, 3.4); context.globalAlpha = 1;
        }
        if (mark.label && mark.kind !== "chest" && (mark.kind !== "uncharted" || hot)) {
          const big = mark.kind === "city" || view.zoom > 2.4;
          context.font = `${big ? 17 : 13}px ${big ? SERIF : CAPS}`;
          const text = big ? mark.label : mark.label.toUpperCase();
          const w = context.measureText(text).width, x = p.x + 13, y = p.y;
          if (hot || fits([x - 2, y - 9, x + w + 2, y + 9])) {
            context.lineWidth = 3.5; context.strokeStyle = "rgba(247, 236, 205, 0.9)"; context.lineJoin = "round"; context.strokeText(text, x, y);
            context.fillStyle = `rgba(${INK}, ${shown})`; context.fillText(text, x, y);
          }
        }
      }
      return moving || (coarse.length > 0 && intro < 1);
    };

    const loop = (now: number) => { running = draw(now) && !still; if (running) frame = requestAnimationFrame(loop); };
    wake.current = () => { if (running) return; running = true; last = performance.now(); frame = requestAnimationFrame(loop); };
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
    const onDown = (event: PointerEvent) => { press = { x: event.clientX, y: event.clientY, lon: goal.current.lon, lat: goal.current.lat, moved: false }; };
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
      if (event.pointerType === "mouse") setHover(hitAt(event));
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
