import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mantine/core", "@mantine/hooks", "@mantine/notifications"],
  turbopack: {
    rules: {
      "./src/**/*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
