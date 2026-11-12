import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import type { Locale } from "./content";

/** Articles (`posts/`) and project notes (`projetos_posts/`) are Markdown files. English versions end in `-en`. */
export type Collection = "posts" | "projetos_posts";
export type Entry = {
  slug: string; title: string; date: string; lang: "en" | "pt"; summary?: string; tags?: string[]; liveUrl?: string;
  /** Slug of the same text in the other language, when it exists. */
  twin?: string;
};

const folder = (collection: Collection) => path.join(process.cwd(), collection);
const twinOf = (slug: string) => (slug.endsWith("-en") ? slug.slice(0, -3) : slug + "-en");

export function slugs(collection: Collection) {
  return fs.readdirSync(folder(collection)).filter(file => file.endsWith(".md")).map(file => file.replace(/\.md$/, ""));
}

function read(collection: Collection, slug: string) {
  const file = path.join(folder(collection), slug + ".md");
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const twin = twinOf(slug);
  const entry: Entry = {
    slug, title: String(data.title), date: String(data.date), lang: slug.endsWith("-en") || data.lang === "en" ? "en" : "pt",
    summary: data.summary, tags: data.tags, liveUrl: data.liveUrl && data.liveUrl !== "#" ? data.liveUrl : undefined,
    twin: fs.existsSync(path.join(folder(collection), twin + ".md")) ? twin : undefined,
  };
  return { entry, content };
}

/** Newest first. With a locale, only that language. */
export function entries(collection: Collection, locale?: Locale) {
  const lang = locale === "en" ? "en" : "pt";
  return slugs(collection).map(slug => read(collection, slug)!.entry)
    .filter(entry => !locale || entry.lang === lang)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function entry(collection: Collection, slug: string) {
  const found = read(collection, slug);
  if (!found) return null;
  return { ...found.entry, html: String(await remark().use(html).process(found.content)) };
}

export function formatDate(date: string, locale: Locale | "pt" | "en") {
  return new Date(date + "T12:00:00").toLocaleDateString(locale === "en" ? "en-GB" : "pt-BR", { day: "numeric", month: "short", year: "numeric" });
}
