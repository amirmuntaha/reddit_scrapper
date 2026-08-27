import Link from "next/link";
import { createPageMetadata } from "../../../lib/metadata";
import {
  BulletList,
  ContentSection,
  ContentSubsection,
  Notice,
  NumberedList,
  StaticPage,
} from "../../components/StaticContent";

export const metadata = createPageMetadata({
  title: "Responsible Reddit Image Curation Guide",
  description:
    "A practical guide to source verification, permission, attribution, context, accessibility, and human review before reusing a discovered Reddit image.",
  path: "/guides/responsible-curation",
});

const linkStyles =
  "rounded-sm font-medium text-orange-300 underline decoration-orange-400/50 underline-offset-4 hover:text-orange-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400";

export default function ResponsibleCurationGuide() {
  return (
    <StaticPage
      eyebrow="Practical guide"
      title="Responsible Reddit image curation"
      intro="A dashboard record can help you discover an image, but discovery is only the beginning. This guide explains the human checks needed before deciding whether and how to feature third-party media."
    >
      <Notice>
        This guide offers educational workflow guidance, not legal advice. Rights,
        privacy, and platform obligations vary by image, creator, location, and
        intended use. When the answer is uncertain, pause publication and seek
        qualified advice or choose material with clearer permission.
      </Notice>

      <ContentSection title="Discovery and publication are different decisions">
        <p>
          Reddit brings together original work, reposts, screenshots, news images,
          memes, promotional material, and media copied from elsewhere. A post being
          public, popular, downloadable, or visible in an RSS feed does not tell you
          who created the image or what reuse rights exist. It also does not show
          whether the uploader had permission to post it.
        </p>
        <p>
          Treat every dashboard card as a lead for investigation. The scraper makes
          discovery more efficient by recording a source link and selected metadata;
          it does not perform a copyright search, verify identity, collect consent,
          assess sensitive context, or approve publication. Those are separate human
          decisions. A responsible process keeps the convenience of automation on the
          discovery side and puts deliberate review between discovery and reuse.
        </p>
        <p>
          Start by defining the publication you are considering. Record the channel,
          audience, purpose, proposed caption, image treatment, and whether the use is
          commercial. Permission for one account or one format may not cover another.
          Knowing the intended use makes later questions specific instead of asking
          only whether an image is vaguely “safe to use.”
        </p>
      </ContentSection>

      <ContentSection title="1. Return to the source and validate the record">
        <NumberedList>
          <li>
            Open the Reddit source link rather than making a decision from the
            dashboard thumbnail. Confirm that the post still exists and that its
            title, author, community, and media match the saved record.
          </li>
          <li>
            Read the surrounding discussion for creator statements, corrections,
            content warnings, links to an original publication, or signs that the
            uploader is reposting someone else&apos;s work.
          </li>
          <li>
            Follow any credited account, watermark, article link, or portfolio. Use
            reverse-image search when appropriate to identify earlier appearances,
            while remembering that the earliest result in a search index is not
            automatically the creator.
          </li>
          <li>
            Save the source URLs and the date checked. Online posts can be edited or
            deleted, so a lightweight decision record helps explain what was reviewed.
          </li>
        </NumberedList>
        <p>
          A matching dashboard card confirms only that the scraper stored what it saw.
          It does not establish that the Reddit submitter is the rights holder. If the
          identity or provenance remains unclear, do not fill the gap with an
          assumption based on username, popularity, or a lack of complaints.
        </p>
      </ContentSection>

      <ContentSection title="2. Confirm rights, permission, and scope">
        <p>
          Identify the person or organization able to authorize the planned use. That
          may be the photographer, illustrator, employer, publication, agency, or
          another rights holder. The person who uploaded a file may not control those
          rights. Attribution is good editorial practice, but credit alone does not
          replace permission when permission is required.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <ContentSubsection title="Ask a complete question">
            <p>
              When requesting permission, describe the exact account, platform,
              format, audience, purpose, duration, territory if relevant, whether the
              post is commercial or monetized, and any crop, overlay, translation, or
              other edit. Ask how the creator wants to be credited.
            </p>
          </ContentSubsection>
          <ContentSubsection title="Preserve the answer">
            <p>
              Keep the response, date, account identity, permitted scope, credit line,
              expiry, and restrictions in a decision log. If the permission is
              conditional, make those conditions part of the publishing checklist.
            </p>
          </ContentSubsection>
        </div>
        <p>
          If an explicit license accompanies the work, read its current terms at the
          authoritative source and check that your use fits. Some licenses require
          attribution, a link, change notices, or sharing adaptations under the same
          terms. Others exclude commercial use or modification. Do not label a work
          with a license simply because a repost or comment claims one applies.
        </p>
        <p>
          Legal exceptions such as fair use or fair dealing are fact-specific and
          differ by jurisdiction. They are not a shortcut for a routine social post.
          If your plan relies on an exception instead of permission, obtain appropriate
          advice rather than treating this guide or an automated tool as clearance.
        </p>
      </ContentSection>

      <ContentSection title="3. Check context, accuracy, dignity, and safety">
        <p>
          Rights clearance does not answer every editorial question. An accurately
          credited image can still mislead when paired with the wrong event, date,
          place, or caption. Verify factual claims against reliable sources and avoid
          presenting a Reddit title as established fact. If you cannot confirm a
          material detail, say what is unknown or do not publish it.
        </p>
        <BulletList>
          <li>
            Look for identifiable people, homes, documents, vehicle plates, medical
            details, precise locations, or other information that could create privacy
            or safety risks.
          </li>
          <li>
            Use additional care with children, people in distress, victims, private
            individuals, graphic events, or content that could invite harassment.
          </li>
          <li>
            Consider whether a crop, translation, removed watermark, or rewritten
            caption changes the meaning or hides relevant context.
          </li>
          <li>
            Check community and platform rules in addition to the law. Reddit,
            Instagram, individual communities, and media hosts can each have relevant
            terms or moderation requirements.
          </li>
          <li>
            Do not publish merely because an automated filter accepted the file. The
            filter checks technical URL characteristics, not truth, safety, or taste.
          </li>
        </BulletList>
      </ContentSection>

      <ContentSection title="4. Add original value instead of duplicating the source">
        <p>
          Responsible curation should help the audience understand why an item matters.
          Copying a Reddit title, image, and top comments creates little value and can
          misrepresent community discussion as your own work. Write an original caption
          grounded in what you verified. Explain the selection, relevant background,
          limitations, and what the audience should notice.
        </p>
        <p>
          Keep your commentary distinct from quoted material. Use quotation marks and a
          source for short quotations when appropriate, and do not copy an entire post
          or discussion. Link to the original Reddit thread and, where different, the
          creator&apos;s authoritative page. A useful caption can acknowledge uncertainty
          without becoming vague: identify confirmed facts, attribute claims, and omit
          details that were not verified.
        </p>
        <p>
          Review the final composition for accidental implications. Placing a person&apos;s
          image beside unrelated claims, promotions, or ads can suggest an endorsement
          they never made. The same concern applies to headlines, thumbnails, hashtags,
          and neighboring posts—not only the main caption.
        </p>
      </ContentSection>

      <ContentSection title="5. Prepare accessible, faithful media">
        <p>
          Use the best authorized version available from the rights holder rather than
          enlarging a compressed preview. Check sharpness, color, orientation, and the
          effect of platform cropping on important details and credits. Do not remove a
          watermark or signature to create a cleaner layout.
        </p>
        <p>
          Write concise alternative text that communicates the image&apos;s relevant visual
          information. Avoid repeating the whole caption or filling alt text with
          hashtags. Mention visible text when it matters, and do not infer a person&apos;s
          identity, emotion, health, or background from appearance. If the image is
          primarily decorative, the publishing platform may support empty alt text;
          otherwise describe its purpose in context.
        </p>
        <p>
          Accessibility also includes readable contrast, captions for any motion added
          later, clear link labels, and warnings where content may be distressing.
          Complete these checks on the final asset, because overlays and crops can
          introduce problems that were absent from the source.
        </p>
      </ContentSection>

      <ContentSection title="6. Keep a decision log and a correction path">
        <p>
          A decision log does not need to be complicated. For each candidate, record the
          source and creator links, who reviewed it, the publication purpose, permission
          or license evidence, required credit, factual sources, safety considerations,
          edits made, approval date, and final destination. Also record a decision not
          to publish; recurring rejection reasons can improve future discovery rules.
        </p>
        <p>
          Before posting, decide how creators or subjects can request a correction,
          credit change, or removal. Respond by reviewing the evidence rather than
          assuming a stored record is correct. If a correction affects both your
          publication and this dashboard, track the two actions separately so one is
          not mistaken for the other.
        </p>
      </ContentSection>

      <ContentSection title="Pre-publication checklist">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 sm:p-7">
          <BulletList>
            <li>I opened the original post and confirmed the saved record.</li>
            <li>I identified the creator or documented why identification remains uncertain.</li>
            <li>I have permission, a suitable license, or qualified advice for the exact use.</li>
            <li>I preserved evidence and followed every permission or license condition.</li>
            <li>I verified material facts and checked the image in its original context.</li>
            <li>I considered privacy, dignity, safety, minors, and possible audience harm.</li>
            <li>I wrote original commentary and clearly separated it from sourced claims.</li>
            <li>I included accurate creator attribution and useful source links.</li>
            <li>I reviewed the final crop, quality, visible credit, and alternative text.</li>
            <li>I checked applicable Reddit, Instagram, host, and community rules.</li>
            <li>I recorded the reviewer, decision, evidence, date, and correction path.</li>
          </BulletList>
        </div>
        <p>
          If any answer is incomplete, the responsible next action is to investigate,
          ask, revise, or decline the image—not to let a deadline convert uncertainty
          into approval.
        </p>
      </ContentSection>

      <ContentSection title="Continue the workflow">
        <p>
          Return to the <Link href="/" className={linkStyles}>dashboard</Link> to review
          discovery records, read the <Link href="/editorial-policy" className={linkStyles}>editorial policy</Link> for
          this project&apos;s automation boundaries, or use the <Link href="/contact" className={linkStyles}>contact page</Link> to
          request a correction or removal.
        </p>
      </ContentSection>
    </StaticPage>
  );
}
