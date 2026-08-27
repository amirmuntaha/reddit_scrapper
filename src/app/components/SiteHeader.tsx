import Link from "next/link";

const navigation = [
  { href: "/", label: "Dashboard" },
  { href: "/guides/responsible-curation", label: "Curation Guide" },
  { href: "/about", label: "About" },
  { href: "/editorial-policy", label: "Editorial Policy" },
  { href: "/contact", label: "Contact" },
];

const focusStyles =
  "rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-3 py-3 sm:px-4 lg:flex-nowrap lg:py-4">
        <Link
          href="/"
          className={`flex shrink-0 items-center gap-2.5 text-white ${focusStyles}`}
          aria-label="Reddit Scraper dashboard"
        >
          <span
            className="flex size-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold"
            aria-hidden="true"
          >
            R
          </span>
          <span className="font-semibold tracking-tight">Reddit Scraper</span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="order-2 w-full overflow-x-auto lg:order-none lg:ml-auto lg:w-auto"
        >
          <ul className="flex min-w-max flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-300 sm:gap-x-5">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`transition-colors hover:text-orange-300 ${focusStyles}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
