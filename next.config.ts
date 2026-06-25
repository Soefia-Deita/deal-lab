import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the Turbopack workspace root to this app dir so Next doesn't infer the
  // root from a parent lockfile (the sibling Soefia repos each have their own).
  turbopack: {
    root: __dirname,
  },
  poweredByHeader: false,
};

export default nextConfig;
