import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { once } from "node:events";
import { after, before, test } from "node:test";
import { siteUrl } from "../next.config.js";

const require = createRequire(import.meta.url);
let app, local;
let logs = "";

before(async () => {
  const probe = createServer();
  probe.listen(0, "127.0.0.1");
  await once(probe, "listening");
  const { port } = probe.address();
  await new Promise(resolve => probe.close(resolve));
  local = `http://127.0.0.1:${port}`;
  app = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "-H", "127.0.0.1", "-p", String(port)], { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, ANTHROPIC_API_KEY: "" } }); // no key: the guide must never call a model in tests
  for (const stream of [app.stdout, app.stderr]) stream.on("data", chunk => { logs = (logs + chunk).slice(-5000); });
  for (let i = 0; i < 80 && app.exitCode === null; i++) {
    try {
      if ((await fetch(local + "/", { signal: AbortSignal.timeout(800) })).ok) return;
    } catch { /* Wait for the local production server. */ }
    await new Promise(resolve => setTimeout(resolve, 125));
  }
  assert.fail("Local Next.js production server unavailable. Run npm run build first.\n" + logs);
});

after(async () => {
  if (app?.exitCode === null) {
    const exited = once(app, "exit");
    app.kill();
    await exited;
  }
});

async function read(route) {
  const response = await fetch(local + route);
  assert.equal(response.status, 200, route);
  return response.text();
}

for (const [route, locale, ogLocale] of [["/", "en", "en_US"], ["/pt", "pt-BR", "pt_BR"]]) {
  test(`${locale} renders complete content from the server with localized SEO`, async () => {
    const html = await read(route);
    assert.ok(html.includes(`lang="${locale}"`));
    assert.ok(html.includes(`rel="canonical" href="${siteUrl + route}"`));
    assert.ok(html.includes(`hrefLang="en" href="${siteUrl}/"`));
    assert.ok(html.includes(`hrefLang="pt-BR" href="${siteUrl}/pt"`));
    assert.ok(html.includes(`property="og:locale" content="${ogLocale}"`));
    assert.ok(html.includes(`property="og:image" content="${siteUrl}/og.png"`));
    // The page must be readable without WebGL: every chapter and project is in the HTML.
    for (const name of ["Prumo", "Torvya", "Marcos Krep’s", "ISO/IEC 27001 Foundation", "Agent Skills"]) assert.ok(html.includes(name), name);
    for (const section of ["top", "trajectory", "pillars", "orchestration", "work", "writing", "credentials", "contact"]) assert.ok(html.includes(`id="${section}"`), section);
    for (const form of ["mark", "strata", "aegis", "orchestra", "prumo", "torvya", "kreps", "horizon"]) assert.ok(html.includes(`data-form="${form}"`), form);
    assert.ok(html.includes('href="#main"'));
    // Nothing may cover the content while scripts load, and every pillar and pipeline stage is in the HTML.
    assert.ok(!html.includes('class="loader"'));
    assert.equal((html.match(/role="tabpanel"/g) ?? []).length, 9);
    assert.ok(html.includes('"@type":"Person"'));
    assert.ok(html.includes(route === "/" ? 'href="/blog/hackers-do-bem-en"' : 'href="/blog/hackers-do-bem"'));
    assert.ok(html.includes(route === "/" ? 'href="/pt"' : 'href="/"'));
  });
}

test("archive routes, brand SVGs, project assets and sitemap stay reachable", async () => {
  for (const route of ["/blog", "/projetos"]) assert.ok((await read(route)).includes('class="mark"'), route);
  assert.ok((await read("/blog/phishing-explained")).includes('href="/blog/phishing-explained-en"'));
  for (const [content, route] of [["posts", "blog"], ["projetos_posts", "projetos"]]) {
    const sources = readdirSync(new URL(`../${content}/`, import.meta.url)).filter(file => file.endsWith(".md"));
    for (const file of sources) assert.ok((await read(`/${route}/${file.replace(/\.md$/, "")}`)).includes("<main"));
  }
  for (const file of ["mark", "mark-light", "mark-mono", "mark-compact", "mark-animated", "favicon"]) {
    const svg = await read("/identity/" + file + ".svg");
    assert.match(svg, /<svg\b[^>]*viewBox=/);
    assert.doesNotMatch(svg, /<image\b|data:image/);
  }
  for (const file of ["/og.png", "/apple-icon.png", "/work/kreps/logo.png", "/work/prumo/card-oferta-prumo.png"]) {
    const response = await fetch(local + file);
    assert.equal(response.headers.get("content-type"), "image/png", file);
  }
  for (const file of ["/work/prumo/logo-negativo.svg", "/work/torvya/torvya-logo-dark.svg"]) assert.match(await read(file), /<svg\b/);
  const sitemap = await read("/sitemap.xml");
  for (const route of ["/pt", "/blog", "/blog/priorizar-vulnerabilidades-alem-do-cvss", "/projetos/servidor-de-aplicacoes-interno-en"]) assert.ok(sitemap.includes(`<loc>${siteUrl}${route}</loc>`), route);
  assert.ok((await read("/robots.txt")).includes(`Sitemap: ${siteUrl}/sitemap.xml`));
  assert.ok(readFileSync(new URL("../vercel.json", import.meta.url), "utf8").includes('"framework": "nextjs"'));
});

test("articles carry their own SEO, structure and interactive pieces in the server HTML", async () => {
  const slug = "priorizar-vulnerabilidades-alem-do-cvss", html = await read("/blog/" + slug);
  assert.ok(html.includes(`rel="canonical" href="${siteUrl}/blog/${slug}"`));
  assert.ok(html.includes(`hrefLang="en" href="${siteUrl}/blog/${slug}-en"`));
  assert.ok(html.includes('property="og:type" content="article"'));
  assert.ok(html.includes('"@type":"BlogPosting"'));
  // Contents, sections, references and the widgets' accessible controls are rendered without client scripts.
  for (const text of ['id="part-1"', 'id="references-title"', 'class="widget"', 'type="range"', 'class="code"', "hljs-keyword", "first.org/cvss"]) assert.ok(html.includes(text), text);
  assert.ok((await read("/blog")).includes(`href="/blog/${slug}"`));
});

test("the anonymised case study keeps its old address and exposes no internal names", async () => {
  const old = await fetch(local + "/projetos/servidor-aplicacoes-credfaz", { redirect: "manual" });
  assert.equal(old.status, 308);
  assert.ok(old.headers.get("location").endsWith("/projetos/servidor-de-aplicacoes-interno"));
  for (const route of ["/projetos/servidor-de-aplicacoes-interno", "/projetos/servidor-de-aplicacoes-interno-en", "/projetos"]) {
    assert.doesNotMatch(await read(route), /credfaz|\/opt\/|proxy_net/i, route);
  }
});

test("the guide is on the page, stays off without a key and refuses other origins", async () => {
  const html = await read("/pt");
  for (const text of ['class="ask-launch"', 'class="ask"', "Pergunte ao sistema", 'id="torvya"', 'id="kreps"']) assert.ok(html.includes(text), text);
  const ask = (headers, body = { question: "Quem é o Emanuel?", locale: "pt-BR" }) => fetch(local + "/api/ask", { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
  const off = await ask({ Origin: local });
  assert.equal(off.status, 503);
  assert.deepEqual(await off.json(), { mode: "guided", reason: "not-configured" });
  assert.equal((await ask({ Origin: "https://example.com" })).status, 403);
  assert.equal((await ask({})).status, 403);
  const summary = await read("/llms.txt");
  for (const text of ["# Emanuel Araújo", "## Prumo", "/blog/priorizar-vulnerabilidades-alem-do-cvss-en"]) assert.ok(summary.includes(text), text);
  assert.doesNotMatch(summary, /@outlook|mailto:/);
});
