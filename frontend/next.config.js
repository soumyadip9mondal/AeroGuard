/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three'],
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

module.exports = nextConfig;
