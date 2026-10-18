export const dynamic = "force-dynamic"

const CONTENT = `# StreetSpot

StreetSpot is a local discovery and engagement platform for vendors, food trucks, pop-up shops, local businesses, events, and community spots.

## What people can discover
- Local vendors and food trucks
- Pop-up shops and businesses
- Events and community gatherings
- Spots and local hidden gems

## Platform capabilities
StreetSpot is designed for local discovery, vendor engagement, event discovery and hosting, saved favorites, reviews, and direct business communication. Availability of individual features can depend on account status, configuration, and rollout.

## Agent access
StreetSpot publishes read-only public information through its MCP endpoint at https://streetspotapp.com/api/mcp and an informational A2A endpoint at https://streetspotapp.com/api/agents/a2a. These interfaces do not expose private user data and do not perform payments, vendor claims, publishing, or operator actions.

## Official links
- Website: https://streetspotapp.com
- Support: https://streetspotapp.com/support
- Privacy: https://streetspotapp.com/privacy
- Terms: https://streetspotapp.com/terms
- Account deletion: https://streetspotapp.com/delete-account
- Agent integration guide: https://streetspotapp.com/agent-docs.md
- OpenAPI: https://streetspotapp.com/openapi.json
- A2A Agent Card: https://streetspotapp.com/.well-known/agent-card.json
- MCP Server Card: https://streetspotapp.com/.well-known/mcp/server-card.json

## Accuracy and safety
Do not infer live listing availability, user location, analytics, search volume, ratings, or connected account status from this description. Public tools provide informational responses only. For account-specific assistance, contact support@streetspotapp.com.
`

export function GET() {
  return new Response(CONTENT, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Vary": "Accept",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
