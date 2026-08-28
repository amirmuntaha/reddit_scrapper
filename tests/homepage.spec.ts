import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.goto("/");
    // Skip all tests if deployment protection is active (302 to Vercel login)
    const title = await page.title();
    test.skip(
      title.includes("Vercel") || title.includes("Login"),
      "Deployment protection is enabled — disable it in Vercel Settings or use a public production URL"
    );
  });

  test("should load the homepage successfully", async ({ page }) => {
    // Page already loaded in beforeEach
    await expect(page).toHaveURL(/\//);
  });

  test("should display the header with app title", async ({ page }) => {
    const title = page.locator("h1");
    await expect(title).toBeVisible();
    await expect(title).toHaveText("Reddit Scraper");
  });

  test("should display the 'Run Scrape' button", async ({ page }) => {
    const scrapeButton = page.locator('button:has-text("Run Scrape")');
    await expect(scrapeButton).toBeVisible();
  });

  test("should show post count in header", async ({ page }) => {
    const postCount = page.locator("text=/\\d+ posts scraped/");
    await expect(postCount).toBeVisible();
  });

  test("should display posts grid or empty state", async ({ page }) => {
    // Either we see posts in a grid or the empty state message
    const postsGrid = page.locator("article");
    const emptyState = page.locator("text=No posts scraped yet");

    const postsCount = await postsGrid.count();

    if (postsCount > 0) {
      // Verify post cards have expected structure
      const firstPost = postsGrid.first();
      await expect(firstPost).toBeVisible();

      // Should have an image
      const image = firstPost.locator("img");
      await expect(image).toBeVisible();

      // Should have subreddit badge
      const subredditBadge = firstPost.locator("text=/r\\//");
      await expect(subredditBadge).toBeVisible();

      // Should have a "View on Reddit" link
      const redditLink = firstPost.locator('a:has-text("View on Reddit")');
      await expect(redditLink).toBeVisible();
    } else {
      // Empty state should be visible
      await expect(emptyState).toBeVisible();
    }
  });

  test("should have proper meta and page title", async ({ page }) => {
    await expect(page).toHaveTitle(/./); // At minimum, a non-empty title
  });

  test("clicking a card opens a dialog with the image at full size", async ({
    page,
  }) => {
    const cardButton = page
      .locator('article button[aria-haspopup="dialog"]')
      .first();

    test.skip(
      (await cardButton.count()) === 0,
      "No scraped posts available to open"
    );

    // A narrow viewport guarantees a typical Reddit image overflows the dialog,
    // so the scroll behaviour below is actually exercised.
    await page.setViewportSize({ width: 380, height: 640 });

    const dialog = page.locator("dialog[open]");
    await expect(dialog).toHaveCount(0);

    await cardButton.click();
    await expect(dialog).toHaveCount(1);

    // Wait for either the loaded image or the explicit failure fallback, so a
    // dead source host fails with a clear message instead of a bare timeout.
    const outcome = await page.waitForFunction(
      () => {
        const img = document.querySelector("dialog[open] img");
        if (img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0) {
          return "loaded";
        }
        const fallback = document.querySelector("dialog[open] p a");
        return fallback ? "failed" : false;
      },
      undefined,
      { timeout: 15000 }
    );
    expect(
      await outcome.jsonValue(),
      "the source image should still be reachable"
    ).toBe("loaded");

    // The image must render at its intrinsic size, not scaled to fit.
    const image = dialog.locator("img").first();
    await expect(image).toBeVisible();

    const sizing = await image.evaluate((node: HTMLImageElement) => {
      const rect = node.getBoundingClientRect();
      const scroller = node.parentElement!;
      return {
        naturalWidth: node.naturalWidth,
        renderedWidth: Math.round(rect.width),
        overflow: getComputedStyle(scroller).overflow,
        scrollable:
          scroller.scrollWidth > scroller.clientWidth ||
          scroller.scrollHeight > scroller.clientHeight,
        clientWidth: scroller.clientWidth,
      };
    });

    expect(sizing.renderedWidth).toBe(sizing.naturalWidth);
    expect(sizing.overflow).toBe("auto");

    // The narrow viewport above should make any real Reddit image overflow, so
    // assert that precondition rather than skipping the scroll check silently.
    expect(
      sizing.naturalWidth,
      "image should be wider than the 380px dialog viewport"
    ).toBeGreaterThan(sizing.clientWidth);
    expect(sizing.scrollable).toBe(true);

    // Escape closes the dialog.
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });
});
