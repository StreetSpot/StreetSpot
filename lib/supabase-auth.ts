import { NextResponse } from "next/server"

export type SupabaseSession = {
  access_token?: unknown
  refresh_token?: unknown
  expires_in?: unknown
  user?: { id?: unknown; email?: unknown }
}

const ACCESS_COOKIE = "streetspot_access_token"
const REFRESH_COOKIE = "streetspot_refresh_token"
const isProduction = process.env.NODE_ENV === "production"

export function setSessionCookies(response: NextResponse, session: SupabaseSession) {
  if (typeof session.access_token !== "string" || typeof session.refresh_token !== "string") return
  const expiresIn = typeof session.expires_in === "number" ? Math.max(60, Math.min(session.expires_in, 86400)) : 3600
  const options = { httpOnly: true, secure: isProduction, sameSite: "lax" as const, path: "/" }
  response.cookies.set(ACCESS_COOKIE, session.access_token, { ...options, maxAge: expiresIn })
  response.cookies.set(REFRESH_COOKIE, session.refresh_token, { ...options, maxAge: 60 * 60 * 24 * 30 })
  response.headers.set("Cache-Control", "no-store")
}

export function clearSessionCookies(response: NextResponse) {
  const options = { httpOnly: true, secure: isProduction, sameSite: "lax" as const, path: "/", maxAge: 0 }
  response.cookies.set(ACCESS_COOKIE, "", options)
  response.cookies.set(REFRESH_COOKIE, "", options)
  response.headers.set("Cache-Control", "no-store")
}

export function publicUser(session: SupabaseSession) {
  const user = session.user
  return {
    id: typeof user?.id === "string" ? user.id : "",
    email: typeof user?.email === "string" ? user.email : "",
  }
}
