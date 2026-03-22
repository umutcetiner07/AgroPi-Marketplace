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
            key: 'Content-Security-Policy',
            value: "frame-ancestors *; default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;",
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
        ],
      },
    ];
  },
}

export default nextConfig
