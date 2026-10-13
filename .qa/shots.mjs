// Screenshots of every travel state, in both eras, at phone and desktop size.
// Motion is switched off (prefers-reduced-motion), so the same code always produces the same pixels:
// run it before and after a change and compare the two folders.
// Usage: node .qa/shots.mjs <base-url> <out-dir>
import { chromium } from "@playwright/test";
import { mkdirSync, rmSync } from "node:fs";

const [base, out] = process.argv.slice(2);
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const sizes = { phone: { width: 390, height: 800 }, desk: { width: 1440, height: 900 } };

for (const [sizeName, viewport] of Object.entries(sizes)) {
  for (const era of ["1826", "2026"]) {
    const phone = sizeName === "phone";
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: phone, hasTouch: phone, reducedMotion: "reduce" });
    await context.addInitScript(value => { try { localStorage.setItem("expedition-era", value); localStorage.setItem("expedition-stamps", JSON.stringify(["JPN", "THA"])); } catch {} }, era);
    const page = await context.newPage();
    const shot = async name => { await page.waitForTimeout(700); await page.screenshot({ path: `${out}/${sizeName}-${era}-${name}.png` }); };
    const open = async path => { await page.goto(base + path, { waitUntil: "networkidle" }); await page.waitForTimeout(900); };

    await open("/bucket-list/"); await shot("1-world");
    await open("/bucket-list/?view=globe"); await shot("2-world-globe");
    await open("/bucket-list/?view=flat"); await shot("3-world-flat");
    await open("/bucket-list/#jpn"); await page.waitForTimeout(1500); await shot("4-japan");
    await open("/bucket-list/?view=globe#jpn"); await page.waitForTimeout(1500); await shot("5-japan-globe");
    await open("/bucket-list/#ind"); await page.waitForTimeout(1500); await shot("6-india");
    await open("/bucket-list/"); await page.locator(".map-tally").click(); await shot("7-stamp-book"); await page.keyboard.press("Escape");
    await open("/bucket-list/");
    await page.evaluate(() => { const t = document.querySelector(".tour"); window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY + (t.offsetHeight - window.innerHeight) * 0.55); });
    await shot("8-passport-scroll");
    await page.evaluate(() => document.querySelector(".ledger").scrollIntoView()); await shot("9-ledger");
    await open("/bucket-list/japan/"); await shot("10-journal-japan");
    await page.evaluate(() => document.querySelector(".city-cards").scrollIntoView()); await shot("11-journal-japan-cities");
    await open("/bucket-list/japan/osaka/"); await shot("12-journal-osaka");
    await page.evaluate(() => document.querySelector(".story-photos").scrollIntoView()); await shot("13-journal-osaka-photos");
    await context.close();
  }
}
// The door, as a first-time visitor meets it.
for (const [sizeName, viewport] of Object.entries(sizes)) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(base + "/bucket-list/", { waitUntil: "networkidle" }); await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}/${sizeName}-door.png` });
  await context.close();
}
await browser.close();
console.log("saved to", out);
