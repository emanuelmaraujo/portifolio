import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";
import { siteUrl as site } from "../next.config.js";

const out = new URL("../out/", import.meta.url);
const read = (file) => readFileSync(new URL(file, out), "utf8");

for (const [file, locale, canonical, ogLocale] of [
  ["index.html", "en", site + "/", "en_US"],
  ["pt.html", "pt-BR", site + "/pt", "pt_BR"],
]) {
  test(`${locale} export includes server-rendered content, artwork and SEO`, () => {
    const html = read(file).split("<script>")[0];
    assert.ok(html.includes(`lang="${locale}"`));
    assert.ok(html.includes(`rel="canonical" href="${canonical}"`));
    assert.ok(html.includes(`hrefLang="en" href="${site}/"`));
    assert.ok(html.includes(`hrefLang="pt-BR" href="${site}/pt"`));
    assert.ok(html.includes(`property="og:locale" content="${ogLocale}"`));
    assert.ok(html.includes(`property="og:image" content="${site}/brand/social.png"`));
    for (const name of ["Prumo", "Torvya", "Marcos Krep’s", "ISO/IEC 27001 Foundation"]) {
      assert.ok(html.includes(name), name);
    }
    assert.ok(html.includes('class="signal-poster"'));
    assert.ok(html.includes('href="#main"'));
  });
}

test("the export includes brand files and the complete article and project archive", () => {
  for (const file of ["brand/icon.svg", "brand/social.png", "brand/avatar.png", "sitemap.xml", "blog.html", "projetos.html"]) {
    assert.ok(readFileSync(new URL(file, out)).length > 0, file);
  }
  assert.ok(read("sitemap.xml").includes(`<loc>${site}/pt</loc>`));
  for (const [content, route] of [["posts", "blog"], ["projetos_posts", "projetos"]]) {
    const sources = readdirSync(new URL(`../${content}/`, import.meta.url)).filter(file => file.endsWith(".md"));
    for (const source of sources) assert.ok(read(`${route}/${source.replace(/\.md$/, ".html")}`).length > 0, source);
  }
});
