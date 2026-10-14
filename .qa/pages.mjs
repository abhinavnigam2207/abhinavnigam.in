// Full-page screenshots of every page of the site, at phone and desktop size, with motion switched off,
// so two builds can be compared pixel for pixel (python .qa/sheet.py diff <before> <after>).
// Usage: node .qa/pages.mjs <base-url> <out-dir>
import { chromium } from "@playwright/test";
import { mkdirSync, rmSync } from "node:fs";

const [base, out] = process.argv.slice(2);
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
const pages = ["/", "/blog/", "/ideologies/", "/google-refer/", "/ask/", "/knowme/", "/bucket-list/japan/", "/bucket-list/japan/osaka/"];
const browser = await chromium.launch();
for (const [size, viewport] of [["phone", { width: 390, height: 800 }], ["desk", { width: 1440, height: 900 }]]) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: size === "phone", hasTouch: size === "phone", reducedMotion: "reduce" });
  await context.addInitScript(() => { try { localStorage.setItem("expedition-era", "2026"); } catch {} });
  const page = await context.newPage();
  for (const path of pages) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    // Load every lazy image, then wait for fonts.
    await page.evaluate(async () => { for (const img of document.images) img.loading = "eager"; await Promise.all([...document.images].map(img => img.decode().catch(() => {}))); await document.fonts.ready; });
    await page.waitForTimeout(600);
    const name = path === "/" ? "home" : path.replaceAll("/", "-").replace(/^-|-$/g, "");
    await page.screenshot({ path: `${out}/${size}-${name}.png`, fullPage: true });
  }
  await context.close();
}
await browser.close();
console.log("saved to", out);
