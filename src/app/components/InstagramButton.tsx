"use client";

import { useState } from "react";

interface InstagramButtonProps {
  postId: number;
  alreadyPosted: boolean;
}

export default function InstagramButton({
  postId,
  alreadyPosted,
}: InstagramButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">(
    alreadyPosted ? "success" : "idle"
  );
  const [message, setMessage] = useState("");

  const handlePost = async () => {
    if (alreadyPosted || loading) return;

    const confirmed = confirm(
      "Post this image to Instagram? This action cannot be undone."
    );
    if (!confirmed) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Posted! ✓");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed");
      }
    } catch {
      setStatus("error");
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (status === "success" || alreadyPosted) {
    return (
      <span className="text-xs text-green-400 flex items-center gap-1">
        ✓ Posted to IG
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePost}
        disabled={loading}
        className="text-xs text-pink-400 hover:text-pink-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Posting..." : "📸 Post to Instagram"}
      </button>
      {status === "error" && (
        <span className="text-xs text-red-400" title={message}>
          ✗ {message}
        </span>
      )}
    </div>
  );
}
