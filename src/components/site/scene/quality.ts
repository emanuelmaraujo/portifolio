/**
 * Graphics quality. The tier is chosen from what the device reports and what the visitor asked for, never from the
 * screen width alone, and the engine lowers it again if measured frame times stay slow.
 *
 *   high      full particle count and pixel ratio, reflections on the plaques, depth dust
 *   balanced  fewer particles, lower pixel ratio, no reflections
 *   lite      a small field at 30 fps and pixel ratio 1
 *   static    no WebGL: the CSS backdrop and the mark stand in, and the page is complete without the scene
 */
export type Tier = "high" | "balanced" | "lite" | "static";
export type Preference = "auto" | "lite" | "static";

const KEY = "motion";

export function preference(): Preference {
  try {
    const stored = localStorage.getItem(KEY);
    return stored === "lite" || stored === "static" ? stored : "auto";
  } catch {
    return "auto";
  }
}

export function setPreference(value: Preference) {
  try {
    if (value === "auto") localStorage.removeItem(KEY); else localStorage.setItem(KEY, value);
  } catch { /* Private mode: the choice lasts for this page only. */ }
  dispatchEvent(new CustomEvent("scene:preference"));
}

type Hints = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string } };

export function pickTier(): Tier {
  const wish = preference();
  if (wish === "static") return "static";
  const probe = document.createElement("canvas");
  const gl = (probe.getContext("webgl2") ?? probe.getContext("webgl")) as WebGLRenderingContext | null;
  if (!gl) return "static";
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const gpu = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
  gl.getExtension("WEBGL_lose_context")?.loseContext();

  const nav = navigator as Hints;
  const memory = nav.deviceMemory ?? 8, cores = nav.hardwareConcurrency ?? 8, network = nav.connection?.effectiveType ?? "";
  const software = /swiftshader|llvmpipe|software|basic render/i.test(gpu);
  if (wish === "lite" || software || nav.connection?.saveData || memory <= 2 || cores <= 2 || /2g/.test(network)) return "lite";
  if (memory <= 4 || cores <= 4 || network === "3g") return "balanced";
  return "high";
}

export type Budget = { particles: number; dpr: number; fps: number; dust: number; reflections: boolean };

export function budget(tier: Exclude<Tier, "static">, touch: boolean): Budget {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  if (tier === "high") return { particles: touch ? 15000 : 28000, dpr: Math.min(ratio, touch ? 1.5 : 1.75), fps: 60, dust: touch ? 260 : 520, reflections: true };
  if (tier === "balanced") return { particles: touch ? 10000 : 16000, dpr: Math.min(ratio, 1.25), fps: 60, dust: 180, reflections: false };
  return { particles: 6000, dpr: 1, fps: 30, dust: 0, reflections: false };
}
