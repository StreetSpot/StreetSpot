/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/",
        headers: [
          { key: "Link", value: '<https://streetspotapp.com/.well-known/api-catalog>; rel="api-catalog", <https://streetspotapp.com/openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json;version=3.1.0", <https://streetspotapp.com/agent-docs.md>; rel="service-doc"; type="text/markdown", <https://streetspotapp.com/auth.md>; rel="describedby"; type="text/markdown"' },
          { key: "Vary", value: "Accept" },
        ],
      },
      {
        source: "/.well-known/api-catalog",
        headers: [{ key: "Content-Type", value: "application/linkset+json; charset=utf-8" }],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "Content-Security-Policy-Report-Only", value: "default-src 'self'; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; connect-src 'self' https:; font-src 'self' data: https:; frame-ancestors 'self'" },
        ],
      },
    ]
  },
}

export default nextConfig
