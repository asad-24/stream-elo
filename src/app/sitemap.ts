import type { MetadataRoute } from "next";
import { navigation, projects, theatreProductions } from "@/lib/content";
import { siteUrl } from "@/lib/server/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteUrl();
  const now = new Date();
  const staticRoutes = ["", ...navigation.map((item) => item.href)].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const portfolioAnchors = projects.map((project) => ({
    url: `${baseUrl}/portfolio#${project.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const theatreAnchors = theatreProductions.map((production) => ({
    url: `${baseUrl}/theatre#${production.title.toLowerCase().replaceAll(" ", "-")}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...portfolioAnchors, ...theatreAnchors];
}
