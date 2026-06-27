// A value that changes on every deploy, exposed to the client so the service
// worker can be registered with a versioned URL (/sw.js?v=…). That makes the SW
// byte-change per release, so its install/activate lifecycle rotates the app-shell
// cache instead of serving a stale shell offline after a redeploy.
const buildId = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || String(Date.now());

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: { NEXT_PUBLIC_BUILD_ID: buildId },
  // Service worker + manifest are served from /public; no extra config needed.
  // Twilio is server-only; keep it out of the client bundle.
  experimental: {
    serverComponentsExternalPackages: ["twilio"],
  },
};

export default nextConfig;
