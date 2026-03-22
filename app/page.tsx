"use client";

import Script from 'next/script';
import { useState, useEffect } from "react";
import { Metadata } from 'next'
import { getTranslation, getAlternateUrls, type Locale } from '@/lib/i18n'
import HomeClient from './HomeClient'

type Page = "dashboard" | "insights" | "monitor" | "profile";

export default function HomePage() {
  const [active, setActive] = useState<Page>("dashboard");

  // Pi SDK Initialization
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Pi) {
      window.Pi.init({ 
        version: '2.0', 
        sandbox: true 
      });
      console.log('Pi SDK initialized with new API key');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <main>
        {active === "dashboard" && <DashboardPage />}
        {active === "insights"  && <AIInsightsPage />}
        {active === "monitor"   && <FieldMonitorPage />}
        {active === "profile"   && <ProfilePage />}
      </main>
      <BottomNav active={active} onChange={setActive} />
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale?: Locale }> }): Promise<Metadata> {
  const resolvedParams = await params
  const locale = resolvedParams?.locale || 'tr'
  const baseUrl = 'https://agropi-smart-farming.vercel.app'
  const path = locale === 'tr' ? '' : `/${locale}`
  
  const title = getTranslation(locale, 'site.title')
  const description = getTranslation(locale, 'site.description')
  const alternates = getAlternateUrls(locale === 'tr' ? '' : `/${locale}`)

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}${path}`,
      languages: {
        'tr': `${baseUrl}`,
        'en': `${baseUrl}/en`,
      },
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${baseUrl}${path}`,
      siteName: title,
      images: [
        {
          url: `${baseUrl}/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&locale=${locale}`,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&locale=${locale}`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default function Home() {
  return <HomeClient />
}
