const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@sentry/nextjs'],
  },
  images: {
    domains: [
      'localhost',
      'supabase.co',
      'replicate.delivery',
      'replicate.com',
      'images.unsplash.com',
      'via.placeholder.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
        port: '',
        pathname: '/**',
      }
    ],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    MIXPOST_API_KEY: process.env.MIXPOST_API_KEY,
    N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,
    DOPPLER_TOKEN: process.env.DOPPLER_TOKEN,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('puppeteer')
    }
    return config
  },
}

const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  transpileClientSDK: false,
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
}

// Make sure adding Sentry options is the last code to run before exporting
module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig