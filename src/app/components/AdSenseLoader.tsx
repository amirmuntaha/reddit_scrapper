import Script from "next/script";
import { getAdSenseClientId, isAdSenseEnabled } from "../../lib/adsense";

/**
 * Loads the AdSense library. Render this only inside pages that are allowed to
 * show ads (see AD_ELIGIBLE_ROUTES) so the script never loads on the dashboard,
 * contact, privacy, or terms pages. Returns null when ads are not configured.
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
