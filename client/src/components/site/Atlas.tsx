import { useEffect, useRef, type MutableRefObject } from "react";
import { southAsiaMask, worldMask, type LandMask } from "@/content/landMask";

// A dotted globe and a dotted flat map drawn on one canvas, in the site's charcoal-on-white palette.
// The parent keeps a Scene in a ref and changes it as the page scrolls; the canvas eases towards it on
// every frame, so scrolling never waits on drawing. No map library and no tiles: land comes from two
// small bit grids (content/landMask.ts).

/** `ring` marks a pin that opens a page when picked. */
export type Pin = { lon: number; lat: number; lit?: boolean; active?: boolean; label?: string; ring?: boolean };
/** A pin under the pointer: its place in `scene.pins` and where it sits inside the canvas, in CSS pixels. */
export type PinHit = { index: number; x: number; y: number };
export type Arc = { from: [number, number]; to: [number, number]; progress: number };
export type Scene = {
  projection: "globe" | "flat";
  lon: number;
  lat: number;
  /** Flat map only: degrees of longitude that fit across the canvas. */
  span?: number;
  /** Globe only: degrees per second of idle spin. */
  spin?: number;
  pins?: Pin[];
  arcs?: Arc[];
};

const RAD = Math.PI / 180;
const INK = "43, 47, 49";
const ACCENT = "229, 72, 77";

type Dot = { lon: number; lat: number; x: number; y: number; z: number };

// Land cells as points. On the globe, rows near the poles are thinned so dots stay evenly spaced.
function dots(mask: LandMask, thin: boolean): Dot[] {
  const bytes = Uint8Array.from(atob(mask.bits), char => char.charCodeAt(0));
  const out: Dot[] = [];
  for (let row = 0; row < mask.rows; row++) {
    const lat = mask.north - (row + 0.5) * mask.step;
    const stride = thin ? Math.max(1, Math.round(1 / Math.cos(lat * RAD))) : 1;
    for (let col = 0; col < mask.cols; col += stride) {
      const index = row * mask.cols + col;
      if (!(bytes[index >> 3] & (1 << (index & 7)))) continue;
      const lon = mask.west + (col + 0.5) * mask.step;
      const cos = Math.cos(lat * RAD);
      out.push({ lon, lat, x: cos * Math.sin(lon * RAD), y: Math.sin(lat * RAD), z: cos * Math.cos(lon * RAD) });
    }
  }
  return out;
}

const ease = (from: number, to: number, rate: number) => from + (to - from) * rate;
// Shortest way round for longitudes.
const turn = (from: number, to: number) => from + ((((to - from) % 360) + 540) % 360) - 180;

type AtlasProps = {
  scene: MutableRefObject<Scene>;
  className?: string;
  /** Called when the pointer moves onto or off a pin. Passing it makes the pins interactive. */
  onHover?: (hit: PinHit | null) => void;
  /** Called when a pin is clicked or tapped; `touch` is true for a finger or pen. */
  onPick?: (hit: PinHit, touch: boolean) => void;
  /** Globe only: let the visitor drag it round. */
  drag?: boolean;
};

export function Atlas({ scene, className, onHover, onPick, drag }: AtlasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handlers = useRef({ onHover, onPick });
  handlers.current = { onHover, onPick };
  const interactive = Boolean(onHover || onPick || drag);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const globeDots = dots(worldMask, true);
    // The flat map leaves out Antarctica, which this projection stretches into a slab along the bottom.
    const worldDots = dots(worldMask, false).filter(dot => dot.lat > -58);
    const regionDots = dots(southAsiaMask, false);

    let width = 0, height = 0, frame = 0, visible = true, last = performance.now(), spun = 0;
    // Where each pin was last drawn (for hit-testing), how far the visitor has dragged the globe, and
    // whether the pointer is busy with it, which pauses the idle spin.
    let spots: ({ x: number; y: number } | null)[] = [];
    const dragged = { lon: 0, lat: 0 };
    let engaged = false, hovered = -1;
    const view = { lon: scene.current.lon, lat: scene.current.lat, span: scene.current.span ?? 360 };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth; height = canvas.clientHeight;
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (now: number) => {
      const target = scene.current;
      const seconds = Math.min((now - last) / 1000, 0.1); last = now;
      if (target.spin && !still && !engaged) spun += target.spin * seconds;
      const rate = still ? 1 : 1 - Math.pow(0.002, seconds);
      view.lon = ease(view.lon, turn(view.lon, target.lon + spun + dragged.lon), rate);
      view.lat = ease(view.lat, Math.max(-70, Math.min(70, target.lat + dragged.lat)), rate);
      view.span = ease(view.span, target.span ?? 360, rate);
      context.clearRect(0, 0, width, height);
      const cx = width / 2, cy = height / 2;
      let project: (lon: number, lat: number, lift?: number) => { x: number; y: number; depth: number } | null;

      if (target.projection === "globe") {
        const radius = Math.min(width, height) * 0.4;
        const sinLat = Math.sin(view.lat * RAD), cosLat = Math.cos(view.lat * RAD);
        const sinLon = Math.sin(view.lon * RAD), cosLon = Math.cos(view.lon * RAD);
        // Rotate so the view's centre faces the viewer, then drop the depth axis.
        const rotate = (x: number, y: number, z: number, lift = 1) => {
          const x1 = x * cosLon - z * sinLon, z1 = x * sinLon + z * cosLon;
          const y2 = y * cosLat - z1 * sinLat, z2 = y * sinLat + z1 * cosLat;
          return z2 < 0 ? null : { x: cx + x1 * radius * lift, y: cy - y2 * radius * lift, depth: z2 };
        };
        project = (lon, lat, lift) => {
          const cos = Math.cos(lat * RAD);
          return rotate(cos * Math.sin(lon * RAD), Math.sin(lat * RAD), cos * Math.cos(lon * RAD), lift);
        };
        const shade = context.createRadialGradient(cx - radius * 0.3, cy - radius * 0.35, radius * 0.1, cx, cy, radius);
        shade.addColorStop(0, "rgba(255, 255, 255, 1)"); shade.addColorStop(1, "rgba(238, 239, 240, 1)");
        context.beginPath(); context.arc(cx, cy, radius, 0, Math.PI * 2);
        context.fillStyle = shade; context.fill();
        context.strokeStyle = `rgba(${INK}, 0.1)`; context.lineWidth = 1; context.stroke();
        const size = Math.max(1.4, radius / 150);
        for (const dot of globeDots) {
          const point = rotate(dot.x, dot.y, dot.z);
          if (!point) continue;
          context.fillStyle = `rgba(${INK}, ${0.12 + point.depth * 0.5})`;
          context.fillRect(point.x - size / 2, point.y - size / 2, size, size);
        }
      } else {
        const scale = width / view.span;
        project = (lon, lat) => ({ x: cx + (lon - view.lon) * scale, y: cy - (lat - view.lat) * scale, depth: 1 });
        // Cross-fade from the coarse world grid to the fine regional grid as the map zooms in.
        const fine = Math.min(1, Math.max(0, (110 - view.span) / 50));
        // Inside the regional grid's box the coarse dots give way to the fine ones; outside it they stay,
        // dimmed, so the zoomed map still has surroundings.
        const east = southAsiaMask.west + southAsiaMask.cols * southAsiaMask.step;
        const south = southAsiaMask.north - southAsiaMask.rows * southAsiaMask.step;
        const inRegion = (dot: Dot) => dot.lon > southAsiaMask.west && dot.lon < east && dot.lat < southAsiaMask.north && dot.lat > south;
        const layers: [Dot[], number, number, ((dot: Dot) => boolean) | null][] = [
          [worldDots, worldMask.step, 1 - fine, inRegion],
          [worldDots, worldMask.step, 1 - fine * 0.6, dot => !inRegion(dot)],
          [regionDots, southAsiaMask.step, fine, null],
        ];
        for (const [list, step, alpha, keep] of layers) {
          if (alpha <= 0.01) continue;
          const size = Math.max(1.2, step * scale * 0.42);
          context.fillStyle = `rgba(${INK}, ${0.42 * alpha})`;
          for (const dot of list) {
            if (keep && !keep(dot)) continue;
            const x = cx + (dot.lon - view.lon) * scale, y = cy - (dot.lat - view.lat) * scale;
            if (x < -4 || x > width + 4 || y < -4 || y > height + 4) continue;
            context.fillRect(x - size / 2, y - size / 2, size, size);
          }
        }
      }

      for (const arc of target.arcs ?? []) {
        if (arc.progress <= 0) continue;
        const steps = 48, upTo = Math.round(steps * Math.min(1, arc.progress));
        // Short hops get a low arc, long hauls a high one.
        const reach = Math.min(1, Math.hypot(turn(arc.from[0], arc.to[0]) - arc.from[0], arc.to[1] - arc.from[1]) / 70);
        context.beginPath();
        let drawing = false;
        for (let step = 0; step <= upTo; step++) {
          const t = step / steps;
          const lon = arc.from[0] + (turn(arc.from[0], arc.to[0]) - arc.from[0]) * t;
          const lat = arc.from[1] + (arc.to[1] - arc.from[1]) * t;
          const hop = Math.sin(Math.PI * t);
          const point = target.projection === "globe" ? project(lon, lat, 1 + hop * 0.16) : project(lon, lat);
          if (!point) { drawing = false; continue; }
          const y = target.projection === "globe" ? point.y : point.y - hop * reach * Math.min(height * 0.14, 80);
          if (drawing) context.lineTo(point.x, y); else context.moveTo(point.x, y);
          drawing = true;
        }
        context.strokeStyle = `rgba(${ACCENT}, 0.85)`; context.lineWidth = 1.6; context.stroke();
      }

      context.font = "500 13px Inter, system-ui, sans-serif"; context.textBaseline = "middle";
      const pulse = still ? 0.5 : (now / 1400) % 1;
      spots = [];
      for (const [index, pin] of (target.pins ?? []).entries()) {
        const point = project(pin.lon, pin.lat);
        spots.push(point && { x: point.x, y: point.y });
        if (!point) continue;
        if (pin.ring || index === hovered) {
          context.beginPath(); context.arc(point.x, point.y, index === hovered ? 11 : 8.5, 0, Math.PI * 2);
          context.strokeStyle = `rgba(${ACCENT}, ${index === hovered ? 0.9 : 0.55})`; context.lineWidth = 1.5; context.stroke();
        }
        if (pin.active) {
          context.beginPath(); context.arc(point.x, point.y, 6 + pulse * 16, 0, Math.PI * 2);
          context.strokeStyle = `rgba(${ACCENT}, ${0.55 * (1 - pulse)})`; context.lineWidth = 1.5; context.stroke();
        }
        context.beginPath(); context.arc(point.x, point.y, pin.active ? 6 : 4, 0, Math.PI * 2);
        if (pin.lit || pin.active) { context.fillStyle = `rgb(${ACCENT})`; context.fill(); context.strokeStyle = "#fff"; context.lineWidth = 1.5; context.stroke(); }
        else { context.fillStyle = "#fff"; context.fill(); context.strokeStyle = `rgba(${INK}, 0.45)`; context.lineWidth = 1.2; context.stroke(); }
        if (pin.label && (pin.lit || pin.active)) { context.fillStyle = `rgb(${INK})`; context.fillText(pin.label, point.x + 11, point.y); }
      }
    };

    const loop = (now: number) => { draw(now); if (visible && !still) frame = requestAnimationFrame(loop); };
    const start = () => { cancelAnimationFrame(frame); last = performance.now(); frame = requestAnimationFrame(loop); };
    resize(); start();
    const onResize = () => { resize(); if (still || !visible) draw(performance.now()); else start(); };
    window.addEventListener("resize", onResize);
    // Draw only while on screen. With reduced motion there is no loop, so redraw when the page scrolls.
    const watcher = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) start(); });
    watcher.observe(canvas);
    const onScroll = () => { if (still && visible) draw(performance.now()); };

    // Pointer: find the pin under it, and on a draggable globe turn drags into rotation.
    const hitAt = (event: PointerEvent): PinHit | null => {
      const box = canvas.getBoundingClientRect();
      const x = event.clientX - box.left, y = event.clientY - box.top;
      const reach = event.pointerType === "mouse" ? 14 : 24;
      let best: PinHit | null = null, nearest = reach;
      spots.forEach((spot, index) => {
        if (!spot) return;
        const distance = Math.hypot(spot.x - x, spot.y - y);
        if (distance < nearest) { nearest = distance; best = { index, x: spot.x, y: spot.y }; }
      });
      return best;
    };
    let press: { x: number; y: number; lon: number; lat: number; moved: boolean } | null = null;
    const setHover = (hit: PinHit | null) => {
      const index = hit?.index ?? -1;
      if (index === hovered) return;
      hovered = index;
      canvas.style.cursor = hit ? "pointer" : drag ? "grab" : "";
      handlers.current.onHover?.(hit);
      if (still) draw(performance.now());
    };
    const onMove = (event: PointerEvent) => {
      if (press && drag && scene.current.projection === "globe") {
        const dx = event.clientX - press.x, dy = event.clientY - press.y;
        if (Math.hypot(dx, dy) > 5) press.moved = true;
        if (press.moved) {
          const perPixel = 150 / Math.max(200, Math.min(width, height));
          dragged.lon = press.lon - dx * perPixel; dragged.lat = press.lat + dy * perPixel;
          canvas.style.cursor = "grabbing";
          if (still) draw(performance.now());
          return;
        }
      }
      if (event.pointerType === "mouse") setHover(hitAt(event));
    };
    const onDown = (event: PointerEvent) => { engaged = true; press = { x: event.clientX, y: event.clientY, lon: dragged.lon, lat: dragged.lat, moved: false }; };
    const onUp = (event: PointerEvent) => {
      const wasDrag = press?.moved;
      press = null;
      if (event.pointerType !== "mouse") engaged = false;
      if (wasDrag) { canvas.style.cursor = drag ? "grab" : ""; return; }
      const hit = hitAt(event);
      if (hit) handlers.current.onPick?.(hit, event.pointerType !== "mouse");
      else if (event.pointerType !== "mouse") handlers.current.onHover?.(null);
    };
    const onEnter = () => { engaged = true; };
    const onLeave = () => { engaged = false; press = null; setHover(null); };
    if (interactive) {
      if (drag) canvas.style.cursor = "grab";
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointerenter", onEnter);
      canvas.addEventListener("pointerleave", onLeave);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame); watcher.disconnect(); window.removeEventListener("resize", onResize); window.removeEventListener("scroll", onScroll);
      canvas.removeEventListener("pointermove", onMove); canvas.removeEventListener("pointerdown", onDown); canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerenter", onEnter); canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [scene, interactive, drag]);

  // touch-action: a draggable globe takes horizontal swipes and leaves vertical ones to scroll the page.
  return <canvas ref={canvasRef} className={className} aria-hidden="true" style={drag ? { touchAction: "pan-y" } : undefined} />;
}
