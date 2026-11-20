# Motion and 3D architecture

The site has one visual engine and a small set of rules about who animates what. This file records those rules and the
decisions behind them.

## Who owns what

| Layer | Owns | Files |
|---|---|---|
| Scene engine (Three.js) | The particle field, camera, plaques and badges, pointer and touch response, the only render loop | `src/components/site/scene/` |
| CSS | Reveals, hover and press states, scroll-linked moves (`animation-timeline`), layout transitions | `site.css`, `experience.css`, `reading.css` |
| React | State of interactive pieces. It never talks to WebGL | `src/components/site/*.tsx` |

React and the engine communicate through data attributes on each chapter (`data-form`, `data-active`, `data-turn`, ...)
and three window events: `scene:chapter`, `scene:quality` and `scene:preference`. The attribute contract is documented
at the top of `scene/engine.ts`.

## Decisions

- **No GSAP.** The engine already maps scroll position to a continuous chapter position and morphs between figures.
  Reveals and scroll-linked moves are CSS. A second timeline library would duplicate both jobs and add its weight to
  every page.
- **Framer Motion is not used by the site.** It remains in `package.json` only for the legacy components in
  `src/components/*.js`, which no route imports.
- **One canvas, one loop.** Plaques, badges and depth dust share the particle field's renderer and frame. Nothing else
  calls `requestAnimationFrame` continuously.
- **MDX compiled with `@mdx-js/mdx` in server components.** Articles ship no MDX runtime to the browser. Code is
  highlighted at build time.
- **No blocking intro.** The hero text is server-rendered and readable at first paint. The field condenses in behind
  it, and the first scroll speeds that up.

## Quality tiers

`scene/quality.ts` picks a tier before three.js is downloaded.

| Tier | When | Particles (desktop / touch) | Pixel ratio | Extras |
|---|---|---|---|---|
| high | capable device | 28,000 / 15,000 | up to 1.75 / 1.5 | depth dust, reflections on the plaques |
| balanced | 4 GB of memory or 4 cores or less, or a 3G connection | 16,000 / 10,000 | up to 1.25 | depth dust |
| lite | 2 GB or 2 cores or less, data saver, software renderer, or chosen by the visitor | 6,000 | 1 | 30 fps |
| static | no WebGL, or chosen by the visitor | none | none | CSS backdrop and the mark. Three.js is never downloaded |

Screen width is not an input. The visitor's choice (footer control, stored in `localStorage` under `motion`) wins over
detection. `prefers-reduced-motion` keeps the tier and removes travel: figures swap in place, the loop stops when
nothing changes.

Measured performance has the last word. If frames stay slower than 1.45 times the target for about 50 frames, the
engine lowers the pixel ratio, then the number of particles drawn (through a shuffled index, so figures thin evenly),
then the frame rate. Steps are one-way for the visit.

## Rendering budget

- Hidden tab: the loop stops.
- Nothing moved for 4 seconds: 24 fps.
- Reduced motion and nothing changing: the loop stops and wakes on scroll, input or attribute changes.
- Context lost: the loop stops and the static backdrop takes over.

## Input

The rule is direct manipulation: what moves is tied to what the visitor is moving, by position and not by speed.

- Scroll: the figure turns with the scroll position, so it travels exactly as far as the page and returns with it.
  Scroll speed only adds a faint streak.
- Drag on a `data-grab` surface: the figure follows the finger one to one through a short spring, keeps a little
  momentum on release and eases home. The surfaces set `touch-action: pan-y`, so vertical scrolling always belongs to
  the page.
- Tap or click: one ring travels through the field from that point. A finger that is scrolling triggers nothing.
- Mouse: slight parallax, and the surface under the cursor swells and brightens. Particles are not pushed aside.
- Device tilt: opt-in through a button, with the permission prompt where the browser requires one.
- Keyboard: every drag has a button alternative (`data-turn`), and every interactive piece is a native control.

The page itself only moves vertically (`touch-action: pan-y pinch-zoom` on `main`, `overflow-x: clip` on the root).
Nothing may be wider than the viewport: a scaled full-width layer once widened the layout viewport on phones and let the
fixed header slide sideways. The route tests cannot catch that, so check `innerWidth === scrollWidth` in a phone
viewport after adding any transformed full-bleed element.

## Adding a figure

1. Write a form function in `scene/forms.ts` and add it to `makers` and to `FormName`.
2. Give it a pose in `POSES` in `scene/engine.ts`.
3. Use it with `data-form="name"` on a chapter, and describe it with `data-caption`.
