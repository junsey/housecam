import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  outputFileTracingIncludes: {
    "/admin/presupuestos/[id]/jpg": [
      "./node_modules/open-sans-fonts/open-sans/Regular/OpenSans-Regular.ttf",
      "./node_modules/open-sans-fonts/open-sans/Bold/OpenSans-Bold.ttf",
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4.5mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
