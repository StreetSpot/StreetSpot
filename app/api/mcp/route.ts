import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const SERVER_INFO = { name: "streetspot-public-mcp", version: "1.0.0" }
const TOOLS = [
  { name: "streetspot_overview", description: "Returns a factual overview of StreetSpot's public platform and limitations.", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "streetspot_public_links", description: "Returns official public StreetSpot links for support, privacy, terms, and account deletion.", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "streetspot_support_guidance", description: "Routes a general StreetSpot question to public help guidance. Do not send secrets or private user data.", inputSchema: { type: "object", properties: { question: { type: "string", minLength: 1, maxLength: 1000 } }, required: ["question"], additionalProperties: false } },
] as const

function rpc(id: unknown, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, result }, { headers: { "Cache-Control": "no-store" } })
}
function rpcError(id: unknown, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, { headers: { "Cache-Control": "no-store" } })
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 })
  }
  const body = await request.json().catch(() => null) as { jsonrpc?: unknown; id?: unknown; method?: unknown; params?: Record<string, unknown> } | null
  if (!body || body.jsonrpc !== "2.0" || typeof body.method !== "string") return rpcError(body?.id, -32600, "Invalid JSON-RPC request.")
  const method = body.method
  const params = body.params ?? {}

  if (method === "notifications/initialized" || method === "notifications/cancelled") {
    return new Response(null, { status: 202, headers: { "Cache-Control": "no-store" } })
  }
  if (method === "initialize") {
    const requested = typeof params.protocolVersion === "string" ? params.protocolVersion : "2025-03-26"
    return rpc(body.id, {
      protocolVersion: requested,
      capabilities: { tools: { listChanged: false } },
      serverInfo: SERVER_INFO,
      instructions: "StreetSpot exposes only public read-only information. Never submit secrets or private data. No payments, publishing, vendor claims, or operator actions are available through this endpoint.",
    })
  }
  if (method === "ping") return rpc(body.id, {})
  if (method === "tools/list") return rpc(body.id, { tools: TOOLS })
  if (method === "tools/call") {
    const name = typeof params.name === "string" ? params.name : ""
    const args = params.arguments && typeof params.arguments === "object" ? params.arguments as Record<string, unknown> : {}
    let text: string
    if (name === "streetspot_overview") {
      text = "StreetSpot is a local discovery platform connecting people with local vendors, food trucks, pop-up shops, businesses, events, and community spots. Public agent endpoints provide information only; live listing availability, private account data, analytics, ad accounts, Play Console, newsletter publishing, and payment operations are not exposed by these tools."
    } else if (name === "streetspot_public_links") {
      text = JSON.stringify({ website: "https://streetspotapp.com", support: "https://streetspotapp.com/support", privacy: "https://streetspotapp.com/privacy", terms: "https://streetspotapp.com/terms", deleteAccount: "https://streetspotapp.com/delete-account", agentDocs: "https://streetspotapp.com/agent-docs.md", agentCard: "https://streetspotapp.com/.well-known/agent-card.json", mcpCard: "https://streetspotapp.com/.well-known/mcp/server-card.json" }, null, 2)
    } else if (name === "streetspot_support_guidance") {
      const question = typeof args.question === "string" ? args.question.slice(0, 1000).toLowerCase() : ""
      if (!question) return rpcError(body.id, -32602, "The question argument is required.")
      if (/delete|remove|account/.test(question)) text = "Review https://streetspotapp.com/delete-account for available account and browser data deletion options."
      else if (/location|map|gps/.test(question)) text = "StreetSpot uses listing coordinates first. Device location should only be requested when a user chooses the location control."
      else if (/vendor|business|claim/.test(question)) text = "Listing claims may require review; a submitted claim is not proof of identity or ownership."
      else if (/event|invite|private/.test(question)) text = "Private event details should only be shared with invited guests. Contact official support if an invitation is missing."
      else text = "For account-specific or unresolved questions, visit https://streetspotapp.com/support or email support@streetspotapp.com."
    } else {
      return rpcError(body.id, -32602, "Unknown tool.")
    }
    return rpc(body.id, { content: [{ type: "text", text }], structuredContent: { text }, isError: false })
  }
  return rpcError(body.id, -32601, "Method not found.")
}

export async function GET() {
  return new Response(null, { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } })
}
