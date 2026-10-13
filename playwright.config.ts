import { defineConfig } from "@playwright/test";

// Browser tests for the travel section. They run against the built site (`pnpm build` first), because
// what they guard — pre-built pages that open in the right era, with nothing corrected after the first
// frame — exists only there; the development server builds its pages in the browser.
const PORT = 3100;

export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: `http://localhost:${PORT}`, reducedMotion: "reduce" },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "phone", use: { viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: "node dist/index.js",
    env: { NODE_ENV: "production", PORT: String(PORT) },
    url: `http://localhost:${PORT}/bucket-list/`,
    reuseExistingServer: true,
  },
});
