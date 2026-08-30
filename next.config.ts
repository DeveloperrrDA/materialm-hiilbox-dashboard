import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.hiilbox.com" },
      { protocol: "https", hostname: "cms.hiilbox.com" },
      { protocol: "https", hostname: "hiilbox.com" },
      { protocol: "https", hostname: "www.hiilbox.com" },
    ],
  },
};

export default nextConfig;
