import { NextRequest,NextResponse } from "next/server"
import { errorResponse,requireUser,supabaseFetch } from "@/lib/supabase-admin"
export const dynamic="force-dynamic"
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export async function GET(request:NextRequest,context:{params:Promise<{id:string}>}) {
 try {
  const user=await requireUser(request); const {id}=await context.params
  if(!uuid.test(id)) return NextResponse.json({ok:false,error:"Invalid event id."},{status:400})
  const events=await supabaseFetch<Array<Record<string,unknown>>>(`private_events?id=eq.${encodeURIComponent(id)}&select=id,host_id,title,event_type,host_name,starts_at,venue_label,latitude,longitude,invitation_style,invitation_message,status,created_at&limit=1`,{},user.accessToken)
  if(!events[0]) return NextResponse.json({ok:false,error:"Event not found or you are not invited."},{status:404})
  return NextResponse.json({ok:true,event:events[0]},{headers:{"Cache-Control":"no-store"}})
 } catch(error){return errorResponse(error)}
}
