const base = (process.env.STREETSPOT_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const failures = []
async function check(path, options, validate) {
  try {
    const response = await fetch(`${base}${path}`, options)
    const bodyText = await response.text()
    let body
    try { body = bodyText ? JSON.parse(bodyText) : null } catch { body = bodyText }
    if (!validate(response, body)) failures.push(`${path}: validation failed (HTTP ${response.status})`)
    else console.log(`PASS ${path} (${response.status})`)
    return { response, body }
  } catch (error) {
    failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}`)
    return { response: null, body: null }
  }
}

for (const path of ['/auth.md','/agent-docs.md','/openapi.json','/.well-known/agent-card.json','/.well-known/mcp/server-card.json','/.well-known/agent-skills/index.json','/.well-known/api-catalog','/.well-known/ai-catalog.json','/.well-known/oauth-protected-resource']) {
  await check(path, {}, (res) => res.status === 200)
}
await check('/.well-known/oauth-protected-resource', {}, (res, body) => res.status === 200 && body?.resource === 'https://streetspotapp.com' && body?.authorization_servers?.includes('https://cdmxgadatzkbqcphkhqv.supabase.co/auth/v1'))
await check('/api/health', {}, (res, body) => res.status === 200 && body?.ok === true)
await check('/', { headers: { Accept: 'text/markdown' } }, (res, body) => res.status === 200 && res.headers.get('content-type')?.includes('text/markdown') && typeof body === 'string' && body.includes('# StreetSpot'))
await check('/', {}, (res) => res.status === 200 && Boolean(res.headers.get('link')?.includes('api-catalog')))
await check('/api/mcp', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26', capabilities: {} } }) }, (res, body) => res.status === 200 && body?.result?.serverInfo?.name === 'streetspot-public-mcp')
await check('/api/mcp', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }) }, (res, body) => res.status === 200 && body?.result?.tools?.some((tool) => tool.name === 'streetspot_overview'))
await check('/api/mcp', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'streetspot_public_links', arguments: {} } }) }, (res, body) => res.status === 200 && body?.result?.content?.[0]?.text?.includes('streetspotapp.com/support'))
await check('/api/agents/a2a', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 4, method: 'message/send', params: { message: { role: 'user', parts: [{ kind: 'text', text: 'Tell me about StreetSpot' }] } } }) }, (res, body) => res.status === 200 && body?.result?.status?.state === 'completed' && body?.result?.artifacts?.length > 0)
if (failures.length) {
  console.error(`\n${failures.length} smoke test(s) failed:\n- ${failures.join('\n- ')}`)
  process.exitCode = 1
} else console.log(`\nAll StreetSpot agent discovery smoke tests passed for ${base}`)
