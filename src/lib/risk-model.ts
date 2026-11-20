/**
 * A teaching model for vulnerability prioritisation, used by the article simulator.
 *
 * It is NOT a standard and it produces no score. It is a small, explicit decision table in the spirit of SSVC: four
 * questions about the vulnerability in its context, and an ordered list of rules that turn the answers into one of four
 * handling classes. Every rule is monotonic: more threat, more reach, more value or more severity never lowers the
 * class. The file has no imports so the tests can load it directly.
 */

export type Exploitation = "none" | "poc" | "active";
export type Exposure = "isolated" | "internal" | "internet";
export type Criticality = "low" | "medium" | "high";
export type Severity = "none" | "low" | "medium" | "high" | "critical";
/** From least to most urgent. */
export const PRIORITIES = ["track", "scheduled", "expedite", "act"] as const;
export type Priority = (typeof PRIORITIES)[number];

export type Input = { cvss: number; exploitation: Exploitation; exposure: Exposure; criticality: Criticality; compensated: boolean };
export type Decision = {
  priority: Priority;
  severity: Severity;
  /** The queue a CVSS-only policy would assign, for comparison. */
  byCvssAlone: Priority;
  /** Which rule decided. The interface explains it in words. */
  rule: "exploited-reachable" | "exploited-internet" | "everything-but-exploitation" | "one-strong-signal" | "some-signal" | "nothing-pressing";
  /** A compensating control was credited and lowered the class by one step. */
  eased: boolean;
  /** A compensating control was declared but not credited, because exploitation is active on an internet-facing asset. */
  refused: boolean;
};

/** Qualitative severity rating scale of CVSS v3.1 (specification, section 5). */
export function severity(cvss: number): Severity {
  if (cvss <= 0) return "none";
  if (cvss < 4) return "low";
  if (cvss < 7) return "medium";
  return cvss < 9 ? "high" : "critical";
}

const THREAT: Record<Exploitation, number> = { none: 0, poc: 1, active: 2 };
const REACH: Record<Exposure, number> = { isolated: 0, internal: 1, internet: 2 };
const VALUE: Record<Criticality, number> = { low: 0, medium: 1, high: 2 };

export function prioritise(input: Input): Decision {
  const band = severity(input.cvss);
  const t = THREAT[input.exploitation], r = REACH[input.exposure], v = VALUE[input.criticality];
  const s = band === "critical" ? 2 : band === "high" ? 1 : 0, context = t + r + v;

  let level: number, rule: Decision["rule"];
  if (t === 2 && r >= 1 && v >= 1) { level = 3; rule = "exploited-reachable"; }
  else if (t === 2 && r === 2) { level = 3; rule = "exploited-internet"; }
  else if (context >= 5 && s >= 1) { level = 3; rule = "everything-but-exploitation"; }
  else if (t === 2 || context >= 4 || (s === 2 && r === 2)) { level = 2; rule = "one-strong-signal"; }
  else if (context >= 2 || s >= 1) { level = 1; rule = "some-signal"; }
  else { level = 0; rule = "nothing-pressing"; }

  // A compensating control buys time, one step at most. It is not credited when attackers are already exploiting
  // something reachable from the internet, and it never moves an actively exploited vulnerability out of the plan.
  const refused = input.compensated && t === 2 && r === 2;
  const eased = input.compensated && !refused && level > (t === 2 ? 1 : 0);
  if (eased) level -= 1;

  const byCvssAlone: Priority = band === "critical" ? "act" : band === "high" ? "expedite" : band === "medium" ? "scheduled" : "track";
  return { priority: PRIORITIES[level], severity: band, byCvssAlone, rule, eased, refused };
}
