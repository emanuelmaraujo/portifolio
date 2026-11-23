"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Github, Moon, Search, SlidersHorizontal, Sun, X } from "lucide-react";
import { areaIds, areas, entryPath, kindIds, kinds, shortDate } from "./taxonomy";
import { filterRecords, searchHref, type CatalogUse, type Filters, type SearchItem } from "./search";
import Creator from "./Attribution";
import { RepositoryGrowth, RepositoryStars } from "./RepositoryStars";
import { subareas } from "./subareas";
import { starsCheckedAt } from "./editorial/stars-date";

const themeEvent = "radar-theme-change";
const themeSnapshot = () => document.documentElement.dataset.radarTheme === "white";
const serverTheme = () => false;

function observeTheme(callback: () => void) {
  addEventListener(themeEvent, callback);
  return () => removeEventListener(themeEvent, callback);
}

export function ThemeSwitch() {
  const white = useSyncExternalStore(observeTheme, themeSnapshot, serverTheme);
  return <button type="button" className="r-theme" aria-label={white ? "Ativar tema Black" : "Ativar tema White"} onClick={() => {
    const next = white ? "black" : "white";
    document.documentElement.dataset.radarTheme = next;
    try { localStorage.setItem("radar-theme", next); } catch { /* In-memory theme still applies. */ }
    dispatchEvent(new Event(themeEvent));
  }}>{white ? <Moon size={16} /> : <Sun size={16} />}<span>{white ? "White" : "Black"}</span></button>;
}

export function PendingIndicator() {
  const { pending } = useLinkStatus();
  return pending ? <span className="r-link-status" role="status" aria-label="Carregando" /> : null;
}

const navigationKey = "radar-navigation";
const isRadar = (path: string) => path === "/radar" || path.startsWith("/radar/");

export function RadarNavigation() {
  useEffect(() => {
    function remember(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!target || target.target || target.hasAttribute("download") || target.hasAttribute("data-radar-back")) return;
      const url = new URL(target.href);
      if (url.origin !== location.origin || !isRadar(url.pathname) || url.pathname === location.pathname) return;
      const fragment = target.closest("#catalogo") ? "#catalogo" : location.hash;
      try { sessionStorage.setItem(navigationKey, JSON.stringify({ from: location.pathname + location.search + fragment, to: url.pathname })); } catch { /* Hierarchical fallback is always available. */ }
    }
    document.addEventListener("click", remember, true);
    return () => document.removeEventListener("click", remember, true);
  }, []);
  return null;
}

export function RadarBack({ fallback }: { fallback: string }) {
  const pathname = usePathname();
  const [previous, setPrevious] = useState<{ from: string; to: string }>();
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(navigationKey) ?? "null");
      if (saved?.to === pathname && typeof saved.from === "string") {
        const source = new URL(saved.from, location.origin);
        if (source.origin === location.origin && isRadar(source.pathname) && source.pathname !== pathname) {
          setPrevious({ from: source.pathname + source.search + source.hash, to: pathname });
          return;
        }
      }
    } catch { /* Hierarchical fallback is always available. */ }
    setPrevious(undefined);
  }, [pathname]);
  const href = previous?.to === pathname ? previous.from : fallback;
  return <Link data-radar-back="true" href={href} replace={href !== fallback}><ArrowLeft size={15} aria-hidden /> Voltar</Link>;
}

export function QuickSearch({ placeholder = "Busque por RAG, Wazuh, motion…" }: { placeholder?: string }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [matches, setMatches] = useState<{ query: string; items: Pick<SearchItem, "slug" | "title" | "kind">[] }>({ query: "", items: [] });
  const input = useRef<HTMLInputElement>(null);
  const results = matches.query === query ? matches.items : [];

  useEffect(() => {
    if (!focused || query.trim().length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/radar/sugestoes?${new URLSearchParams({ q: query })}`, { signal: controller.signal });
        if (response.ok) {
          const items = await response.json();
          if (!controller.signal.aborted) setMatches({ query, items });
        }
      } catch { /* The search form remains available if suggestions fail. */ }
    }, 140);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [focused, query]);

  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      const editing = event.target instanceof HTMLElement && Boolean(event.target.closest("input, textarea, select, [contenteditable]"));
      if (event.key === "/" && !editing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        input.current?.focus();
      }
    }
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, []);

  return <div className="r-quick" onFocus={() => setFocused(true)} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  }} onKeyDown={event => {
    if (event.key === "Escape") { input.current?.focus(); setFocused(false); }
    if (event.key === "ArrowDown" && event.target === input.current && focused && results.length) {
      event.preventDefault();
      event.currentTarget.querySelector<HTMLAnchorElement>(".r-suggestions a")?.focus();
    }
  }}>
    <form className="r-searchbar" action="/radar/busca" role="search" aria-label="Busca rápida">
      <Search size={20} aria-hidden="true" />
      <input ref={input} type="search" name="q" value={query} maxLength={160} aria-label="Buscar no Radar" placeholder={placeholder} onChange={event => { setQuery(event.target.value); setFocused(true); }} autoComplete="off" />
      <kbd aria-hidden="true">/</kbd>
      <button type="submit" aria-label="Ver resultados da busca"><ArrowRight size={20} /></button>
    </form>
    {focused && results.length > 0 && <ul className="r-suggestions" aria-label="Sugestões de busca">
      {results.map(item => <li key={item.slug}><a href={entryPath(item.slug)}><span>{item.title}</span><small>{kinds[item.kind].singular}</small><ArrowDownRight size={16} aria-hidden /></a></li>)}
      <li><a href={searchHref({ q: query })}>Ver todos os resultados <ArrowRight size={16} aria-hidden /></a></li>
    </ul>}
  </div>;
}

const fullCatalog: Filters = { q: "", area: "", tipo: "" };
const quickFormats = ["projetos", "skills", "repositorios"] as const;

export function SearchExplorer({ items, initial, basePath = "/radar/busca", scope = fullCatalog, title, uses }: {
  items: SearchItem[];
  initial: Filters;
  basePath?: string;
  scope?: Filters;
  title?: string;
  uses?: CatalogUse[];
}) {
  const [filters, setFilters] = useState(initial);
  const [limit, setLimit] = useState(100);
  const sentinel = useRef<HTMLDivElement>(null);
  const selectedUse = uses?.find(use => use.id === filters.uso);
  const candidates = useMemo(() => selectedUse ? items.filter(item => selectedUse.slugs.includes(item.slug)) : items, [items, selectedUse]);
  const matches = useMemo(() => filterRecords(candidates, filters), [candidates, filters]);
  const hasMore = limit < matches.length;
  const scoped = useMemo(() => filterRecords(items, scope), [items, scope]);
  const topics = [...new Set([
    ...(filters.tema ? [filters.tema] : []),
    ...filterRecords(candidates, { ...filters, q: "", tema: "", ordenar: "" }).flatMap(item => item.tags),
  ])].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const suggestedTopics = useMemo(() => {
    if (!scope.area) return [];
    const counts = new Map<string, number>();
    for (const item of scoped) counts.set(item.tags[0], (counts.get(item.tags[0]) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([topic]) => topic);
  }, [scope.area, scoped]);
  const collectionAreas = areaIds.filter(area => scoped.some(item => item.area === area));
  const area = areaIds.find(id => id === filters.area);
  const groups = area ? subareas[area].filter(group => scoped.some(item => item.subareas.includes(group.id))) : [];
  const formatCandidates = useMemo(() => filterRecords(items, { ...filters, tipo: "", ordenar: "" }), [items, filters]);
  const formatCounts = quickFormats.map(kind => ({
    kind,
    count: formatCandidates.filter(item => item.kind === kind || (kind === "projetos" && item.openSource)).length,
  })).filter(({ kind }) => scoped.some(item => item.kind === kind || (kind === "projetos" && item.openSource)));
  const sample = matches.find(item => item.repository?.weekly)?.repository?.weekly;
  const hasStars = scoped.some(item => item.repository?.total !== undefined);
  const hasGrowth = scoped.some(item => item.repository?.weekly);
  const chips: [keyof Filters, string][] = [];
  if (selectedUse) chips.push(["uso", selectedUse.label]);
  if (filters.tema) chips.push(["tema", filters.tema]);
  if (filters.colecao) chips.push(["colecao", filters.colecao]);
  const selectedGroup = groups.find(group => group.id === filters.subarea);
  if (selectedGroup && !scope.subarea) chips.push(["subarea", selectedGroup.title]);
  if (!scope.tipo && filters.tipo && !quickFormats.some(kind => kind === filters.tipo)) {
    const selectedKind = kindIds.find(kind => kind === filters.tipo);
    if (selectedKind) chips.push(["tipo", kinds[selectedKind].name]);
  }
  const hrefFor = (next: Filters) => searchHref({ ...next, area: scope.area ? "" : next.area, tipo: scope.tipo ? "" : next.tipo, subarea: scope.subarea ? "" : next.subarea }, basePath);

  function update(next: Filters) {
    setFilters(next);
    setLimit(100);
    const href = hrefFor(next);
    if (location.pathname + location.search !== href) history.replaceState(history.state, "", href + location.hash);
  }

  useEffect(() => {
    const target = sentinel.current;
    if (!target || !hasMore || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.unobserve(target);
        setLimit(value => value + 50);
      }
    }, { rootMargin: "320px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, limit]);

  return <section className="r-catalog" id="catalogo" tabIndex={-1} aria-label={title ?? "Resultados da biblioteca"}>
    {title && <h2>{title}</h2>}
    {!uses && !scope.tipo && formatCounts.length > 0 && <div className="r-format-switch" role="group" aria-label="Formatos rápidos">
      <button type="button" aria-pressed={!filters.tipo} onClick={() => update({ ...filters, tipo: "" })}>Tudo</button>
      {formatCounts.map(({ kind, count }) => <button type="button" key={kind} aria-pressed={filters.tipo === kind} onClick={() => update({ ...filters, tipo: kind })}>{kinds[kind].name}<small>{count}</small></button>)}
    </div>}
    {!scope.area && quickFormats.some(kind => kind === scope.tipo) && <nav className="r-format-switch" aria-label="Formatos rápidos">
      {quickFormats.map(kind => {
        const root = area ? `/radar/${area}/${kind}` : kind === "projetos" ? "/radar/projetos" : "/radar/busca";
        const href = searchHref({ q: filters.q, ordenar: filters.ordenar, tipo: root === "/radar/busca" ? kind : "" }, root);
        return <Link key={kind} href={kind === scope.tipo ? "#catalogo" : `${href}#catalogo`} aria-current={kind === scope.tipo ? "page" : undefined}>{kinds[kind].name}</Link>;
      })}
    </nav>}
    <form className="r-search-tools" action={basePath} role="search" aria-label="Buscar e filtrar biblioteca" onSubmit={event => { event.preventDefault(); update(filters); }}>
      <div className="r-searchbar"><Search size={21} aria-hidden />
        <input type="search" name="q" maxLength={160} aria-label="Termo de busca" placeholder="Busque por tema, projeto ou autor" value={filters.q} onChange={event => update({ ...filters, q: event.target.value })} />
        <button type="submit" aria-label="Buscar"><ArrowRight size={20} /></button>
      </div>
      <div className="r-search-facets">
        {!scope.area && <div className="r-field"><label htmlFor="radar-area">Área</label><select id="radar-area" name="area" value={filters.area} onChange={event => update({ ...filters, area: event.target.value, tema: "", subarea: "" })}><option value="">Todas as áreas</option>{collectionAreas.map(id => <option value={id} key={id}>{areas[id].name}</option>)}</select></div>}
        {(hasStars || hasGrowth || filters.ordenar) && <div className="r-field"><label htmlFor="radar-order">Ordenar por</label><select id="radar-order" name="ordenar" value={filters.ordenar || ""} onChange={event => update({ ...filters, ordenar: event.target.value })}><option value="">Relevância</option>{(hasStars || filters.ordenar === "estrelas") && <option value="estrelas">Mais estrelas no GitHub</option>}{(hasGrowth || filters.ordenar === "crescimento") && <option value="crescimento">Mais estrelas na semana</option>}</select></div>}
        {hrefFor(filters) !== basePath && <button className="r-clear" type="button" onClick={() => update(scope)}><X size={15} aria-hidden /> Limpar filtros</button>}
      </div>
      <details className="r-catalog-more">
        <summary><SlidersHorizontal size={15} aria-hidden /> Mais filtros</summary>
        <div className="r-search-facets">
          {!scope.tipo && <div className="r-field"><label htmlFor="radar-type">Tipo</label><select id="radar-type" name="tipo" value={filters.tipo} onChange={event => update({ ...filters, tipo: event.target.value, tema: "" })}><option value="">Todos os tipos</option>{kindIds.filter(kind => scoped.some(item => item.kind === kind || (kind === "projetos" && item.openSource))).map(kind => <option value={kind} key={kind}>{kinds[kind].name}</option>)}</select></div>}
          {!scope.subarea && (groups.length > 0 || filters.subarea) && <div className="r-field"><label htmlFor="radar-subarea">Subárea</label><select id="radar-subarea" name="subarea" value={filters.subarea || ""} onChange={event => update({ ...filters, subarea: event.target.value, tema: "" })}><option value="">Todas as subáreas</option>{groups.map(group => <option value={group.id} key={group.id}>{group.title}</option>)}</select></div>}
          <div className="r-field"><label htmlFor="radar-topic">Assunto</label><select id="radar-topic" name="tema" value={filters.tema || ""} onChange={event => update({ ...filters, tema: event.target.value })}><option value="">Todos os assuntos</option>{topics.map(topic => <option key={topic}>{topic}</option>)}</select></div>
        </div>
      </details>
    </form>
    {uses && <div className="r-framework-uses">
      <h3 id="escolher-framework">Qual referência resolve sua dúvida?</h3>
      <div className="r-kind-links" role="group" aria-labelledby="escolher-framework">
        <button type="button" aria-pressed={!selectedUse} onClick={() => update({ ...filters, uso: "" })}>Todos</button>
        {uses.map(use => <button key={use.id} type="button" aria-pressed={selectedUse?.id === use.id} onClick={() => update({ ...scope, uso: use.id, ordenar: filters.ordenar })}>{use.label}</button>)}
      </div>
      {selectedUse && <p className="r-use-tip">{selectedUse.tip}</p>}
    </div>}
    {chips.length > 0 && <div className="r-kind-links r-active-filters" role="group" aria-label="Filtros ativos">
      {chips.map(([name, label]) => <button key={name} type="button" aria-label={`Remover filtro ${label}`} onClick={() => update({ ...filters, [name]: "" })}>{label}<X size={14} aria-hidden /></button>)}
    </div>}
    {!uses && suggestedTopics.length > 1 && <div className="r-kind-links r-catalog-topics" aria-label="Assuntos da área">
      {suggestedTopics.map(tema => <button key={tema} type="button" aria-pressed={filters.tema === tema} onClick={() => update({ ...filters, tema: filters.tema === tema ? "" : tema })}>{tema}</button>)}
    </div>}
    <div className="r-catalog-status">
      <p className="r-result-count" role="status">{matches.length} {matches.length === 1 ? "resultado" : "resultados"}{hasMore && ` · ${limit} exibidos`}</p>
      {sample ? <small>Estrelas adicionadas de {shortDate(sample.from)} a {shortDate(sample.to)} · <a href="https://docs.github.com/en/rest/activity/starring#get-repository-star-history">GitHub</a></small> : matches.some(item => item.repository?.total !== undefined) && <small>Estrelas do GitHub consultadas em {shortDate(starsCheckedAt)}.</small>}
    </div>
    {matches.length ? <>
      <ul className="r-results">
        {matches.slice(0, limit).map(item => <li key={item.slug} data-area={item.area}>
          <Link className="r-result-main" href={entryPath(item.slug)} prefetch={false}>
            <span className="r-result-kind">{kinds[item.kind].singular} <span>·</span> {areas[item.area].short}{item.catalogOrigin && <span> · {item.catalogOrigin}</span>}{item.eventDate && <> <span>·</span> <time dateTime={item.eventDate}>{shortDate(item.eventDate)}</time></>}</span>
            <strong>{item.title}</strong><span className="r-result-summary">{item.summary}</span><ArrowDownRight size={20} aria-hidden />
          </Link>
          <div className="r-result-foot"><Creator creator={item.creator} compact /><div>
            <RepositoryStars repository={item.repository} />
            <RepositoryGrowth repository={item.repository} />
            {item.creator.github && <a className="r-github" href={item.creator.github} aria-label={`${item.title} no GitHub`}><Github size={15} aria-hidden />GitHub</a>}
            {item.source !== item.creator.github && <a className="r-github" href={item.source} aria-label={`Fonte oficial de ${item.title}`}>Fonte oficial<ArrowUpRight size={14} aria-hidden /></a>}
          </div></div>
        </li>)}
      </ul>
      {hasMore && <div ref={sentinel} className="r-page-links"><button className="r-action r-action-muted" type="button" onClick={() => setLimit(value => value + 50)}>Carregar mais resultados</button></div>}
    </> : <div className="r-empty"><Search size={25} aria-hidden /><h3>Nenhum resultado</h3><p>Experimente outro termo ou amplie os filtros.</p><button className="r-action r-action-muted" type="button" onClick={() => update(scope)}>Limpar filtros <ArrowRight size={16} aria-hidden /></button>{basePath !== "/radar/busca" && <Link className="r-inline-link" href={searchHref({ q: filters.q })}>Buscar em todo o Radar <ArrowUpRight size={15} aria-hidden /></Link>}</div>}
  </section>;
}

export function ReadingContents({ parts }: { parts: { id: string; title: string }[] }) {
  const [current, setCurrent] = useState<string>();
  useEffect(() => {
    const targets = parts.map(part => document.getElementById(part.id)).filter(element => element !== null);
    let frame = 0;
    function measure() {
      frame = 0;
      const threshold = Math.min(215, window.innerHeight * .35);
      const active = targets.findLast(element => element.getBoundingClientRect().top <= threshold);
      setCurrent(active?.id);
    }
    function queue() {
      if (!frame) frame = requestAnimationFrame(measure);
    }
    queue();
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", queue);
      removeEventListener("resize", queue);
    };
  }, [parts]);
  return <nav aria-label="Nesta ficha"><p>Nesta ficha</p><ol>{parts.map(part => <li key={part.id}><a href={`#${part.id}`} aria-current={part.id === current ? "location" : undefined}>{part.title}<ArrowDownRight size={13} aria-hidden /></a></li>)}</ol></nav>;
}
