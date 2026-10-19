import { NextRequest, NextResponse } from "next/server"
import { errorResponse, requireUser, supabaseFetch } from "@/lib/supabase-admin"
export const dynamic = "force-dynamic"
const eventTypes = new Set(["Wedding","Graduation","Birthday","Baby Shower","Anniversary","Family Gathering","Private Party","Other"])
const styles = new Set(["elegant","celebration","street"])
type PrivateEvent = { id:string; title:string; event_type:string; host_name:string; starts_at:string; venue_label:string; latitude:number; longitude:number; invitation_style:string; invitation_message:string; status:"draft"|"published"|"canceled"; created_at:string }
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const events = await supabaseFetch<PrivateEvent[]>(`private_events?host_id=eq.${encodeURIComponent(user.id)}&select=id,title,event_type,host_name,starts_at,venue_label,latitude,longitude,invitation_style,invitation_message,status,created_at&order=starts_at.asc`, {}, user.accessToken)
    return NextResponse.json({ok:true,events},{headers:{"Cache-Control":"no-store"}})
  } catch(error) { return errorResponse(error) }
}
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const body = await request.json().catch(()=>null) as Record<string,unknown>|null
    if (!body || typeof body!=="object" || Array.isArray(body)) return NextResponse.json({ok:false,error:"Send a valid event draft."},{status:400})
    const title=typeof body.title==="string"?body.title.trim():""
    const eventType=typeof body.eventType==="string"?body.eventType:""
    const hostName=typeof body.hostName==="string"?body.hostName.trim():""
    const startsAt=typeof body.startsAt==="string"?new Date(body.startsAt):new Date(Number.NaN)
    const venueLabel=typeof body.venueLabel==="string"?body.venueLabel.trim():""
    const latitude=typeof body.latitude==="number"?body.latitude:Number.NaN
    const longitude=typeof body.longitude==="number"?body.longitude:Number.NaN
    const invitationStyle=typeof body.invitationStyle==="string"?body.invitationStyle:"celebration"
    const invitationMessage=typeof body.invitationMessage==="string"?body.invitationMessage.trim():""
    if(title.length<1||title.length>120||!eventTypes.has(eventType)||hostName.length>100||!Number.isFinite(startsAt.getTime())||startsAt.getTime()<=Date.now()||venueLabel.length<1||venueLabel.length>200||!Number.isFinite(latitude)||latitude < -90||latitude>90||!Number.isFinite(longitude)||longitude < -180||longitude>180||!styles.has(invitationStyle)||invitationMessage.length>1000)
      return NextResponse.json({ok:false,error:"Check the event title, future date, venue, map coordinates, and invitation details."},{status:400})
    const created=await supabaseFetch<PrivateEvent[]>("private_events",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify({host_id:user.id,title,event_type:eventType,host_name:hostName,starts_at:startsAt.toISOString(),venue_label:venueLabel,latitude,longitude,invitation_style:invitationStyle,invitation_message:invitationMessage,status:"draft",is_private:true})},user.accessToken)
    if(!Array.isArray(created)||!created[0]?.id) return NextResponse.json({ok:false,error:"The event draft could not be saved."},{status:502})
    return NextResponse.json({ok:true,event:created[0]},{status:201,headers:{"Cache-Control":"no-store"}})
  } catch(error) { return errorResponse(error) }
}
