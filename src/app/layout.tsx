import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "An independent dashboard for discovering and responsibly reviewing public Reddit image post records.";

export const metadata: Metadata = {
  metadataBase: new URL("https://reddit-scrapper-phi.vercel.app"),
  title: {
    default: "Reddit Scraper",
    template: "%s | Reddit Scraper",
  },
  description,
  applicationName: "Reddit Scraper",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    siteName: "Reddit Scraper",
    type: "website",
    title: "Reddit Scraper",
    description,
    url: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-gray-950 text-white">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
