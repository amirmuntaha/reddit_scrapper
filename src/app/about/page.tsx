import Link from "next/link";
import { createPageMetadata } from "../../lib/metadata";
import AdSenseLoader from "../components/AdSenseLoader";
import ContentAd from "../components/ContentAd";
import {
  BulletList,
  ContentSection,
  ContentSubsection,
  Notice,
  StaticPage,
} from "../components/StaticContent";

export const metadata = createPageMetadata({
  title: "About",
  description:
    "Learn what the independent Reddit Scraper dashboard does, why it exists, and the limits of automated image discovery.",
  path: "/about",
});

const linkStyles =
  "rounded-sm font-medium text-orange-300 underline decoration-orange-400/50 underline-offset-4 hover:text-orange-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400";

export default function AboutPage() {
  return (
    <StaticPage
      eyebrow="About the project"
      title="A transparent image-discovery workflow"
      intro="Reddit Scraper is a small, independent Next.js project that turns selected public RSS entries into a reviewable dashboard. Its purpose is to make discovery organized without pretending that automation can replace editorial judgment."
    >
      <AdSenseLoader />

      <ContentSection title="Why this project exists">
        <p>
          Finding candidate images across fast-moving communities can be repetitive.
          This project records a narrow set of public post metadata—such as the title,
          author, subreddit, source link, image URL, and scrape time—so candidates can
          be reviewed in one place. Pagination and the download-and-copy control support
          that review workflow; they do not publish media automatically.
        </p>
        <p>
          The project also documents the boundary between technical discovery and
          responsible publication. A public URL is not a license, a Reddit score is not
          an endorsement, and a stored card is not proof that the uploader created the
          media. The <Link href="/guides/responsible-curation" className={linkStyles}>responsible curation guide</Link> explains
          the checks a person should complete before any reuse decision.
        </p>
      </ContentSection>

      <ContentSection title="What the automation does">
        <div className="grid gap-4 md:grid-cols-2">
          <ContentSubsection title="In scope">
            <BulletList>
              <li>Requests configured public Reddit RSS feeds.</li>
              <li>Extracts post and source metadata made available in those feeds.</li>
              <li>Accepts recognized direct static-image URLs from selected hosts.</li>
              <li>Rejects known video, gallery, and preview-image patterns.</li>
              <li>Deduplicates records and displays recent scrape results.</li>
            </BulletList>
          </ContentSubsection>
          <ContentSubsection title="Outside its scope">
            <BulletList>
              <li>Identifying the original creator or rights holder.</li>
              <li>Granting permission or deciding whether a legal exception applies.</li>
              <li>Fact-checking titles, comments, or claims in source posts.</li>
              <li>Assessing privacy, safety, dignity, or suitability.</li>
              <li>Automatically posting content to Instagram or another service.</li>
            </BulletList>
          </ContentSubsection>
        </div>
      </ContentSection>

      <ContentSection title="Independence and attribution">
        <Notice>
          Reddit Scraper is not affiliated with, sponsored by, approved by, or operated
          by Reddit, Instagram, Meta, Vercel, or Supabase. Product and company names
          belong to their respective owners.
        </Notice>
        <p>
          Images, post titles, usernames, and community names shown in dashboard records
          originate from third-party sources. Their appearance does not transfer
          ownership to this project. Every card links back to Reddit so reviewers can
          inspect the source rather than treating this dashboard as the authoritative
          publication.
        </p>
      </ContentSection>

      <ContentAd />

      <ContentSection title="Limitations and corrections">
        <p>
          RSS feeds can be delayed, incomplete, edited, or unavailable. Filters can
          reject valid images or fail to recognize a new media pattern. A source post
          can change after a record is stored, and older records may no longer match the
          current source. This project therefore makes no claim that the dashboard is a
          complete archive or a definitive measure of what is popular.
        </p>
        <p>
          For a correction, credit concern, privacy request, security report, or removal
          request, follow the details on the <Link href="/contact" className={linkStyles}>contact page</Link>. Include both the
          dashboard record and original source URL so the request can be evaluated.
        </p>
      </ContentSection>
    </StaticPage>
  );
}
