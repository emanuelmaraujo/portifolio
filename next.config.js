/** @type {import("next").NextConfig} */

export const siteUrl = (process.env.PORTFOLIO_SITE_URL || "https://emanuelaraujo.com.br").replace(/\/$/, "");

/** Texts that changed address. The old links keep working. */
const moved = [
  ["/projetos/servidor-aplicacoes-credfaz", "/projetos/servidor-de-aplicacoes-interno"],
  ["/projetos/servidor-aplicacoes-credfaz-en", "/projetos/servidor-de-aplicacoes-interno-en"],
];

export default {
  env: { NEXT_PUBLIC_PORTFOLIO_SITE_URL: siteUrl },
  reactStrictMode: true,
  redirects: async () => moved.map(([source, destination]) => ({ source, destination, permanent: true })),
};
