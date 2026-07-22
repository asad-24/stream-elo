import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/portfolio-2-2", destination: "/portfolio", permanent: true },
      { source: "/photos", destination: "/behind-the-scenes", permanent: true },
      { source: "/photos-4", destination: "/behind-the-scenes", permanent: true },
      { source: "/videos", destination: "/films", permanent: true },
      { source: "/video-production", destination: "/portfolio", permanent: true },
      { source: "/services", destination: "/portfolio", permanent: true },
      { source: "/podcast-studio", destination: "/portfolio", permanent: true },
      { source: "/consultation", destination: "/contact", permanent: true },
      { source: "/virginia", destination: "/contact", permanent: true },
      { source: "/west-virginia", destination: "/contact", permanent: true },
      { source: "/studio-policies", destination: "/contact", permanent: true },
      { source: "/privacy-policy-2", destination: "/contact", permanent: true },
      { source: "/terms-of-service", destination: "/contact", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "meroestream.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "www.meroestream.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
};

export default nextConfig;
