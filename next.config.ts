import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/reset-password",
        destination: "/auth/reset-password",
        permanent: false,
      },
      {
        source: "/login",
        destination: "/auth/login",
        permanent: false,
      },
      {
        source: "/register",
        destination: "/auth/register",
        permanent: false,
      },
      {
        source: "/forgot-password",
        destination: "/auth/forgot-password",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
