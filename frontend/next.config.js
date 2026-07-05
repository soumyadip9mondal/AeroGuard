/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three'],
  swcMinify: true,
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react', '@base-ui/react'],
  },
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

module.exports = nextConfig;
