import { useEffect, useRef } from "react";
import { paintAurora, type AuroraControl } from "./auroraGl";

// Pale aurora drawn by a small WebGL fragment shader (auroraGl.ts): two soft curtains of colour drifting over a
// near-white sky. The curtains lean toward the pointer and a faint glow follows it. If it cannot run, nothing is
// drawn and the still CSS haze behind it stays visible.
export function Aurora() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // The picture is all soft gradients, so half resolution is enough and keeps it cheap. On phones the browser
    // bar slides away while scrolling, which changes the window height on every frame; re-sizing the canvas each
    // time made scrolling stutter, so only a change in width (rotation, window resize) counts.
    const measure = () => [Math.max(1, Math.round(window.innerWidth / 2)), Math.max(1, Math.round(window.screen.height / 2))] as const;
    let sizedForWidth = window.innerWidth;
    let control: AuroraControl | null = null;

    // Normally the drawing runs in a worker, so setting up WebGL (the heaviest thing on this page) and every
    // frame happen off the main thread. Browsers that cannot hand a canvas to a worker draw it here instead, once
    // the page is idle. Either way the aurora fades in over the haze when it is drawing.
    const start = () => {
      const [width, height] = measure();
      if (typeof canvas.transferControlToOffscreen === "function") {
        const worker = new Worker(new URL("./aurora.worker.ts", import.meta.url), { type: "module" });
        const offscreen = canvas.transferControlToOffscreen();
        worker.onmessage = (event: MessageEvent<{ live: boolean }>) => { if (event.data.live) canvas.classList.add("is-live"); else worker.terminate(); };
        worker.postMessage({ type: "start", canvas: offscreen, width, height, still }, [offscreen]);
        control = {
          size: (w, h) => worker.postMessage({ type: "size", width: w, height: h }),
          pointer: (x, y) => worker.postMessage({ type: "pointer", x, y }),
          stop: () => worker.terminate(),
        };
      } else {
        control = paintAurora(canvas, still);
        if (!control) return;
        control.size(width, height);
        canvas.classList.add("is-live");
      }
    };
    const idle = window.requestIdleCallback
      ? (() => { const id = window.requestIdleCallback(start, { timeout: 2500 }); return () => window.cancelIdleCallback(id); })()
      : (() => { const id = window.setTimeout(start, 1200); return () => window.clearTimeout(id); })();

    const onResize = () => {
      if (window.innerWidth === sizedForWidth) return;
      sizedForWidth = window.innerWidth;
      control?.size(...measure());
    };
    const onMove = (event: PointerEvent) => control?.pointer(event.clientX / window.innerWidth, 1 - event.clientY / window.innerHeight);
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      idle(); control?.stop();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="aurora" aria-hidden="true" />;
}
