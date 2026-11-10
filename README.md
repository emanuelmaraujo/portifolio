# Emanuel Araújo · Engineering Portfolio

Bilingual portfolio for AI engineering, agent orchestration, cybersecurity, IT leadership and product building. The English edition is the default. The Brazilian Portuguese edition lives at `/pt`.

## Local development

Validated on Windows with Node.js 26.13.0, npm 11.20.0, Git 2.56.0.windows.4, GitHub CLI 2.103.3, pnpm 11.25.0 and Python 3.14.10. Agent CLI versions were Codex 0.167.0-alpha.3.2 and Claude Code 2.1.317.

```powershell
npm ci
npm run dev
```

Open `http://localhost:3000/portifolio/`. For production validation, run these commands from the repository root.

```powershell
npm run build
npm run lint
npm run typecheck
npm test
```

Next.js exports the site into `out/`. Serve that directory at the `/portifolio` mount point with clean URL support for local production previews. GitHub Pages continues to use the existing workflow and base path. The implementation branch is for review.

## Architecture and identity

- Next.js App Router, TypeScript and static export. The two portfolio layouts emit their own document language, canonical and alternate links, and Open Graph metadata. Articles and older projects keep their existing paths and archive layout.
- `src/components/portfolio/content.ts` contains the parallel English and Brazilian Portuguese content. The three featured case studies separate the challenge, architecture and evidence. Their diagrams are original illustrations.
- **The Signal** is an EA monogram made of three linked planes for intelligence, trust and operations. The same geometry produces the static SVG and the perspective Canvas2D scene. A separate chunk loads only when the stage enters the viewport on fine-pointer devices with motion enabled. Frames are scheduled on interaction, resizing and scroll. The pixel ratio is capped at 1.5. The SVG covers mobile, reduced motion and renderer failure.
- Three.js would make sense for a scene with materials and lighting. React Three Fiber and Drei would add abstractions for a larger Three.js scene. GSAP would support sequenced animation. The chosen scene uses line geometry, perspective and restrained pointer easing, so none of these are runtime dependencies.
- `portfolio.css` contains the design tokens. Graphite `#0b1111`, warm white `#edf6ef` and mint `#9bf1c7` anchor the palette. System sans and mono stacks pair with Georgia italic. Reusable wordmarks, the favicon, avatar and social preview are under `public/brand/`.
- Linear informed content hierarchy, Bruno Simon informed purposeful spatial interaction and Awwwards helped survey WebGL presentation. Active Theory and Vercel were secondary references. The visual assets were drawn for this project. [Linear](https://linear.app/) · [Bruno Simon](https://bruno-simon.com/) · [Awwwards](https://www.awwwards.com/websites/webgl/) · [Active Theory](https://activetheory.net/) · [Vercel](https://vercel.com/)

## Evidence and scope

Prumo’s adapters, workers and publishing paths support the commerce case. Torvya’s app dependencies and edge redirect implementation support the NFC case. Marcos Krep’s checkout components, migrations and tests support the POS case. Promos is a prototype exercised against a simulated store, Cezar is a fork of the upstream orchestration tool, and VideoFactory is an audiovisual pilot. Private repository details stay out of public copy. The career section draws from the existing portfolio, public profile and the supplied education and certification.

| Check | Result |
| --- | --- |
| Static build, TypeScript, export tests | Pass. Both languages, metadata, brand assets and all archive content are covered by the export tests. |
| ESLint | Pass with 16 unused-variable warnings in legacy files. |
| Browser verification | Chrome at 1440×900, 768×1024, 390×844 and 320×720. Tested reflow, keyboard navigation, case studies, workflow, language switch, pointer/scroll motion, Canvas2D failure and reduced-motion changes. |
| Accessibility | Axe WCAG 2.0/2.1 A and AA checks reported zero violations on the English and Portuguese landing pages at desktop and mobile sizes. Screen-reader and physical-device checks were outside this test run. |
| Local performance | Three cold browser contexts on localhost at 1440×900. Median observed LCP moved from 324 ms in the previous local export to 140 ms in the new one. Uncompressed JS fetched fell from 592 KiB to 348 KiB, and new CLS was zero in the sample. No field CWV or representative mobile GPU data were collected. |
| Security and dependencies | The landing uses static content, original assets and no tracking, auth, forms or third-party scripts. Next.js and its lint config were updated within major version 15. npm audit still reports 15 findings when omitting dev dependencies and 66 across the full tree, including two critical findings in inherited tooling. GitHub Pages serves the static export without that tooling. |

## Agent Skills used

The library at `D:/dev/skills` is the canonical local copy. Junctions under `~/.agents/skills` and `~/.claude/skills` expose each package to both tools. Codex returned all 24 packages through `skills/list`. Claude Code startup logs also reported 24 user skills. Claude CLI authentication is separate from discovery. The repository validator and its six unit tests passed. [Agent Skills library](https://github.com/emanuelmaraujo/skills) · [Codex skill discovery](https://learn.chatgpt.com/docs/build-skills) · [Claude Code skill discovery](https://code.claude.com/docs/en/skills)

| Skills | Use in this change |
| --- | --- |
| `web-design-orchestrator`, `web-reference-researcher` | Ordered discovery, creative direction, implementation and verification. Assigned a purpose to each primary reference. |
| `product-art-direction`, `design-system-architect`, `premium-landing-builder` | Shaped the monogram, token palette, typography, content hierarchy and responsive project layouts. |
| `web-3d-experience-builder`, `web-motion-engineer` | Separated SVG and interactive rendering, limited canvas work and verified reduced motion. |
| `frontend-visual-qa`, `web-accessibility-audit`, `web-performance-engineer` | Verified screenshots, keyboard paths, layout, accessibility and comparable local performance samples. |
| `web-security-review`, `seo-technical-auditor` | Reviewed publishable content and dependencies. Verified locale, alternate links, canonical URLs and social assets in the static export. |

The Codex Skill Installer and OpenAI Docs informed setup. Vercel React Best Practices informed the TSX self-review. Browser validation was performed separately from the implementation checks. An independent human review remains part of the pull request process.
