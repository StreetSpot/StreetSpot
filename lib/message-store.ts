import { useSyncExternalStore } from "react"

export interface Message {
  id: string
  conversationId: string
  fromName: string
  toName: string
  body: string
  createdAt: number
  read: boolean
}

export interface Conversation {
  id: string
  vendorId: string
  vendorName: string
  customerName: string
  consentGiven: boolean
  createdAt: number
}

const MSG_KEY = "streetspot_messages"
const CONV_KEY = "streetspot_conversations"

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveJSON(key: string, data: unknown) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
}

let messages: Message[] = []
let conversations: Conversation[] = []
let listeners: Array<() => void> = []
let initialized = false

function ensureInit() {
  if (!initialized && typeof window !== "undefined") {
    messages = loadJSON(MSG_KEY, [])
    conversations = loadJSON(CONV_KEY, [])
    initialized = true
  }
}

function emitChange() {
  for (const listener of listeners) listener()
}

export const messageStore = {
  subscribe(listener: () => void) {
    listeners = [...listeners, listener]
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },
  getMessages(): Message[] {
    ensureInit()
    return messages
  },
  getConversations(): Conversation[] {
    ensureInit()
    return conversations
  },
  createConversation(data: Omit<Conversation, "id" | "createdAt" | "consentGiven">) {
    ensureInit()
    const conv: Conversation = {
      ...data,
      id: `conv-${Date.now()}`,
      consentGiven: false,
      createdAt: Date.now(),
    }
    conversations = [conv, ...conversations]
    saveJSON(CONV_KEY, conversations)
    emitChange()
    return conv
  },
  grantConsent(conversationId: string) {
    ensureInit()
    conversations = conversations.map((c) =>
      c.id === conversationId ? { ...c, consentGiven: true } : c
    )
    saveJSON(CONV_KEY, conversations)
    emitChange()
  },
  sendMessage(msg: Omit<Message, "id" | "createdAt" | "read">) {
    ensureInit()
    const newMsg: Message = {
      ...msg,
      id: `msg-${Date.now()}`,
      createdAt: Date.now(),
      read: false,
    }
    messages = [...messages, newMsg]
    saveJSON(MSG_KEY, messages)
    emitChange()
    return newMsg
  },
  getConversationMessages(conversationId: string) {
    ensureInit()
    return messages.filter((m) => m.conversationId === conversationId)
  },
}

export function useMessages() {
  return useSyncExternalStore(
    messageStore.subscribe,
    messageStore.getMessages,
    () => []
  )
}

export function useConversations() {
  return useSyncExternalStore(
    messageStore.subscribe,
    messageStore.getConversations,
    () => []
  )
}
