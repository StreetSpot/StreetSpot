import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = {
  title: {
    default: 'StreetSpot — Live Food Trucks, Street Vendors & Local Gems',
    template: '%s | StreetSpot',
  },
  description:
    'Real-time map of food trucks, pop-up carts, markets, flea markets, block parties, skate parks, and street vendors. Vendors go live in one tap. Anyone can pin new gems. Claim your spot.',
  keywords: [
    'StreetSpot',
    'food trucks near me',
    'street vendors',
    'live vendor map',
    'pop-up carts',
    'flea market',
    'skate park',
    'block party',
    'claim your spot',
    'street food',
    'Columbia SC',
    'Manning SC',
  ],
  applicationName: 'StreetSpot',
  authors: [{ name: 'StreetSpot' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'StreetSpot',
    title: 'StreetSpot — Live Food Trucks, Street Vendors & Local Gems',
    description:
      'Find street vendors in real time. Pin food trucks, markets, skate spots, and events. Vendors go live with one tap.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StreetSpot — Live map for street vendors & gems',
    description:
      'Food trucks, carts, markets, skate parks — live on the map. Pin what you find. Claim your spot.',
  },
  robots: {
    index: true,
    follow: true,
  },
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#0D0D0D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="StreetSpot" />
      </head>
      <body className={`${_inter.variable} ${_jetbrainsMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
