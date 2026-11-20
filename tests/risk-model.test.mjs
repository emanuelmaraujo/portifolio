import assert from "node:assert/strict";
import { test } from "node:test";
import { PRIORITIES, prioritise, severity } from "../src/lib/risk-model.ts";

const exploitation = ["none", "poc", "active"], exposure = ["isolated", "internal", "internet"], criticality = ["low", "medium", "high"];
const scores = [0, 2, 5, 7.5, 9.8];
const rank = input => PRIORITIES.indexOf(prioritise(input).priority);

test("severity follows the CVSS v3.1 qualitative scale", () => {
  for (const [score, band] of [[0, "none"], [0.1, "low"], [3.9, "low"], [4, "medium"], [6.9, "medium"], [7, "high"], [8.9, "high"], [9, "critical"], [10, "critical"]]) assert.equal(severity(score), band, String(score));
});

test("context can outrank severity, in both directions", () => {
  const lab = prioritise({ cvss: 9.8, exploitation: "none", exposure: "isolated", criticality: "low", compensated: false });
  assert.equal(lab.priority, "scheduled");
  assert.equal(lab.byCvssAlone, "act");
  const exploited = prioritise({ cvss: 6.5, exploitation: "active", exposure: "internet", criticality: "high", compensated: false });
  assert.equal(exploited.priority, "act");
  assert.equal(exploited.byCvssAlone, "scheduled");
});

test("more threat, reach, value or severity never lowers the class", () => {
  for (const compensated of [false, true]) for (const cvss of scores) for (let t = 0; t < 3; t++) for (let r = 0; r < 3; r++) for (let v = 0; v < 3; v++) {
    const at = (dt, dr, dv, score = cvss) => rank({ cvss: score, exploitation: exploitation[t + dt], exposure: exposure[r + dr], criticality: criticality[v + dv], compensated });
    const here = at(0, 0, 0);
    if (r < 2) assert.ok(at(0, 1, 0) >= here, "exposure");
    if (v < 2) assert.ok(at(0, 0, 1) >= here, "criticality");
    if (t < 2 && !compensated) assert.ok(at(1, 0, 0) >= here, "exploitation");
    for (const higher of scores.filter(score => score > cvss)) assert.ok(at(0, 0, 0, higher) >= here, "severity");
  }
});

test("a compensating control buys one step at most and is refused where it should not decide", () => {
  for (const cvss of scores) for (const e of exploitation) for (const x of exposure) for (const c of criticality) {
    const base = { cvss, exploitation: e, exposure: x, criticality: c }, plain = prioritise({ ...base, compensated: false }), eased = prioritise({ ...base, compensated: true });
    const drop = PRIORITIES.indexOf(plain.priority) - PRIORITIES.indexOf(eased.priority);
    assert.ok(drop === 0 || drop === 1);
    assert.equal(eased.eased, drop === 1);
    if (e === "active" && x === "internet") { assert.equal(drop, 0); assert.ok(eased.refused); }
    if (e === "active") assert.notEqual(eased.priority, "track");
  }
});
