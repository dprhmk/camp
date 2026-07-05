import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the floating dev-tools indicator; it never ships to production,
  // but it gets in the way of mobile testing in dev too.
  devIndicators: false,
};

export default nextConfig;
