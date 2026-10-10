import { NextRequest, NextResponse } from "next/server"

interface DnsAnswer {
  name: string
  type: number
  TTL: number
  data: string
}

interface DnsResponse {
  Status: number
  Answer?: DnsAnswer[]
  Authority?: DnsAnswer[]
}

const RECORD_TYPES: Record<string, number> = {
  A: 1,
  NS: 2,
  CNAME: 5,
  TXT: 16,
  AAAA: 28,
}

async function queryCloudflareDoH(name: string, type: string): Promise<DnsResponse | null> {
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`, {
      headers: {
        Accept: "application/dns-json",
      },
      next: { revalidate: 30 },
    })

    if (!res.ok) return null
    return (await res.json()) as DnsResponse
  } catch (error) {
    console.error(`Error querying DoH for ${name} (${type}):`, error)
    return null
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const domain = searchParams.get("domain") || "streetspotapp.com"

  // 1. Query NS records to see if Cloudflare is the active DNS provider
  const nsResult = await queryCloudflareDoH(domain, "NS")
  const nsRecords = nsResult?.Answer?.map((a) => a.data) || []
  const isCloudflareNameserver = nsRecords.some((ns) => ns.toLowerCase().includes("cloudflare.com"))

  // 2. Query A and CNAME for apex
  const aResult = await queryCloudflareDoH(domain, "A")
  const aRecords = aResult?.Answer?.map((a) => a.data) || []

  const cnameResult = await queryCloudflareDoH(domain, "CNAME")
  const cnameRecords = cnameResult?.Answer?.map((a) => a.data) || []

  // 3. Query CNAME for www
  const wwwResult = await queryCloudflareDoH(`www.${domain}`, "CNAME")
  const wwwCnameRecords = wwwResult?.Answer?.map((a) => a.data) || []

  const wwwAResult = await queryCloudflareDoH(`www.${domain}`, "A")
  const wwwARecords = wwwAResult?.Answer?.map((a) => a.data) || []

  // 4. Test live HTTP/HTTPS reachability
  let httpsStatus: {
    reachable: boolean
    statusCode?: number
    isCloudflareProxy?: boolean
    cfRay?: string | null
    server?: string | null
    error?: string
  } = { reachable: false }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    const testRes = await fetch(`https://${domain}`, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": "StreetSpot-Domain-Health-Check/1.0",
      },
    }).catch(() => null)

    clearTimeout(timeout)

    if (testRes) {
      const serverHeader = testRes.headers.get("server") || ""
      const cfRay = testRes.headers.get("cf-ray")
      const isCloudflare = serverHeader.toLowerCase().includes("cloudflare") || !!cfRay

      httpsStatus = {
        reachable: true,
        statusCode: testRes.status,
        isCloudflareProxy: isCloudflare,
        cfRay,
        server: serverHeader || undefined,
      }
    }
  } catch (err: any) {
    httpsStatus = {
      reachable: false,
      error: err?.message || "Connection timed out",
    }
  }

  const isConfigured =
    (aRecords.length > 0 || cnameRecords.length > 0) &&
    (isCloudflareNameserver || httpsStatus.isCloudflareProxy)

  return NextResponse.json({
    domain,
    checkedAt: new Date().toISOString(),
    isConfigured,
    dns: {
      nameservers: nsRecords,
      isCloudflareNameserver,
      apex: {
        a: aRecords,
        cname: cnameRecords,
      },
      www: {
        cname: wwwCnameRecords,
        a: wwwARecords,
      },
    },
    http: httpsStatus,
    targetHost: "ais-pre-wvkjq5rxiwrz3xw6dkmgou-197495457505.us-west1.run.app",
  })
}
