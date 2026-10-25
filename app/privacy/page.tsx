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
    "How StreetSpot handles account data, location permissions, public listings, private events, payments, and analytics.",
  alternates: { canonical: "https://streetspotapp.com/privacy" },
  openGraph: { url: "https://streetspotapp.com/privacy" },
}

const EFFECTIVE_DATE = "October 17, 2026"
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
                StreetSpot requests location only when you choose a location-based action. We use the information differently for vendors and customers:
              </p>
              <div className="rounded-lg border border-border bg-secondary/50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
                  Founders (Vendors)
                </p>
                <div className="space-y-1.5">
                  <DataRow
                    label="GPS coordinates"
                    value="Collected only after you choose Go Live or update your location. The coordinates are sent to StreetSpot and appear on the public map while your listing is live."
                  />
                  <DataRow
                    label="Precision"
                    value="We use the browser's device-native geolocation API. Accuracy varies by device, permission settings, signal quality, and environment; the browser supplies an accuracy estimate."
                  />
                  <DataRow
                    label="Duration"
                    value="The live vendor location is stored with your server-side vendor listing until you update it, take the listing offline, or request deletion."
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
                    value="The locate result is used in your browser and is not sent to StreetSpot's server. Other features may save their own data in browser storage; these records are not synced to a verified StreetSpot account."
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
                The public map displays server-backed vendor records only when the vendor has published a valid location and is live. Unclaimed candidate listings and private events are not shown as public vendor pins. Public listing details may include:
              </p>
              <div className="space-y-1.5">
                <DataRow
                  label="Business name"
                  value="The business name stored on the backend vendor record."
                />
                <DataRow
                  label="Description"
                  value="The description stored on the backend vendor record."
                />
                <DataRow
                  label="Pinned GPS location"
                  value="The coordinates stored on the backend vendor record, displayed as a map marker."
                />
                <DataRow
                  label="Closing time"
                  value="The backend record's closing time, shown with a countdown timer."
                />
                <DataRow
                  label="Gold status"
                  value="Premium placement is shown only when StreetSpot confirms an active paid vendor subscription in the backend."
                />
              </div>
              <p>
                Public vendor records are stored in StreetSpot&apos;s backend and remain until the owner takes them offline or requests deletion. Some finder tools still use browser storage and may not sync across devices.
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
                      <td className="px-4 py-2.5">Account and email</td>
                      <td className="px-4 py-2.5">Sign-in, ownership, support</td>
                      <td className="px-4 py-2.5 font-mono text-xs">Account lifetime</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5">Vendor listing and GPS</td>
                      <td className="px-4 py-2.5">Public map while live</td>
                      <td className="px-4 py-2.5 font-mono text-xs">Until offline or deleted</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5">Claim requests</td>
                      <td className="px-4 py-2.5">Ownership verification</td>
                      <td className="px-4 py-2.5 font-mono text-xs">Until resolved or deleted</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5">Private events and invites</td>
                      <td className="px-4 py-2.5">Guest access and hosting</td>
                      <td className="px-4 py-2.5 font-mono text-xs">Until deleted or retained for legal needs</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5">Payment status</td>
                      <td className="px-4 py-2.5">Subscriptions and event packages</td>
                      <td className="px-4 py-2.5 font-mono text-xs">Handled by Stripe; status stored by StreetSpot</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5">Website analytics</td>
                      <td className="px-4 py-2.5">Page views and performance</td>
                      <td className="px-4 py-2.5 font-mono text-xs">Aggregate provider metrics</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                StreetSpot uses account authentication for vendor claims, vendor publishing, and private event hosting. We may process your account identifier and email address to secure those features and respond to support requests.
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
                  value="Some finder tools save favorites, parking, and travel records in browser storage. Vendor claims, server-published listings, private event drafts, invitations, and billing status are stored in StreetSpot's backend and are subject to account access controls."
                />
                <DataRow
                  label="Payment security"
                  value="Stripe-hosted checkout collects payment details. StreetSpot stores the payment status, plan, billing period, and Stripe reference identifiers needed to activate or revoke paid features; StreetSpot does not store full card numbers."
                />
                <DataRow
                  label="Third-party access"
                  value="StreetSpot does not sell personal information. Providers such as Supabase, Stripe, Vercel, and OpenStreetMap may process the data needed to provide authentication, hosting, payments, analytics, and map tiles under their own policies."
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
                Vendor subscriptions and paid event-hosting packages use Stripe-hosted checkout. Stripe processes payment details under its own terms:
              </p>
              <div className="space-y-1.5">
                <DataRow
                  label="Checkout"
                  value="Plan links open a Stripe-hosted checkout page. StreetSpot does not receive card details through this website."
                />
                <DataRow
                  label="Status"
                  value="StreetSpot receives server-side payment and subscription events from Stripe. A successful return URL alone does not activate a plan; Stripe confirmation is required."
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
                  value="Toggle your live status off at any time. This removes the listing from the public live map but does not delete the vendor record or past billing records."
                />
                <DataRow
                  label="Data deletion"
                  value="Use the Delete Account page for the available account-deletion flow or contact support@streetspotapp.com. Requests may require verification; some payment, fraud-prevention, and legal records may need to be retained where required by law."
                />
                <DataRow
                  label="Cookie usage"
                  value="StreetSpot uses secure session cookies for account authentication and browser storage for selected local features. Vercel Web Analytics and Speed Insights collect aggregate page-view and performance metrics. Stripe may use its own technologies on checkout pages."
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
                <div className="flex items-baseline gap-2">
                  <span className="inline-block h-1 w-1 shrink-0 translate-y-[-2px] rounded-full bg-primary" />
                  <span>
                    <span className="font-medium text-foreground">Support page:</span>{" "}
                    <Link
                      href="/support"
                      className="text-primary underline decoration-primary/30 underline-offset-2 hover:text-primary/80"
                    >
                      https://streetspotapp.com/support
                    </Link>
                  </span>
                </div>
                <DataRow label="Email" value={SUPPORT_EMAIL} />
                <div className="flex items-baseline gap-2">
                  <span className="inline-block h-1 w-1 shrink-0 translate-y-[-2px] rounded-full bg-primary" />
                  <span>
                    <span className="font-medium text-foreground">Data deletion:</span>{" "}
                    <Link href="/delete-account" className="text-primary underline decoration-primary/30 underline-offset-2 hover:text-primary/80">
                      Clear local data or request deletion
                    </Link>
                  </span>
                </div>
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
