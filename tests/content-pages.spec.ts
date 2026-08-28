import { test, expect, type Page } from "@playwright/test";

/**
 * Covers the public content/policy routes, shared navigation, crawler files, and
 * the rule that advertising code must never appear on the dashboard or on the
 * editorial-policy, contact, privacy, and terms pages.
 */

const CONTENT_ROUTES = [
  { path: "/guides/responsible-curation", heading: /Responsible Reddit image curation/i },
  { path: "/about", heading: /image-discovery workflow/i },
  { path: "/editorial-policy", heading: /Editorial policy/i },
  { path: "/contact", heading: /Reach the project maintainers/i },
  { path: "/privacy", heading: /Privacy policy/i },
  { path: "/terms", heading: /Terms of use/i },
];

/** Routes that must never contain ad markup or the AdSense loader. */
const AD_FREE_ROUTES = ["/", "/editorial-policy", "/contact", "/privacy", "/terms"];

const NAV_LINKS = [
  "/",
  "/guides/responsible-curation",
  "/about",
  "/editorial-policy",
  "/contact",
];

async function skipIfProtected(page: Page) {
  const title = await page.title();
  test.skip(
    title.includes("Vercel") || title.includes("Login"),
    "Deployment protection is enabled — disable it in Vercel Settings or use a public production URL"
  );
}

test.describe("Content and policy pages", () => {
  for (const route of CONTENT_ROUTES) {
    test(`${route.path} loads with its own heading and metadata`, async ({ page }) => {
      const response = await page.goto(route.path);
      await skipIfProtected(page);

      expect(response?.status()).toBeLessThan(400);
      await expect(page.locator("h1")).toHaveText(route.heading);

      // Each page must declare its own canonical URL and description.
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute("href", new RegExp(`${route.path}$`));

      const description = page.locator('meta[name="description"]');
      await expect(description).toHaveAttribute("content", /.{40,}/);
    });
  }

  test("shared navigation exposes every primary route", async ({ page }) => {
    await page.goto("/about");
    await skipIfProtected(page);

    const nav = page.getByRole("navigation", { name: "Primary navigation" });
    await expect(nav).toBeVisible();

    for (const href of NAV_LINKS) {
      await expect(nav.locator(`a[href="${href}"]`)).toHaveCount(1);
    }
  });

  test("footer links to the privacy policy and terms", async ({ page }) => {
    await page.goto("/");
    await skipIfProtected(page);

    const footer = page.locator("footer");
    await expect(footer.locator('a[href="/privacy"]')).toBeVisible();
    await expect(footer.locator('a[href="/terms"]')).toBeVisible();
  });

  test("privacy policy discloses the current advertising state", async ({ page }) => {
    await page.goto("/privacy");
    await skipIfProtected(page);

    await expect(page.getByRole("heading", { name: /Advertising and cookies/i })).toBeVisible();
    await expect(page.locator("body")).toContainText(/AdSense/i);
  });
});

test.describe("Ad placement rules", () => {
  for (const path of AD_FREE_ROUTES) {
    test(`${path} contains no ad code`, async ({ page }) => {
      await page.goto(path);
      await skipIfProtected(page);

      await expect(page.locator("ins.adsbygoogle")).toHaveCount(0);
      await expect(
        page.locator('script[src*="googlesyndication.com"]')
      ).toHaveCount(0);
    });
  }
});

test.describe("Crawler files", () => {
  test("robots.txt allows crawling and points to the sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain("Allow: /");
    expect(body).toContain("Disallow: /api/");
    expect(body).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/);
  });

  test("sitemap.xml lists the public content routes", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);

    const body = await response.text();
    for (const route of CONTENT_ROUTES) {
      expect(body).toContain(`${route.path}</loc>`);
    }
  });

  test("ads.txt is either absent or a valid authorized-seller line", async ({ request }) => {
    const response = await request.get("/ads.txt");

    if (response.status() === 404) {
      return; // Advertising is not configured — expected default.
    }

    expect(response.status()).toBe(200);
    expect(await response.text()).toMatch(
      /^google\.com,\s*pub-\d+,\s*DIRECT,\s*f08c47fec0942fa0/m
    );
  });
});
