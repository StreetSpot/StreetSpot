import type { Metadata } from "next"
import Link from "next/link"
import {
  MapPin,
  ArrowLeft,
  Shield,
  MapPinned,
  Eye,
  Server,
  Lock,
  UserCheck,
  CreditCard,
  Bell,
  Mail,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy - StreetSpot",
  description:
    "How StreetSpot handles browser location, local feature data, vendor listings, and support requests.",
  alternates: { canonical: "https://streetspotapp.com/privacy" },
  openGraph: { url: "https://streetspotapp.com/privacy" },
}

const EFFECTIVE_DATE = "March 4, 2026"
const SUPPORT_EMAIL = "support@streetspotapp.com"

interface SectionProps {
  icon: React.ReactNode
  number: string
  title: string
  children: React.ReactNode
}

function PolicySection({ icon, number, title, children }: SectionProps) {
  return (
    <section className="group">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
          {icon}
        </div>
        <div className="flex-1">
          <h2 className="mb-3 text-lg font-semibold tracking-tight text-foreground">
            <span className="mr-2 font-mono text-sm text-primary">
              {number}
            </span>
            {title}
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}

interface DataRowProps {
  label: string
  value: string
}

function DataRow({ label, value }: DataRowProps) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="inline-block h-1 w-1 shrink-0 translate-y-[-2px] rounded-full bg-primary" />
      <span>
        <span className="font-medium text-foreground">{label}:</span> {value}
      </span>
    </div>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Back to StreetSpot"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <MapPin className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              StreetSpot
            </span>
          </div>
        </div>
        <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
          Legal
        </span>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-2xl">
          {/* Title block */}
          <div className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  Privacy Policy
                </h1>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Effective: {EFFECTIVE_DATE}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                StreetSpot (&quot;we,&quot; &quot;our,&quot; or &quot;the App&quot;) is a real-time vendor
                discovery platform connecting street vendors (Founders) with
                nearby customers (Finders). This policy explains how we
                collect, use, store, and protect your information when you
                interact with StreetSpot.
              </p>
            </div>
          </div>

          {/* Policy sections */}
          <div className="space-y-10">
            {/* 1. Location Data */}
            <PolicySection
              icon={<MapPinned className="h-5 w-5" />}
              number="01"
              title="Location Data Collection (GPS)"
            >
              <p>
                StreetSpot relies on GPS-based location data to provide its
                core functionality. We collect location information differently
                depending on your role:
              </p>
              <div className="rounded-lg border border-border bg-secondary/50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
                  Founders (Vendors)
                </p>
                <div className="space-y-1.5">
                  <DataRow
                    label="GPS coordinates"
                    value="Collected when you explicitly tap 'Go Live' to pin your location on the map."
                  />
                  <DataRow
                    label="Precision"
                    value="We use device-native geolocation APIs. Coordinates are accurate to approximately 10 meters."
                  />
                  <DataRow
                    label="Duration"
                    value="Your pinned location is stored in-session only. When your closing time is reached or you go offline, your pin is automatically removed."
                  />
                  <DataRow
                    label="Background tracking"
                    value="StreetSpot does NOT track your location in the background. GPS is only accessed when you explicitly request it."
                  />
                </div>
              </div>
              <div className="rounded-lg border border-border bg-secondary/50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
                  Finders (Customers)
                </p>
                <div className="space-y-1.5">
                  <DataRow
                    label="Map center"
                    value="Your location is requested only when you choose the locate control. The map uses it to center in your browser; map tile requests go to the tile provider."
                  />
                  <DataRow
                    label="No storage"
                    value="The app does not send the locate result to its own server. If you choose to pin a spot or go live, its coordinates are kept in the browser's current app state."
                  />
                </div>
              </div>
            </PolicySection>

            {/* 2. Vendor Mapping */}
            <PolicySection
              icon={<Eye className="h-5 w-5" />}
              number="02"
              title="Vendor Mapping & Public Profiles"
            >
              <p>
                When a Founder goes live, the following information is displayed
                publicly on the StreetSpot map and is visible to all Finders:
              </p>
              <div className="space-y-1.5">
                <DataRow
                  label="Business name"
                  value="The vendor name you provide during login."
                />
                <DataRow
                  label="Description"
                  value="Your short vendor description (up to 120 characters)."
                />
                <DataRow
                  label="Pinned GPS location"
                  value="Displayed as a map marker to help customers find you."
                />
                <DataRow
                  label="Closing time"
                  value="Shown alongside a countdown timer so customers know your availability."
                />
                <DataRow
                  label="Gold status"
                  value="If you are a Gold subscriber, your pin receives a distinctive gold marker and appears in the Featured Vendors section."
                />
              </div>
              <p>
                All vendor map data is ephemeral. When your session ends or
                your closing time passes, your pin and associated information
                are permanently removed from the map. We do not maintain a
                historical record of vendor locations.
              </p>
            </PolicySection>

            {/* 3. Data We Collect */}
            <PolicySection
              icon={<Server className="h-5 w-5" />}
              number="03"
              title="Information We Collect"
            >
              <p>StreetSpot collects the minimum data necessary to operate:</p>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <th className="px-4 py-2.5 font-medium text-foreground">
                        Data Type
                      </th>
                      <th className="px-4 py-2.5 font-medium text-foreground">
                        Purpose
                      </th>
                      <th className="px-4 py-2.5 font-medium text-foreground">
                        Retention
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-2.5">Business name</td>
                      <td className="px-4 py-2.5">Map display</td>
                      <td className="px-4 py-2.5 font-mono text-xs">
                        Session only
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5">GPS coordinates</td>
                      <td className="px-4 py-2.5">Pin placement</td>
                      <td className="px-4 py-2.5 font-mono text-xs">
                        Until closing time
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5">Closing time</td>
                      <td className="px-4 py-2.5">Auto-removal</td>
                      <td className="px-4 py-2.5 font-mono text-xs">
                        Session only
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5">Payment info</td>
                      <td className="px-4 py-2.5">Gold subscription</td>
                      <td className="px-4 py-2.5 font-mono text-xs">
                        Handled by Stripe
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                This website&apos;s vendor dashboard does not provide a verified
                account sign-in. Do not treat a name entered in the dashboard
                as a verified identity. The support email is used only when you
                choose to contact StreetSpot.
              </p>
            </PolicySection>

            {/* 4. Data Protection */}
            <PolicySection
              icon={<Lock className="h-5 w-5" />}
              number="04"
              title="Data Protection & Security"
            >
              <p>We employ the following measures to protect your data:</p>
              <div className="space-y-1.5">
                <DataRow
                  label="Encryption in transit"
                  value="Use StreetSpot over HTTPS. Security and request logging at external providers are governed by their own policies."
                />
                <DataRow
                  label="Browser storage"
                  value="Some tools save favorites, parking, spots, reviews, messages, travel records, and claim requests in this browser's local storage. These records are not synced to a StreetSpot account or shared across devices."
                />
                <DataRow
                  label="Payment security"
                  value="The plan links open Stripe-hosted checkout. This website does not collect card details or verify or record a completed payment in a StreetSpot account."
                />
                <DataRow
                  label="Third-party access"
                  value="We do not sell, share, or provide your data to any third party for marketing or advertising purposes."
                />
                <DataRow
                  label="Map tile provider"
                  value="The map uses OpenStreetMap tiles. Tile requests are sent to its tile service, which may process request metadata under its own policies."
                />
              </div>
            </PolicySection>

            {/* 5. Payments & Stripe */}
            <PolicySection
              icon={<CreditCard className="h-5 w-5" />}
              number="05"
              title="Payments & Subscriptions"
            >
              <p>
                The vendor dashboard contains links to Stripe-hosted plan checkout. Those links leave StreetSpot and are governed by the checkout provider&apos;s terms:
              </p>
              <div className="space-y-1.5">
                <DataRow
                  label="Checkout"
                  value="Plan links open a Stripe-hosted checkout page. StreetSpot does not receive card details through this website."
                />
                <DataRow
                  label="Status"
                  value="This website has no payment webhook or authenticated subscription state, so a return to the site does not verify payment or activate a plan."
                />
              </div>
              <p>
                Stripe{"'"}s handling of your payment information is governed by the{" "}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary/80"
                >
                  Stripe Privacy Policy
                </a>
                .
              </p>
            </PolicySection>

            {/* 6. Your Rights */}
            <PolicySection
              icon={<UserCheck className="h-5 w-5" />}
              number="06"
              title="Your Rights & Choices"
            >
              <p>You have full control over your data on StreetSpot:</p>
              <div className="space-y-1.5">
                <DataRow
                  label="Opt out of GPS"
                  value="Deny or revoke location permissions in your browser/device settings at any time. The app will still function but cannot pin your location."
                />
                <DataRow
                  label="Go offline"
                  value="Toggle your live status off at any time. Your pin and all associated data are immediately removed from the map."
                />
                <DataRow
                  label="Data deletion"
                  value="Use browser settings to clear locally stored feature data. Account deletion requests can be sent to support; self-service deletion is not available because no account backend is configured."
                />
                <DataRow
                  label="Cookie usage"
                  value="StreetSpot uses sessionStorage for temporary state management only (vendor ID, business name). No tracking cookies are used."
                />
              </div>
            </PolicySection>

            {/* 7. Updates */}
            <PolicySection
              icon={<Bell className="h-5 w-5" />}
              number="07"
              title="Policy Updates"
            >
              <p>
                We may update this Privacy Policy to reflect changes in our
                practices or applicable regulations. When we make material
                  changes, we will update the &quot;Effective&quot; date at the top of this
                page. We encourage you to review this policy periodically.
              </p>
            </PolicySection>

            {/* 8. Contact */}
            <PolicySection
              icon={<Mail className="h-5 w-5" />}
              number="08"
              title="Contact Us"
            >
              <p>
                If you have questions about this Privacy Policy or your data,
                you can reach us through:
              </p>
              <div className="space-y-1.5">
                <DataRow
                  label="Support"
                  value="https://streetspotapp.com/support"
                />
                <DataRow label="Support page" value="https://streetspotapp.com/support" />
                <DataRow label="Email" value={SUPPORT_EMAIL} />
              </div>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=StreetSpot%20Privacy%20Inquiry`}
                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
              >
                <Mail className="h-4 w-4 text-primary" />
                Send a Privacy Inquiry
              </a>
            </PolicySection>
          </div>

          {/* Back link */}
          <div className="mt-12 flex justify-center">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to StreetSpot
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-5 md:px-6">
        <p className="text-center text-[10px] text-muted-foreground/60">
          {"\u00A9"} {new Date().getFullYear()} StreetSpot. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
