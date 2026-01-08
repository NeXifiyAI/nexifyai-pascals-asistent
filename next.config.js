/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@qdrant/js-client-rest']
  }
};

module.exports = nextConfig;
