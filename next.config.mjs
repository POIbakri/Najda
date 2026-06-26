/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Service worker + manifest are served from /public; no extra config needed.
  // Twilio is server-only; keep it out of the client bundle.
  experimental: {
    serverComponentsExternalPackages: ["twilio"],
  },
};

export default nextConfig;
