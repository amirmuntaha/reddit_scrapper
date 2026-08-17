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
          `✅ ${data.posts_found} found, ${data.inserted} inserted`
        );
        // Reload the page after a short delay to show new posts
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setResult(`❌ ${data.error || "Error"}`);
      }
    } catch (error) {
      setResult(`❌ Failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleScrape}
        disabled={loading}
        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 disabled:cursor-not-allowed rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
      >
        {loading ? "Scraping..." : "Run Scrape"}
      </button>
      {result && (
        <span className="text-xs text-gray-300 max-w-[200px] sm:max-w-xs text-right leading-tight">
          {result}
        </span>
      )}
    </div>
  );
}
