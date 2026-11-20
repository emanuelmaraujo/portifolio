import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { z } from "zod";
import type { Locale } from "./content";

/**
 * Articles (`posts/`) and project notes (`projetos_posts/`) are Markdown or MDX files in this repository. English
 * versions end in `-en`. The frontmatter is validated here, so a typo in a field name or a malformed date fails the
 * build instead of reaching the site. See docs/ARTICLES.md.
 */
export type Collection = "posts" | "projetos_posts";

const day = z.preprocess(value => (value instanceof Date ? value.toISOString().slice(0, 10) : value), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use YYYY-MM-DD"));

const frontmatter = z.object({
  title: z.string().min(1),
  date: day,
  /** Set when the text is revised. Shown to readers and used as `dateModified`. */
  updated: day.optional(),
  author: z.string().default("Emanuel Araújo"),
  lang: z.enum(["pt", "en"]).optional(),
  /** One or two sentences. Used in lists, as the meta description and in social cards. */
  summary: z.string().max(260).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  /** Drafts are built in development and left out of production builds. */
  status: z.enum(["published", "draft"]).default("published"),
  references: z.array(z.object({ title: z.string(), url: z.string().url(), publisher: z.string().optional() })).default([]),
  /** Slugs of related texts in the same collection. Without it, texts sharing a category or tags are suggested. */
  related: z.array(z.string()).default([]),
  /** Seed of the particle figure. Defaults to the slug, so every text has its own. */
  figure: z.string().optional(),
  liveUrl: z.string().optional(),
  repoUrl: z.string().optional(),
  seo: z.object({ title: z.string().optional(), description: z.string().optional() }).strict().default({}),
}).strict();

export type Entry = {
  slug: string; title: string; date: string; updated?: string; author: string; lang: "en" | "pt"; summary?: string; category?: string;
  tags: string[]; status: "published" | "draft"; references: { title: string; url: string; publisher?: string }[]; related: string[];
  figure: string; liveUrl?: string; seo: { title?: string; description?: string }; minutes: number; format: "md" | "mdx";
  /** Slug of the same text in the other language, when it exists. */
  twin?: string;
};

const folder = (collection: Collection) => path.join(process.cwd(), collection);
const twinOf = (slug: string) => (slug.endsWith("-en") ? slug.slice(0, -3) : slug + "-en");
const fileOf = (collection: Collection, slug: string) => {
  for (const format of ["mdx", "md"] as const) {
    const file = path.join(folder(collection), `${slug}.${format}`);
    if (fs.existsSync(file)) return { file, format };
  }
  return null;
};

function read(collection: Collection, slug: string) {
  const found = fileOf(collection, slug);
  if (!found) return null;
  const { data, content } = matter(fs.readFileSync(found.file, "utf8"));
  const parsed = frontmatter.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map(issue => `  ${issue.path.join(".") || "(root)"}: ${issue.message}`).join("\n");
    throw new Error(`Invalid frontmatter in ${collection}/${slug}.${found.format}\n${issues}`);
  }
  const meta = parsed.data, twin = twinOf(slug);
  const entry: Entry = {
    slug, title: meta.title, date: meta.date, updated: meta.updated, author: meta.author,
    lang: slug.endsWith("-en") || meta.lang === "en" ? "en" : "pt",
    summary: meta.summary, category: meta.category, tags: meta.tags, status: meta.status, references: meta.references, related: meta.related,
    figure: meta.figure ?? slug, liveUrl: meta.liveUrl && meta.liveUrl !== "#" ? meta.liveUrl : undefined, seo: meta.seo,
    minutes: Math.max(1, Math.round(content.split(/\s+/).filter(Boolean).length / 200)), format: found.format,
    twin: fileOf(collection, twin) ? twin : undefined,
  };
  return { entry, content };
}

const visible = (entry: Entry) => entry.status === "published" || process.env.NODE_ENV !== "production";

export function slugs(collection: Collection) {
  return fs.readdirSync(folder(collection)).filter(file => /\.mdx?$/.test(file)).map(file => file.replace(/\.mdx?$/, ""))
    .filter(slug => visible(read(collection, slug)!.entry));
}

/** Newest first. With a locale, only that language. */
export function entries(collection: Collection, locale?: Locale) {
  const lang = locale === "en" ? "en" : "pt";
  return slugs(collection).map(slug => read(collection, slug)!.entry)
    .filter(entry => !locale || entry.lang === lang)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
}

/** The entry with its Markdown source. Rendering lives in article/render.tsx. */
export function entry(collection: Collection, slug: string) {
  const found = read(collection, slug);
  return found && visible(found.entry) ? { ...found.entry, source: found.content } : null;
}

/** Texts worth reading next: the ones named in `related`, then those sharing the category or the most tags. */
export function related(collection: Collection, item: Entry, limit = 2) {
  const pool = entries(collection, item.lang === "en" ? "en" : "pt-BR").filter(other => other.slug !== item.slug);
  const named = item.related.map(slug => pool.find(other => other.slug === slug)).filter((other): other is Entry => Boolean(other));
  const scored = pool.filter(other => !named.includes(other))
    .map(other => ({ other, score: (other.category && other.category === item.category ? 2 : 0) + other.tags.filter(tag => item.tags.includes(tag)).length }))
    .filter(({ score }) => score > 0).sort((a, b) => b.score - a.score).map(({ other }) => other);
  return [...named, ...scored].slice(0, limit);
}

export function formatDate(date: string, locale: Locale | "pt" | "en") {
  return new Date(date + "T12:00:00").toLocaleDateString(locale === "en" ? "en-GB" : "pt-BR", { day: "numeric", month: "short", year: "numeric" });
}
