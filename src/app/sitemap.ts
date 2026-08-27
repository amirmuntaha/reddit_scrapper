import type { MetadataRoute } from "next";

const siteUrl = "https://reddit-scrapper-phi.vercel.app";

const routes = [
  { path: "", changeFrequency: "daily", priority: 1 },
  {
    path: "/guides/responsible-curation",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  {
    path: "/editorial-policy",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.6 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.6 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${siteUrl}${path}`,
    changeFrequency,
    priority,
  }));
}
