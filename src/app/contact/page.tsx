import { createPageMetadata } from "../../lib/metadata";
import {
  BulletList,
  ContentSection,
  Notice,
  NumberedList,
  StaticPage,
} from "../components/StaticContent";

export const metadata = createPageMetadata({
  title: "Contact",
  description:
    "Contact the Reddit Scraper project about corrections, removal, privacy, accessibility, or security through its public GitHub repository.",
  path: "/contact",
});

const issuesUrl = "https://github.com/amirmuntaha/reddit_scrapper/issues";
const linkStyles =
  "rounded-sm font-medium text-orange-300 underline decoration-orange-400/50 underline-offset-4 hover:text-orange-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400";

export default function ContactPage() {
  return (
    <StaticPage
      eyebrow="Contact"
      title="Reach the project maintainers"
      intro="The public GitHub issue tracker is the project’s official contact route for corrections, removal requests, privacy questions, accessibility feedback, and reproducible technical problems."
    >
      <ContentSection title="Open a GitHub issue">
        <p>
          Visit the{" "}
          <a href={issuesUrl} target="_blank" rel="noopener noreferrer" className={linkStyles}>
            Reddit Scraper issue tracker ↗
          </a>{" "}
          and choose a short, descriptive title. There is no contact form on this site,
          and the project does not publish an email address. GitHub may require an
          account and applies its own privacy terms.
        </p>
        <Notice>
          Do not post passwords, access tokens, private keys, identity documents,
          private addresses, or other sensitive personal information in a public issue.
          For a matter that needs confidential evidence, open a minimal issue asking
          the maintainer to arrange an appropriate private follow-up method.
        </Notice>
      </ContentSection>

      <ContentSection title="What to include">
        <NumberedList>
          <li>The dashboard record title and its Reddit source URL.</li>
          <li>The specific problem: correction, attribution, privacy, rights, safety, accessibility, removal, or security.</li>
          <li>The action you are requesting and a concise explanation of why.</li>
          <li>Non-sensitive supporting links that help verify the request.</li>
          <li>A way to distinguish your request from unrelated reports without disclosing unnecessary personal data.</li>
        </NumberedList>
        <p>
          Clear record and source URLs are especially important because usernames,
          titles, and images can change or appear in more than one place.
        </p>
      </ContentSection>

      <ContentSection title="Request types">
        <BulletList>
          <li><strong className="text-white">Correction or credit:</strong> identify the inaccurate field and provide an authoritative source.</li>
          <li><strong className="text-white">Removal or rights concern:</strong> explain your relationship to the work and the requested scope without posting sensitive proof publicly.</li>
          <li><strong className="text-white">Privacy:</strong> identify the personal information involved and where it appears.</li>
          <li><strong className="text-white">Security:</strong> avoid publishing exploit details or credentials; request a private reporting path first.</li>
          <li><strong className="text-white">Technical problem:</strong> include the URL, browser, steps, expected result, actual result, and a redacted error message.</li>
        </BulletList>
      </ContentSection>

      <ContentSection title="Scope of a response">
        <p>
          The maintainers can review records and code controlled by this project. They
          cannot edit or remove content hosted by Reddit, an image host, Instagram, a
          search engine, or another third party. Contact those services directly for
          action on their systems.
        </p>
        <p>
          Good-faith requests will be evaluated against the available evidence and the
          project&apos;s editorial and privacy policies. The public issue may be closed or
          redacted after resolution when leaving it open would expose unnecessary
          personal or security information.
        </p>
      </ContentSection>
    </StaticPage>
  );
}
