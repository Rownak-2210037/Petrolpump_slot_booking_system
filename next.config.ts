import type { NextConfig } from "next";

const nextConfig = {
  // Add this line to optimize Vercel serverless tracing
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
    ],
  },
};
export default nextConfig;
