import type { Metadata } from "next";

interface PageMetadataOptions {
  title: string;
  description: string;
  path: `/${string}`;
}

export function createPageMetadata({
  title,
  description,
  path,
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      siteName: "Reddit Scraper",
      type: "website",
      title,
      description,
      url: path,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
