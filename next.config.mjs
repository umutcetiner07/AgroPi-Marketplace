/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  output: 'standalone',
  ignoreDuringBuilds: true,
  ignoreBuildErrors: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    PI_APP_ID: '68a6fed62cb50254172b6593',
    PI_API_KEY: '5inedspkbqoa4bz4tljrimau6rl7yvwnwkeinebxrgy2jwtiryyuh3g15jxyqjqj',
    PI_WALLET_ADDRESS: 'GDLROKVSDNERQXEOOOSLKFBZGFJZEM4WEY3V66E4UAT7UPHWF72XCKTL',
  },
}

export default nextConfig
