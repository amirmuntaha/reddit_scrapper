import Link from "next/link";
import { createPageMetadata } from "../../lib/metadata";
import {
  BulletList,
  ContentSection,
  ContentSubsection,
  Notice,
  NumberedList,
  StaticPage,
} from "../components/StaticContent";

export const metadata = createPageMetadata({
  title: "Editorial Policy",
  description:
    "How Reddit Scraper discovers, filters, orders, labels, corrects, and removes public Reddit image-post records.",
  path: "/editorial-policy",
});

const linkStyles =
  "rounded-sm font-medium text-orange-300 underline decoration-orange-400/50 underline-offset-4 hover:text-orange-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400";

export default function EditorialPolicyPage() {
  return (
    <StaticPage
      eyebrow="Trust and transparency"
      title="Editorial policy"
      intro="This policy explains what is automated, how records qualify for the dashboard, what the displayed fields mean, and where human responsibility begins."
    >
      <ContentSection title="Purpose and editorial boundary">
        <p>
          Reddit Scraper is a discovery index, not a newsroom and not an endorsement
          engine. It records selected public RSS data to help a reviewer find possible
          image sources. Inclusion means that a post matched technical rules at scrape
          time; it does not mean that this project verified the post, recommends its
          message, owns its media, or approved it for publication elsewhere.
        </p>
        <Notice>
          No dashboard record should be republished solely because it appears here.
          Source validation, rights review, permission, factual verification, safety,
          attribution, accessibility, and the final publishing decision remain manual.
        </Notice>
      </ContentSection>

      <ContentSection title="How records are discovered and selected">
        <NumberedList>
          <li>
            A scheduled Vercel cron job, or an authorized manual request, asks the
            configured Reddit top-post RSS feeds for current entries.
          </li>
          <li>
            The parser reads available identifiers, titles, authors, subreddit names,
            Reddit links, publication dates, and candidate media references.
          </li>
          <li>
            A record qualifies only when the parser finds a direct URL from an allowed
            static-image host and a recognized image extension. Current accepted hosts
            are <code>i.redd.it</code> and <code>i.imgur.com</code>.
          </li>
          <li>
            Known Reddit video, preview, thumbnail, gallery, and non-image patterns are
            rejected. This is a technical media filter, not an editorial quality check.
          </li>
          <li>
            Qualifying posts are deduplicated by Reddit ID and stored in Supabase. Each
            scrape saves no more than the configured batch limit.
          </li>
        </NumberedList>
        <p>
          The RSS source determines which entries are available to inspect. This
          project does not claim that a returned set is a complete or independently
          calculated ranking of Reddit. Feed availability, upstream ranking, network
          failures, and filtering can all change the result.
        </p>
      </ContentSection>

      <ContentSection title="Ordering, labels, and generated fields">
        <div className="grid gap-4 md:grid-cols-2">
          <ContentSubsection title="Ordering">
            <p>
              The public dashboard orders stored records by <code>scraped_at</code>
              with the newest scrape time first, then paginates that database result.
              This is not a fresh popularity ranking and is not ordered by editorial
              preference.
            </p>
          </ContentSubsection>
          <ContentSubsection title="Scores">
            <p>
              Score is retained as source metadata when available. The current RSS
              workflow commonly stores zero because the feed does not provide a score.
              A score is not this project&apos;s rating, verification, or endorsement.
            </p>
          </ContentSubsection>
          <ContentSubsection title="Captions">
            <p>
              A stored caption may combine the source title with attribution-oriented
              text for workflow convenience. It is not original reporting, rights
              clearance, a final editorial caption, or evidence that anyone contacted
              the creator.
            </p>
          </ContentSubsection>
          <ContentSubsection title="Posted status">
            <p>
              The posted flag is an operational database state. It does not certify
              that permission, accuracy, safety, attribution, or platform checks were
              completed.
            </p>
          </ContentSubsection>
        </div>
      </ContentSection>

      <ContentSection title="Human review standard for reuse">
        <BulletList>
          <li>Open and compare the original source post with the saved record.</li>
          <li>Identify the creator or earliest reliable source rather than assuming the uploader owns the media.</li>
          <li>Obtain suitable permission or verify an applicable license and keep evidence.</li>
          <li>Confirm material facts, context, credit wording, and any edits.</li>
          <li>Assess privacy, dignity, safety, minors, graphic content, and potential harm.</li>
          <li>Write original commentary and useful alternative text for the intended audience.</li>
          <li>Follow Reddit, Instagram, host, community, and other applicable rules.</li>
        </BulletList>
        <p>
          The full workflow is described in the <Link href="/guides/responsible-curation" className={linkStyles}>Responsible Curation Guide</Link>.
        </p>
      </ContentSection>

      <ContentSection title="Corrections, credit, and removals">
        <p>
          The project will review specific, good-faith requests about inaccurate
          metadata, mistaken attribution, privacy, rights, safety, or removal. A request
          should identify the dashboard record, original Reddit URL, issue, requested
          action, and enough supporting context to evaluate the claim. Sensitive proof
          should not be posted publicly; begin with a minimal GitHub issue asking for a
          private follow-up channel if needed.
        </p>
        <p>
          Use the <Link href="/contact" className={linkStyles}>contact instructions</Link> to submit a request. Removal from this
          dashboard does not remove the source from Reddit, an image host, a search
          engine, or another publisher; those services must be contacted separately.
        </p>
      </ContentSection>

      <ContentSection title="Policy review">
        <p>
          This policy is reviewed when the data source, filter rules, stored fields,
          publication workflow, or monetization approach changes. Last substantive
          review: August 17, 2026.
        </p>
      </ContentSection>
    </StaticPage>
  );
}
