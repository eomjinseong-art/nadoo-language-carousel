import type { MetadataRoute } from "next";
import { getTags, getVisibleCarousels } from "@/lib/carousels";
import { LANGUAGES, languageHref, tagHref } from "@/lib/shared";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const carousels = getVisibleCarousels();
  const tags = getTags();

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    ...LANGUAGES.map((lang) => ({
      url: `${base}${languageHref(lang.code)}`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.4 },
    ...carousels.map((carousel) => ({
      url: `${base}/c/${carousel.slug}`,
      lastModified: carousel.date || undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...tags.map((tag) => ({
      url: `${base}${tagHref(tag)}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
