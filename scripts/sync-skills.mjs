// Mantém as skills iguais em todas as pastas que os agentes leem.
// Fonte única: .agents/skills (Codex, Cursor, Gemini CLI).
// Cópias: .claude/skills (Claude Code, GitHub Copilot).
// Uso: node scripts/sync-skills.mjs          -> copia
//      node scripts/sync-skills.mjs --check  -> só confere (sai com 1 se divergir)
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ORIGEM = ".agents/skills";
const DESTINOS = [".claude/skills"];
const check = process.argv.includes("--check");

function arquivos(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    if (n === "__pycache__") return [];
    const p = join(dir, n);
    return statSync(p).isDirectory() ? arquivos(p) : [p];
  });
}

let divergente = false;
for (const skill of readdirSync(ORIGEM)) {
  const src = join(ORIGEM, skill);
  for (const base of DESTINOS) {
    const dst = join(base, skill);
    if (check) {
      const a = arquivos(src).map((f) => relative(src, f)).sort();
      const b = arquivos(dst).map((f) => relative(dst, f)).sort();
      const iguais = a.join() === b.join() && a.every((f) => readFileSync(join(src, f)).equals(readFileSync(join(dst, f))));
      if (!iguais) { divergente = true; console.error(`diferente: ${dst}`); }
    } else {
      rmSync(dst, { recursive: true, force: true });
      cpSync(src, dst, { recursive: true, filter: (p) => !p.includes("__pycache__") });
      console.log(`${src} -> ${dst}`);
    }
  }
}
if (check) { console.log(divergente ? "skills fora de sincronia: rode node scripts/sync-skills.mjs" : "skills em sincronia"); process.exit(divergente ? 1 : 0); }
