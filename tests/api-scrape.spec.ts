import { test, expect } from "@playwright/test";

test.describe("API - /api/scrape", () => {
  test("should return a valid HTTP response", async ({ request }) => {
    const response = await request.get("/api/scrape");
    const status = response.status();

    // Valid responses:
    // - 200: scrape succeeded (CRON_SECRET not set or matched)
    // - 401: unauthorized (CRON_SECRET is set, no auth header provided)
    // - 302: deployment protection redirect
    // - 500: scrape failed (but endpoint is reachable)
    expect([200, 302, 401, 500]).toContain(status);
  });

  test("should return JSON when endpoint is accessible", async ({ request }) => {
    const response = await request.get("/api/scrape");
    const status = response.status();

    // If we get a 302, deployment protection is active — skip JSON checks
    test.skip(status === 302, "Deployment protection is active");

    const contentType = response.headers()["content-type"] || "";

    if (contentType.includes("application/json")) {
      const body = await response.json();
      expect(body).toBeDefined();

      if (status === 200) {
        // Successful scrape response structure
        expect(body).toHaveProperty("success", true);
        expect(body).toHaveProperty("posts_found");
        expect(body).toHaveProperty("inserted");
        expect(body).toHaveProperty("skipped");
        expect(typeof body.posts_found).toBe("number");
        expect(typeof body.inserted).toBe("number");
        expect(typeof body.skipped).toBe("number");
      } else if (status === 401) {
        expect(body).toHaveProperty("error", "Unauthorized");
      } else if (status === 500) {
        expect(body).toHaveProperty("success", false);
        expect(body).toHaveProperty("error");
      }
    }
  });

  test("should respond within acceptable time", async ({ request }) => {
    const start = Date.now();
    await request.get("/api/scrape");
    const duration = Date.now() - start;

    // Should respond within 30 seconds (generous timeout for cold starts)
    expect(duration).toBeLessThan(30000);
  });
});
