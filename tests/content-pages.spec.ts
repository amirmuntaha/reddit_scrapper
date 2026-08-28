import { test, expect, type APIRequestContext, type Page } from "@playwright/test";
import { AD_ELIGIBLE_ROUTES, AD_EXCLUDED_ROUTES } from "../src/lib/adsense";

/**
 * Covers the public content/policy routes, shared navigation, crawler files, and
 * the ad placement rules.
 *
 * The advertising assertions adapt to the deployed state: `/ads.txt` returns 200
 * only when a publisher ID and ad slot are both configured, so it is used to
 * decide whether ad units are expected on the eligible pages.
 *
 * The excluded-route checks assert zero ad markup in both states. They only carry
 * real signal against a configured deployment; on an ad-free target they simply
 * confirm the default. Run the suite against a configured preview URL to exercise
 * the placement split itself.
 */

const CONTENT_ROUTES = [
  { path: "/guides/responsible-curation", heading: /Responsible Reddit image curation/i },
  { path: "/about", heading: /image-discovery workflow/i },
  { path: "/editorial-policy", heading: /Editorial policy/i },
  { path: "/contact", heading: /Reach the project maintainers/i },
  { path: "/privacy", heading: /Privacy policy/i },
  { path: "/terms", heading: /Terms of use/i },
];

const NAV_LINKS = [
  "/",
  "/guides/responsible-curation",
  "/about",
  "/editorial-policy",
  "/contact",
];

/**
 * Match the loader this app renders by its stable id rather than by host: once
 * adsbygoogle.js runs it injects further scripts from the same domain, which
 * would make a host-based count racy.
 */
const AD_LOADER = "script#adsbygoogle-loader";

async function skipIfProtected(page: Page) {
  const title = await page.title();
  test.skip(
    title.includes("Vercel") || title.includes("Login"),
    "Deployment protection is enabled — disable it in Vercel Settings or use a public production URL"
  );
}

async function skipIfProtectedRequest(request: APIRequestContext, path: string) {
  const response = await request.get(path, { maxRedirects: 0 });
  test.skip(
    response.status() === 401 || response.status() === 403 || response.status() === 307,
    "Deployment protection is enabled — disable it in Vercel Settings or use a public production URL"
  );
  return response;
}

/** True when the deployment has advertising configured. */
async function adsEnabled(request: APIRequestContext): Promise<boolean> {
  const response = await request.get("/ads.txt");
  return response.status() === 200;
}

test.describe("Content and policy pages", () => {
  for (const route of CONTENT_ROUTES) {
    test(`${route.path} loads with its own heading and metadata`, async ({ page }) => {
      const response = await page.goto(route.path);
      await skipIfProtected(page);

      expect(response, "navigation should return a response").not.toBeNull();
      expect(response!.status()).toBeLessThan(400);
      await expect(page.locator("h1")).toHaveText(route.heading);

      // Each page must declare its own canonical URL and description.
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        new RegExp(`${route.path}$`)
      );
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        /.{40,}/
      );
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

  test("privacy policy discloses the current advertising state", async ({
    page,
    request,
  }) => {
    await page.goto("/privacy");
    await skipIfProtected(page);

    await expect(
      page.getByRole("heading", { name: /Advertising and cookies/i })
    ).toBeVisible();

    const enabled = await adsEnabled(request);
    await expect(page.locator("main")).toContainText(
      enabled ? /AdSense is\s+enabled/i : /not currently enabled/i
    );
  });
});

test.describe("Ad placement rules", () => {
  for (const path of AD_EXCLUDED_ROUTES) {
    test(`${path} contains no ad code`, async ({ page }) => {
      await page.goto(path);
      await skipIfProtected(page);

      await expect(page.locator("ins.adsbygoogle")).toHaveCount(0);
      await expect(page.locator(AD_LOADER)).toHaveCount(0);
    });
  }

  for (const path of AD_ELIGIBLE_ROUTES) {
    test(`${path} matches the deployment's advertising state`, async ({
      page,
      request,
    }) => {
      const enabled = await adsEnabled(request);

      await page.goto(path);
      await skipIfProtected(page);

      const units = page.locator("ins.adsbygoogle");

      if (enabled) {
        // Exactly one labelled unit per article page, plus this app's loader.
        await expect(units).toHaveCount(1);
        await expect(page.locator(AD_LOADER)).toHaveCount(1);

        // The label must exist in the markup. It is not asserted as *visible*:
        // globals.css intentionally collapses the wrapper on an unfilled ad.
        await expect(
          page.locator(".ad-unit").getByText("Advertisement", { exact: true })
        ).toHaveCount(1);

        // The unit must carry the publisher ID and a slot.
        await expect(units).toHaveAttribute("data-ad-client", /^ca-pub-\d+$/);
        await expect(units).toHaveAttribute("data-ad-slot", /^\d+$/);
      } else {
        // Ad-free deployments must not ship any ad markup or loader.
        await expect(units).toHaveCount(0);
        await expect(page.locator(AD_LOADER)).toHaveCount(0);
      }
    });
  }
});

test.describe("Crawler files", () => {
  test("robots.txt allows crawling and points to the sitemap", async ({ request }) => {
    const response = await skipIfProtectedRequest(request, "/robots.txt");
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain("Allow: /");
    expect(body).toContain("Disallow: /api/");
    expect(body).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/);
  });

  test("sitemap.xml lists the public content routes", async ({ request }) => {
    const response = await skipIfProtectedRequest(request, "/sitemap.xml");
    expect(response.status()).toBe(200);

    const body = await response.text();
    for (const route of CONTENT_ROUTES) {
      expect(body).toContain(`${route.path}</loc>`);
    }
  });

  test("ads.txt is either absent or a valid authorized-seller line", async ({
    request,
  }) => {
    const response = await skipIfProtectedRequest(request, "/ads.txt");
    expect([200, 404]).toContain(response.status());

    if (response.status() === 200) {
      expect(await response.text()).toMatch(
        /^google\.com,\s*pub-\d+,\s*DIRECT,\s*f08c47fec0942fa0/m
      );
    }
  });
});
