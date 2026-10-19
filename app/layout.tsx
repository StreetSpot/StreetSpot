import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { SupportChatWidget } from '@/components/support-chat-widget'
import { WebMCPRegistration } from '@/components/webmcp-registration'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

const brandName = 'StreetSpot | Discover What’s Happening Nearby'
const brandDescription =
  'Discover food trucks, pop-up shops, local businesses, neighborhood events, skate spots, and hidden gems near you. Explore the live map and connect with local businesses.'

export const metadata: Metadata = {
  title: {
    default: brandName,
    template: '%s | StreetSpot',
  },
  description: brandDescription,
  keywords: [
    '$treet$pot',
    'food trucks near me',
    'street vendors',
    'local discovery map',
    'pop-up carts',
    'flea market',
    'skate spots',
    'community events',
    'local businesses',
    'street food',
    'hidden gems',
  ],
  applicationName: 'StreetSpot',
  authors: [{ name: 'StreetSpot' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'StreetSpot',
    url: 'https://streetspotapp.com',
    title: 'StreetSpot | Discover What’s Happening Nearby',
    description: brandDescription,
    images: [{ url: '/brand-social.png', width: 1200, height: 630, alt: 'StreetSpot local discovery map' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StreetSpot | Discover What’s Happening Nearby',
    description: brandDescription,
    images: ['/brand-social.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/brand-icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/brand-icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/brand-apple-icon.png',
  },
  manifest: '/manifest.json',
  metadataBase: new URL('https://streetspotapp.com'),
  alternates: { canonical: '/' },
}

export const viewport: Viewport = {
  themeColor: '#f06435',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
        <meta name="theme-color" content="#f06435" />
      </head>
      <body className={`${_inter.variable} ${_jetbrainsMono.variable} font-sans antialiased`}>
        {children}
        <WebMCPRegistration />
        <SupportChatWidget />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
