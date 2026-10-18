import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://streetspotapp.com"
  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...["terms", "delete-account", "support"].map((path) => ({
      url: `${base}/${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.2,
    })),
    ...["vendors", "food-trucks", "pop-up-shops", "private-events", "host/invitations"].map((path) => ({
      url: `${base}/${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ]
}
