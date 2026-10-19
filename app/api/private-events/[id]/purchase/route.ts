import { NextRequest,NextResponse } from "next/server"
import { errorResponse,requireUser,supabaseFetch,supabaseServiceFetch } from "@/lib/supabase-admin"
export const dynamic="force-dynamic"
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export async function GET(request:NextRequest,context:{params:Promise<{id:string}>}) {
 try {
  const user=await requireUser(request); const {id}=await context.params
  if(!uuid.test(id)) return NextResponse.json({ok:false,error:"Invalid event id."},{status:400})
  const events=await supabaseFetch<Array<{id:string}>>(`private_events?id=eq.${encodeURIComponent(id)}&host_id=eq.${encodeURIComponent(user.id)}&select=id&limit=1`,{},user.accessToken)
  if(!events[0]) return NextResponse.json({ok:false,error:"Event not found."},{status:404})
  const purchases=await supabaseServiceFetch<Array<{tier:string;status:string;guest_limit:number}>>(`event_hosting_purchases?event_id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(user.id)}&select=tier,status,guest_limit&limit=1`)
  const purchase=purchases[0]
  return NextResponse.json({ok:true,paid:purchase?.status==="paid",purchase:purchase??null},{headers:{"Cache-Control":"no-store"}})
 } catch(error){return errorResponse(error)}
}
