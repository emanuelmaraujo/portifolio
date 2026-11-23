import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const [destination = "out/radar-weekly-stars.json", repositoryList] = process.argv.slice(2);
const snapshot = JSON.parse(await readFile(new URL("../src/components/radar/editorial/repository-stars.json", import.meta.url), "utf8"));
const repositories = repositoryList ? JSON.parse(await readFile(repositoryList, "utf8")) : Object.keys(snapshot);
if (!Array.isArray(repositories) || repositories.some(repo => typeof repo !== "string" || !/^[\w.-]+\/[\w.-]+$/.test(repo))) {
  throw new Error("Lista de repositórios inválida");
}

const date = new Date();
date.setUTCHours(0, 0, 0, 0);
const daySeconds = 86400;
const start = date.getTime() / 1000 - (date.getUTCDay() + 7) * daySeconds;
const isoDay = timestamp => new Date(timestamp * 1000).toISOString().slice(0, 10);
const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2026-03-10", "User-Agent": "radar-do-emanuel" };
if (process.env.GH_TOKEN) headers.Authorization = `Bearer ${process.env.GH_TOKEN}`;

const from = isoDay(start);
const to = isoDay(start + 6 * daySeconds);
const previous = await readFile(destination, "utf8").then(JSON.parse).catch(error => {
  if (error.code !== "ENOENT") throw error;
});
const verified = previous?.from === from && previous?.to === to ? previous.repositories : {};
const unavailable = [];
const pending = [...new Set(repositories)].filter(repo => !Object.hasOwn(verified, repo)).sort();
let rateLimited = false;

async function collect() {
  while (pending.length && !rateLimited) {
    const repo = pending.shift();
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/stargazers/history?per_page=3`, {
        headers, signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        rateLimited = response.status === 429 || response.headers.get("x-ratelimit-remaining") === "0";
        throw new Error(`HTTP ${response.status}`);
      }
      const weeks = await response.json();
      const week = weeks.find(row => row.week === start);
      if (!Number.isSafeInteger(week?.total) || week.total < 0) throw new Error("Semana indisponível");
      verified[repo] = week.total;
    } catch (error) {
      unavailable.push({ repo, reason: error.message });
    }
  }
}

await Promise.all(Array.from({ length: 4 }, collect));
for (const repo of pending) unavailable.push({ repo, reason: "Limite da API do GitHub" });
if (Object.keys(verified).length === 0) throw new Error(`Nenhum total verificado. ${unavailable[0]?.reason ?? ""}`);
const result = {
  from,
  to,
  repositories: Object.fromEntries(Object.entries(verified).sort(([a], [b]) => a.localeCompare(b, "en"))),
};
await mkdir(path.dirname(destination), { recursive: true });
await writeFile(destination, JSON.stringify(result, null, 2) + "\n", "utf8");
console.log(`${result.from} a ${result.to} · ${Object.keys(verified).length} repositórios · ${unavailable.length} indisponíveis`);
if (unavailable.length) {
  console.error(unavailable);
  process.exitCode = 1;
}
