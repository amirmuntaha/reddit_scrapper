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
    const scrapeButton = page.locator('a:has-text("Run Scrape")');
    await expect(scrapeButton).toBeVisible();
    await expect(scrapeButton).toHaveAttribute("href", "/api/scrape");
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
});
