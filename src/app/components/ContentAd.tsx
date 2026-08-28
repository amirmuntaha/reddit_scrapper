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
 * markup is absent (not just hidden) on an ad-free deployment. Only use this on
 * routes listed in AD_ELIGIBLE_ROUTES, alongside <AdSenseLoader />, and keep it
 * away from navigation, pagination, and download controls.
 *
 * When AdSense reports no creative, the `[data-ad-status="unfilled"]` rule in
 * globals.css collapses the wrapper and its label. If the library never runs at
 * all (blocked, CSP failure, network error) that attribute is never set, so the
 * reserved space can remain empty — an accepted trade for lower layout shift.
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
    <div className={`ad-unit my-10 border-y border-gray-800 py-5 ${className}`}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
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
    </div>
  );
}
