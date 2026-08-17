import { defineConfig } from "@playwright/test";

/**
 * Base URL for testing the deployed website.
 * 
 * Set the BASE_URL environment variable to override:
 *   BASE_URL=https://your-production-url.vercel.app npx playwright test
 * 
 * NOTE: If Vercel Deployment Protection is enabled, you must either:
 * 1. Disable it in Vercel Settings > General > Deployment Protection
 * 2. Or use your production domain (which bypasses protection by default)
 */
const BASE_URL =
  process.env.BASE_URL || "https://reddit-scrapper-phi.vercel.app";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: BASE_URL,
    headless: true,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
