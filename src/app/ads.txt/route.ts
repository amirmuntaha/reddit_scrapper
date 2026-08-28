import { getAdsTxtPublisherId } from "../../lib/adsense";

/**
 * Serves ads.txt only when a real AdSense publisher ID is configured.
 *
 * Google's authorized-inventory policy requires publishers to be listed as an
 * authorized seller when a domain uses ads.txt, so an unconfigured deployment
 * returns 404 instead of an empty or placeholder file.
 * https://support.google.com/adsense/answer/12171612
 */
export function GET() {
  const publisherId = getAdsTxtPublisherId();

  if (!publisherId) {
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(`google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
