import Link from "next/link";
import { createPageMetadata } from "../../lib/metadata";
import {
  BulletList,
  ContentSection,
  Notice,
  StaticPage,
} from "../components/StaticContent";

export const metadata = createPageMetadata({
  title: "Terms of Use",
  description:
    "Terms governing use of the independent Reddit Scraper discovery dashboard and its third-party source links.",
  path: "/terms",
});

const linkStyles =
  "rounded-sm font-medium text-orange-300 underline decoration-orange-400/50 underline-offset-4 hover:text-orange-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400";

export default function TermsPage() {
  return (
    <StaticPage
      eyebrow="Terms"
      title="Terms of use"
      intro="These terms describe the permitted use and limitations of the Reddit Scraper website. By using the site, you agree to use it lawfully and to make your own responsible decisions about third-party content."
    >
      <Notice>
        Effective August 17, 2026. This site is an informational discovery and review
        tool. It does not provide legal advice, grant media rights, or guarantee that a
        source post is accurate, safe, available, or suitable for reuse.
      </Notice>

      <ContentSection title="Purpose of the service">
        <p>
          Reddit Scraper retrieves selected public Reddit RSS entries, applies
          technical static-image filters, stores source metadata, and displays recent
          records for review. The download and caption-copy control is a convenience;
          it does not automatically publish to Instagram or another platform and does
          not certify ownership, permission, or compliance.
        </p>
        <p>
          You are responsible for independently verifying any source, creator,
          permission, license, fact, attribution, privacy issue, safety concern, and
          platform rule before using material discovered through the site. The{" "}
          <Link href="/guides/responsible-curation" className={linkStyles}>Responsible Curation Guide</Link> provides a
          workflow, but it is not a substitute for professional advice.
        </p>
      </ContentSection>

      <ContentSection title="Third-party content and services">
        <p>
          Post titles, usernames, subreddit names, images, links, and related metadata
          come from third-party sources. Their respective owners retain their rights.
          Display on this dashboard does not transfer a copyright, trademark, privacy
          right, publicity right, license, endorsement, or authorization to you or the
          project.
        </p>
        <p>
          Links and images can lead to Reddit, Imgur, GitHub, Vercel, Supabase, Google,
          Instagram, or other services. This project does not control their content,
          availability, security, or privacy practices. Your use of those services is
          governed by their own terms and policies.
        </p>
        <Notice>
          Reddit Scraper is independent and is not affiliated with, sponsored by,
          endorsed by, or operated by Reddit, Instagram, Meta, Vercel, Supabase, or
          Imgur.
        </Notice>
      </ContentSection>

      <ContentSection title="Acceptable use">
        <p>You may use the public site for lawful review and project evaluation. You must not:</p>
        <BulletList>
          <li>Use the service to infringe intellectual-property, privacy, publicity, or other rights.</li>
          <li>Present a dashboard record as proof of ownership, consent, accuracy, or permission.</li>
          <li>Use the service for harassment, doxxing, stalking, exploitation, deception, or unlawful surveillance.</li>
          <li>Attempt unauthorized access to the application, database, provider accounts, secrets, or protected endpoints.</li>
          <li>Interfere with availability, bypass rate limits or access controls, introduce malicious code, or place unreasonable load on the service.</li>
          <li>Misrepresent affiliation with this project or with any third-party platform or creator.</li>
        </BulletList>
      </ContentSection>

      <ContentSection title="Availability and changes">
        <p>
          The service is provided on an as-available basis. Feeds, image hosts,
          databases, hosting, APIs, schemas, filters, and third-party terms can change
          without notice. Records may be incomplete, delayed, duplicated, outdated, or
          removed. Features may be changed, suspended, or discontinued, and no uptime,
          archive completeness, ranking accuracy, or data-retention commitment is made.
        </p>
        <p>
          These terms may be updated when the service or its obligations change.
          Continued use after an update is subject to the revised terms shown on this
          page. The effective date will be updated for substantive changes.
        </p>
      </ContentSection>

      <ContentSection title="Disclaimers and responsibility">
        <p>
          To the extent permitted by applicable law, the site and its information are
          provided without warranties of accuracy, completeness, merchantability,
          fitness for a particular purpose, non-infringement, security, or uninterrupted
          operation. You assume responsibility for decisions and actions based on the
          service, including any download, edit, caption, attribution, or publication.
        </p>
        <p>
          To the extent permitted by law, the project maintainers are not liable for
          indirect, incidental, special, consequential, or exemplary losses arising
          from use of or inability to use the site or third-party material. Nothing in
          these terms excludes a responsibility that applicable law does not permit to
          be excluded.
        </p>
      </ContentSection>

      <ContentSection title="Questions and requests">
        <p>
          Use the <Link href="/contact" className={linkStyles}>contact page</Link> for questions about these terms or for a
          correction, privacy, rights, security, or removal request. Removal from this
          dashboard cannot remove material from a third-party service.
        </p>
      </ContentSection>
    </StaticPage>
  );
}
