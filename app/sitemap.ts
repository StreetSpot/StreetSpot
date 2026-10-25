import type { MetadataRoute } from "next"

const base = "https://streetspotapp.com"

// Public, indexable discovery and support pages only. Private invitation tokens,
// account flows, vendor workspaces, and success pages are intentionally excluded.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/vendors`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/for-vendors`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/discover-local-spots`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/themes`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/local-events`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${base}/pop-up-shops`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${base}/support`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/delete-account`, lastModified: now, changeFrequency: "yearly", priority: 0.1 },
  ]
}
