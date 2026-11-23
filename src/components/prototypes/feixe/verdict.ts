/**
 * A reduced reading of Prumo's verdict rules over demonstration data. The thresholds are the ones in the product's
 * policy module: a 90-day window cut back to what was really observed, 3% tolerance for "near the lowest", at least
 * four observations before the word "lowest" is allowed, a rise of 10% or more in the last 14 days as inflation, and
 * the 70th time-weighted percentile as the ceiling of "typical". The real engine has more rules than this.
 */
export const DAYS = 90, LOW = 280, HIGH = 400;
export const NEAR = 0.03, MIN_OBSERVATIONS = 4, LOOKBACK = 14, MIN_RISE = 0.1, TYPICAL_CEILING = 0.7;

/** [day, price]. A row exists only where the price changed. */
export type Series = [number, number][];
export const SERIES: Series = [[0, 349], [12, 329], [25, 359], [40, 339], [58, 319], [70, 349], [82, 345]];
export const RAISED: Series = [[0, 349], [12, 329], [25, 359], [40, 339], [58, 319], [70, 349], [79, 389]];

export type Claim = "lowest" | "near" | "typical" | "above" | "inflated" | "started";

export function priceAt(series: Series, day: number) {
  let price = series[0][1];
  for (const [d, p] of series) if (d <= day) price = p;
  return price;
}

export function judge(today: number, series: Series, windowDays: number) {
  const start = DAYS - windowDays;
  // What was seen: the price in force when watching began, then every change after it.
  const points: Series = [[start, priceAt(series, start)], ...series.filter(([day]) => day > start)];
  const lowest = Math.min(...points.map(([, price]) => price));
  const result = (claim: Claim) => ({ claim, lowest, start, observations: points.length });
  if (points.length < MIN_OBSERVATIONS) return result("started");
  const rise = points.find(([day, price], i) => i > 0 && day >= DAYS - LOOKBACK && price >= points[i - 1][1] * (1 + MIN_RISE));
  if (rise && today < rise[1] && today > lowest * (1 + NEAR)) return result("inflated");
  if (today <= lowest) return result("lowest");
  if (today <= lowest * (1 + NEAR)) return result("near");
  // Share of the observed time the listing spent cheaper than today.
  let cheaper = 0;
  points.forEach(([day, price], i) => { if (price < today) cheaper += (i + 1 < points.length ? points[i + 1][0] : DAYS) - day; });
  return result(cheaper / windowDays <= TYPICAL_CEILING ? "typical" : "above");
}

/** What the stage and the bench share. The bench writes, the scene reads once per frame. */
export const link = {
  price: (319 - LOW) / (HIGH - LOW), // 0..1 up the chart
  window: 0, // 0..1 from the left: where the observed window begins
  raised: 0, // 0 or 1
  swing: 0, // the plumb line's angle, radians
};

export const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
/** How far the camera has swung round the mark at a given scroll progress: out and back, 0..1. */
export const orbit = (progress: number) => smooth(0, 0.34, progress) * (1 - smooth(0.46, 0.8, progress));
/** Where the lit hall has turned into the dark room of the case, 0..1. */
export const dusk = (progress: number) => smooth(0.3, 0.62, progress);

/** The axis of the mark's beam, in the logo's 64 × 64 box. A stroke on screen is mapped onto it. */
export const AXIS = { top: [29.5, 10] as [number, number], bottom: [52, 58] as [number, number] };
