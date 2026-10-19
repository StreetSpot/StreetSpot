import { NextResponse } from "next/server"

export const dynamic = "force-static"

export async function GET() {
  return NextResponse.json({
    resource: "https://streetspotapp.com",
    authorization_servers: ["https://cdmxgadatzkbqcphkhqv.supabase.co/auth/v1"],
    bearer_methods_supported: ["header"],
    resource_name: "StreetSpot API",
    resource_documentation: "https://streetspotapp.com/agent-docs.md",
    resource_policy_uri: "https://streetspotapp.com/privacy",
    resource_tos_uri: "https://streetspotapp.com/terms",
  }, {
    headers: { "Cache-Control": "public, max-age=300" },
  })
}
