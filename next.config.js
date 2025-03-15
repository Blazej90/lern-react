/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  },

  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "regenerator-runtime": require.resolve("regenerator-runtime"),
    };
    return config;
  },
};

module.exports = nextConfig;
