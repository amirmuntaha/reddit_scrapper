/**
 * AdSense configuration helpers.
 *
 * The site stays ad-free unless BOTH environment variables below hold valid
 * values. Nothing here injects a placeholder publisher ID.
 *
 *   NEXT_PUBLIC_ADSENSE_CLIENT_ID    e.g. ca-pub-1234567890123456
 *   NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE e.g. 1234567890
 *
 * Ad units are rendered only by the pages listed in `AD_ELIGIBLE_ROUTES`, which
 * import `AdSenseLoader` and `ContentAd` directly. No ad component is used in the
 * root layout, so the routes in `AD_EXCLUDED_ROUTES` never render ad markup or
 * request the ad library.
 *
 * Caveat: `next/script` does not unload a script, so after a client-side
 * navigation from an article page to an excluded page the library can remain
 * loaded for the rest of that browser session. Because of that, account-level
 * Auto ads must stay OFF; otherwise Google could place ads on excluded pages
 * without any code change.
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

const warned = new Set<string>();

function readValidatedEnv(
  name: string,
  value: string | undefined,
  pattern: RegExp
): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  if (!pattern.test(trimmed)) {
    if (!warned.has(name)) {
      warned.add(name);
      console.warn(
        `${name} is set but not in the expected format; advertising stays disabled.`
      );
    }
    return null;
  }

  return trimmed;
}

export function getAdSenseClientId(): string | null {
  return readValidatedEnv(
    "NEXT_PUBLIC_ADSENSE_CLIENT_ID",
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
    CLIENT_ID_PATTERN
  );
}

export function getArticleAdSlot(): string | null {
  return readValidatedEnv(
    "NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE",
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE,
    SLOT_ID_PATTERN
  );
}

/** True only when a real publisher ID and ad slot are both configured. */
export function isAdSenseEnabled(): boolean {
  return getAdSenseClientId() !== null && getArticleAdSlot() !== null;
}

/**
 * Publisher ID without the `ca-` prefix, as required by the ads.txt format.
 * Returns null unless advertising is fully configured, so ads.txt and the
 * rendered ad units can never disagree about the site's state.
 * https://support.google.com/adsense/answer/12171612
 */
export function getAdsTxtPublisherId(): string | null {
  if (!isAdSenseEnabled()) {
    return null;
  }

  return getAdSenseClientId()!.replace(/^ca-/, "");
}
