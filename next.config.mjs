/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['10.10.40.160', 'devtradem.byb.gt'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
