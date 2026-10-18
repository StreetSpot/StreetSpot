import { createHash } from "node:crypto"
import { NextRequest } from "next/server"
import { supabaseFetch } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type InviteRow = { id: string; event_id: string; invited_email: string; expires_at: string; status: string }
type EventRow = {
  title: string
  event_type: string
  host_name: string
  starts_at: string
  venue_label: string
  latitude: number
  longitude: number
  invitation_style: string
  invitation_message: string
}

export async function GET(_request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params
  if (!/^[A-Za-z0-9_-]{40,64}$/.test(token)) {
    return Response.json({ ok: false, message: "This invitation link is invalid or has expired." }, { status: 404, headers: { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" } })
  }
  try {
    const tokenHash = createHash("sha256").update(token).digest("hex")
    const invites = await supabaseFetch<InviteRow[]>(
      `private_event_invites?token_hash=eq.${encodeURIComponent(tokenHash)}&status=eq.invited&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=id,event_id,invited_email,expires_at,status&limit=1`
    )
    const invite = invites[0]
    if (!invite) {
      return Response.json({ ok: false, message: "This invitation link is invalid or has expired." }, { status: 404, headers: { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" } })
    }
    const events = await supabaseFetch<EventRow[]>(
      `private_events?id=eq.${encodeURIComponent(invite.event_id)}&is_private=eq.true&status=eq.published&select=title,event_type,host_name,starts_at,venue_label,latitude,longitude,invitation_style,invitation_message&limit=1`
    )
    const event = events[0]
    if (!event) {
      return Response.json({ ok: false, message: "This private event is no longer available." }, { status: 404, headers: { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" } })
    }
    return Response.json({
      ok: true,
      invite: { invitedEmail: invite.invited_email, expiresAt: invite.expires_at },
      event: {
        title: event.title, eventType: event.event_type, hostName: event.host_name,
        startsAt: event.starts_at, venueLabel: event.venue_label,
        latitude: event.latitude, longitude: event.longitude,
        invitationStyle: event.invitation_style, invitationMessage: event.invitation_message,
      },
    }, { headers: { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" } })
  } catch {
    return Response.json({ ok: false, message: "The private invitation could not be loaded right now." }, { status: 503, headers: { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" } })
  }
}
