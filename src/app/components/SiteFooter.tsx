import Link from "next/link";

const resourceLinks = [
  {
    href: "https://reddit-scrapper-phi.vercel.app",
    label: "Live site",
  },
  {
    href: "https://github.com/amirmuntaha/reddit_scrapper",
    label: "GitHub repository",
  },
  {
    href: "https://vercel.com/amirmuntaha/reddit-scrapper",
    label: "Vercel dashboard",
  },
  {
    href: "https://vercel.com/amirmuntaha/reddit-scrapper/logs",
    label: "Vercel logs",
  },
  {
    href: "https://supabase.com/dashboard",
    label: "Supabase dashboard",
  },
];

const linkStyles =
  "rounded-sm text-gray-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400";

export default function SiteFooter() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-3 py-8 sm:px-4 md:grid-cols-[1fr_2fr]">
        <div>
          <p className="font-semibold text-white">Reddit Scraper</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-gray-400">
            An independent discovery dashboard for reviewing public Reddit image
            post records before any separate reuse or publication decision.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <nav aria-label="Policy links">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Policies
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-3 text-sm">
              <li>
                <Link href="/privacy" className={linkStyles}>
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className={linkStyles}>
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/editorial-policy" className={linkStyles}>
                  Editorial Policy
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Project and administration resources">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Project resources
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-3 text-sm">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkStyles}
                  >
                    {link.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
