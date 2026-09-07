"use client";

import { useState } from "react";

interface InstagramButtonProps {
  postId: number;
  imageUrl: string;
  caption: string;
  title: string;
  alreadyPosted: boolean;
}

export default function InstagramButton({
  postId,
  imageUrl,
  caption,
  title,
  alreadyPosted,
}: InstagramButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">(
    alreadyPosted ? "success" : "idle"
  );
  const [message, setMessage] = useState("");

  const handleDownloadAndCopy = async () => {
    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      // Step 1: Download the image via a proxy to avoid CORS
      const response = await fetch(
        `/api/download?url=${encodeURIComponent(imageUrl)}`
      );

      if (!response.ok) {
        throw new Error("Failed to download image");
      }

      const blob = await response.blob();
      const filename = `reddit-${postId}-${title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "_")}.jpg`;

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Step 2: Copy caption to clipboard
      await navigator.clipboard.writeText(caption);

      setStatus("success");
      setMessage("Downloaded! Caption copied ✓");

      // Reset message after 5 seconds
      setTimeout(() => {
        if (status !== "error") {
          setMessage("");
        }
      }, 5000);
    } catch (error) {
      setStatus("error");
      // Fallback: try just copying caption if download fails
      try {
        await navigator.clipboard.writeText(caption);
        setMessage("Caption copied! (download may have been blocked)");
        setStatus("success");
      } catch {
        setMessage(error instanceof Error ? error.message : "Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (alreadyPosted) {
    return (
      <span className="inline-flex h-8 items-center gap-1 text-xs text-green-400">
        ✓ Posted to IG
      </span>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col items-start gap-1 md:items-end">
      <button
        type="button"
        onClick={handleDownloadAndCopy}
        disabled={loading}
        className="inline-flex h-8 items-center whitespace-nowrap text-xs text-pink-400 transition-colors hover:text-pink-300 disabled:cursor-not-allowed disabled:text-gray-600"
      >
        {loading ? "Downloading..." : "📸 Download for IG"}
      </button>
      {message && (
        <span
          className={`max-w-full break-words text-left text-xs md:text-right ${
            status === "success" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </span>
      )}
    </div>
  );
}
