"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Github, RefreshCw, TrendingUp } from "lucide-react";
import type { skillHighlights } from "./content";
import { snapshotDate, shortDate, areas, entryPath, type Area } from "./taxonomy";
import { RepositoryGrowth, RepositoryStars } from "./RepositoryStars";
import Creator from "./Attribution";

const format = new Intl.NumberFormat("pt-BR");

export default function SkillSpotlight({ area, items, placement }: { area: Area; items: ReturnType<typeof skillHighlights>; placement: "home" | "area" }) {
  const [offset, setOffset] = useState(0);
  const key = `radar-skill-rotation-${area}-${placement}`;

  useEffect(() => {
    try {
      const previous = Math.max(0, Number(sessionStorage.getItem(key)) || 0);
      setOffset(previous);
      sessionStorage.setItem(key, String(previous + 2));
    } catch { /* The same curated ordering serves as the fallback. */ }
  }, [key]);

  if (!items.length) return null;
  const displayed = items.slice(0, 2).map((_, index) => items[(offset + index) % items.length]);
  return <div className="r-skill-feature" data-area={area} data-placement={placement}>
    <div className="r-skill-feature-head"><h3>{placement === "home" ? areas[area].short : "Seleção de skills"}</h3>
      {items.length > 2 && <button type="button" className="r-action r-action-muted" onClick={() => setOffset(value => value + 2)}><RefreshCw size={15} aria-hidden /> Trocar seleção</button>}
    </div>
    <div className="r-skill-feature-list" aria-live="polite">
      {displayed.map(item => <article className="r-skill-feature-item" key={item.slug}>
        <Link className="r-skill-feature-title" href={entryPath(item.slug)}><strong>{item.title}</strong><ArrowUpRight size={16} aria-hidden /></Link>
        <p>{item.summary}</p>
        <div className="r-skill-feature-metrics">
          <RepositoryStars repository={item.signal} />
          <RepositoryGrowth repository={item.signal} />
          {!item.signal?.weekly && item.weeklyStars && <span title={`Recorte de GitHub Trending em ${shortDate(snapshotDate)}`}><TrendingUp size={15} aria-hidden /> +{format.format(item.weeklyStars)} no Trending</span>}
        </div>
        <div className="r-card-foot"><Creator creator={item.creator} compact />{item.creator.github && <a className="r-github" href={item.creator.github} aria-label={`${item.title} no GitHub`}><Github size={15} aria-hidden />GitHub</a>}</div>
      </article>)}
    </div>
    {placement === "home" && <Link href={`/radar/${area}/skills`} className="r-inline-link">Todas as skills <ArrowUpRight size={15} aria-hidden /></Link>}
  </div>;
}
