/**
 * The rendered take, as the page needs to know it. These numbers mirror docs/portfolio-next/assets-src/mesa.py: the
 * frames the camera rests on, the order of the project stops, and where every key of the table lands on screen at
 * each rest (printed by `mesa.py … anchors`, as fractions of the frame from its top left).
 *
 * The film is the rendered take (001 to 330) with one sequence spliced in after frame 120: the camera stands still
 * there while the eight layers of the second act switch on, six frames each (a01 to a48). Positions in the film are
 * counted over that spliced list; the scenes keep the frame numbers of the render (120, 208, …) as their names.
 */
export const BASE = "/prototypes/percurso";
export const ARM = 48, ARM_STEP = 6, ARM_AT = 120;
const pad = (n: number, size = 3) => String(n).padStart(size, "0");
export const SEQ: string[] = [
  ...Array.from({ length: ARM_AT }, (_, i) => pad(i + 1)),
  ...Array.from({ length: ARM }, (_, i) => "a" + pad(i + 1, 2)),
  ...Array.from({ length: 330 - ARM_AT }, (_, i) => pad(ARM_AT + 1 + i)),
];
export const FRAMES = SEQ.length;
/** The English take shares the frames that show no word: everything before the table lights up. */
export const SHARED = 95;

/** Scroll fraction → position in the film. Flat stretches are the rests. */
export const TIMELINE: [number, number][] = [
  [0, 1], [0.03, 5],
  [0.125, 76], [0.17, 76],      // projeto
  [0.245, 120],                 // protejo: the table lights up with nothing armed…
  [0.365, 168], [0.4, 168],     // …and the layers switch on one after another, then stay to be touched
  [0.535, 235], [0.555, 235],   // orquestro: the model puts itself together while one scrolls
  [0.605, 256], [0.65, 256],    // project 1
  [0.695, 284], [0.74, 284],    // project 2
  [0.785, 312], [0.83, 312],    // project 3
  [0.895, 356], [0.925, 356],   // the whole table from above, in paper
  [0.975, 378], [1, 378],       // the same table, lit
];
/** The scene each rest belongs to, by the frame number of the render. */
export const REST_ID: Record<number, number> = { 76: 76, 168: 120, 235: 187, 256: 208, 284: 236, 312: 264, 356: 308, 378: 330 };
/** Where each act begins: 0 opening, 1 to 3 the verbs, 4 to 6 one project each, 7 the hand-off. */
export const MARKS = [0, 0.04, 0.17, 0.4, 0.555, 0.65, 0.74, 0.83];
/** The rest of each project stop, in the order of PROJECTS in mesa.py. A fourth project needs a fourth stop rendered. */
export const PROJECT_RESTS: [number, number][] = [[0.605, 0.65], [0.695, 0.74], [0.785, 0.83]];
/** Where the dock and the model of the last view send the page. */
export const GO = { projeto: 0.15, protejo: 0.385, orquestro: 0.545, systems: 0.63, paper: 0.91, lit: 1 };
/** The scenes where the table can be touched. */
export const PROTEJO = 120, STOPS = [208, 236, 264], END = 308, END_LIT = 330;

/** The eight layers of the second act, in the order of the dock, from the outside in. */
export const LAYERS = ["firewall", "identity", "uem", "edr", "servers", "backup", "monitor", "govern"] as const;
/** The state each project stop is rendered in within the take itself. */
export const DEFAULTS = [0, 0, 3];
export const VARIANTS = [3, 3, 6];

type Box = [number, number, number, number];
/** Boxes of the keys on screen: left, top, right, bottom. Landscape take. */
export const HOT: Record<number, Record<string, Box>> = {
  120: { firewall: [0.0258, 0.766, 0.1431, 0.8376], identity: [0.1389, 0.7716, 0.2536, 0.8436], uem: [0.2526, 0.7773, 0.3647, 0.8497], edr: [0.3669, 0.783, 0.4762, 0.8558], servers: [0.4817, 0.7888, 0.589, 0.8619], backup: [0.5963, 0.7946, 0.705, 0.8681], monitor: [0.709, 0.8004, 0.8216, 0.8742], govern: [0.8223, 0.8062, 0.9387, 0.8804] },
  208: { k0: [0.1269, 0.7919, 0.374, 0.8609], k1: [0.3953, 0.7881, 0.6386, 0.8568], k2: [0.6579, 0.7843, 0.9053, 0.8528] },
  236: { k0: [0.116, 0.7715, 0.3622, 0.8485], k1: [0.3807, 0.7848, 0.624, 0.8626], k2: [0.6463, 0.7982, 0.8948, 0.877] },
  264: { k0: [0.1069, 0.7467, 0.3511, 0.8378], k1: [0.3667, 0.7765, 0.6101, 0.8701], k2: [0.6334, 0.8071, 0.8823, 0.9032] },
  308: {
    model: [0.3794, 0.2626, 0.6416, 0.7266], photo: [0.023, 0.4226, 0.2, 0.7953],
    link0: [0.7253, 0.2059, 0.899, 0.2703], link1: [0.7517, 0.2979, 0.9257, 0.3625], link2: [0.7303, 0.3903, 0.9046, 0.4551], link3: [0.7525, 0.4829, 0.9271, 0.5479], link4: [0.7354, 0.5758, 0.9103, 0.641], link5: [0.7533, 0.669, 0.9284, 0.7344],
    chip0: [0.4193, 0.8688, 0.5948, 0.9473], chip1: [0.6034, 0.8688, 0.7791, 0.9473], chip2: [0.7874, 0.8688, 0.9633, 0.9473],
  },
  330: {
    model: [0.3794, 0.2626, 0.6416, 0.7266], photo: [0.0274, 0.4319, 0.1956, 0.7859],
    link0: [0.7383, 0.2029, 0.9294, 0.2734], link1: [0.7386, 0.2979, 0.9301, 0.3687], link2: [0.739, 0.3933, 0.9308, 0.4643], link3: [0.7394, 0.489, 0.9315, 0.5603], link4: [0.7398, 0.5851, 0.9322, 0.6565], link5: [0.7402, 0.6814, 0.9329, 0.7531],
    chip0: [0.4193, 0.8688, 0.5948, 0.9473], chip1: [0.6034, 0.8688, 0.7791, 0.9473], chip2: [0.7874, 0.8688, 0.9633, 0.9473],
  },
};

/** The same keys in the upright take. */
export const HOT_P: Record<number, Record<string, Box>> = {
  120: { firewall: [0.0504, 0.7353, 0.2671, 0.7916], identity: [0.279, 0.7353, 0.4932, 0.7916], uem: [0.5076, 0.7353, 0.7218, 0.7916], edr: [0.7336, 0.7353, 0.9504, 0.7916], servers: [0.0443, 0.8002, 0.264, 0.858], backup: [0.2761, 0.8002, 0.4931, 0.858], monitor: [0.5077, 0.8002, 0.7248, 0.858], govern: [0.7368, 0.8002, 0.9565, 0.858] },
  208: { k0: [0.0426, 0.7859, 0.34, 0.8493], k1: [0.3528, 0.7859, 0.6481, 0.8492], k2: [0.6608, 0.7859, 0.9582, 0.8492] },
  236: { k0: [0.0426, 0.7859, 0.34, 0.8493], k1: [0.3528, 0.7859, 0.6481, 0.8492], k2: [0.6608, 0.7859, 0.9582, 0.8492] },
  264: { k0: [0.0426, 0.7859, 0.34, 0.8493], k1: [0.3528, 0.7859, 0.6481, 0.8492], k2: [0.6608, 0.7859, 0.9582, 0.8492] },
  308: { model: [0.3288, 0.3935, 0.701, 0.6017], photo: [0.1571, 0.1716, 0.3539, 0.3072], link0: [0.1639, 0.6495, 0.413, 0.679], link1: [0.587, 0.6495, 0.8361, 0.679], link2: [0.1632, 0.6953, 0.4128, 0.725], link3: [0.5872, 0.6953, 0.8368, 0.725], link4: [0.1625, 0.7413, 0.4126, 0.7711], link5: [0.5874, 0.7413, 0.8375, 0.7711], chip0: [0.0651, 0.7953, 0.3161, 0.831], chip1: [0.3747, 0.7953, 0.6253, 0.831], chip2: [0.6839, 0.7953, 0.9349, 0.831] },
  330: { model: [0.3288, 0.3935, 0.701, 0.6017], photo: [0.1571, 0.1716, 0.3539, 0.3072], link0: [0.1327, 0.646, 0.4441, 0.6826], link1: [0.5559, 0.646, 0.8673, 0.6826], link2: [0.1319, 0.6917, 0.4439, 0.7285], link3: [0.5561, 0.6917, 0.8681, 0.7285], link4: [0.1312, 0.7377, 0.4438, 0.7746], link5: [0.5562, 0.7377, 0.8688, 0.7746], chip0: [0.0651, 0.7953, 0.3161, 0.831], chip1: [0.3747, 0.7953, 0.6253, 0.831], chip2: [0.6839, 0.7953, 0.9349, 0.831] },
};

/** Links that do not exist yet. Fill them in and the keys of the last view come alive. */
export const NOTION = { skills: "", updates: "" };
