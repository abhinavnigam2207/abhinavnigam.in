import { expect, test, type Page } from "@playwright/test";

const MAP = "/bucket-list/";
const eras = ["1826", "2026"] as const;

/** A returning visitor: an era already chosen, and (optionally) stamps already collected. */
async function returning(page: Page, era: string, stamps: string[] = []) {
  await page.addInitScript(([chosen, collected]) => {
    // Only when nothing is saved yet, so a choice made during the test survives a reload.
    if (!localStorage.getItem("expedition-era")) localStorage.setItem("expedition-era", chosen as string);
    if (!localStorage.getItem("expedition-stamps")) localStorage.setItem("expedition-stamps", JSON.stringify(collected));
  }, [era, stamps] as const);
}
const eraOf = (page: Page) => page.evaluate(() => document.documentElement.dataset.era);
const isPhone = (page: Page) => (page.viewportSize()?.width ?? 0) < 760;

test.describe("the door", () => {
  test("a first visit is asked to choose, and the choice is kept", async ({ page }) => {
    await page.goto(MAP);
    const door = page.getByRole("dialog", { name: "Choose how to read this journal" });
    await expect(door).toBeVisible();
    // Neither half is ringed as if already picked; the keyboard reaches the first one with a single Tab.
    await expect(door).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(door.locator(".era-half.is-1826")).toBeFocused();
    await door.locator(".era-half.is-1826").click();
    await expect(door).toBeHidden();
    expect(await eraOf(page)).toBe("1826");
    await page.reload();
    await expect(page.locator(".era-door")).toHaveCount(0);
    expect(await eraOf(page)).toBe("1826");
  });

  test("a link can name the era", async ({ page }) => {
    await page.goto(`${MAP}?era=1826`);
    expect(await eraOf(page)).toBe("1826");
    await expect(page.locator(".era-door")).toHaveCount(0);
  });
});

// The pre-built page is what a visitor sees until the app's script has run. With that script held back,
// the page must already be in the chosen era, in every word, with the travel stylesheet applied.
test.describe("before the app's script runs", () => {
  for (const era of eras) {
    test(`the map page already reads as ${era}`, async ({ page }) => {
      await returning(page, era);
      await page.route("**/assets/*.js", route => route.abort());
      await page.goto(MAP);
      expect(await eraOf(page)).toBe(era);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator(".era-door")).toHaveCount(0);
      const old = era === "1826";
      await expect(page.locator(".tour-title .only-1826")).toBeVisible({ visible: old });
      await expect(page.locator(".tour-title .only-2026")).toBeVisible({ visible: !old });
      // Controls that depend on the visitor are not shown in their pre-built defaults.
      await expect(page.locator(".map-tools")).toBeHidden();
      await expect(page.locator(".map-tally")).toBeHidden();
      // The travel stylesheet is in force: the map section fills the screen.
      const box = await page.locator(".expedition").boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(560);
      const font = await page.locator("h1").evaluate(node => getComputedStyle(node).fontFamily);
      expect(font.includes("IM Fell")).toBe(old);
    });

    test(`a journal page already reads as ${era}`, async ({ page }) => {
      await returning(page, era);
      await page.route("**/assets/*.js", route => route.abort());
      await page.goto("/bucket-list/japan/osaka/");
      expect(await eraOf(page)).toBe(era);
      await expect(page.locator("h1")).toHaveText("Osaka");
      const font = await page.locator("h1").evaluate(node => getComputedStyle(node).fontFamily);
      expect(font.includes("IM Fell")).toBe(era === "1826");
      // The era is chosen on the map page only.
      await expect(page.locator(".era-switch")).toHaveCount(0);
    });
  }
});

test.describe("the map", () => {
  test("is not drawn until its coastline has arrived, then appears whole", async ({ page }) => {
    await returning(page, "1826");
    let release = () => {};
    const held = new Promise<void>(resolve => { release = resolve; });
    await page.route("**/travel/coast-110.json", async route => { await held; await route.continue(); });
    await page.goto(MAP);
    const canvas = page.locator(".expedition-canvas");
    await expect(canvas).toHaveCSS("opacity", "0");
    const blank = await canvas.evaluate((node: HTMLCanvasElement) => {
      const pixels = node.getContext("2d")!.getImageData(0, 0, node.width, node.height).data;
      return pixels.every(value => value === 0);
    });
    expect(blank).toBe(true);
    release();
    await expect(canvas).toHaveCSS("opacity", "1");
  });

  test("shows the visitor's own stamp count from the first frame", async ({ page }) => {
    await returning(page, "2026", ["JPN", "THA"]);
    await page.goto(MAP);
    await expect(page.locator(".map-tally")).toContainText(isPhone(page) ? "2/14" : "2 of 14");
  });

  test("opens straight into a country named in the address, and steps back out", async ({ page }) => {
    await returning(page, "2026");
    await page.goto(`${MAP}#jpn`);
    await expect(page.locator(".dive-panel h2")).toHaveText("Japan");
    await page.locator(isPhone(page) ? ".back-pill" : ".dive-back").click();
    await expect(page.locator(".dive-panel")).toHaveCount(0);
    expect(new URL(page.url()).hash).toBe("");
  });

  test("the browser's back button leaves a country, then the page", async ({ page }) => {
    await returning(page, "2026");
    await page.goto("/");
    await page.goto(MAP);
    await page.locator('.ledger a[href="#jpn"]').click();
    await expect(page.locator(".dive-panel h2")).toHaveText("Japan");
    await page.goBack();
    await expect(page.locator(".dive-panel")).toHaveCount(0);
    await expect(page).toHaveURL(/\/bucket-list\/$/);
  });

  test("reset goes straight to the whole map, however many countries were opened", async ({ page }) => {
    await returning(page, "2026");
    await page.goto(MAP);
    for (const code of ["jpn", "vnm", "tha"]) {
      await page.locator(`.ledger a[href="#${code}"]`).click();
      await expect(page.locator(".dive-panel")).toBeVisible();
    }
    await page.locator(".map-reset").click();
    await expect(page.locator(".dive-panel")).toHaveCount(0);
    await expect(page).toHaveURL(/\/bucket-list\/$/);
  });

  test("opening a country collects its stamp", async ({ page }) => {
    await returning(page, "2026");
    await page.goto(`${MAP}#vnm`);
    await expect(page.locator(".dive-panel")).toBeVisible();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("expedition-stamps") ?? "[]"))).toContain("VNM");
  });

  test("the era switch repaints the page and remembers", async ({ page }) => {
    await returning(page, "2026");
    await page.goto(MAP);
    await page.locator('.map-tools .era-switch button[data-era="1826"]').click();
    expect(await eraOf(page)).toBe("1826");
    await expect(page.locator(".tour-title .only-1826")).toBeVisible();
    await page.reload();
    expect(await eraOf(page)).toBe("1826");
  });
});

test.describe("the stamp book", () => {
  test("opens from the map, and closes with Escape or the back button", async ({ page }) => {
    await returning(page, "2026", ["JPN"]);
    await page.goto(MAP);
    const book = page.getByRole("dialog", { name: "Your passport" });
    await page.locator(".map-tally").click();
    await expect(book).toBeVisible();
    await expect(book).toContainText("1 of 14 collected");
    await page.keyboard.press("Escape");
    await expect(book).toBeHidden();
    await page.locator(".map-tally").click();
    await expect(book).toBeVisible();
    await page.goBack();
    await expect(book).toBeHidden();
    await expect(page).toHaveURL(/\/bucket-list\/$/);
  });
});

test.describe("the journal", () => {
  test("country, city and back again", async ({ page }) => {
    await returning(page, "2026");
    await page.goto("/bucket-list/japan/");
    await expect(page.locator("h1")).toHaveText("Japan");
    await expect(page.locator(".city-card")).toHaveCount(3);
    await page.locator('.city-card[href$="/osaka"]').click();
    await expect(page.locator("h1")).toHaveText("Osaka");
    // The way back is a pill at the top on a phone and a link above the title on a wide screen.
    const back = page.locator(".back-pill:visible, .story-back:visible");
    await back.click();
    await expect(page.locator("h1")).toHaveText("Japan");
    await back.click();
    await expect(page.locator(".dive-panel h2")).toHaveText("Japan");
  });
});

test.describe("every travel page", () => {
  for (const era of eras) for (const path of [MAP, `${MAP}#jpn`, `${MAP}#ind`, "/bucket-list/japan/", "/bucket-list/japan/tokyo/", "/bucket-list/japan/osaka/"]) {
    test(`${path} in ${era}: no errors, nothing wider than the screen`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
      page.on("response", response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
      await returning(page, era);
      await page.goto(path, { waitUntil: "networkidle" });
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
    });
  }
});

// The globe turns slowly on its own in both eras, and carries on after the visitor lets go of it.
test.describe("the globe keeps turning", () => {
  test.use({ reducedMotion: "no-preference" });
  const picture = (page: Page) => page.locator(".expedition-canvas").evaluate((node: HTMLCanvasElement) => node.toDataURL());
  const turning = async (page: Page) => { const before = await picture(page); await page.waitForTimeout(700); return before !== await picture(page); };

  for (const era of eras) {
    test(`in ${era}, before and after it is handled`, async ({ page }) => {
      await returning(page, era);
      await page.goto(`${MAP}?view=globe`);
      // Let the opening shot (routes drawing themselves) finish, so only the turning is left to move.
      await page.waitForTimeout(5200);
      expect(await turning(page)).toBe(true);

      const box = (await page.locator(".expedition-canvas").boundingBox())!;
      const x = box.x + box.width * 0.5, y = box.y + box.height * 0.2;
      if (isPhone(page)) {
        await page.touchscreen.tap(x, y);
      } else {
        await page.mouse.move(x, y);
        await page.mouse.down(); await page.mouse.move(x + 120, y + 10, { steps: 6 }); await page.mouse.up();
      }
      await page.waitForTimeout(1500);
      expect(await turning(page)).toBe(true);
    });
  }
});

// 1826 belongs to the travel pages. The rest of the site is always its plain self, however it is reached.
test.describe("leaving the travel pages", () => {
  for (const from of [MAP, "/bucket-list/japan/osaka/"]) {
    test(`the site name on ${from} leads to the plain home page`, async ({ page }) => {
      // On a phone the journal pages show a back button where the site name would be.
      test.skip(isPhone(page) && from !== MAP, "no site name on a phone's journal page");
      await returning(page, "1826");
      await page.goto(from);
      expect(await eraOf(page)).toBe("1826");
      await page.locator("a.brand").click();
      await expect(page).toHaveURL(/\/$/);
      expect(await eraOf(page)).toBeUndefined();
      const look = await page.evaluate(() => [getComputedStyle(document.body).backgroundColor, getComputedStyle(document.querySelector("h1")!).fontFamily]);
      expect(look[0]).not.toBe("rgb(234, 217, 176)");
      expect(look[1]).not.toContain("IM Fell");
      // And the chosen era is still there when the visitor comes back.
      await page.goto(MAP);
      expect(await eraOf(page)).toBe("1826");
    });
  }
});
