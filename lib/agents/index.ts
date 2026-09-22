export type AgentStatus = "ready" | "disabled" | "needs-configuration"

export interface AgentCard {
  id: "marketing" | "store" | "support" | "security"
  name: string
  status: AgentStatus
  description: string
  lastRun: null
  paidServices: false
}

export const AGENTS: AgentCard[] = [
  { id: "marketing", name: "Marketing Agent", status: "ready", description: "Creates deterministic discovery, vendor, and event copy from supplied data.", lastRun: null, paidServices: false },
  { id: "store", name: "Store Agent", status: "ready", description: "Checks release metadata and public policy links without Play Console access.", lastRun: null, paidServices: false },
  { id: "support", name: "Support Agent", status: "ready", description: "Matches questions to local help content and provides escalation guidance.", lastRun: null, paidServices: false },
  { id: "security", name: "Security Agent", status: "ready", description: "Runs local, deterministic checks on routes and configuration shapes.", lastRun: null, paidServices: false },
]

export function createMarketingDraft(subject: string, detail: string) {
  const safeSubject = subject.trim() || "a local StreetSpot discovery"
  const safeDetail = detail.trim() || "Find it, save it, and share it with your community."
  return `Built for the Hustle: discover ${safeSubject}. ${safeDetail} Find your next StreetSpot.`
}

const SUPPORT_ANSWERS = [
  { terms: ["delete", "remove", "account"], answer: "Visit /delete-account and follow the ownership-confirmed request instructions." },
  { terms: ["location", "map", "gps"], answer: "StreetSpot requests one browser location fix for map centering. If permission is denied, choose a location manually." },
  { terms: ["vendor", "business", "claim"], answer: "Use the listing claim workflow when it is available for the spot. Claims require an auditable owner review." },
  { terms: ["event", "invite", "private"], answer: "Private event details should only be shared with invited guests. Contact support if an invitation is missing." },
]

export function answerSupportQuestion(question: string) {
  const normalized = question.toLowerCase()
  return SUPPORT_ANSWERS.find(({ terms }) => terms.some((term) => normalized.includes(term)))?.answer ??
    "I could not match that to StreetSpot help content. Please use the support page to escalate the question."
}
