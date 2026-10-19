import assert from "node:assert/strict"

const base = (process.env.STREETSPOT_SMOKE_BASE_URL || "http://localhost:3100").replace(/\/$/, "")
const password = process.env.STREETSPOT_AGENT_ACCESS_PASSWORD
if (!password || password.length < 24) {
  throw new Error("Set STREETSPOT_AGENT_ACCESS_PASSWORD to the configured server password before running this test.")
}

const results = []
function check(name, condition) {
  assert.ok(condition, name)
  results.push(name)
}

for (const path of ["/agents", "/agents/advertising-search-analyst"]) {
  const page = await fetch(`${base}${path}`, { redirect: "manual" })
  check(`Unauthenticated ${path} redirects to operator sign-in`, page.status >= 300 && page.status < 400 && (page.headers.get("location") || "").includes("/agents/login"))
}
for (const path of ["/host/invitations", "/vendor-studio"]) {
  const page = await fetch(`${base}${path}`, { redirect: "manual" })
  check(`Unauthenticated ${path} redirects to account sign-in`, page.status >= 300 && page.status < 400 && (page.headers.get("location") || "").includes("/account"))
}

const apiUnauth = await fetch(`${base}/api/agents/advertising-search-analyst`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ business: "StreetSpot" }),
})
check("Unauthenticated agent API is rejected", apiUnauth.status === 401)

const authMe = await fetch(`${base}/api/auth/me`, { cache: "no-store" })
check("Account endpoint rejects missing sessions", authMe.status === 401)

const invalidSignIn = await fetch(`${base}/api/auth/sign-in`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "not-an-email", password: "" }),
})
check("Sign-in validates input before contacting Auth", invalidSignIn.status === 400)

const invalidSignUp = await fetch(`${base}/api/auth/sign-up`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "not-an-email", password: "short" }),
})
check("Sign-up validates input before contacting Auth", invalidSignUp.status === 400)

const vendorPublishUnauth = await fetch(`${base}/api/vendors`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Unauthorized Test Vendor", lat: 35, lng: -80, closingTime: "22:00" }),
})
check("Vendor publishing requires a signed-in account", vendorPublishUnauth.status === 401)

const spotCreateUnauth = await fetch(`${base}/api/spots`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Unauthorized Test Spot", type: "other", lat: 35, lng: -80 }),
})
check("Community spot publishing requires a signed-in account", spotCreateUnauth.status === 401)

const badLogin = await fetch(`${base}/api/agents/auth`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password: "incorrect-password-value" }),
})
check("Incorrect password is rejected", badLogin.status === 401)

const login = await fetch(`${base}/api/agents/auth`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password }),
})
if (login.status !== 200) {
  throw new Error(`Correct password login returned HTTP ${login.status}: ${await login.text()}`)
}
check("Correct password creates a session", login.headers.get("set-cookie")?.includes("streetspot_agent_access="))
const cookie = login.headers.get("set-cookie")?.split(";")[0]
assert.ok(cookie, "Expected an agent session cookie")

const privatePage = await fetch(`${base}/agents`, { headers: { Cookie: cookie }, redirect: "manual" })
check("Authenticated operator can open agent console", privatePage.status === 200)

const analyst = await fetch(`${base}/api/agents/advertising-search-analyst`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: cookie },
  body: JSON.stringify({ business: "StreetSpot", audience: "all", goal: "awareness" }),
})
const analystReport = await analyst.json()
check("Authenticated analyst API returns a structured report", analyst.status === 200 && Array.isArray(analystReport.keywordIdeas) && analystReport.keywordIdeas.length > 0)

const logout = await fetch(`${base}/api/agents/auth`, { method: "DELETE", headers: { Cookie: cookie } })
check("Logout clears the session cookie", logout.status === 200 && logout.headers.get("set-cookie")?.includes("Max-Age=0"))

console.log(`PASS ${results.length} access-control smoke tests`)
for (const result of results) console.log(`- ${result}`)
