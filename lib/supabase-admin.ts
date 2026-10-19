import { NextRequest } from "next/server"

export type AuthenticatedUser = { id: string; email?: string; role?: string; accessToken: string }

export function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const apiKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !apiKey) throw new Error("Supabase server configuration is missing")
  try {
    const parsed = new URL(url)
    const isSecureProtocol = parsed.protocol === "https:"
    const isLocalHttp = parsed.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname)
    if ((!isSecureProtocol && !isLocalHttp) || parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) throw new Error()
    return { url: parsed.toString().replace(/\/$/, ""), apiKey, anonKey }
  } catch {
    throw new Error("Supabase server configuration is invalid")
  }
}

export async function requireUser(request: NextRequest): Promise<AuthenticatedUser> {
  const authorization = request.headers.get("authorization")
  const token = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1] || request.cookies.get("streetspot_access_token")?.value
  if (!token) throw new Response("Unauthorized", { status: 401 })
  const { url, apiKey } = getSupabaseConfig()
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: apiKey, Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Response("Unauthorized", { status: 401 })
  let value: unknown
  try {
    value = await response.json()
  } catch {
    throw new Response("Unauthorized", { status: 401 })
  }
  if (
    !value ||
    typeof value !== "object" ||
    !("id" in value) ||
    typeof value.id !== "string" ||
    !value.id.trim()
  ) {
    throw new Response("Unauthorized", { status: 401 })
  }
  const user = value as { id: string; email?: unknown; app_metadata?: { role?: unknown } }
  return {
    id: user.id,
    accessToken: token,
    ...(typeof user.email === "string" ? { email: user.email } : {}),
    ...(typeof user.app_metadata?.role === "string" ? { role: user.app_metadata.role } : {}),
  }
}

export async function supabaseFetch<T>(path: string, init: RequestInit = {}, accessToken?: string): Promise<T> {
  const { url, apiKey, anonKey } = getSupabaseConfig()
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${accessToken ?? anonKey ?? apiKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    signal: init.signal ?? AbortSignal.timeout(15000),
    cache: "no-store",
  })
  if (!response.ok) {
    throw new Error(`Supabase request failed (${response.status})`)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export async function supabaseServiceFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url } = getSupabaseConfig()
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error("Supabase server configuration is missing")

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    signal: init.signal ?? AbortSignal.timeout(15000),
    cache: "no-store",
  })
  if (!response.ok) throw new Error(`Supabase service request failed (${response.status})`)
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export function errorResponse(error: unknown) {
  if (error instanceof Response) return error
  if (error instanceof Error && error.message.startsWith("Supabase server configuration")) {
    return Response.json({ ok: false, code: "BACKEND_NOT_CONFIGURED", message: "This feature is unavailable until the server backend is configured." }, { status: 503 })
  }
  if (error instanceof Error && /Supabase request failed \((401|403)\)/.test(error.message)) {
    return Response.json({ ok: false, code: "ACCESS_DENIED", message: "This action requires an authorized account and, for vendor publishing, an active paid vendor subscription." }, { status: 403 })
  }
  if (error instanceof Error && /Supabase request failed \(400\)/.test(error.message)) {
    return Response.json({ ok: false, code: "INVALID_BACKEND_REQUEST", message: "The request could not be completed. Check the submitted details and account permissions." }, { status: 400 })
  }
  if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
    return Response.json({ ok: false, code: "BACKEND_TIMEOUT", message: "The backend took too long to respond. Please try again." }, { status: 503, headers: { "Retry-After": "5" } })
  }
  if (error instanceof TypeError && error.message.toLowerCase().includes("fetch failed")) {
    return Response.json({ ok: false, code: "BACKEND_UNREACHABLE", message: "The server backend is unreachable. Live listings and account actions are temporarily unavailable." }, { status: 503, headers: { "Retry-After": "30" } })
  }
  console.error("[v0] Supabase API error", error)
  return Response.json({ ok: false, code: "DATABASE_ERROR", message: "The request could not be completed." }, { status: 500 })
}
