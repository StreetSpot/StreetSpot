import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

const brandName = '$treet$pot: Bu!lt 4 Da Hu$tle'
const brandDescription =
  'REAL SPOTS. REAL PEOPLE. REAL HUSTLE. Discover food trucks, street vendors, pop-ups, local businesses, skate spots, community events, and hidden gems on a real-time local map.'

export const metadata: Metadata = {
  title: {
    default: brandName,
    template: '%s | $treet$pot',
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
  applicationName: '$treet$pot',
  authors: [{ name: '$treet$pot' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: '$treet$pot: Bu!lt 4 Da Hu$tle',
    url: 'https://streetspotapp.com',
    title: '$treet$pot: Bu!lt 4 Da Hu$tle',
    description: brandDescription,
    images: [{ url: '/brand-social.png', width: 1200, height: 630, alt: '$treet$pot: Bu!lt 4 Da Hu$tle' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '$treet$pot: Bu!lt 4 Da Hu$tle',
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
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/brand-apple-icon.png',
  },
  manifest: '/manifest.json',
  metadataBase: new URL('https://streetspotapp.com'),
  alternates: { canonical: '/' },
}

export const viewport: Viewport = {
  themeColor: '#B6FF38',
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
        <meta name="apple-mobile-web-app-title" content="$treet$pot" />
        <meta name="theme-color" content="#B6FF38" />
      </head>
      <body className={`${_inter.variable} ${_jetbrainsMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
