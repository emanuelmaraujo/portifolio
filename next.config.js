/** @type {import("next").NextConfig} */

export const siteUrl = (process.env.PORTFOLIO_SITE_URL || "https://emanuel-araujo-portfolio.vercel.app").replace(/\/$/, "");

export default {
  env: { NEXT_PUBLIC_PORTFOLIO_SITE_URL: siteUrl },
  reactStrictMode: true,
};
