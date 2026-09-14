import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests", fullyParallel: true, workers: 2, timeout: 45_000,
  use: { baseURL: "http://127.0.0.1:4176", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium", viewport: { width: 390, height: 844 } } },
  ],
  webServer: { command: "pnpm exec vite --host 127.0.0.1 --port 4176 --strictPort", url: "http://127.0.0.1:4176", reuseExistingServer: false },
});
