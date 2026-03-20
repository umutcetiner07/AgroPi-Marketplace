import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'AgroPi Smart Farming',
    template: '%s | AgroPi Smart Farming'
  },
  description: 'AgroPi — AI-powered smart farming advisor and field management system',
  metadataBase: new URL('https://agropicbecaed4844.pinet.com'),
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'AgroPi Smart Farming',
    description: 'AgroPi — AI-powered smart farming advisor and field management system',
    url: 'https://agropicbecaed4844.pinet.com',
    siteName: 'AgroPi Smart Farming',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      }
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgroPi Smart Farming',
    description: 'AgroPi — AI-powered smart farming advisor and field management system',
    images: ['/og-image.png'],
  },
  referrer: 'no-referrer-when-downgrade',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <script src="https://sdk.minepi.com/pi-sdk.js" />
        {children}
      </body>
    </html>
  )
}
