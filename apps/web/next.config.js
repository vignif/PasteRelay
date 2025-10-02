/** @type {import('next').NextConfig} */
const nextConfig = () => {
  const basePath = process.env.NEXT_BASE_PATH || '';
  return {
    reactStrictMode: true,
    basePath,
    output: 'standalone',
    env: {
      NEXT_BASE_PATH: basePath,
      // Provide a default from PUBLIC_WS_URL if NEXT_PUBLIC_SIGNALING_URL is not set at build time
      PUBLIC_WS_URL: process.env.PUBLIC_WS_URL,
    },
  };
};

module.exports = nextConfig();