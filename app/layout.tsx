import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SupabaseProvider } from '@/lib/providers/supabase-provider'
import { BrandProvider } from '@/lib/providers/brand-provider'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from '@/components/error-boundary'
import { ErrorReportingProvider } from '@/lib/providers/error-reporting-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nester - AI-Powered Real Estate Marketing Platform',
  description: 'Transform your real estate business with AI-powered content generation, automated social media posting, and intelligent property management.',
  keywords: 'real estate, AI, marketing, automation, social media, property management',
  authors: [{ name: 'Nester Team' }],
  creator: 'Nester',
  publisher: 'Nester',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nester.studio'),
  openGraph: {
    title: 'Nester - AI-Powered Real Estate Marketing Platform',
    description: 'Transform your real estate business with AI-powered content generation, automated social media posting, and intelligent property management.',
    url: 'https://nester.studio',
    siteName: 'Nester',
    images: [
      {
        url: '/nester-logo.svg',
        width: 1200,
        height: 630,
        alt: 'Nester - AI-Powered Real Estate Marketing Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nester - AI-Powered Real Estate Marketing Platform',
    description: 'Transform your real estate business with AI-powered content generation, automated social media posting, and intelligent property management.',
    images: ['/nester-logo.svg'],
    creator: '@nester_ai',
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
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="light">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Additional meta tags */}
        <meta name="theme-color" content="#3B82F6" />
        <meta name="color-scheme" content="light" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Nester',
              description: 'AI-Powered Real Estate Marketing Platform',
              url: 'https://nester.studio',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              creator: {
                '@type': 'Organization',
                name: 'Nester',
                url: 'https://nester.studio',
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
          <SupabaseProvider>
            <ErrorReportingProvider>
              <BrandProvider>
                {children}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#10B981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#EF4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </BrandProvider>
            </ErrorReportingProvider>
          </SupabaseProvider>
        </ErrorBoundary>
        
        {/* Analytics Scripts */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            {process.env.NEXT_PUBLIC_GA_ID && (
              <>
                <script
                  async
                  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                    `,
                  }}
                />
              </>
            )}
            
            {/* Hotjar */}
            {process.env.NEXT_PUBLIC_HOTJAR_ID && (
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    (function(h,o,t,j,a,r){
                        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                        h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HOTJAR_ID},hjsv:6};
                        a=o.getElementsByTagName('head')[0];
                        r=o.createElement('script');r.async=1;
                        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                        a.appendChild(r);
                    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
                  `,
                }}
              />
            )}
          </>
        )}
      </body>
    </html>
  )
}