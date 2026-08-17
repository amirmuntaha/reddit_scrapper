"use client";

import { useState } from "react";

export default function ScrapeButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleScrape = async () => {
    const secret = prompt("Enter your CRON_SECRET:");
    if (!secret) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/scrape", {
        headers: {
          Authorization: `Bearer ${secret}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(
          `✅ Success! Found ${data.posts_found} posts, inserted ${data.inserted}, skipped ${data.skipped}`
        );
        // Reload the page after a short delay to show new posts
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setResult(`❌ Error: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      setResult(`❌ Failed to connect: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleScrape}
        disabled={loading}
        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
      >
        {loading ? "Scraping..." : "Run Scrape"}
      </button>
      {result && (
        <span className="text-xs text-gray-300 max-w-xs truncate">
          {result}
        </span>
      )}
    </div>
  );
}
