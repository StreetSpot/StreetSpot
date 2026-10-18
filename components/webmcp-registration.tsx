'use client'

import { useEffect } from 'react'

type WebMCPTool = {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  execute: (input: Record<string, unknown>, context?: { signal?: AbortSignal }) => Promise<{ content: { type: 'text'; text: string }[] }>
}
type WebMCPContext = {
  registerTool: (tool: WebMCPTool) => void | (() => void) | { unregister?: () => void }
}
declare global {
  interface Navigator { modelContext?: WebMCPContext }
}

const links = {
  website: 'https://streetspotapp.com',
  support: 'https://streetspotapp.com/support',
  privacy: 'https://streetspotapp.com/privacy',
  terms: 'https://streetspotapp.com/terms',
  deleteAccount: 'https://streetspotapp.com/delete-account',
}

export function WebMCPRegistration() {
  useEffect(() => {
    const context = navigator.modelContext
    if (!context || typeof context.registerTool !== 'function') return
    const tools: WebMCPTool[] = [
      {
        name: 'streetspot_get_public_info',
        description: 'Get a factual overview of StreetSpot and the limits of public agent access.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        execute: async () => ({ content: [{ type: 'text', text: 'StreetSpot is a local discovery platform for vendors, food trucks, pop-up shops, businesses, events, and community spots. This browser tool provides public information only and does not access private data or perform external actions.' }] }),
      },
      {
        name: 'streetspot_get_public_links',
        description: 'Get official StreetSpot website, support, privacy, terms, and account deletion links.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        execute: async () => ({ content: [{ type: 'text', text: JSON.stringify(links, null, 2) }] }),
      },
    ]
    const cleanups: (() => void)[] = []
    for (const tool of tools) {
      try {
        const registration = context.registerTool(tool)
        if (typeof registration === 'function') cleanups.push(registration)
        else if (registration && typeof registration.unregister === 'function') cleanups.push(() => registration.unregister?.())
      } catch {
        // Browser implementations may reject registration when the API is experimental.
      }
    }
    return () => cleanups.forEach((cleanup) => cleanup())
  }, [])
  return null
}
