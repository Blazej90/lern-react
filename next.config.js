/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "regenerator-runtime": require.resolve("regenerator-runtime"),
    };
    return config;
  },
};

module.exports = nextConfig;
