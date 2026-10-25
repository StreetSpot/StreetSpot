import type { MetadataRoute } from "next"

const base = "https://streetspotapp.com"

// Include only public, canonical pages with useful content. Keep account flows,
// private invitation tokens, vendor workspaces, API routes and checkout results out.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/vendors`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/for-vendors`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/discover-local-spots`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/food-trucks`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/themes`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/local-events`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/private-events`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/pop-up-shops`, changeFrequency: "weekly", priority: 0.75 },
    { url: `${base}/support`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/delete-account`, changeFrequency: "yearly", priority: 0.1 },
  ]
}
