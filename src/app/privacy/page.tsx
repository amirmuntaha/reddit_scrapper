import Link from "next/link";
import { createPageMetadata } from "../../lib/metadata";
import {
  BulletList,
  ContentSection,
  ContentSubsection,
  Notice,
  StaticPage,
} from "../components/StaticContent";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "How Reddit Scraper handles public post metadata, hosting logs, external resources, requests, and any future advertising technology.",
  path: "/privacy",
});

const linkStyles =
  "rounded-sm font-medium text-orange-300 underline decoration-orange-400/50 underline-offset-4 hover:text-orange-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400";

export default function PrivacyPage() {
  return (
    <StaticPage
      eyebrow="Privacy"
      title="Privacy policy"
      intro="This policy describes the data involved when you visit Reddit Scraper and the public-source metadata stored by the project. It also states clearly which advertising and tracking features are not currently enabled."
    >
      <Notice>
        Effective August 17, 2026. Reddit Scraper currently has no user accounts,
        newsletter, contact form, analytics SDK, advertising code, or first-party
        behavioral tracking. Do not send sensitive information through public GitHub
        issues.
      </Notice>

      <ContentSection title="Information handled by the project">
        <div className="grid gap-4 md:grid-cols-2">
          <ContentSubsection title="Public Reddit post records">
            <p>
              The server stores selected public-source fields in Supabase: Reddit post
              ID, title, direct image URL, generated workflow caption, subreddit,
              author name, Reddit source URL, available score and source date, scrape
              time, and an operational posted-status flag.
            </p>
          </ContentSubsection>
          <ContentSubsection title="Visit and infrastructure data">
            <p>
              Vercel hosts the site and may process ordinary request data such as IP
              address, browser or device information, requested URL, timestamps,
              response status, and diagnostic logs to deliver, secure, and operate the
              service. Supabase processes database requests from the server.
            </p>
          </ContentSubsection>
        </div>
        <p>
          The site does not ask visitors to provide a name, email address, payment
          information, or profile. If you contact the project through GitHub, GitHub
          processes your account and issue content under its own terms and privacy
          policy. Public issue content is visible to others.
        </p>
      </ContentSection>

      <ContentSection title="Why this information is used">
        <BulletList>
          <li>Display and paginate stored discovery records.</li>
          <li>Prevent duplicate storage using the source post identifier.</li>
          <li>Support manual review, download, caption-copy, and workflow status.</li>
          <li>Operate, diagnose, secure, and improve the application.</li>
          <li>Review correction, removal, privacy, accessibility, or security requests.</li>
        </BulletList>
        <p>
          The project does not use stored Reddit usernames to build visitor profiles,
          target advertising, or identify people who browse this site.
        </p>
      </ContentSection>

      <ContentSection title="External images and links">
        <p>
          Dashboard images are loaded from third-party hosts such as Reddit&apos;s image
          domain or Imgur. When your browser requests an image, that host can receive
          request information including your IP address, browser details, referrer, and
          the asset requested. Opening links to Reddit, GitHub, Vercel, Supabase,
          Google, or another site takes you to a service with its own privacy practices.
        </p>
        <p>
          The external-link icon and new-tab behavior help identify these transitions,
          but they do not prevent the destination from processing request data. Review
          the destination&apos;s privacy information before submitting personal data.
        </p>
      </ContentSection>

      <ContentSection title="Advertising and cookies">
        <p>
          Google AdSense and other advertising services are <strong className="text-white">not currently enabled</strong> on
          this site. No AdSense script, ad slot, or placeholder publisher identifier is
          included. This site also does not currently set first-party cookies for
          accounts, preferences, or analytics.
        </p>
        <p>
          Before advertising is activated, the implementation and this policy must be
          reviewed and updated, and any consent mechanism required for the visitor&apos;s
          location must be put in place. If Google AdSense is enabled in the future,
          Google and participating vendors may use cookies, web beacons, IP addresses,
          or other identifiers to serve, personalize where permitted, limit, and
          measure ads based on visits to this and other sites. Visitors would be able
          to manage personalized advertising through{" "}
          <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className={linkStyles}>Google Ads Settings ↗</a>.
        </p>
        <p>
          Google explains its data use on publisher sites in{" "}
          <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className={linkStyles}>How Google uses information from sites or apps that use its services ↗</a>.
          This prospective disclosure does not mean advertising is active today.
        </p>
      </ContentSection>

      <ContentSection title="Retention, corrections, and removal">
        <p>
          Public-source records are retained while they support the discovery workflow,
          documentation, and operation of the project. Infrastructure providers may
          retain logs and backups according to their service settings and policies.
          There is no guarantee that a dashboard record will remain indefinitely.
        </p>
        <p>
          To request correction or removal of a dashboard record, or ask a privacy
          question, follow the <Link href="/contact" className={linkStyles}>contact instructions</Link>. Include the record
          and source URLs, the issue, and the requested action. Do not place identity
          documents or other sensitive evidence in a public issue; request a private
          follow-up route when necessary.
        </p>
      </ContentSection>

      <ContentSection title="Security and policy changes">
        <p>
          Reasonable technical controls are used, including server-side database
          credentials and restricted scrape requests, but no internet service can
          promise absolute security or uninterrupted availability. Report a suspected
          vulnerability using the security guidance on the contact page.
        </p>
        <p>
          This policy will be revised when data sources, providers, user-facing inputs,
          analytics, advertising, or other material practices change. The effective
          date above will be updated for substantive revisions.
        </p>
      </ContentSection>
    </StaticPage>
  );
}
