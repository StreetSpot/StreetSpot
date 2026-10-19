import { createHash } from "node:crypto"
import { NextRequest,NextResponse } from "next/server"
import { errorResponse,requireUser,supabaseFetch,supabaseServiceFetch } from "@/lib/supabase-admin"
export const runtime="nodejs"
export const dynamic="force-dynamic"
export async function POST(request:NextRequest) {
 try {
  const user=await requireUser(request)
  if(!user.email) return NextResponse.json({ok:false,error:"Sign in with the email address that received this invitation."},{status:403})
  const body=await request.json().catch(()=>null) as {token?:unknown}|null
  const token=typeof body?.token==="string"?body.token.trim():""
  if(!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return NextResponse.json({ok:false,error:"This invitation link is invalid."},{status:400})
  const hash=createHash("sha256").update(token).digest("hex")
  const rows=await supabaseServiceFetch<Array<{id:string;event_id:string;invited_email:string;status:string;expires_at:string}>>(`private_event_invites?token_hash=eq.${encodeURIComponent(hash)}&select=id,event_id,invited_email,status,expires_at&limit=1`)
  const invite=rows[0]
  if(!invite||invite.status!=="invited"||Date.parse(invite.expires_at)<=Date.now()||invite.invited_email.toLowerCase()!==user.email.toLowerCase()) return NextResponse.json({ok:false,error:"This invitation is expired, already used, or belongs to a different email address."},{status:403})
  await supabaseServiceFetch("private_event_invites?id=eq."+encodeURIComponent(invite.id)+"&status=eq.invited",{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({invited_user_id:user.id,status:"accepted"})})
  const events=await supabaseFetch<Array<Record<string,unknown>>>(`private_events?id=eq.${encodeURIComponent(invite.event_id)}&select=id,title,event_type,host_name,starts_at,venue_label,latitude,longitude,invitation_style,invitation_message,status&limit=1`,{},user.accessToken)
  if(!events[0]) return NextResponse.json({ok:false,error:"The invitation was accepted, but the event is not available."},{status:404})
  return NextResponse.json({ok:true,event:events[0]},{headers:{"Cache-Control":"no-store"}})
 } catch(error){return errorResponse(error)}
}
