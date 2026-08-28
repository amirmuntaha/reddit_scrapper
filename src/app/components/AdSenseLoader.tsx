import Script from "next/script";
import { getAdSenseClientId, isAdSenseEnabled } from "../../lib/adsense";

/**
 * Loads the AdSense library. Render this only inside pages that are allowed to
 * show ads (see AD_ELIGIBLE_ROUTES), so no excluded page requests the script on
 * load. Returns null when ads are not configured.
 *
 * Note: `next/script` does not unload a script, so after a client-side
 * navigation away from an article page the library stays loaded for the rest of
 * the session. Excluded pages still render no ad markup, but account-level Auto
 * ads must stay off. See src/lib/adsense.ts for the full caveat.
 */
export default function AdSenseLoader() {
  const clientId = getAdSenseClientId();

  if (!clientId || !isAdSenseEnabled()) {
    return null;
  }

  return (
    <Script
      id="adsbygoogle-loader"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
