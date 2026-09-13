import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 2,
  timeout: 45_000,
  use: { baseURL: "http://127.0.0.1:4175", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 810 } } },
    { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium", viewport: { width: 390, height: 844 } } },
  ],
  webServer: { command: "npm run dev -- --host 127.0.0.1 --port 4175 --strictPort", url: "http://127.0.0.1:4175", reuseExistingServer: false },
});
