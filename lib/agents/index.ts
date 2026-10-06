/**
 * Local, deterministic agent registry and task coordinator.
 * This is an application-side workflow boundary, not a connection to AI or
 * external accounts. Jobs are in-memory and intentionally have no side effects.
 */
export type AgentId =
  | "play-store"
  | "console-compliance"
  | "marketing-growth"
  | "advertising"
  | "media-content"
  | "store-management"
  | "support"
  | "analytics-data"
  | "beehiiv-newsletter"

export type AgentStatus = "ready" | "disabled" | "needs-configuration"
export type AgentJobStatus = "queued" | "running" | "completed" | "blocked"

export interface AgentCard {
  id: AgentId
  name: string
  status: AgentStatus
  description: string
  capabilities: readonly string[]
  externalAccess: false
}

export interface AgentJob {
  id: string
  agentId: AgentId
  task: string
  status: AgentJobStatus
  result?: string
  resultIsVerified?: false
  createdAt: string
}

export const MAIN_AGENT = {
  id: "main-orchestrator" as const,
  role: "Routes scoped, reviewable work to registered specialists.",
  safeguards: [
    "No external account access or production writes",
    "No secrets in task context or results",
    "No fabricated metrics, provider connections, or compliance outcomes",
    "Production-sensitive actions require verified human authorization and a connected executor",
    "Jobs remain isolated to their selected specialist scope",
  ] as const,
}

export const AGENTS: readonly AgentCard[] = [
  { id: "play-store", name: "Play Store Agent", status: "needs-configuration", description: "Local release-readiness and policy URL checks; no Play Console access.", capabilities: ["release-readiness", "store-metadata", "policy-links"], externalAccess: false },
  { id: "console-compliance", name: "Console / Compliance Agent", status: "needs-configuration", description: "Prepares local compliance checklists; cannot inspect Console declarations or warnings.", capabilities: ["compliance-preflight", "release-blockers"], externalAccess: false },
  { id: "marketing-growth", name: "Marketing / Growth Agent", status: "ready", description: "Drafts discovery and growth content for customers, vendors, businesses, event hosts, and communities.", capabilities: ["seo", "audience-planning", "campaign-drafts"], externalAccess: false },
  { id: "advertising", name: "Advertising Agent", status: "disabled", description: "Campaign planning only; ad accounts, spending, and launches are not connected.", capabilities: ["audience-segments", "ad-copy-drafts", "performance-review-from-supplied-data"], externalAccess: false },
  { id: "media-content", name: "Media / Content Agent", status: "ready", description: "Prepares social, video, YouTube, and store-asset briefs without publishing.", capabilities: ["social-drafts", "video-briefs", "creative-requests"], externalAccess: false },
  { id: "store-management", name: "Store Management Agent", status: "needs-configuration", description: "Reviews local app/store assets; ratings, reviews, and release health require external access.", capabilities: ["asset-inventory", "metadata-review"], externalAccess: false },
  { id: "support", name: "Support Agent", status: "ready", description: "Matches questions to local help content and escalates to official support.", capabilities: ["help-content", "escalation"], externalAccess: false },
  { id: "analytics-data", name: "Analytics / Data Agent", status: "disabled", description: "Can summarize only metrics supplied to a task; no analytics source is connected.", capabilities: ["supplied-data-summary", "report-outline"], externalAccess: false },
  { id: "beehiiv-newsletter", name: "beehiiv Newsletter Agent", status: "needs-configuration", description: "Newsletter preparation architecture; beehiiv credentials and publication are not configured.", capabilities: ["signup-architecture", "content-preparation", "segmentation-plan"], externalAccess: false },
]

const jobs = new Map<string, AgentJob>()
const PRODUCTION_SENSITIVE = /\b(publish|send|launch|spend|charge|delete|deploy|change settings|write to production)\b/i
const SECRET_LIKE = /(?:sk_live_|service_role|api[_-]?key\s*[:=]|client_secret\s*[:=]|password\s*[:=])/i

export function createMarketingDraft(subject: string, detail: string) {
  const safeSubject = subject.trim() || "a local StreetSpot discovery"
  const safeDetail = detail.trim() || "Find it, save it, and share it with your community."
  return `Built for the Hustle: discover ${safeSubject}. ${safeDetail} Find your next StreetSpot.`
}

/** Route one task into a bounded specialist queue; this never calls an external service. */
export function dispatchAgentTask(agentId: AgentId, task: string): AgentJob {
  const agent = AGENTS.find((entry) => entry.id === agentId)
  if (!agent) throw new Error("Unknown specialist agent")
  if (typeof task !== "string" || task.trim().length === 0 || task.length > 4000) throw new Error("Task must contain 1–4000 characters")
  if (SECRET_LIKE.test(task)) throw new Error("Secrets must not be included in agent task context")
  const sensitive = PRODUCTION_SENSITIVE.test(task)
  // No trusted authorization service or external executor exists in this repo.
  const status: AgentJobStatus = agent.status === "disabled" || sensitive ? "blocked" : "queued"
  const job: AgentJob = {
    id: crypto.randomUUID(),
    agentId,
    task: task.trim(),
    status,
    resultIsVerified: false,
    result: status === "blocked"
      ? sensitive
        ? "Blocked: a verified human authorization and a connected executor are required before this production-sensitive action."
        : "Blocked: this specialist has no active external integration."
      : undefined,
    createdAt: new Date().toISOString(),
  }
  jobs.set(job.id, job)
  return { ...job }
}

export function getAgentJob(jobId: string): AgentJob | undefined {
  const job = jobs.get(jobId)
  return job ? { ...job } : undefined
}

/** Store a supplied specialist result; this function does not validate external claims. */
export function recordAgentResult(jobId: string, result: string): AgentJob {
  const job = jobs.get(jobId)
  if (!job) throw new Error("Agent job not found")
  if (job.status !== "queued" || typeof result !== "string" || result.trim().length === 0 || result.length > 8000) {
    throw new Error("A queued job and a 1–8000 character result are required")
  }
  if (SECRET_LIKE.test(result)) throw new Error("Secret-like content must not be stored in an agent result")
  const completed = { ...job, status: "completed" as const, result: result.trim(), resultIsVerified: false as const }
  jobs.set(jobId, completed)
  return { ...completed }
}

export function listAgentJobs(): AgentJob[] {
  return Array.from(jobs.values(), (job) => ({ ...job }))
}

export function answerSupportQuestion(question: string) {
  const normalized = question.toLowerCase()
  const answers = [
    { terms: ["delete", "remove", "account"], answer: "Visit https://streetspotapp.com/delete-account for the available account and browser data deletion options." },
    { terms: ["location", "map", "gps"], answer: "StreetSpot uses listing coordinates first. Your location is requested only when you choose the locate control." },
    { terms: ["vendor", "business", "claim"], answer: "A listing claim must be reviewed before ownership changes. Client-side claim status is not identity verification." },
    { terms: ["event", "invite", "private"], answer: "Private event details should only be shared with invited guests. Contact support if an invitation is missing." },
  ]
  return answers.find(({ terms }) => terms.some((term) => normalized.includes(term)))?.answer ??
    "I could not match that to StreetSpot help content. Please use https://streetspotapp.com/support to escalate the question."
}
