/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'agropicbecaed4844.pinet.com'],
  },
  output: 'standalone',
  basePath: '',
  assetPrefix: '',
  env: {
    PI_APP_ID: '68a6fed62cb50254172b6593',
    PI_API_KEY: '5inedspkbqoa4bz4tljrimau6rl7yvwnwkeinebxrgy2jwtiryyuh3g15jxyqjqj',
    PI_WALLET_ADDRESS: 'GDLROKVSDNERQXEOOOSLKFBZGFJZEM4WEY3V66E4UAT7UPHWF72XCKTL',
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer-when-downgrade',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' https://sdk.minepi.com https://agropicbecaed4844.pinet.com 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.minepi.com https://agropicbecaed4844.pinet.com;",
          },
        ],
      },
    ];
  },
}

export default nextConfig
