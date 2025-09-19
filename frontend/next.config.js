/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  // Vercel optimizations
  images: {
    domains: [],
  },
  // Enable static exports if needed
  output: 'standalone',
}

module.exports = nextConfig
