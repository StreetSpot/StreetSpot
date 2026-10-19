import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function response(id: unknown, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, result }, { headers: { "Cache-Control": "no-store" } })
}
function errorResponse(id: unknown, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, { status: 400, headers: { "Cache-Control": "no-store" } })
}
function answer(text: string) {
  const normalized = text.toLowerCase()
  if (/delete|remove|account/.test(normalized)) return "For account and browser data deletion options, visit https://streetspotapp.com/delete-account."
  if (/location|map|gps/.test(normalized)) return "StreetSpot focuses on discovering local vendors, businesses, events, and community spots. Device location should only be requested when a user chooses the location control."
  if (/vendor|business|claim/.test(normalized)) return "StreetSpot helps people discover vendors, food trucks, pop-up shops, and local businesses. Listing claims may require review; submission is not proof of ownership."
  if (/event|invite|private/.test(normalized)) return "StreetSpot supports local event discovery and hosting workflows. Private event details should only be shared with invited guests."
  return "StreetSpot is a local discovery platform for vendors, food trucks, pop-up shops, businesses, events, and community spots. For account-specific support, visit https://streetspotapp.com/support. This informational agent does not access private data or perform external actions."
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { jsonrpc?: unknown; id?: unknown; method?: unknown; params?: Record<string, unknown> } | null
  if (!body || body.jsonrpc !== "2.0" || typeof body.method !== "string") return errorResponse(body?.id, -32600, "Invalid JSON-RPC request.")
  if (body.method === "message/send" || body.method === "tasks/send") {
    const params = body.params ?? {}
    const message = params.message && typeof params.message === "object" ? params.message as Record<string, unknown> : {}
    const parts = Array.isArray(message.parts) ? message.parts : []
    const text = parts.map((part) => part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string" ? (part as { text: string }).text : "").filter(Boolean).join("\n").slice(0, 4000)
    if (!text.trim()) return errorResponse(body.id, -32602, "Provide a text message in params.message.parts.")
    const reply = answer(text)
    const taskId = randomUUID()
    return response(body.id, {
      id: taskId,
      contextId: typeof params.contextId === "string" ? params.contextId : randomUUID(),
      status: { state: "completed", timestamp: new Date().toISOString() },
      artifacts: [{ artifactId: randomUUID(), name: "streetspot-public-information", parts: [{ kind: "text", text: reply }] }],
      metadata: { readOnly: true, externalActionsPerformed: false },
    })
  }
  if (body.method === "tasks/get") return errorResponse(body.id, -32602, "This informational endpoint does not persist task history.")
  return errorResponse(body.id, -32601, "Method not found.")
}
