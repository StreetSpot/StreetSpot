import { NextResponse } from "next/server"
import { z } from "zod"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const InputSchema = z.object({
  business: z.string().trim().min(2).max(100),
  location: z.string().trim().max(100).default(""),
  audience: z.enum(["customers", "vendors", "event-hosts", "businesses", "all"]).default("all"),
  goal: z.enum(["awareness", "app-installs", "vendor-claims", "event-hosting", "retention"]).default("awareness"),
  offerings: z.string().trim().max(500).default(""),
  seedKeywords: z.string().trim().max(500).default(""),
})
const ReportSchema = z.object({
  objective: z.string().min(10).max(500),
  keywordIdeas: z.array(z.string().min(2).max(120)).min(5).max(20),
  adHeadlines: z.array(z.string().min(3).max(100)).min(3).max(10),
  adDescriptions: z.array(z.string().min(10).max(500)).min(2).max(6),
  recommendedLandingPage: z.object({
    title: z.string().min(5).max(120),
    metaDescription: z.string().min(20).max(300),
    primaryCallToAction: z.string().min(3).max(80),
  }),
  channelPlan: z.array(z.object({ channel: z.string().min(2).max(80), action: z.string().min(10).max(600) })).min(3).max(8),
  measurementPlan: z.array(z.string().min(10).max(400)).min(3).max(8),
  guardrails: z.array(z.string().min(5).max(300)).min(2).max(6),
})
const audiences = { customers: "local customers", vendors: "food trucks, pop-up vendors, and street businesses", "event-hosts": "people hosting weddings, birthdays, graduations, and community events", businesses: "local businesses and pop-up retailers", all: "customers, vendors, businesses, and event hosts" }
const goals = { awareness: "increase local awareness", "app-installs": "earn relevant app installs", "vendor-claims": "encourage verified vendor listing claims", "event-hosting": "convert personal and community event hosts", retention: "increase repeat discovery and engagement" }
const unique = (values: string[]) => [...new Set(values.map(x => x.trim()).filter(Boolean))]
const requestBuckets = new Map<string, { count: number; resetAt: number }>()
function isRateLimited(request: Request) {
  const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const now = Date.now()
  const current = requestBuckets.get(ip)
  if (!current || current.resetAt <= now) {
    requestBuckets.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }
  current.count += 1
  return current.count > 6
}

function createFallback(input: z.infer<typeof InputSchema>) {
  const place = input.location ? ` in ${input.location}` : " near me"
  const keywords = unique([
    `StreetSpot ${input.business}`, `${input.business}${place}`, `local ${input.business}${place}`,
    `things to do${place}`, `food trucks${place}`, `pop-up shops${place}`, `local events${place}`,
    `discover local vendors${place}`,
    ...input.offerings.split(/[,\n;]/).map(x => x.trim()).filter(Boolean).slice(0, 8).map(x => `${x}${place}`),
    ...input.seedKeywords.split(/[,\n;]/).map(x => x.trim()).filter(Boolean).slice(0, 10),
  ]).slice(0, 20)
  return {
    objective: `Help ${audiences[input.audience]} discover ${input.business}${place} and ${goals[input.goal]}.`,
    keywordIdeas: keywords.length >= 5 ? keywords : [...keywords, "local discovery app", "find local events"],
    adHeadlines: [`Find ${input.business} on StreetSpot`, `Discover What's Happening${input.location ? ` in ${input.location}` : " Nearby"}`, "Built for the Street. Made for Your City.", "Find Local Spots, Vendors and Events", "Your Next Favorite Spot Starts Here"],
    adDescriptions: [
      `StreetSpot helps ${audiences[input.audience]} discover active vendors, pop-ups, businesses, and events. Explore what is happening${place}.`,
      `Help ${goals[input.goal]} with StreetSpot. Find local gems, connect with businesses, and discover more close to home.`,
      input.offerings ? `Promote ${input.business}: ${input.offerings}. Help people discover it through StreetSpot.` : "Explore local food trucks, pop-up shops, events, and hidden gems with StreetSpot.",
    ],
    recommendedLandingPage: {
      title: `${input.business}${input.location ? ` in ${input.location}` : ""} | Discover on StreetSpot`,
      metaDescription: `Discover ${input.business} and more local vendors, pop-ups, businesses, and events on StreetSpot. Find your next local favorite.`,
      primaryCallToAction: input.goal === "vendor-claims" ? "Claim your listing" : input.goal === "event-hosting" ? "Create your event" : input.goal === "app-installs" ? "Get StreetSpot" : "Explore local spots",
    },
    channelPlan: [
      { channel: "Google Search / SEO", action: "Create useful landing pages for real service areas, with unique titles and descriptions. Do not publish doorway pages for places StreetSpot does not serve." },
      { channel: "Google Play listing", action: "Test listing headlines and screenshots that explain live discovery, vendors, events, and personal hosting. Compare store visits against installs." },
      { channel: "Local communities", action: "Create useful vendor spotlights and local-event roundups. Get permission before using logos, photos, or customer content." },
      { channel: "Paid advertising", action: "Only test after conversion tracking works. Set a strict budget cap and optimize for completed actions, not clicks alone." },
      { channel: "Retention", action: "Use opt-in updates for saved vendors and nearby events. Limit notification frequency and provide a clear opt-out." },
    ],
    measurementPlan: [
      "Record baseline impressions, clicks, installs, and target actions before changing campaigns.",
      "Use UTM-tagged links and verify analytics events before spending.",
      "Review search-query relevance weekly and exclude irrelevant queries.",
      "Report cost per completed action and conversion rate; never label keyword ideas as measured search volume.",
    ],
    guardrails: ["This is a strategy draft, not live search-volume research or live ad-account analysis.", "No campaigns were published and no advertising budget was spent.", "Validate search demand and brand usage before publishing."],
  }
}

async function createAiReport(input: z.infer<typeof InputSchema>, request: Request) {
  const apiKey = process.env.AI_GATEWAY_API_KEY || request.headers.get("x-vercel-oidc-token") || process.env.VERCEL_OIDC_TOKEN
  if (!apiKey) return null
  const model = process.env.STREETSPOT_AI_MODEL || "openai/gpt-5.6-sol"
  const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "X-Vercel-AI-App-Name": "StreetSpot Advertising Search Analyst", "X-Vercel-AI-App-Url": "https://streetspotapp.com" },
    body: JSON.stringify({
      model,
      stream: false,
      temperature: 0.3,
      max_tokens: 1800,
      messages: [
        { role: "system", content: "You are StreetSpot's search and advertising analyst. Return only valid JSON matching this structure: objective string; keywordIdeas string[] (5-20); adHeadlines string[] (3-10); adDescriptions string[] (2-6); recommendedLandingPage object with title, metaDescription, primaryCallToAction strings; channelPlan array of {channel,action} (3-8); measurementPlan string[] (3-8); guardrails string[] (2-6). Make practical, specific recommendations. Never invent search volumes, rankings, analytics, competitor facts, or results. Mark unverified keyword suggestions as ideas. Do not suggest publishing campaigns or spending money automatically." },
        { role: "user", content: JSON.stringify(input) },
      ],
    }),
    signal: AbortSignal.timeout(20000),
    cache: "no-store",
  })
  if (!response.ok) throw new Error(`AI Gateway returned ${response.status}`)
  const payload = await response.json() as { choices?: { message?: { content?: string | null } }[] }
  const content = payload.choices?.[0]?.message?.content
  if (!content) throw new Error("AI Gateway returned no text")
  const clean = content.trim().replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`$/, "")
  return ReportSchema.parse(JSON.parse(clean))
}

export async function POST(request: Request) {
  if (isRateLimited(request)) return NextResponse.json({ error: "Too many analyses in a short period. Try again in a minute." }, { status: 429 })
  const parsed = InputSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Check the business name and field lengths." }, { status: 400 })
  const input = parsed.data
  let report: z.infer<typeof ReportSchema>
  let mode: "ai" | "fallback" = "fallback"
  try {
    const aiReport = await createAiReport(input, request)
    if (aiReport) { report = aiReport; mode = "ai" }
    else report = createFallback(input)
  } catch (error) {
    console.error("Advertising Search Analyst AI generation failed; using deterministic fallback.", error instanceof Error ? error.message : "unknown error")
    report = createFallback(input)
  }
  return NextResponse.json({
    ...report,
    generatedAt: new Date().toISOString(),
    agent: "Advertising Search Analyst",
    mode,
    inputs: { business: input.business, location: input.location || "not specified", audience: input.audience, goal: input.goal },
    guardrails: unique([...report.guardrails, "No campaigns were published and no advertising budget was spent.", "Live search-volume and ranking metrics are not available unless a verified analytics/search data source is connected."]),
  })
}
