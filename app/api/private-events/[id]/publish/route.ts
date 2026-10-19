import { NextRequest,NextResponse } from "next/server"
import { errorResponse,requireUser,supabaseFetch,supabaseServiceFetch } from "@/lib/supabase-admin"
export const dynamic="force-dynamic"
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export async function POST(request:NextRequest,context:{params:Promise<{id:string}>}) {
 try {
  const user=await requireUser(request); const {id}=await context.params
  if(!uuid.test(id)) return NextResponse.json({ok:false,error:"Invalid event id."},{status:400})
  const events=await supabaseFetch<Array<{id:string;starts_at:string}>>(`private_events?id=eq.${encodeURIComponent(id)}&host_id=eq.${encodeURIComponent(user.id)}&select=id,starts_at&limit=1`,{},user.accessToken)
  const event=events[0]
  if(!event) return NextResponse.json({ok:false,error:"Event not found."},{status:404})
  if(Date.parse(event.starts_at)<=Date.now()) return NextResponse.json({ok:false,error:"Past events cannot be published."},{status:400})
  const purchases=await supabaseServiceFetch<Array<{tier:string;status:string;guest_limit:number}>>(`event_hosting_purchases?event_id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(user.id)}&status=eq.paid&select=tier,status,guest_limit&limit=1`)
  if(!purchases[0]) return NextResponse.json({ok:false,error:"A confirmed event-hosting payment is required before publishing."},{status:402})
  const updated=await supabaseFetch<Array<{id:string;status:string}>>(`private_events?id=eq.${encodeURIComponent(id)}&host_id=eq.${encodeURIComponent(user.id)}`,{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify({status:"published",updated_at:new Date().toISOString()})},user.accessToken)
  return NextResponse.json({ok:true,event:updated[0]??{id,status:"published"},purchase:purchases[0]},{headers:{"Cache-Control":"no-store"}})
 } catch(error){return errorResponse(error)}
}
