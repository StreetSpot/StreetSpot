import { NextRequest } from "next/server"

export type AuthenticatedUser = { id: string; email?: string }

function config() {
  // Prefer the server-only URL; keep the public variable as a backward-compatible fallback.
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) throw new Error("Supabase server configuration is missing")
  try {
    const parsed = new URL(url)
    const isSecureProtocol = parsed.protocol === "https:"
    const isLocalHttp = parsed.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname)
    if ((!isSecureProtocol && !isLocalHttp) || parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) throw new Error()
    return { url: parsed.toString().replace(/\/$/, ""), serviceRoleKey }
  } catch {
    throw new Error("Supabase server configuration is invalid")
  }
}

export async function requireUser(request: NextRequest): Promise<AuthenticatedUser> {
  const authorization = request.headers.get("authorization")
  const token = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1]
  if (!token) throw new Response("Unauthorized", { status: 401 })
  const { url, serviceRoleKey } = config()
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${token}` },
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
  const user = value as { id: string; email?: unknown }
  return {
    id: user.id,
    ...(typeof user.email === "string" ? { email: user.email } : {}),
  }
}

export async function supabaseFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url, serviceRoleKey } = config()
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
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

export async function supabaseAuthAdmin(path: string, init: RequestInit = {}) {
  const { url, serviceRoleKey } = config()
  const response = await fetch(`${url}/auth/v1/admin/${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    signal: init.signal ?? AbortSignal.timeout(15000),
    cache: "no-store",
  })
  if (!response.ok) throw new Error(`Supabase auth request failed (${response.status})`)
  return response.status === 204 ? undefined : response.json()
}

export function errorResponse(error: unknown) {
  if (error instanceof Response) return error
  if (error instanceof Error && error.message.startsWith("Supabase server configuration")) {
    return Response.json({ ok: false, code: "BACKEND_NOT_CONFIGURED", message: "This feature is unavailable until the server backend is configured." }, { status: 503 })
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
