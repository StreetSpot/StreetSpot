"use client"

import { useState } from "react"
import { LogIn, Store } from "lucide-react"

interface VendorLoginProps {
  onLogin: (name: string) => void
}

export function VendorLogin({ onLogin }: VendorLoginProps) {
  const [name, setName] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim()) {
      onLogin(name.trim())
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
            Founder Login
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Enter your business name to access the vendor dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="vendor-name"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Business Name
            </label>
            <input
              id="vendor-name"
              type="text"
              placeholder="e.g. Taco Royale"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <LogIn className="h-4 w-4" />
            <span>Access Dashboard</span>
          </button>
        </form>
      </div>
    </div>
  )
}
