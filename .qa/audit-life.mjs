// QA audit for the bucket list page and every route of the site. Prints a pass/fail line per check and saves
// screenshots for review.  Usage: node .qa/audit-life.mjs <base-url> <reference-url> <out-dir>
// <reference-url> is a build to compare the unchanged top of the page against (e.g. the live site).
import { chromium } from "@playwright/test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const [base, reference, out] = process.argv.slice(2);
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`); };
const context = async (era, viewport = { width: 1440, height: 900 }, extra = {}) => {
  const phone = viewport.width < 760;
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: phone, hasTouch: phone, reducedMotion: "reduce", ...extra });
  if (era) await ctx.addInitScript(e => { try { localStorage.setItem("expedition-era", e); } catch {} }, era);
  return ctx;
};

// 1. Every route: status, a real page (not the 404), no console errors, in both eras.
{
  const ctx = await context("2026");
  const page = await ctx.newPage();
  await page.goto(base + "/bucket-list/", { waitUntil: "networkidle" });
  const journals = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="/bucket-list/"]')].map(a => a.getAttribute("href").replace(/\/?$/, "/")))]);
  await ctx.close();
  const cityRoutes = [];
  for (const journal of journals.filter(href => href.split("/").length === 4)) {
    const res = await fetch(base + journal); const html = await res.text();
    for (const m of html.matchAll(/href="(\/bucket-list\/[^"#]+\/[^"#]+)"/g)) cityRoutes.push(m[1].replace(/\/?$/, "/"));
  }
  const routes = [...new Set(["/", "/blog/", "/ideologies/", "/google-refer/", "/ask/", "/knowme/", "/bucket-list/", ...journals, ...cityRoutes])];
  let bad = [];
  for (const route of routes) {
    const res = await fetch(base + route);
    const html = await res.text();
    if (res.status !== 200 || /<title>[^<]*(Not found|404)/i.test(html)) bad.push(`${route} ${res.status}`);
  }
  check(`All ${routes.length} routes answer with their own page`, bad.length === 0, bad.join(", "));

  for (const era of ["1826", "2026"]) {
    const errors = [];
    const ctx2 = await context(era);
    const page2 = await ctx2.newPage();
    page2.on("pageerror", e => errors.push(`${page2.url()} ${e.message}`));
    page2.on("console", m => { if (m.type() === "error") errors.push(`${page2.url()} ${m.text()}`); });
    for (const route of routes) await page2.goto(base + route, { waitUntil: "load" });
    await ctx2.close();
    check(`No script errors on any route (${era})`, errors.length === 0, errors.slice(0, 3).join(" | "));
  }
}

// 2. Nothing wider than the screen, and nothing poking out of it, at phone, small-phone and tablet widths.
for (const width of [320, 360, 390, 768, 1024]) for (const era of ["1826", "2026"]) {
  const ctx = await context(era, { width, height: 800 });
  const page = await ctx.newPage();
  await page.goto(base + "/bucket-list/?chapter=adventures", { waitUntil: "networkidle" });
  const over = await page.evaluate(() => {
    const limit = document.documentElement.clientWidth;
    const hits = [];
    for (const el of document.querySelectorAll(".numbers *, .life *, .next *, .moments *, .choose *, .suggest *")) {
      const r = el.getBoundingClientRect();
      if (r.width && r.right > limit + 1 && !el.closest(".life-tabs") && getComputedStyle(el).position !== "absolute") hits.push(`${el.className || el.tagName} ${Math.round(r.right)}`);
    }
    return { page: document.documentElement.scrollWidth - limit, hits: hits.slice(0, 4) };
  });
  check(`No overflow at ${width}px (${era})`, over.page <= 0 && over.hits.length === 0, over.page > 0 ? `page ${over.page}px wider` : over.hits.join(", "));
  if (width === 320) for (const sel of [".numbers", ".life", ".next", ".suggest"]) { await page.locator(sel).scrollIntoViewIfNeeded(); await page.locator(sel).screenshot({ path: `${out}/w320-${era}-${sel.slice(1)}.png` }); }
  await ctx.close();
}

// 3. Keyboard only: every control in the new sections can be reached and shows where focus is.
{
  const ctx = await context("2026");
  const page = await ctx.newPage();
  await page.goto(base + "/bucket-list/", { waitUntil: "networkidle" });
  await page.evaluate(() => { const s = document.querySelector(".numbers"); s.setAttribute("tabindex", "-1"); s.focus(); });
  const seen = [], invisible = [];
  for (let i = 0; i < 160; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement; if (!el || el === document.body) return null;
      const c = getComputedStyle(el);
      const shows = (c.outlineStyle !== "none" && parseFloat(c.outlineWidth) > 0) || (c.boxShadow && c.boxShadow !== "none") || c.textDecorationLine.includes("underline");
      const inside = el.closest(".life, .next, .moments, .choose, .suggest");
      return { label: (el.getAttribute("aria-label") || el.textContent || el.getAttribute("name") || el.tagName).trim().slice(0, 40), shows, inside: Boolean(inside), section: inside?.getAttribute("aria-labelledby") };
    });
    if (!info || !info.inside) { if (seen.length) break; continue; }
    seen.push(info.section); if (!info.shows) invisible.push(info.label);
  }
  const sections = [...new Set(seen)];
  check("Keyboard reaches every section with controls", ["life-title", "next-title", "moments-title", "suggest-title"].every(id => sections.includes(id)), sections.join(" → "));
  check("Focus is always visible", invisible.length === 0, invisible.slice(0, 5).join(", "));
  await ctx.close();
}

// 4. Switching era with the life list open repaints every section in the new era.
{
  const ctx = await context("2026");
  const page = await ctx.newPage();
  await page.goto(base + "/bucket-list/?chapter=together", { waitUntil: "networkidle" });
  await page.locator('.map-tools .era-switch button[data-era="1826"]').click();
  await page.waitForTimeout(800);
  await page.locator(".life").scrollIntoViewIfNeeded();
  const fonts = await page.evaluate(() => [".numbers-grid dd", "#life-title", ".life-item h3", "#next-title", "#moments-title", "#choose-title", "#suggest-title"].map(s => getComputedStyle(document.querySelector(s)).fontFamily.includes("IM Fell")));
  const tabStill = await page.locator('[role="tab"][aria-selected="true"]').textContent();
  check("Era switch repaints all new sections", fonts.every(Boolean), fonts.map((f, i) => f ? "" : i).filter(String).join(","));
  check("Era switch keeps the open chapter", /Together/.test(tabStill ?? ""), tabStill ?? "");
  await page.locator(".life").screenshot({ path: `${out}/era-switched-life.png` });
  await ctx.close();
}

// 5. Links in the new sections open the right page, and Back returns to the list.
{
  const ctx = await context("2026");
  const page = await ctx.newPage();
  await page.goto(base + "/bucket-list/", { waitUntil: "networkidle" });
  const pairs = [[".places-grid a[href='/bucket-list/croatia']", "Croatia"], [".moments-grid a[href='/bucket-list/turkey/cappadocia']", "Cappadocia"]];
  let ok = true, detail = [];
  for (const [selector, title] of pairs) {
    const link = page.locator(selector);
    await link.scrollIntoViewIfNeeded();
    const y = await page.evaluate(() => window.scrollY);
    await link.click();
    await page.waitForLoadState("networkidle");
    const h1 = await page.locator("h1").textContent();
    if (!h1?.includes(title)) { ok = false; detail.push(`${selector} → "${h1}"`); }
    await page.goBack(); await page.waitForLoadState("networkidle"); await page.waitForTimeout(500);
    const back = await page.evaluate(() => window.scrollY);
    if (Math.abs(back - y) > 200) { ok = false; detail.push(`back to ${back}, was ${y}`); }
  }
  check("Places and Moments links open the right journal; Back returns to the same spot", ok, detail.join("; "));
  await ctx.close();
}

// 6. The form while sending, on a slow connection.
{
  const ctx = await context("2026");
  const page = await ctx.newPage();
  await page.route("**/bucket-list/", async route => { if (route.request().method() !== "POST") return route.continue(); await new Promise(r => setTimeout(r, 1500)); await route.fulfill({ status: 200 }); });
  await page.goto(base + "/bucket-list/", { waitUntil: "networkidle" });
  await page.getByLabel("Your suggestion").fill("Sleep under the stars");
  await page.getByRole("button", { name: /Send it/ }).click();
  const sending = await page.getByRole("button", { name: "Sending…" }).isDisabled();
  await page.locator(".suggest").screenshot({ path: `${out}/form-sending.png` });
  await page.locator(".suggest-done").waitFor();
  await page.locator(".suggest").screenshot({ path: `${out}/form-sent.png` });
  const emptyBlocked = await (async () => { await page.locator(".suggest-again").click(); await page.getByRole("button", { name: /Send it/ }).click(); return page.evaluate(() => !document.querySelector(".suggest-form").checkValidity()); })();
  check("Form: disabled while sending, then thanks; empty suggestion is refused", sending && emptyBlocked);
  await ctx.close();
}

// 7. Reloading part way down the page, or on a chapter, paints once: no flash, no jump.
for (const era of ["1826", "2026"]) {
  const ctx = await context(era, { width: 390, height: 800 }, { reducedMotion: "no-preference" });
  const page = await ctx.newPage();
  await page.goto(base + "/bucket-list/?chapter=food", { waitUntil: "networkidle" });
  await page.locator(".life").scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
  const client = await ctx.newCDPSession(page);
  const frames = [];
  client.on("Page.screencastFrame", async f => { frames.push(f.data); await client.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {}); });
  await client.send("Page.startScreencast", { format: "jpeg", quality: 60 });
  await page.reload({ waitUntil: "commit" }); await page.waitForTimeout(2500);
  await client.send("Page.stopScreencast");
  const distinct = [...new Set(frames.map(f => createHash("md5").update(f).digest("hex")))];
  frames.forEach((f, i) => { if (i < 6) writeFileSync(`${out}/reload-${era}-${i}.jpg`, Buffer.from(f, "base64")); });
  check(`Reload mid-page on a chapter paints cleanly (${era})`, distinct.length <= 2, `${distinct.length} distinct frames`);
  await ctx.close();
}

// 8. The two sections we kept look exactly as they do on the reference build.
if (reference) {
  for (const [size, viewport] of [["desk", { width: 1440, height: 900 }], ["phone", { width: 390, height: 800 }]]) for (const era of ["1826", "2026"]) {
    const shots = [];
    for (const site of [reference, base]) {
      const ctx = await context(era, viewport);
      const page = await ctx.newPage();
      await page.goto(site + "/bucket-list/", { waitUntil: "networkidle" }); await page.waitForTimeout(1200);
      const hero = await page.screenshot();
      await page.evaluate(() => { const t = document.querySelector(".tour"); window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY + (t.offsetHeight - window.innerHeight) * 0.4); });
      await page.waitForTimeout(900);
      const tour = await page.screenshot();
      shots.push([hero, tour]); await ctx.close();
    }
    const same = (a, b) => createHash("md5").update(a).digest("hex") === createHash("md5").update(b).digest("hex");
    writeFileSync(`${out}/kept-${size}-${era}-ref-hero.png`, shots[0][0]); writeFileSync(`${out}/kept-${size}-${era}-new-hero.png`, shots[1][0]);
    writeFileSync(`${out}/kept-${size}-${era}-ref-tour.png`, shots[0][1]); writeFileSync(`${out}/kept-${size}-${era}-new-tour.png`, shots[1][1]);
    check(`Map hero and passport unchanged (${size}, ${era})`, same(shots[0][0], shots[1][0]) && same(shots[0][1], shots[1][1]), `hero ${same(shots[0][0], shots[1][0]) ? "same" : "differs"}, passport ${same(shots[0][1], shots[1][1]) ? "same" : "differs"}`);
  }
}

await browser.close();
writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2));
console.log(`\n${results.filter(r => r.ok).length} of ${results.length} checks passed`);
