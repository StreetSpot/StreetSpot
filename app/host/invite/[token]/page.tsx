import type { Metadata } from "next"
import { PrivateInviteView } from "@/components/private-invite-view"

export const metadata: Metadata = {
  title: "Private StreetSpot Invitation",
  robots: { index: false, follow: false },
}

export default async function PrivateInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return <PrivateInviteView token={token} />
}
