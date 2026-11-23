import { Star, TrendingUp } from "lucide-react";
import type { SearchItem } from "./search";
import { shortDate } from "./taxonomy";

const numberFormat = new Intl.NumberFormat("pt-BR");

export function RepositoryStars({ repository }: { repository?: SearchItem["repository"] }) {
  if (!repository) return null;
  const { repo, total, url } = repository;
  return <a className="r-github r-stars" href={url} aria-label={total === undefined ? `Ver estrelas de ${repo} no GitHub` : `${numberFormat.format(total)} estrelas no GitHub em ${repo}`} title={repo}>
    <Star size={15} aria-hidden />{total === undefined ? "Ver estrelas" : numberFormat.format(total)}
  </a>;
}

export function RepositoryGrowth({ repository }: { repository?: SearchItem["repository"] }) {
  const week = repository?.weekly;
  if (!week) return null;
  const period = `${shortDate(week.from)} a ${shortDate(week.to)}`;
  const count = numberFormat.format(week.count);
  return <span className="r-github r-growth" aria-label={`${count} estrelas adicionadas de ${period}`} title={period}>
    <TrendingUp size={15} aria-hidden />{week.count > 0 ? "+" : ""}{count} na semana
  </span>;
}
