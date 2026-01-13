/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone", // For production deployment
  experimental: {
    typedRoutes: true,
  },
};

module.exports = nextConfig;

