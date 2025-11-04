/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly set the root directory for Turbopack to prevent workspace inference
  turbopack: {
    root: __dirname,
  },
  
  // Ensure the blog is completely isolated from parent directories
  experimental: {
    // Prevent Next.js from looking up the directory tree
    externalDir: false,
  },
  
  // Optimize for production
  reactStrictMode: true,
  
  // Prevent hydration mismatches
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
