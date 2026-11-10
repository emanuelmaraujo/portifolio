/** @type {import("next").NextConfig} */

export const siteUrl = process.env.PORTFOLIO_SITE_URL || (process.env.VERCEL === "1"
  ? "https://emanuel-araujo-portfolio.vercel.app"
  : "https://emanuelmaraujo.github.io/portifolio");
const basePath = new URL(siteUrl).pathname.replace(/\/$/, "");

const nextConfig = {
  output: "export",
  basePath,
  env: { NEXT_PUBLIC_PORTFOLIO_SITE_URL: siteUrl, NEXT_PUBLIC_PORTFOLIO_BASE_PATH: basePath },
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "via.placeholder.com", pathname: "/**" }],
  },
};

export default nextConfig;
