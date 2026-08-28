/**
 * AdSense configuration helpers.
 *
 * The site stays completely ad-free unless BOTH environment variables below are
 * set to valid values. Nothing here injects a placeholder publisher ID.
 *
 *   NEXT_PUBLIC_ADSENSE_CLIENT_ID   e.g. ca-pub-1234567890123456
 *   NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE e.g. 1234567890
 *
 * Ad units are only rendered on the long-form, original-content routes listed in
 * `AD_ELIGIBLE_ROUTES`. The dashboard (dynamic third-party records plus utility
 * controls), contact, privacy, and terms pages are intentionally excluded, in
 * line with Google's policies on screens without publisher content and on ads
 * placed next to navigational or action items.
 *
 * https://support.google.com/publisherpolicies/answer/11112688
 * https://support.google.com/adsense/answer/1346295
 */

const CLIENT_ID_PATTERN = /^ca-pub-\d{10,20}$/;
const SLOT_ID_PATTERN = /^\d{6,20}$/;

/** Public routes allowed to render ad units (original long-form prose only). */
export const AD_ELIGIBLE_ROUTES = [
  "/guides/responsible-curation",
  "/about",
] as const;

/** Public routes that must never render ad units. */
export const AD_EXCLUDED_ROUTES = [
  "/", // dynamic dashboard: third-party records and operational controls
  "/editorial-policy",
  "/contact",
  "/privacy",
  "/terms",
] as const;

export function getAdSenseClientId(): string | null {
  const value = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim();
  return value && CLIENT_ID_PATTERN.test(value) ? value : null;
}

export function getArticleAdSlot(): string | null {
  const value = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE?.trim();
  return value && SLOT_ID_PATTERN.test(value) ? value : null;
}

/** True only when a real publisher ID and ad slot are both configured. */
export function isAdSenseEnabled(): boolean {
  return getAdSenseClientId() !== null && getArticleAdSlot() !== null;
}

/**
 * Publisher ID without the `ca-` prefix, as required by the ads.txt format.
 * https://support.google.com/adsense/answer/12171612
 */
export function getAdsTxtPublisherId(): string | null {
  const clientId = getAdSenseClientId();
  return clientId ? clientId.replace(/^ca-/, "") : null;
}
