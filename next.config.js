/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.dicebear.com', 'ui-avatars.com'],
  },
  // Server Actions are now available by default in Next.js 14+
}

module.exports = nextConfig