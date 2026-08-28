"use client";

import { useEffect, useRef } from "react";
import { getAdSenseClientId, getArticleAdSlot } from "../../lib/adsense";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface ContentAdProps {
  /** Optional wrapper classes for spacing within an article. */
  className?: string;
}

/**
 * A single labelled in-article ad unit.
 *
 * Renders nothing unless a real publisher ID and slot are configured, so the
 * markup is absent (not just hidden) on an unconfigured or ad-free deployment.
 * Keep instances away from navigation, buttons, and download links, and reserve
 * height to limit layout shift.
 */
export default function ContentAd({ className = "" }: ContentAdProps) {
  const clientId = getAdSenseClientId();
  const slot = getArticleAdSlot();
  const requested = useRef(false);

  useEffect(() => {
    if (!clientId || !slot || requested.current) {
      return;
    }

    requested.current = true;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("AdSense unit could not be requested:", error);
    }
  }, [clientId, slot]);

  if (!clientId || !slot) {
    return null;
  }

  return (
    <aside
      aria-label="Advertisement"
      className={`my-10 border-y border-gray-800 py-5 ${className}`}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
        Advertisement
      </p>
      <ins
        className="adsbygoogle block"
        style={{ display: "block", minHeight: 280 }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
