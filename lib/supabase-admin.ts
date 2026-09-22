import { NextRequest } from "next/server"

export type AuthenticatedUser = { id: string; email?: string }

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) throw new Error("Supabase server configuration is missing")
  return { url: url.replace(/\/$/, ""), serviceRoleKey }
}

export async function requireUser(request: NextRequest): Promise<AuthenticatedUser> {
  const authorization = request.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) throw new Response("Unauthorized", { status: 401 })
  const { url, serviceRoleKey } = config()
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: serviceRoleKey, Authorization: authorization },
    cache: "no-store",
  })
  if (!response.ok) throw new Response("Unauthorized", { status: 401 })
  return (await response.json()) as AuthenticatedUser
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
    cache: "no-store",
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Supabase request failed (${response.status}): ${detail.slice(0, 300)}`)
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
    cache: "no-store",
  })
  if (!response.ok) throw new Error(`Supabase auth request failed (${response.status})`)
  return response.status === 204 ? undefined : response.json()
}

export function errorResponse(error: unknown) {
  if (error instanceof Response) return error
  console.error("[v0] Supabase API error", error)
  return Response.json({ ok: false, code: "DATABASE_ERROR", message: "The request could not be completed." }, { status: 500 })
}
