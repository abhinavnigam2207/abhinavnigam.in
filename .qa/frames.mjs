// Records every frame the browser paints while a page reloads, to see what a visitor sees.
// Usage: node frames.mjs <url> <era> <outDir> [width height]
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";

const [url, era, out, w = "390", h = "800"] = process.argv.slice(2);
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, isMobile: +w < 700, hasTouch: +w < 700 });
const page = await context.newPage();
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(e => { localStorage.setItem("expedition-era", e); }, era);
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(5500);

const client = await context.newCDPSession(page);
const frames = [];
client.on("Page.screencastFrame", async frame => {
  frames.push({ time: frame.metadata.timestamp, data: frame.data });
  await client.send("Page.screencastFrameAck", { sessionId: frame.sessionId }).catch(() => {});
});
await client.send("Page.startScreencast", { format: "jpeg", quality: 70, everyNthFrame: 1 });
const started = Date.now() / 1000;
await page.reload({ waitUntil: "commit" });
await page.waitForTimeout(3200);
await client.send("Page.stopScreencast");

let last = "", kept = 0;
const first = frames[0]?.time ?? started;
for (const frame of frames) {
  const hash = createHash("md5").update(frame.data).digest("hex");
  if (hash === last) continue;
  last = hash; kept += 1;
  const ms = Math.round((frame.time - first) * 1000);
  writeFileSync(`${out}/f${String(kept).padStart(2, "0")}_${String(ms).padStart(4, "0")}ms.jpg`, Buffer.from(frame.data, "base64"));
}
console.log(`${frames.length} frames, ${kept} distinct, saved to ${out}`);
await browser.close();
