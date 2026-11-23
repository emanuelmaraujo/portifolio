import snapshot from "./repository-stars.json";
import weeklySnapshot from "./repository-weekly-stars.json";

const stars: Readonly<Record<string, number | undefined>> = snapshot;
const additions: Readonly<Record<string, number | undefined>> = weeklySnapshot.repositories;
export const starsWeek = { from: weeklySnapshot.from, to: weeklySnapshot.to };

export function repositoryIdentity(url?: string) {
  if (!url) return;
  const link = new URL(url);
  const match = /^\/([\w.-]+)\/([\w.-]+)(?:\/|$)/.exec(link.pathname);
  if (link.hostname === "github.com" && match) return `${match[1]}/${match[2]}`.toLowerCase();
}

export function repositorySignal(github?: string, sources: { url: string }[] = []) {
  const repo = repositoryIdentity(github) ?? sources.map(source => repositoryIdentity(source.url)).find(Boolean);
  if (!repo) return;
  const count = additions[repo];
  return { repo, total: stars[repo], url: `https://github.com/${repo}/stargazers`, weekly: count === undefined ? undefined : { count, ...starsWeek } };
}
