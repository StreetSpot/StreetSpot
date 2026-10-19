"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LockKeyhole, Mail, UserRound } from "lucide-react"

type Mode = "sign-in" | "sign-up"

export default function AccountPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("sign-in")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    const checkSession = async () => {
      try {
        let response = await fetch("/api/auth/me", { cache: "no-store" })
        if (response.status === 401) {
          const refresh = await fetch("/api/auth/refresh", { method: "POST", cache: "no-store" })
          if (refresh.ok) response = await fetch("/api/auth/me", { cache: "no-store" })
        }
        if (response.ok) {
          const requestedNext = new URLSearchParams(window.location.search).get("next") || "/"
          const nextPath = requestedNext.startsWith("/") && !requestedNext.startsWith("//") && !requestedNext.startsWith("/\\") ? requestedNext : "/"
          router.replace(nextPath)
        }
      } catch {
        // Account screen remains usable when the network is unavailable.
      }
    }
    void checkSession()
  }, [router])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError("")
    setNotice("")
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "The account request failed.")
      if (result.confirmationRequired) {
        setNotice(result.message || "Check your email for the verification link.")
        setPassword("")
        return
      }
      const requestedNext = new URLSearchParams(window.location.search).get("next") || "/"
      const nextPath = requestedNext.startsWith("/") && !requestedNext.startsWith("//") && !requestedNext.startsWith("/\\") ? requestedNext : "/"
      router.replace(nextPath)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The account request failed.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-[70dvh] items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><UserRound className="h-6 w-6" /></div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">StreetSpot account</p>
        <h1 className="mt-2 text-3xl font-black">{mode === "sign-in" ? "Welcome back" : "Join StreetSpot"}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {mode === "sign-in" ? "Sign in to use account-backed StreetSpot features." : "Create an account to save your activity and use account-backed features."}
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold">Email address
            <span className="mt-2 flex h-12 items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input type="email" autoComplete="email" required maxLength={254} value={email} onChange={event=>setEmail(event.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" placeholder="you@example.com" />
            </span>
          </label>
          <label className="block text-sm font-semibold">Password
            <span className="mt-2 flex h-12 items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
              <LockKeyhole className="h-4 w-4 text-muted-foreground" />
              <input type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} required minLength={mode === "sign-up" ? 8 : 1} maxLength={256} value={password} onChange={event=>setPassword(event.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" placeholder={mode === "sign-up" ? "At least 8 characters" : "Your password"} />
            </span>
          </label>
          <button type="submit" disabled={busy} className="min-h-12 w-full rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground transition-opacity disabled:opacity-60">
            {busy ? "Working…" : mode === "sign-in" ? "Sign in" : "Create account"}
          </button>
        </form>
        {error && <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {notice && <p role="status" className="mt-4 rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm">{notice}</p>}
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "sign-in" ? "New to StreetSpot?" : "Already have an account?"}{" "}
          <button type="button" onClick={()=>{setMode(mode === "sign-in" ? "sign-up" : "sign-in");setError("");setNotice("")}} className="font-bold text-primary underline underline-offset-4">
            {mode === "sign-in" ? "Create an account" : "Sign in instead"}
          </button>
        </p>
        <p className="mt-5 text-xs leading-5 text-muted-foreground">Passwords are sent directly to Supabase Auth over HTTPS. Session tokens stay in HttpOnly cookies rather than browser local storage.</p>
      </section>
    </main>
  )
}
