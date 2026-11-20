import assert from "node:assert/strict";
import { test } from "node:test";
import { match } from "../src/components/site/ask/match.ts";

const topic = (id, keywords) => ({ id, title: id, text: id, form: "mark", href: "#" + id, keywords });
const all = [topic("security", ["seguranca", "security", "iso"]), topic("prumo", ["prumo", "preco", "price"]), topic("contact", ["contato", "email"])];

test("guided answers find the topic regardless of accents and case", () => {
  assert.equal(match("Qual a experiência dele em SEGURANÇA e ISO?", all).id, "security");
  assert.equal(match("como o Prumo acompanha preço", all).id, "prumo");
  assert.equal(match("what's the weather today", all), null);
});
