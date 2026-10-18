"use client"

import { useState } from "react"
import { LogIn, Store, UserPlus, LoaderCircle } from "lucide-react"

export type StreetSpotAuthSession = {
  access_token: string
  refresh_token: string
  user: { id: string; email?: string; user_metadata?: { business_name?: string } }
}

interface VendorLoginProps {
  onLogin: (name: string, session: StreetSpotAuthSession) => void
}

export function VendorLogin({ onLogin }: VendorLoginProps) {
  const [mode, setMode] = useState<"login" | "signup">("signup")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError("")
    setNotice("")
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      if (!supabaseUrl || !apiKey) throw new Error("Account service is not configured yet. Please contact StreetSpot support.")

      const endpoint = mode === "signup"
        ? `${supabaseUrl}/auth/v1/signup`
        : `${supabaseUrl}/auth/v1/token?grant_type=password`
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { apikey: apiKey, "Content-Type": "application/json" },
        body: JSON.stringify(mode === "signup"
          ? { email: email.trim().toLowerCase(), password, data: { business_name: name.trim() } }
          : { email: email.trim().toLowerCase(), password }),
        cache: "no-store",
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) {
        const message = typeof result?.msg === "string" ? result.msg
          : typeof result?.message === "string" ? result.message
          : typeof result?.error_description === "string" ? result.error_description
          : "StreetSpot could not complete sign-in. Check your details and try again."
        throw new Error(message)
      }

      if (!result?.access_token || !result?.refresh_token || !result?.user?.id) {
        setNotice("Account created. Check your email for the verification link, then return here and sign in.")
        setMode("login")
        setPassword("")
        return
      }

      const session = result as StreetSpotAuthSession
      sessionStorage.setItem("streetspot_auth_session", JSON.stringify(session))
      const accountName = name.trim() || session.user.user_metadata?.business_name || email.split("@")[0] || "StreetSpot Vendor"
      onLogin(accountName, session)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-in failed. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-57px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              <Store className="h-7 w-7 text-primary" />
            </div>
          </div>
          <h2 className="mb-2 text-balance text-2xl font-bold tracking-tight text-foreground">
            StreetSpot Account
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Create an account or sign in to manage your StreetSpot features. Your account is verified by the authentication service, not just a name typed into a box.
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 rounded-xl border border-border bg-card p-1">
          <button type="button" onClick={() => { setMode("signup"); setError(""); setNotice("") }} className={`min-h-10 rounded-lg text-sm font-semibold ${mode === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <UserPlus className="mr-1.5 inline h-4 w-4" /> Create account
          </button>
          <button type="button" onClick={() => { setMode("login"); setError(""); setNotice("") }} className={`min-h-10 rounded-lg text-sm font-semibold ${mode === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <LogIn className="mr-1.5 inline h-4 w-4" /> Sign in
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && <div>
            <label htmlFor="vendor-name" className="mb-1.5 block text-sm font-medium text-foreground">Business Name</label>
            <input id="vendor-name" type="text" placeholder="e.g. Taco Royale" value={name} onChange={(event) => setName(event.target.value)} required maxLength={160} autoComplete="organization" className="h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>}
          <div>
            <label htmlFor="vendor-email" className="mb-1.5 block text-sm font-medium text-foreground">Email Address</label>
            <input id="vendor-email" type="email" placeholder="you@yourbusiness.com" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} autoComplete="email" className="h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label htmlFor="vendor-password" className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
            <input id="vendor-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={128} autoComplete={mode === "signup" ? "new-password" : "current-password"} className="h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            {mode === "signup" && <p className="mt-1 text-xs text-muted-foreground">Use at least 8 characters.</p>}
          </div>
          <button type="submit" disabled={busy || !email.trim() || password.length < 8 || (mode === "signup" && !name.trim())} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : mode === "signup" ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            {busy ? "Connecting securely..." : mode === "signup" ? "Create vendor account" : "Sign in to dashboard"}
          </button>
        </form>

        {notice && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-5 text-emerald-900">{notice}</p>}
        {error && <p role="alert" className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm leading-5 text-red-900">{error}</p>}
        <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">Subscriptions are paid separately. Creating an account does not publish a listing or start a charge.</p>
      </div>
    </div>
  )
}
