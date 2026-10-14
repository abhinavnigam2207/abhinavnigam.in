// Runs the aurora (auroraGl.ts) off the page's main thread, on a canvas the page has handed over, so setting up
// WebGL and drawing every frame never hold up scrolling, taps or the page's own start.
import { paintAurora, type AuroraControl } from "./auroraGl";

type Message =
  | { type: "start"; canvas: OffscreenCanvas; width: number; height: number; still: boolean }
  | { type: "size"; width: number; height: number }
  | { type: "pointer"; x: number; y: number };

let control: AuroraControl | null = null;
self.onmessage = (event: MessageEvent<Message>) => {
  const message = event.data;
  if (message.type === "start") {
    control = paintAurora(message.canvas, message.still);
    control?.size(message.width, message.height);
    self.postMessage({ live: Boolean(control) });
  } else if (message.type === "size") control?.size(message.width, message.height);
  else control?.pointer(message.x, message.y);
};
