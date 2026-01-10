/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@qdrant/js-client-rest']

};

module.exports = nextConfig;
