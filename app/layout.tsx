import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'AgroPi Marketplace',
    template: '%s | AgroPi Marketplace'
  },
  description: 'AgroPi — Pi Network üzerinden yapay zeka destekli tarımsal yönetim',
  metadataBase: new URL('https://agropicbecaed4844.pinet.com'),
  icons: {
    icon: 'https://agropicbecaed4844.pinet.com/favicon.ico',
    apple: 'https://agropicbecaed4844.pinet.com/apple-touch-icon.png',
  },
  openGraph: {
    title: 'AgroPi Marketplace',
    description: 'AgroPi — Pi Network üzerinden yapay zeka destekli tarımsal yönetim',
    url: 'https://agropicbecaed4844.pinet.com',
    siteName: 'AgroPi Marketplace',
    images: [
      {
        url: 'https://agropicbecaed4844.pinet.com/og-image.png',
        width: 1200,
        height: 630,
      }
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgroPi Marketplace',
    description: 'AgroPi — Pi Network üzerinden yapay zeka destekli tarımsal yönetim',
    images: ['https://agropicbecaed4844.pinet.com/og-image.png'],
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
