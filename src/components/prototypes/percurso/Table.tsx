"use client";

import { useEffect, useRef, useState } from "react";
import { BASE, DEFAULTS, END, END_LIT, GO, HOT, HOT_P, LAYERS, PROJECT_RESTS, PROTEJO, STOPS, VARIANTS } from "./take";
import { words, type Lang } from "./words";

/**
 * What can be touched on the table. The take itself is a film; at each rest the keys drawn on the table become real
 * buttons, laid exactly over the picture, and the picture answers: the page composes the rendered states of that rest
 * on a canvas over the film. Second act: the film switches the eight layers on while one scrolls, and once they are
 * all on they can be switched in any order. Project stops: one render for each scenario. Last view: the film itself
 * turns the paper table into the lit one, and the model in the middle plays it either way.
 *
 * The explanation of what was touched goes to one short caption at the foot of the screen.
 */
const load = (src: string) => { const im = new Image(); im.decoding = "async"; im.src = src; return im; };
const ok = (im?: HTMLImageElement) => !!im && im.complete && im.naturalWidth > 0;

export default function Table({ links, projects, lang }: { links: string[]; projects: string[]; lang: Lang }) {
  const w = words[lang];
  const canvas = useRef<HTMLCanvasElement>(null);
  const [rest, setRest] = useState(0), [act, setAct] = useState(0), [take, setTake] = useState("l"), [arm, setArm] = useState(0);
  const [on, setOn] = useState<boolean[]>(() => LAYERS.map(() => true));
  const [variant, setVariant] = useState<number[]>(() => [...DEFAULTS]);
  const [said, setSaid] = useState("");
  const state = useRef({ rest, on, variant }); state.current = { rest, on, variant };

  // The film tells where it rests, which act it is in, and which layer it is switching on.
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".px-p");
    if (!root) return;
    const read = () => { setRest(Number(root.dataset.rest || 0)); setAct(Number(root.dataset.act || 0)); setTake(root.dataset.take || "l"); setArm(Number(root.dataset.arm || 0)); };
    const watch = new MutationObserver(read);
    watch.observe(root, { attributes: true, attributeFilter: ["data-rest", "data-act", "data-take", "data-arm"] });
    read();
    return () => watch.disconnect();
  }, []);
  // Leaving a rest puts the table back as the film shows it.
  useEffect(() => { if (!rest) { setOn(LAYERS.map(() => true)); setVariant([...DEFAULTS]); setSaid(""); } }, [rest]);

  // The canvas over the film: it only shows while what it draws differs from the film, or is on its way back.
  useEffect(() => {
    const el = canvas.current, box = el?.parentElement;
    const ctx = el?.getContext("2d");
    if (!el || !box || !ctx) return;
    [el.width, el.height] = take === "p" ? [1080, 1920] : [1920, 1080];
    const dir = `${BASE}${lang === "en" ? "/en" : ""}/${take}`, bank = new Map<string, HTMLImageElement>();
    const img = (name: string) => { let im = bank.get(name); if (!im) { im = load(`${dir}/${name}.webp`); bank.set(name, im); } return im; };
    const alpha = LAYERS.map(() => 1), mix = { from: -1, to: -1, t: 1 };
    let gauge = { from: 8, to: 8, t: 1 }, raf = 0, last = performance.now(), scene = 0, live = false;
    const ease = (now: number, goal: number, k: number) => now + (goal - now) * k;
    const tick = (time: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((time - last) / 1000, 0.05), k = Math.min(1, dt * 7); last = time;
      const s = state.current;
      if (s.rest !== scene) { scene = s.rest; mix.from = mix.to = -1; mix.t = 1; LAYERS.forEach((_, i) => { alpha[i] = 1; }); gauge = { from: 8, to: 8, t: 1 }; }
      let show = false;
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
      if (scene === PROTEJO) {
        const count = s.on.filter(Boolean).length;
        if (count !== gauge.to) gauge = { from: gauge.to, to: count, t: 0 };
        gauge.t = Math.min(1, gauge.t + dt * 4);
        let moving = gauge.t < 1;
        LAYERS.forEach((_, i) => { const goal = s.on[i] ? 1 : 0; if (Math.abs(alpha[i] - goal) > 0.004) { alpha[i] = ease(alpha[i], goal, k); moving = true; } else alpha[i] = goal; });
        show = moving || count < LAYERS.length;
        const base = img("s120-base");
        if (show && ok(base)) {
          ctx.drawImage(base, 0, 0, el.width, el.height);
          ctx.globalCompositeOperation = "lighter";
          LAYERS.forEach((name, i) => { const im = img("s120-" + name); if (alpha[i] > 0 && ok(im)) { ctx.globalAlpha = alpha[i]; ctx.drawImage(im, 0, 0, el.width, el.height); } });
          for (const [n, a] of [[gauge.from, 1 - gauge.t], [gauge.to, gauge.t]] as const) { const im = img("s120-g" + n); if (a > 0 && ok(im)) { ctx.globalAlpha = a; ctx.drawImage(im, 0, 0, el.width, el.height); } }
        } else if (show) show = false;
        else LAYERS.forEach(name => img("s120-" + name));  // warm the bank while the visitor reads
      } else if (STOPS.includes(scene)) {
        const n = STOPS.indexOf(scene), v = s.variant[n];
        if (mix.to < 0) mix.from = mix.to = v;
        if (v !== mix.to) { mix.from = mix.to; mix.to = v; mix.t = 0; }
        mix.t = Math.min(1, mix.t + dt * 3.2);
        show = v !== DEFAULTS[n] || mix.t < 1;
        const a = img(`s${scene}-${mix.from}`), b = img(`s${scene}-${mix.to}`);
        if (show && ok(a) && ok(b)) { ctx.drawImage(a, 0, 0, el.width, el.height); ctx.globalAlpha = mix.t; ctx.drawImage(b, 0, 0, el.width, el.height); }
        else if (show) show = false;
        else for (let i = 0; i < VARIANTS[n]; i++) img(`s${scene}-${i}`);
      }
      if (show !== live) { live = show; box.dataset.live = show ? "1" : ""; }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [take, lang]);

  const hot = (take === "p" ? HOT_P : HOT)[rest] || {};
  const place = (id: string) => { const b = hot[id]; return b ? { left: b[0] * 100 + "%", top: b[1] * 100 + "%", width: (b[2] - b[0]) * 100 + "%", height: (b[3] - b[1]) * 100 + "%" } : undefined; };
  const stop = STOPS.indexOf(rest), end = rest === END || rest === END_LIT, lit = rest === END_LIT;
  const count = on.filter(Boolean).length;
  let caption = w.acts[act] || "";
  if (rest === PROTEJO) caption = said || (count === LAYERS.length ? w.protejo.full : w.protejo.some(count));
  else if (act === 2 && arm) caption = w.protejo.arming(arm, ...w.layers[LAYERS[arm - 1]]);
  else if (act === 2) caption = w.protejo.enter;
  else if (stop >= 0) caption = w.stopsCopy[stop].states[variant[stop]];
  else if (act >= 4 && act <= 6) caption = w.stopsCopy[act - 4].states[DEFAULTS[act - 4]];
  else if (end) caption = said || (lit ? w.end.lit : w.end.paper);
  else if (act === 7) caption = w.end.between;

  const toggle = (i: number) => {
    const next = on.map((v, n) => (n === i ? !v : v)); setOn(next);
    const [name, text] = w.layers[LAYERS[i]];
    setSaid(`${name} ${next[i] ? w.on : w.off}: ${text}`);
  };
  const pick = (k: number) => {
    const n = stop, now = variant[n];
    const next = n === 2 ? (k === 0 ? Math.max(0, now - 1) : k === 1 ? Math.min(VARIANTS[2] - 1, now + 1) : 0) : k;
    setVariant(variant.map((v, i) => (i === n ? next : v)));
  };

  return (
    <>
      <div className="p-table" data-scene={rest || ""}>
        <canvas ref={canvas} width={1920} height={1080} aria-hidden="true" />
        {rest === PROTEJO && LAYERS.map((name, i) => (
          <button type="button" className="p-hot" style={place(name)} aria-pressed={on[i]} onClick={() => toggle(i)} key={name}>{w.layers[name][0]}</button>
        ))}
        {stop >= 0 && w.stopsCopy[stop].keys.map((name, k) => (
          <button type="button" className="p-hot" style={place("k" + k)} aria-pressed={stop === 2 ? undefined : variant[stop] === k} onClick={() => pick(k)} key={name}>{name}</button>
        ))}
        {end && (
          <>
            {/* The model plays the film to the other state of the table, and back. */}
            <button type="button" className="p-hot p-hot--model" style={place("model")} aria-pressed={lit} data-go={lit ? GO.paper : GO.lit} data-glide="1" onClick={() => setSaid("")}>{lit ? w.end.toPaper : w.end.toLit}</button>
            {w.links.map((name, k) => links[k]
              ? <a className="p-hot" style={place("link" + k)} href={links[k]} target={links[k].startsWith("http") ? "_blank" : undefined} rel="noreferrer" key={name}>{name}</a>
              : <button type="button" className="p-hot" style={place("link" + k)} aria-disabled="true" onClick={() => setSaid(`${name}: ${w.soon}.`)} key={name}>{name}, {w.soon}</button>)}
            {projects.map((name, k) => (
              <button type="button" className="p-hot" style={place("chip" + k)} data-go={(PROJECT_RESTS[k][0] + PROJECT_RESTS[k][1]) / 2} key={name}>{name}</button>
            ))}
          </>
        )}
      </div>
      <p className="p-caption" aria-live="polite" data-on={caption ? "1" : ""}>{caption}</p>
    </>
  );
}
