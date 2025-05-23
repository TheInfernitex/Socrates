import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/404",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
