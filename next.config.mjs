/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    serverComponentsExternalPackages: ['pg'],
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'date-fns',
      'clsx',
      'tailwind-merge',
      'canvas-confetti',
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
};

export default nextConfig;
