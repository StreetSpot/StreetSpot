"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { LockKeyhole, ShieldCheck } from "lucide-react"

export default function AgentLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      const response = await fetch("/api/agents/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        cache: "no-store",
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Sign-in failed.")
      router.replace("/agents")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-in failed.")
    } finally {
      setBusy(false)
    }
  }

  return <main className="flex min-h-dvh items-center justify-center bg-[#111116] px-4 py-10 text-white">
    <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1b1b22] p-7 shadow-2xl">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#B6FF38] text-slate-950"><LockKeyhole className="h-7 w-7"/></div>
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#B6FF38]">StreetSpot private operations</p>
      <h1 className="mt-2 text-3xl font-black">Agent console sign-in</h1>
      <p className="mt-3 text-sm leading-6 text-slate-300">This area is restricted to the authorized StreetSpot operator. Access is checked on the server, not hidden with a cosmetic lock icon.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold">Operations password
          <input type="password" autoComplete="current-password" required minLength={24} maxLength={256} value={password} onChange={event=>setPassword(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/15 bg-black/30 px-3 outline-none focus:border-[#B6FF38]" />
        </label>
        <button disabled={busy} className="min-h-12 w-full rounded-xl bg-[#B6FF38] px-4 py-3 font-extrabold text-slate-950 disabled:opacity-60">{busy ? "Checking access…" : "Unlock operations console"}</button>
        {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-950/40 p-3 text-sm text-red-200">{error}</p>}
      </form>
      <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-400"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0"/> Protected pages and agent API requests require a valid HttpOnly session cookie. Sessions expire after 12 hours.</p>
    </section>
  </main>
}
