/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Keep better-sqlite3 (native module) server-side only
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
};

export default nextConfig;
