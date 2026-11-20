# Writing articles and project notes

Articles live in `posts/` and project notes in `projetos_posts/`. Each text is one file in Git. There is no CMS: you
add a file, open a pull request and the build publishes it.

## Add a text

1. Copy `docs/templates/article.mdx` to `posts/<slug>.mdx` (or `projetos_posts/<slug>.mdx`).
2. Fill in the frontmatter and write.
3. For the other language, create `<slug>-en.mdx`. Files ending in `-en` are English, and the pair is linked
   automatically (language switch, `hreflang`, sitemap).
4. Run `npm run dev` and open `/blog/<slug>`.

Use `.md` for plain Markdown and `.mdx` when the text needs a component. Plain `.md` files are read as Markdown only, so
characters such as `<` and `{` need no escaping there.

## Frontmatter

The fields are validated in `src/components/site/entries.ts`. An unknown field, a wrong type or a malformed date stops
the build with the file name and the field.

| Field | Required | Purpose |
|---|---|---|
| `title` | yes | Heading and default page title |
| `date` | yes | `YYYY-MM-DD`, publication date |
| `updated` | no | `YYYY-MM-DD`, shown to readers and used as `dateModified` |
| `author` | no | Defaults to Emanuel Araújo |
| `lang` | no | `pt` or `en`. The `-en` suffix already implies English |
| `summary` | recommended | One or two sentences, up to 260 characters. Used in lists, meta description and social cards |
| `category` | recommended | One category. Drives the filter on the index and the related texts |
| `tags` | no | List of tags |
| `status` | no | `published` (default) or `draft`. Drafts appear in development and are left out of production builds |
| `references` | no | List of `{ title, url, publisher }`, rendered as the sources section and exported as `citation` |
| `related` | no | Slugs to suggest at the end. Without it, texts sharing the category or tags are suggested |
| `figure` | no | Seed of the particle figure. Defaults to the slug, so every text gets its own |
| `seo.title`, `seo.description` | no | Overrides for the page title and meta description |
| `liveUrl` | no | Adds an "open the project" button (project notes) |

Reading time, the table of contents, the progress indicator, canonical URL, Open Graph tags and the
`BlogPosting`/`TechArticle` structured data are generated. Nothing else needs to be written by hand.

## Structure

Every `##` heading starts a section. Sections become the table of contents, and the particle figure rearranges itself
from one to the next. Text before the first `##` is the opening.

## Components available in `.mdx`

| Component | Use |
|---|---|
| `<Callout title="...">` | A key concept set apart from the text |
| `<DataFlowDiagram title="..." steps={[{ name, text, enters, leaves }]} note="..." />` | A pipeline the reader can step through |
| `<InteractiveRiskMatrix />` | Likelihood by impact, with adjustable risk appetite |
| `<DecisionSimulator />` | The vulnerability prioritisation model in `src/lib/risk-model.ts` |

Fenced code blocks are highlighted at build time and get a copy button. Tables use GitHub syntax and scroll
horizontally on small screens. External links open in a new tab.

To add a component, write it in `src/components/site/article/widgets.tsx` and register it in
`src/components/site/article/render.tsx`. Rules for a new one:

- It must work with keyboard and screen reader, using native form controls where possible.
- It must not depend on the 3D scene.
- If it shows a model or example data, it says so and states its limits.

## Before publishing

- No internal host names, addresses, paths, credentials or data from an employer or a client. Replace real names with
  examples (`service.apps.example.internal`).
- Every factual claim has a source in `references`, and nothing is attributed to experience that did not happen.
- MDX is compiled as code during the build. Only files in this repository are compiled. Never feed it text from
  visitors or from a form.

If a text changes address, add the old and new paths to `moved` in `next.config.js` so old links keep working.
