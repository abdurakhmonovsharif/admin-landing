import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Generate the standalone output so production builds can be copied into a slim Docker image.
   * See: https://nextjs.org/docs/app/building-your-application/deploying/standalone.
   */
  output: "standalone",
};

export default nextConfig;
