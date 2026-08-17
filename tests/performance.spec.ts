import { test, expect } from "@playwright/test";

test.describe("Performance & Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    test.skip(
      title.includes("Vercel") || title.includes("Login"),
      "Deployment protection is enabled — disable it in Vercel Settings or use a public production URL"
    );
  });

  test("homepage should load within 5 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(5000);
  });

  test("should not have any console errors on the app page", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Filter out known benign errors (external resource loading, third-party scripts)
    const criticalErrors = errors.filter(
      (err) =>
        !err.includes("Failed to load resource") &&
        !err.includes("net::ERR") &&
        !err.includes("Provider") &&
        !err.includes("GSI_LOGGER") &&
        !err.includes("FedCM")
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test("should be responsive on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const header = page.locator("header");
    await expect(header).toBeVisible();

    const title = page.locator("h1");
    await expect(title).toBeVisible();
  });

  test("should be responsive on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    const header = page.locator("header");
    await expect(header).toBeVisible();

    const title = page.locator("h1");
    await expect(title).toBeVisible();
  });

  test("all external links should have target=_blank and rel=noopener", async ({
    page,
  }) => {
    await page.goto("/");

    const externalLinks = page.locator('a[href^="http"]');
    const count = await externalLinks.count();

    for (let i = 0; i < count; i++) {
      const link = externalLinks.nth(i);
      const target = await link.getAttribute("target");
      const rel = await link.getAttribute("rel");

      expect(target).toBe("_blank");
      expect(rel).toContain("noopener");
    }
  });

  test("images should have alt attributes", async ({ page }) => {
    await page.goto("/");

    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      // alt should exist (not null) — empty string is acceptable for decorative images
      expect(alt).not.toBeNull();
    }
  });
});
