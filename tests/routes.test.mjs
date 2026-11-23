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
  app = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "-H", "127.0.0.1", "-p", String(port)], { stdio: ["ignore", "pipe", "pipe"] });
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

test("Radar serves its three editorias, creator attribution and education content in HTML", async () => {
  const home = await read("/radar");
  assert.ok(home.includes(`rel="canonical" href="${siteUrl}/radar"`));
  assert.ok(home.includes('action="/radar/busca"'));
  for (const area of ["ia", "ciberseguranca", "design-desenvolvimento"]) {
    assert.ok(home.includes(`href="/radar/${area}"`), area);
    assert.match(await read(`/radar/${area}/skills`), /GitHub|Curadoria/);
  }
  assert.match(await read("/radar/p/cezar"), /github\.com\/open-mercato\/cezar/);
  assert.match(await read("/radar/p/como-funciona-rag"), /Trechos recuperados/);
  assert.ok((await read("/blog")).includes('href="/radar"'));
});

test("Radar search accepts a direct URL and news are available via RSS", async () => {
  const html = await read("/radar/busca?q=seguran%C3%A7a&area=ciberseguranca&tipo=skills");
  const matches = html.split('class="r-results"')[1]?.split("</ul>")[0];
  assert.ok(matches?.includes("security-best-practices"));
  assert.ok(!matches?.includes("frontend-design-skill"));
  assert.match(await read("/radar/busca?q=termo-improvavel"), /Nenhum resultado/);
  assert.equal((await fetch(local + "/radar/p/nao-existe")).status, 404);
  const rss = await fetch(local + "/radar/rss.xml");
  assert.equal(rss.headers.get("content-type"), "application/rss+xml; charset=utf-8");
  assert.match(await rss.text(), /<rss.*<item>.*openbot-1-1-3/);
  const sitemap = await read("/sitemap.xml");
  assert.ok(sitemap.includes(`<loc>${siteUrl}/radar/ia/skills</loc>`));
  assert.ok(!sitemap.includes(`<loc>${siteUrl}/radar/busca</loc>`));
});

test("Radar surfaces skill picks, weekly signals and the Linux collection", async () => {
  const home = await read("/radar");
  assert.match(home, /Trocar seleção/);
  assert.ok(home.includes("/radar/p/docker"));
  assert.match(home, /estrelas no GitHub em/);
  const trends = await read("/radar/em-alta");
  assert.match(trends, /github\.com\/trending\?since=weekly/);
  assert.match(trends, /estrelas na semana/);
  assert.match(trends, /\/radar\/p\/ag-ui/);
  const systems = await read("/radar/design-desenvolvimento/sistemas");
  for (const slug of ["ubuntu-lts", "fedora-linux", "debian-stable", "nixos"]) assert.ok(systems.includes(`/radar/p/${slug}`), slug);
  assert.match(await read("/radar/p/openart"), /Serviço hospedado/);
  assert.match(await read("/radar/p/kimi-code"), /github\.com\/MoonshotAI\/kimi-code/);
  const rss = await read("/radar/rss.xml");
  assert.match(rss, /zizmor-1-33-1/);
  assert.match(rss, /docker-compose-5-8/);
});

test("Radar exposes official sector resources and the recorded weekly stars across the three editions", async () => {
  const directory = await read("/radar/acervo");
  assert.match(directory, /Frameworks por área/);
  assert.match(directory, /Documentos do setor/);
  const skills = await read("/radar/acervo?tipo=skills&ordenar=crescimento");
  const rows = skills.match(/<ul class="r-results">([\s\S]*?)<\/ul>/)?.[1] ?? "";
  const weekly = [...rows.matchAll(/aria-label="([\d.]+) estrelas adicionadas de/g)].map(match => Number(match[1].replaceAll(".", "")));
  assert.ok(weekly.length >= 80);
  assert.equal(weekly.length, catalogRows(skills).length);
  assert.deepEqual(weekly, weekly.toSorted((a, b) => b - a));
  for (const [area, framework, report] of [
    ["ia", "llamaindex-framework-rag", "google-agents-whitepaper-radar"],
    ["ciberseguranca", "nist-csf-governanca", "kaspersky-security-bulletin"],
    ["design-desenvolvimento", "dtcg-design-tokens", "web-almanac-2025-acessibilidade"],
  ]) {
    const html = await read(`/radar/${area}`);
    assert.ok(html.includes(`/radar/p/${framework}`), area);
    assert.ok(html.includes(`/radar/p/${report}`), area);
    assert.match(html, /r-edition-visual/);
    assert.match(html, /r-reference-panel/);
  }
});

test("area navigation has hierarchical back links and distinguishes guides, skills and open source", async () => {
  const area = await read("/radar/ia");
  assert.match(area, /Explorar por tipo/);
  assert.match(area, /Assuntos da área/);
  const skill = await read("/radar/p/roteiro-avaliar-skill");
  assert.match(skill, /data-radar-back="true" href="\/radar\/ia\/guias"/);
  assert.match(skill, /Guias e roteiros/);
  const skills = await read("/radar/busca?area=ia&tipo=skills&q=Testar+uma+skill+antes+de+adota-la");
  assert.match(skills, /Nenhum resultado/);
  const openbot = await read("/radar/p/openbot");
  assert.match(openbot, /https:\/\/github\.com\/nightly-labs\/openbot/);
  assert.match(openbot, /PolyForm Noncommercial/);
  const projects = await read("/radar/ciberseguranca/projetos");
  assert.match(projects, /\/radar\/p\/keycloak/);
  const community = await read("/radar/projetos");
  assert.match(community, /Descobertas nas comunidades/);
  assert.match(community, /news\.ycombinator\.com/);
  const catalog = await read("/radar/busca?tipo=projetos&tema=Comunidades+t%C3%A9cnicas");
  assert.match(catalog, /href="\/radar\/p\/typst"/);
});

test("Radar indexes the Notion collections and renders the first 100 entries of a large catalog", async () => {
  const directory = await read("/radar/acervo");
  for (const collection of ["Biblioteca de Skills", "Atlas Web Design &amp; IA", "Academia IA", "Dados e backends", "Redes e homelab"]) assert.ok(directory.includes(collection), collection);
  const topic = await read("/radar/busca?area=design-desenvolvimento&tema=Dados+e+backends");
  assert.match(topic, /href="\/radar\/p\/acervo-postgresql"/);
  const skills = await read("/radar/busca?colecao=Biblioteca+de+Skills");
  assert.match(skills, /webapp-testing/);
  const largeCatalog = await read("/radar/busca");
  assert.equal(catalogRows(largeCatalog).length, 100);
  assert.match(largeCatalog, /Carregar mais resultados/);
  assert.match(await read("/radar/p/acervo-postgresql"), /Fonte e catalogação/);
});

function catalogRows(html) {
  const list = html.match(/<ul class="r-results">([\s\S]*?)<\/ul>/)?.[1] ?? "";
  return [...list.matchAll(/<li data-area=/g)];
}

test("Radar lists every skill and project in a short catalog and sorts by verified GitHub stars", async () => {
  for (const route of ["/radar/ia/skills", "/radar/projetos"]) {
    const html = await read(route);
    const count = Number(html.match(/class="r-result-count" role="status">(\d+)/)?.[1]);
    assert.ok(count > 0 && count <= 100, route);
    assert.equal(catalogRows(html).length, count, route);
    assert.doesNotMatch(html, /Carregar mais resultados/);
  }
  const sorted = await read("/radar/ia/skills?ordenar=estrelas");
  const list = sorted.match(/<ul class="r-results">([\s\S]*?)<\/ul>/)?.[1] ?? "";
  const totals = [...list.matchAll(/aria-label="([\d.]+) estrelas no GitHub/g)].map(match => Number(match[1].replaceAll(".", "")));
  assert.equal(totals.length, catalogRows(sorted).length);
  assert.deepEqual(totals, totals.toSorted((a, b) => b - a));
});

test("Radar exposes subareas and practical selections of official standards", async () => {
  const cyber = await read("/radar/ciberseguranca");
  assert.match(cyber, /href="\/radar\/ciberseguranca\/blue-team"/);
  assert.match(cyber, /href="\/radar\/ciberseguranca\/red-team"/);
  assert.match(await read("/radar/ciberseguranca/red-team"), /Kali Linux|Bellingcat/);
  assert.match(await read("/radar/ciberseguranca/frameworks"), /NIST Cybersecurity Framework 2\.0/);
  assert.match(await read("/radar/ciberseguranca/relatorios"), /CrowdStrike Global Threat Report 2026/);
  assert.match(await read("/radar/ia/padroes"), /Qual referência resolve sua dúvida/);
  assert.match(await read("/radar/design-desenvolvimento/padroes"), /WCAG 2\.2/);
});

test("Radar framework task links apply a reusable filter and keep the official source one click away", async () => {
  const route = "/radar/ciberseguranca/frameworks";
  const all = await read(route);
  const task = await read(`${route}?uso=nist-csf-governanca`);
  assert.ok(catalogRows(all).length > catalogRows(task).length);
  assert.equal(catalogRows(task).length, 2);
  assert.match(task, /Definir prioridades com a liderança/);
  assert.match(task, /href="https:\/\/www\.nist\.gov\/cyberframework/);
  assert.match(task, /Remover filtro Definir prioridades com a liderança/);
  assert.match(task, /Mais filtros/);
});

test("the redesigned Acervo opens practical guides and supplies lightweight suggestions", async () => {
  const directory = await read("/radar/acervo");
  assert.match(directory, /Comece pela tarefa/);
  assert.match(directory, /href="\/radar\/p\/roteiro-avaliacao-rag"/);
  const guide = await read("/radar/p/roteiro-inventario-sbom");
  assert.match(guide, /O que entregar/);
  const suggestions = JSON.parse(await read("/radar/sugestoes?q=Keycloak"));
  assert.deepEqual(suggestions[0], { slug: "keycloak", title: "Keycloak", kind: "repositorios" });
  assert.ok(suggestions.length <= 4);
  assert.deepEqual(JSON.parse(await read("/radar/sugestoes?q=a")), []);
  const legacy = await fetch(local + "/radar/p/acervo-keycloak", { redirect: "manual" });
  assert.equal(legacy.status, 308);
  assert.ok(legacy.headers.get("location").endsWith("/radar/p/keycloak"));
});
