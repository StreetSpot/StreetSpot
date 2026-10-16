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
  title: "Privacy Policy - $treet$pot",
  description:
    "How $treet$pot handles browser location, local feature data, vendor listings, and support requests.",
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
            aria-label="Back to $treet$pot"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <MapPin className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              $treet$pot
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
                $treet$pot (&quot;we,&quot; &quot;our,&quot; or &quot;the App&quot;) is a real-time vendor
                discovery platform connecting street vendors (Founders) with
                nearby customers (Finders). This policy explains how we
                collect, use, store, and protect your information when you
                interact with $treet$pot.
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
                $treet$pot relies on GPS-based location data to provide its
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
                    value="Collected only after you choose to start a browser-only vendor preview; this dashboard does not publish those coordinates to other users."
                  />
                  <DataRow
                    label="Precision"
                    value="We use the browser's device-native geolocation API. Accuracy varies by device, permission settings, signal quality, and environment; the browser supplies an accuracy estimate."
                  />
                  <DataRow
                    label="Duration"
                    value="The current dashboard preview exists in browser memory and ends when the page is reloaded or the preview is stopped. It is not a server-published vendor listing."
                  />
                  <DataRow
                    label="Background tracking"
                    value="$treet$pot does NOT track your location in the background. GPS is only accessed when you explicitly request it."
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
                    value="The locate result is used in your browser and is not sent to $treet$pot's server. Other features may save their own data in browser storage; these records are not synced to a verified $treet$pot account."
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
                The current dashboard&apos;s Start Preview action does not publish a listing to other users. The public map displays vendor records returned by the configured backend. For those records, the following information may be public:
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
                  value="The backend record’s closing time, shown with a countdown timer."
                />
                <DataRow
                  label="Gold status"
                  value="Gold placement is not activated by this website's checkout flow. The public map shows Gold status only when it is present on a backend vendor record."
                />
              </div>
              <p>
                Browser-only preview data is held in memory and is cleared when the page is reloaded or the preview is stopped. Public vendor records returned by the backend are separate and may persist according to backend configuration; the browser-only closing timer does not delete those server records.
              </p>
            </PolicySection>

            {/* 3. Data We Collect */}
            <PolicySection
              icon={<Server className="h-5 w-5" />}
              number="03"
              title="Information We Collect"
            >
              <p>$treet$pot collects the minimum data necessary to operate:</p>
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
                        Browser preview only
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5">GPS coordinates</td>
                      <td className="px-4 py-2.5">Pin placement</td>
                      <td className="px-4 py-2.5 font-mono text-xs">
                        Browser preview only
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5">Closing time</td>
                      <td className="px-4 py-2.5">Auto-removal</td>
                      <td className="px-4 py-2.5 font-mono text-xs">
                        Browser preview only
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
                choose to contact $treet$pot.
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
                  value="Use $treet$pot over HTTPS. Security and request logging at external providers are governed by their own policies."
                />
                <DataRow
                  label="Browser storage"
                  value="Some tools save favorites, parking, spots, reviews, messages, travel records, and claim requests in this browser's local storage. These records are not synced to a $treet$pot account or shared across devices."
                />
                <DataRow
                  label="Payment security"
                  value="The plan links open Stripe-hosted checkout. This website does not collect card details or verify or record a completed payment in a $treet$pot account."
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
                The vendor dashboard contains links to Stripe-hosted plan checkout. Those links leave $treet$pot and are governed by the checkout provider&apos;s terms:
              </p>
              <div className="space-y-1.5">
                <DataRow
                  label="Checkout"
                  value="Plan links open a Stripe-hosted checkout page. $treet$pot does not receive card details through this website."
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
              <p>You have full control over your data on $treet$pot:</p>
              <div className="space-y-1.5">
                <DataRow
                  label="Opt out of GPS"
                  value="Deny or revoke location permissions in your browser/device settings at any time. The app will still function but cannot pin your location."
                />
                <DataRow
                  label="Go offline"
                  value="Toggle your live status off at any time. Your browser-only preview pin is removed from this browser's map state. This does not delete any separate server-side vendor record."
                />
                <DataRow
                  label="Data deletion"
                  value="Use the Delete Account page to clear StreetSpot-prefixed local/session data in this browser. This does not delete server-side data; account deletion requests can be sent to support because no account backend is configured."
                />
                <DataRow
                  label="Cookie usage"
                  value="$treet$pot uses sessionStorage for a temporary vendor ID. The business name is held in in-memory interface state rather than saved to sessionStorage. No tracking cookies are used."
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
                href={`mailto:${SUPPORT_EMAIL}?subject=$treet$pot%20Privacy%20Inquiry`}
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
              Back to $treet$pot
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-5 md:px-6">
        <p className="text-center text-[10px] text-muted-foreground/60">
          {"\u00A9"} {new Date().getFullYear()} $treet$pot. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
