import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, ChevronDown, FileText, FlaskConical, FolderGit2, Github, Layers3, Orbit, Rss, Search, ShieldCheck, Star, TrendingUp } from "lucide-react";
import Mark from "@/components/site/Mark";
import { siteUrl } from "@/components/site/content";
import { belongsToKind, communitySelection, labs, library, news, relatedTo, rising, selectedSkills, skillHighlights, type RadarRecord } from "./content";
import { areaIds, areas, entryPath, fullDate, kindIds, kinds, shortDate, snapshotDate, trendingUrl, type Area, type Kind } from "./taxonomy";
import { catalogFilters, filterRecords, searchHref, type CatalogParams } from "./search";
import { PendingIndicator, QuickSearch, RadarBack, RadarNavigation, ReadingContents, SearchExplorer, ThemeSwitch } from "./widgets";
import Lab from "./Lab";
import Creator from "./Attribution";
import SkillSpotlight from "./SkillSpotlight";
import { repositorySignal } from "./editorial/repository-signals";
import { starsCheckedAt } from "./editorial/stars-date";
import { RepositoryGrowth, RepositoryStars } from "./RepositoryStars";
import { searchIndex } from "./search-index";
import { subareas, type Subarea } from "./subareas";
import { AreaHero, editions } from "./AreaEdition";

export const radarTitle = "Radar do Emanuel";
export const radarDescription = "Novidades verificadas, ferramentas e referências oficiais de IA, cibersegurança e design & desenvolvimento.";

export function radarMetadata(title: string, description: string, path: string): Metadata {
  const url = siteUrl + path;
  return { title, description, alternates: { canonical: url, types: { "application/rss+xml": `${siteUrl}/radar/rss.xml` } },
    openGraph: { title, description, url, locale: "pt_BR", siteName: radarTitle, images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "Emanuel Araújo" }] },
  };
}

const areaIcons = { ia: Orbit, ciberseguranca: ShieldCheck, "design-desenvolvimento": Layers3 };

export function RadarHeader() {
  return <>
    <RadarNavigation />
    <a className="skip" href="#main">Ir para o conteúdo</a>
    <div className="r-progress" aria-hidden />
    <header className="r-header">
      <div className="r-wrap r-header-inner">
        <Link className="r-identity" href="/radar" aria-label="Radar do Emanuel, início"><Mark /><span>Emanuel Araújo<small>Radar</small></span></Link>
        <nav aria-label="Navegação do Radar">
          <Link href="/radar">Visão geral<PendingIndicator /></Link><Link href="/radar/acervo">Acervo<PendingIndicator /></Link><Link href="/radar/novidades">Novidades<PendingIndicator /></Link><Link href="/radar/laboratorios">Laboratórios<PendingIndicator /></Link>
        </nav>
        <div className="r-header-actions"><Link className="r-icon-button r-header-search" href="/radar/busca" aria-label="Buscar na biblioteca"><Search size={17} /></Link><ThemeSwitch /></div>
      </div>
    </header>
  </>;
}

export function RadarFooter() {
  return <footer className="r-footer"><div className="r-wrap r-footer-inner">
    <div className="r-identity"><Mark /><span>Emanuel Araújo<small>{radarTitle}</small></span></div>
    <div><Link href="/portifolio/pt">Portfólio <ArrowUpRight size={14} aria-hidden /></Link><Link href="/blog">Blog <ArrowUpRight size={14} aria-hidden /></Link><a href="/radar/rss.xml"><Rss size={15} aria-hidden /> RSS</a></div>
  </div></footer>;
}

function AreaLabel({ area }: { area: Area }) {
  return <span className="r-area-label" data-area={area}><i aria-hidden />{areas[area].short}</span>;
}

export function RecordCard({ item }: { item: RadarRecord }) {
  const discussion = item.tags.includes("Comunidades técnicas") ? item.sources.at(-1) : undefined;
  return <article className="r-card r-arrive" data-area={item.area}>
    <div className="r-card-top"><AreaLabel area={item.area} /><span>{kinds[item.kind].singular}</span></div>
    <h3><Link href={entryPath(item.slug)}>{item.title}<ArrowUpRight size={18} aria-hidden /></Link></h3>
    <p>{item.summary}</p>
    {discussion && <a className="r-community-source" href={discussion.url}>{discussion.title}<ArrowUpRight size={14} aria-hidden /></a>}
    {item.weeklyStars && <WeeklySignal stars={item.weeklyStars} />}
    <div className="r-card-foot"><Creator creator={item.creator} compact /><div className="r-card-links"><RepositoryStars repository={repositorySignal(item.creator.github, item.sources)} />{item.creator.github
      ? <a className="r-github" href={item.creator.github} aria-label={`${item.title} no GitHub`}><Github size={16} aria-hidden />GitHub</a>
      : <a className="r-github" href={item.sources[0].url} aria-label={`Fonte oficial de ${item.title}`}>Fonte oficial <ArrowUpRight size={14} aria-hidden /></a>}</div></div>
  </article>;
}

const digits = new Intl.NumberFormat("pt-BR");

function WeeklySignal({ stars }: { stars: number }) {
  return <span className="r-weekly-signal"><Star size={14} aria-hidden /> +{digits.format(stars)} estrelas na semana de <time dateTime={snapshotDate}>{shortDate(snapshotDate)}</time></span>;
}

function TrendMethod() {
  return <p className="r-method">Seleção de projetos da lista semanal consultada em <time dateTime={snapshotDate}>{fullDate(snapshotDate)}</time>. As estrelas indicam interesse no período. <a href={trendingUrl}>GitHub Trending <ArrowUpRight size={14} aria-hidden /></a></p>;
}

function NewsCard({ item }: { item: RadarRecord }) {
  return <article className="r-card r-news-card r-arrive" data-area={item.area}>
    <div className="r-card-top"><AreaLabel area={item.area} />{item.eventDate && <time dateTime={item.eventDate}>{shortDate(item.eventDate)}</time>}</div>
    <h3><Link href={entryPath(item.slug)}>{item.title}</Link></h3>
    <p>{item.summary}</p>
    <div className="r-card-foot"><Creator creator={item.creator} compact /><div className="r-card-links"><RepositoryStars repository={repositorySignal(item.creator.github, item.sources)} /><a className="r-github" href={item.sources[0].url} aria-label={`Fonte oficial de ${item.title}`}>Fonte oficial <ArrowUpRight size={14} aria-hidden /></a></div></div>
  </article>;
}

function LabCard({ item }: { item: RadarRecord }) {
  return <Link href={entryPath(item.slug)} className="r-lab-card r-arrive" data-area={item.area}>
    <div className="r-lab-art" data-demo={item.demo} aria-hidden><span /><span /><span /><i /><i /></div>
    <div className="r-lab-info"><AreaLabel area={item.area} /><h3>{item.title}</h3><p>{item.summary}</p><span className="r-inline-link">Abrir laboratório <ArrowUpRight size={17} aria-hidden /></span></div>
  </Link>;
}

function SectionTitle({ id, icon, title, text, href, link }: { id: string; icon: React.ReactNode; title: string; text: string; href?: string; link?: string }) {
  return <div className="r-section-head"><div><span className="r-section-icon" aria-hidden>{icon}</span><h2 id={id}>{title}</h2><p>{text}</p></div>
    {href && <Link className="r-action r-action-muted" href={href}>{link}<ArrowUpRight size={16} aria-hidden /><PendingIndicator /></Link>}
  </div>;
}

function RadarDiagram() {
  return <div className="r-figure" aria-hidden="true">
    <div className="r-diagram">
      <div className="r-scan" /><div className="r-rings"><i /><i /><i /><i /></div>
      <div className="r-axis r-axis-x" /><div className="r-axis r-axis-y" />
      <span className="r-point r-point-ai"><i /> <b>IA</b></span>
      <span className="r-point r-point-dev"><i /> <b>Design & Dev</b></span>
      <span className="r-point r-point-cyber"><i /> <b>Cibersegurança</b></span>
      <div className="r-diagram-core"><Mark /></div>
    </div>
  </div>;
}

export function RadarHome() {
  const highlights = areaIds.flatMap(area => news.find(item => item.area === area && item.featured) ?? news.find(item => item.area === area) ?? []);
  const featured = library.filter(item => item.featured && item.kind !== "laboratorios");
  return <main className="r-wrap" id="main">
    <section className="r-hero" aria-labelledby="radar-title">
      <div className="r-hero-copy">
        <p className="r-kicker"><span className="r-live-dot" /> Curadoria de tecnologia</p>
        <h1 id="radar-title">Radar do<br /><em>Emanuel.</em></h1>
        <p className="r-hero-intro">Novidades verificadas, ferramentas e referências para decidir o que acompanhar e usar em IA, cibersegurança e design & desenvolvimento.</p>
        <QuickSearch />
        <div className="r-examples"><Link href="/radar/projetos">Projetos open source</Link><Link href={searchHref({ tipo: "skills" })}>Skills</Link><Link href={searchHref({ tipo: "repositorios" })}>Repositórios</Link><Link href="/radar/acervo#frameworks">Frameworks</Link></div>
      </div>
      <RadarDiagram />
      <a className="r-scroll-hint" href="#areas" aria-label="Ir para as áreas"><ArrowDown size={16} /></a>
    </section>

    <section className="r-area-grid" id="areas" aria-label="Áreas do Radar">{areaIds.map(area => {
      const Icon = areaIcons[area];
      return <Link href={`/radar/${area}`} className="r-area-card" key={area} data-area={area}>
        <span className="r-area-icon"><Icon size={21} aria-hidden /></span><span><strong>{areas[area].name}</strong><small>{areas[area].description}</small></span><ArrowUpRight className="r-area-arrow" size={17} aria-hidden />
      </Link>;
    })}</section>

    <section className="r-section" aria-labelledby="novidades-title">
      <SectionTitle id="novidades-title" icon={<Orbit size={20} />} title="O que importa agora" text="Mudanças com impacto no trabalho do dia a dia. Veja o que mudou, para quem importa e como testar." href="/radar/novidades" link="Ver novidades" />
      <div className="r-grid">{highlights.map(item => <NewsCard item={item} key={item.slug} />)}</div>
    </section>
    <section className="r-section" aria-labelledby="em-alta-title">
      <SectionTitle id="em-alta-title" icon={<TrendingUp size={20} />} title="Repositórios em alta" text="Descobertas para avaliar por utilidade, maturidade e atividade." href="/radar/em-alta" link="Ver seleção completa" />
      <TrendMethod /><div className="r-grid">{rising.slice(0, 3).map(item => <RecordCard item={item} key={item.slug} />)}</div>
    </section>
    <section className="r-section" aria-labelledby="biblioteca-title">
      <SectionTitle id="biblioteca-title" icon={<BookOpen size={20} />} title="Biblioteca técnica" text={`${library.length} fichas e referências. Entre por área, por assunto ou pelo tipo de material que você procura.`} href="/radar/acervo" link="Abrir o acervo por assunto" />
      <div className="r-kind-links">{kindIds.filter(kind => kind !== "novidades" && kind !== "laboratorios").map(kind => <Link key={kind} href={kind === "projetos" ? "/radar/projetos" : searchHref({ tipo: kind })}>{kinds[kind].name}<ArrowUpRight size={14} aria-hidden /></Link>)}</div>
      <div className="r-grid">{featured.map(item => <RecordCard item={item} key={item.slug} />)}</div>
    </section>
    <section className="r-section" aria-labelledby="skills-title">
      <SectionTitle id="skills-title" icon={<Layers3 size={20} />} title="Skills em destaque" text="Seleção rotativa por área. As estrelas são do repositório e o crescimento é mostrado quando há recorte semanal verificável." href={searchHref({ tipo: "skills" })} link="Buscar skills" />
      <div className="r-grid">{areaIds.map(area => <SkillSpotlight area={area} items={skillHighlights(area)} placement="home" key={area} />)}</div>
    </section>
    <section className="r-section" aria-labelledby="laboratorios-title">
      <SectionTitle id="laboratorios-title" icon={<FlaskConical size={20} />} title="Laboratórios" text="Experimentos guiados para aprofundar os conceitos do Radar." href="/radar/laboratorios" link="Ver laboratórios" />
      <div className="r-grid">{labs.slice(0, 3).map(item => <LabCard item={item} key={item.slug} />)}</div>
    </section>
  </main>;
}

export function RadarTrends() {
  return <main className="r-wrap r-inner" id="main">
    <Breadcrumb />
    <header className="r-page-hero"><span className="r-area-icon"><TrendingUp size={26} aria-hidden /></span><h1>Repositórios em alta</h1><p>Projetos que chamaram atenção recentemente e já têm documentação para um primeiro teste.</p></header>
    <TrendMethod />
    <div className="r-grid">{rising.map(item => <RecordCard item={item} key={item.slug} />)}</div>
  </main>;
}

export function RadarDirectory({ params }: { params: CatalogParams }) {
  const collections = new Map<string, number>();
  for (const item of library) if (item.catalogOrigin) collections.set(item.catalogOrigin, (collections.get(item.catalogOrigin) ?? 0) + 1);
  const groups = areaIds.map(area => ({ area, items: library.filter(item => item.area === area) }));
  const initial = catalogFilters(params, { q: "", area: "", tipo: "" });
  const format = (count: number) => digits.format(count);
  const tasks = [
    ["roteiro-avaliacao-rag", "Avaliar respostas de IA", "Descubra em que etapa o RAG perde a evidência."],
    ["hf-escolher-modelo-local", "Escolher um modelo local", "Leve tarefa, memória e latência para a decisão."],
    ["roteiro-inventario-sbom", "Revisar dependências", "Confira o inventário do artefato antes do release."],
    ["roteiro-segredo-exposto", "Responder a um alerta", "Organize a contenção de uma credencial exposta."],
    ["roteiro-homologar-compose", "Homologar um ambiente", "Valide serviços, volumes e recuperação com Compose."],
    ["roteiro-qa-pre-publicacao", "Revisar uma interface", "Verifique o fluxo em desktop, mobile e teclado."],
  ].map(([slug, title, description]) => ({ item: library.find(record => record.slug === slug)!, title, description }));

  return <main className="r-wrap r-inner r-acervo" id="main">
    <Breadcrumb />
    <header className="r-acervo-hero">
      <div className="r-acervo-intro"><p className="r-kicker"><BookOpen size={16} aria-hidden /> Biblioteca do Radar</p><h1>Acervo de<br /><em>conhecimento.</em></h1><p>Encontre uma skill, compare ferramentas ou abra um roteiro para a tarefa que você tem em mãos.</p><a className="r-action r-action-primary" href="#catalogo"><Search size={16} aria-hidden /> Buscar no acervo <ArrowDown size={15} aria-hidden /></a></div>
      <aside className="r-acervo-index" aria-label="Distribuição do acervo"><b>{format(library.length)}</b><span>itens para consultar</span><ul>{groups.map(({ area, items }) => <li key={area} data-area={area}><Link href={`/radar/${area}`}><AreaLabel area={area} /><span>{format(items.length)}</span><ArrowUpRight size={14} aria-hidden /></Link></li>)}</ul></aside>
    </header>
    <nav className="r-acervo-formats" aria-label="Atalhos do acervo">
      {(["projetos", "skills", "repositorios"] as const).map(kind => <Link key={kind} href={searchHref({ tipo: kind }, "/radar/acervo") + "#catalogo"}>{kinds[kind].name}<small>{format(library.filter(item => belongsToKind(item, kind)).length)}</small></Link>)}
      <a href="#frameworks">Frameworks<ArrowDown size={15} aria-hidden /></a><a href="#documentos">Documentos do setor<ArrowDown size={15} aria-hidden /></a>
    </nav>
    <section className="r-section r-directory-hub" id="frameworks" aria-labelledby="acervo-frameworks">
      <SectionTitle id="acervo-frameworks" icon={<Layers3 size={19} />} title="Frameworks por área" text="Comece pela tarefa e compare as referências que podem orientar sua decisão." />
      <div className="r-dispatch-grid">{areaIds.map(area => {
        const edition = editions[area];
        return <Link className="r-dispatch-card" data-area={area} key={area} href={`/radar/${area}/${edition.frameworkPath}`}>
          <AreaLabel area={area} /><strong>{area === "ia" ? "Agentes, RAG e avaliação" : area === "ciberseguranca" ? "NIST, CIS, MITRE e OWASP" : "Acessibilidade, design e engenharia"}</strong><ArrowUpRight size={18} aria-hidden />
        </Link>;
      })}</div>
    </section>
    <section className="r-section r-directory-hub" id="documentos" aria-labelledby="acervo-documentos">
      <SectionTitle id="acervo-documentos" icon={<FileText size={19} />} title="Documentos do setor" text="Relatórios, guias técnicos e pesquisas com contexto para aplicar os achados." />
      <div className="r-dispatch-grid">{areaIds.map(area => <Link className="r-dispatch-card" data-area={area} key={area} href={`/radar/${area}/relatorios`}>
        <AreaLabel area={area} /><strong>{area === "ia" ? "Google, Anthropic e Stanford" : area === "ciberseguranca" ? "Mandiant, CrowdStrike e Unit 42" : "HTTP Archive, Google SRE e CNCF"}</strong><ArrowUpRight size={18} aria-hidden />
      </Link>)}</div>
    </section>
    <SearchExplorer items={searchIndex.filter(item => item.kind !== "novidades")} initial={initial} basePath="/radar/acervo" title="Filtrar o acervo" key={JSON.stringify(initial)} />

    <div className="r-acervo-body">
      <aside className="r-acervo-rail"><nav aria-label="Nesta página"><p>Explorar acervo</p><a href="#por-tarefa">Por tarefa</a>{groups.map(({ area }) => <a key={area} href={`#acervo-${area}`}>{areas[area].short}</a>)}<a href="#colecoes-origem">Coleções de origem</a><Link href="/radar/busca">Busca com filtros <ArrowUpRight size={14} aria-hidden /></Link></nav></aside>
      <div className="r-acervo-content">
        <section className="r-acervo-section" id="por-tarefa" aria-labelledby="titulo-tarefas"><h2 id="titulo-tarefas">Comece pela tarefa</h2><div className="r-acervo-tasks">{tasks.map(({ item, title, description }) => <Link className="r-acervo-task" data-area={item.area} href={entryPath(item.slug)} key={item.slug}><AreaLabel area={item.area} /><strong>{title}</strong><span>{description}</span><ArrowUpRight size={16} aria-hidden /></Link>)}</div></section>
        {groups.map(({ area, items }) => {
          const Icon = areaIcons[area];
          const subjects = new Map<string, number>();
          for (const item of items) subjects.set(item.tags[0], (subjects.get(item.tags[0]) ?? 0) + 1);
          const topics = [...subjects].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"));
          const spotlight = {
            ia: ["RAG", "Inferência local", "Agentes e orquestração"],
            ciberseguranca: ["Detecção e resposta", "Cadeia de suprimentos", "Identidade e segredos"],
            "design-desenvolvimento": ["Motion", "DevOps e hospedagem", "Dados e backends", "Componentes UI"],
          }[area];
          const firstTopics = [...new Set([...spotlight, ...topics.slice(0, 5).map(([topic]) => topic)])].slice(0, 6);
          function listTopics(labels: string[]) {
            return <ul className="r-acervo-topics">{labels.map(topic => <li key={topic}><Link href={searchHref({ area, tema: topic })}>{topic}<small>{format(items.filter(item => item.tags.includes(topic)).length)}</small><ArrowUpRight size={14} aria-hidden /></Link></li>)}</ul>;
          }
          return <section className="r-acervo-section r-directory-area" data-area={area} id={`acervo-${area}`} key={area} aria-labelledby={`titulo-${area}`}>
            <div className="r-acervo-area-head"><span className="r-area-icon"><Icon size={22} aria-hidden /></span><div><h2 id={`titulo-${area}`}>{areas[area].name}</h2><p>{areas[area].description}</p></div><Link className="r-action r-action-muted" href={searchHref({ area })}>Ver {format(items.length)} itens <ArrowUpRight size={15} aria-hidden /></Link></div>
            <nav className="r-kind-links" aria-label={`Subáreas de ${areas[area].name}`}>{subareas[area].map(group => <Link key={group.id} href={`/radar/${area}/${group.id}`}>{group.title}<ArrowUpRight size={14} aria-hidden /></Link>)}</nav>
            <nav className="r-kind-links" aria-label={`Tipos em ${areas[area].name}`}>{kindIds.filter(kind => items.some(item => belongsToKind(item, kind))).map(kind => <Link key={kind} href={`/radar/${area}/${kind}`}>{kinds[kind].name}</Link>)}</nav>
            {listTopics(firstTopics)}
            <details className="r-acervo-more"><summary>Mais assuntos <ChevronDown size={16} aria-hidden /></summary>{listTopics(topics.map(([topic]) => topic).filter(topic => !firstTopics.includes(topic)))}</details>
          </section>;
        })}
        <section className="r-acervo-section" id="colecoes-origem" aria-labelledby="titulo-colecoes"><h2 id="titulo-colecoes">Coleções de origem</h2><ul className="r-acervo-topics">{[...collections].map(([colecao, count]) => <li key={colecao}><Link href={searchHref({ colecao })}>{colecao}<small>{format(count)}</small><ArrowUpRight size={14} aria-hidden /></Link></li>)}</ul></section>
      </div>
    </div>
  </main>;
}

export function Breadcrumb({ area, back, kind }: { area?: Area; back?: string; kind?: Kind }) {
  return <nav className="r-crumb" aria-label="Caminho da página"><RadarBack fallback={back ?? (area ? `/radar/${area}` : "/radar")} />
    <span aria-hidden>/</span><Link href="/radar">Radar</Link>
    {area && <><span aria-hidden>/</span><Link href={`/radar/${area}`}>{areas[area].short}</Link></>}
    {area && kind && <><span aria-hidden>/</span><Link href={`/radar/${area}/${kind}`}>{kinds[kind].name}</Link></>}
  </nav>;
}

const frameworkChoices = {
  ia: [
    ["Construir um agente com etapas controladas", "Compare LangGraph para fluxos com estado e Google ADK para aplicações em que ferramentas e sessões precisam de uma estrutura comum.", ["langgraph", "google-adk-python"]],
    ["Conectar documentos a um sistema de IA", "Use LlamaIndex para organizar ingestão e recuperação, e teste seus resultados com perguntas que exigem fonte e contexto.", ["llamaindex-framework-rag"]],
    ["Avaliar qualidade de resposta", "Defina tarefas representativas do seu produto e registre os erros que impedem a adoção.", ["openai-metodologia-evals", "mlperf-inference-benchmarks"]],
    ["Governar o uso de IA", "Documente quem responde pelo sistema, como ele será monitorado e como tratar falhas.", ["nist-ai-rmf-governanca", "model-cards-guia"]],
    ["Integrar agentes e ferramentas", "Identifique os dados e permissões de cada integração antes de conectar serviços.", ["a2a-protocolo"]],
  ],
  ciberseguranca: [
    ["Definir prioridades com a liderança", "Comece pelo NIST CSF para organizar os resultados esperados e pelo CIS Controls para priorizar ações.", ["nist-csf-governanca", "cis-controls-priorizacao"]],
    ["Melhorar a resposta a incidentes", "Use o NIST SP 800-61 para distribuir responsabilidades, preparar exercícios e orientar a revisão pós-incidente.", ["nist-800-61-resposta"]],
    ["Definir requisitos para software", "Use o OWASP ASVS para transformar requisitos de segurança da aplicação em critérios de verificação.", ["owasp-asvs-verificacao"]],
    ["Revisar a cobertura de detecção", "Use o MITRE ATT&CK para mapear o que suas fontes de telemetria e regras de detecção conseguem observar.", ["mitre-attack-cobertura"]],
  ],
  "design-desenvolvimento": [
    ["Estruturar uma aplicação React", "Consulte o App Router do Next.js para organizar rotas e layouts. Decida quais partes exigem JavaScript no navegador e valide essas escolhas no build.", ["nextjs"]],
    ["Melhorar a acessibilidade", "Parta da WCAG e valide os fluxos principais com teclado, ampliação e tecnologias assistivas.", ["wcag-22-padrao"]],
    ["Planejar compatibilidade entre navegadores", "Consulte Baseline e compare os recursos com os navegadores usados pelo seu público.", ["baseline-compatibilidade-web"]],
    ["Medir desempenho e diagnosticar regressões", "Comece com Core Web Vitals para experiência real e OpenTelemetry para observar serviços e rastrear falhas.", ["core-web-vitals-medicao", "opentelemetry-especificacao"]],
  ],
} satisfies Record<Area, [string, string, string[]][]>;

function EditionReferences({ area }: { area: Area }) {
  const edition = editions[area];
  const groups = [
    { id: "frameworks", title: "Frameworks", path: edition.frameworkPath, picks: edition.frameworks, icon: Layers3 },
    { id: "documentos", title: "Documentos do setor", path: "relatorios", picks: edition.reports, icon: FileText },
  ];
  return <div className="r-edition-references" aria-label="Referências essenciais">
    {groups.map(({ id, title, path, picks, icon: Icon }) => <section key={id} id={id} className="r-reference-panel" aria-labelledby={`r-edition-${id}`}>
      <div className="r-reference-heading"><Icon size={21} aria-hidden /><h2 id={`r-edition-${id}`}>{title}</h2><Link href={`/radar/${area}/${path}`}>Ver todos <ArrowUpRight size={15} aria-hidden /></Link></div>
      <ul>{picks.slice(0, 3).flatMap(slug => {
        const item = library.find(record => record.slug === slug);
        if (!item) return [];
        return <li key={slug}><div><Link href={entryPath(slug)}>{item.title}</Link><p>{item.summary}</p></div><a className="r-source-action" href={item.sources[0].url} aria-label={`Fonte oficial de ${item.title}`}>Fonte <ArrowUpRight size={13} aria-hidden /></a></li>;
      })}</ul>
    </section>)}
  </div>;
}

function AreaExplore({ area, kind, group }: { area: Area; kind?: Kind; group?: Subarea }) {
  const index = searchIndex.filter(item => item.area === area);
  const groups = kindIds.map(type => ({ type, count: index.filter(item => item.kind === type || (type === "projetos" && item.openSource)).length })).filter(group => group.count > 0);
  const frameworkPath = editions[area].frameworkPath;
  const destinations = [
    { id: frameworkPath, label: "Frameworks", icon: Layers3 },
    { id: "skills", label: "Skills", icon: Star },
    { id: "projetos", label: "Projetos open source", icon: FolderGit2 },
    { id: "repositorios", label: "Repositórios", icon: Github },
    { id: "relatorios", label: "Documentos do setor", icon: FileText },
  ];
  return <div className="r-area-explore">
    <nav className="r-area-shortcuts" aria-label="Explorar por tipo">
      {destinations.map(({ id, label, icon: Icon }) => <Link key={id} href={`/radar/${area}/${id}`} aria-current={kind === id || group?.id === id ? "page" : undefined}>
        <Icon size={16} aria-hidden />{label}
      </Link>)}
    </nav>
    <details className="r-area-more">
      <summary>Subáreas e outros formatos <ChevronDown size={15} aria-hidden /></summary>
      <nav className="r-subarea-grid" aria-label={`Subáreas de ${areas[area].name}`}>
        {subareas[area].map(option => {
          if (destinations.some(destination => destination.id === option.id)) return null;
          const count = index.filter(item => item.subareas.includes(option.id)).length;
          if (!count) return null;
          return <Link key={option.id} href={`/radar/${area}/${option.id}`} aria-current={group?.id === option.id ? "page" : undefined}>
            <strong>{option.title}</strong><small>{count} fichas</small><span>{option.description}</span><ArrowUpRight size={16} aria-hidden />
          </Link>;
        })}
      </nav>
      <nav aria-label={`Outros formatos em ${areas[area].name}`} className="r-area-choices">{groups.filter(({ type }) => !destinations.some(destination => destination.id === type)).map(({ type, count }) => <Link key={type} href={`/radar/${area}/${type}`} aria-current={kind === type ? "page" : undefined}>{kinds[type].name}<small>{count}</small><ArrowUpRight size={14} aria-hidden /></Link>)}</nav>
    </details>
  </div>;
}

export function RadarCollection({ area, kind, group, params }: { area?: Area; kind?: Kind; group?: Subarea; params: CatalogParams }) {
  const overview = area && !kind && !group;
  const recent = overview ? news.filter(item => item.area === area).slice(0, 3) : [];
  const picks = area && (overview || kind === "skills") ? selectedSkills(area) : [];
  const fromCommunities = kind === "projetos" ? (area ? communitySelection.filter(item => item.area === area).slice(0, 3) : areaIds.flatMap(topic => communitySelection.find(item => item.area === topic) ?? [])) : [];
  const guides = overview ? library.filter(item => item.area === area && item.kind === "guias").slice(0, 3) : [];
  const title = group?.title ?? (kind ? kinds[kind].name : area ? areas[area].name : "Biblioteca");
  const intro = group?.description ?? (kind === "novidades" ? "Lançamentos e mudanças que merecem atenção, com o impacto prático e a fonte de cada anúncio."
    : kind === "laboratorios" ? "Simulações interativas com pequenos experimentos para aprender no seu ritmo."
    : kind === "projetos" ? "Projetos com código aberto, contexto de uso e referências da documentação e das comunidades técnicas."
    : overview ? areas[area].description : "Fichas com contexto, autor e referências para aprofundar e aplicar.");
  const Icon = area ? areaIcons[area] : kind === "laboratorios" ? FlaskConical : Orbit;
  const path = [area, kind ?? group?.id].filter(Boolean).join("/");
  const basePath = `/radar/${path}`;
  const scope = { q: "", area: area ?? "", tipo: kind ?? "", subarea: group?.id };
  const items = filterRecords(searchIndex, scope).filter(item => !overview || item.kind !== "novidades");
  const uses = area && (group?.id === "frameworks" || group?.id === "padroes")
    ? frameworkChoices[area].map(([label, tip, slugs]) => ({ id: slugs[0], label, tip, slugs }))
    : undefined;
  const initial = catalogFilters(params, scope);
  if (!uses?.some(use => use.id === initial.uso)) initial.uso = "";
  const catalogTitle = kind === "projetos" ? "Catálogo de projetos" : kind === "skills" ? "Todas as skills" : overview ? "Biblioteca da área" : "Consultar fichas";
  const catalog = <SearchExplorer items={items} initial={initial} scope={scope} basePath={basePath} title={catalogTitle} uses={uses} key={JSON.stringify(initial)} />;
  return <main className="r-wrap r-inner" id="main" data-area={area}>
    <Breadcrumb area={kind || group ? area : undefined} back={overview ? "/radar/acervo" : group && area ? `/radar/${area}` : undefined} />
    {area ? <AreaHero area={area} title={title} intro={intro} count={items.length} overview={overview || undefined} skillSpotlight={kind === "skills" && picks.length > 0} /> : <header className="r-page-hero"><span className="r-area-icon"><Icon size={27} aria-hidden /></span><h1>{title}</h1><p>{intro}</p><div className="r-author-line">
      <a className="r-action r-action-primary" href="#catalogo"><Search size={16} aria-hidden /> Abrir catálogo · {items.length}</a>
    </div></header>}
    {area && <AreaExplore area={area} kind={kind} group={group} />}
    {overview && <EditionReferences area={area} />}
    {!overview && kind !== "laboratorios" && catalog}
    {picks.length > 0 && area && <section className="r-section r-collection-section" aria-labelledby="skills-area"><SectionTitle id="skills-area" icon={<Layers3 size={19} />} title="Skills em destaque" text={`As estrelas pertencem aos repositórios. Totais consultados em ${shortDate(starsCheckedAt)}.`} href={kind ? undefined : `/radar/${area}/skills`} link="Ver todas" /><SkillSpotlight area={area} items={skillHighlights(area)} placement="area" /></section>}
    {guides.length > 0 && <section className="r-section r-collection-section" aria-labelledby="guias-area"><SectionTitle id="guias-area" icon={<BookOpen size={19} />} title="Guias para aplicar" text="Roteiros com entradas, procedimento e evidência esperada." href={`/radar/${area}/guias`} link="Ver guias" /><div className="r-grid">{guides.map(item => <RecordCard item={item} key={item.slug} />)}</div></section>}
    {recent.length > 0 && <section className="r-section r-collection-section" aria-labelledby="recentes-area"><SectionTitle id="recentes-area" icon={<Orbit size={19} />} title="Novidades da área" text="Mudanças verificadas na fonte original." href={`/radar/${area}/novidades`} link="Ver todas" /><div className="r-grid">{recent.map(item => <NewsCard item={item} key={item.slug} />)}</div></section>}
    {kind === "laboratorios" && labs.filter(item => !area || item.area === area).length > 0 && <div className="r-grid r-collection-grid">{labs.filter(item => !area || item.area === area).map(item => <LabCard item={item} key={item.slug} />)}</div>}
    {(overview || kind === "laboratorios") && catalog}
    {fromCommunities.length > 0 && <section className="r-section r-collection-section" aria-labelledby="projetos-comunidades"><SectionTitle id="projetos-comunidades" icon={<TrendingUp size={19} />} title="Descobertas nas comunidades" text="Seleção com discussões e marcos de canais como Hacker News, Lobsters, CNCF, LinuxFr e Fedora Magazine." href={searchHref({ area, tipo: "projetos", tema: "Comunidades técnicas" })} link="Ver todas as descobertas" /><div className="r-grid">{fromCommunities.map(item => <RecordCard item={item} key={item.slug} />)}</div></section>}
  </main>;
}

export function RadarEntry({ item }: { item: RadarRecord }) {
  const sourceTitle = item.catalogOrigin ? "Fonte e catalogação" : "Fontes e referências";
  const signal = repositorySignal(item.creator.github, item.sources);
  const contents = [...(item.demo ? [{ id: "experimento", title: "Experimento" }] : []), ...item.sections.map((section, index) => ({ id: `parte-${index + 1}`, title: section.title })), { id: "referencias", title: sourceTitle }];
  return <main className="r-wrap r-inner" id="main" data-area={item.area}>
    <Breadcrumb area={item.area} kind={item.kind} back={`/radar/${item.area}/${item.kind}`} />
    <article>
      <header className="r-page-hero r-article-head">
        <div className="r-chip-line"><AreaLabel area={item.area} /><span>{kinds[item.kind].singular}</span>{item.eventDate && <time dateTime={item.eventDate}>{fullDate(item.eventDate)}</time>}</div>
        <h1>{item.title}</h1><p>{item.summary}</p>
        <div className="r-author-line"><Creator creator={item.creator} />{item.creator.github && <a className="r-action r-action-muted" href={item.creator.github}><Github size={17} aria-hidden /> GitHub <ArrowUpRight size={14} aria-hidden /></a>}</div>
        {(signal || item.weeklyStars) && <div className="r-article-signal"><RepositoryStars repository={signal} /><RepositoryGrowth repository={signal} />{signal?.total !== undefined && <small>Estrelas do GitHub em {shortDate(starsCheckedAt)}</small>}{!signal?.weekly && item.weeklyStars && <><WeeklySignal stars={item.weeklyStars} /><a href={trendingUrl}>GitHub Trending <ArrowUpRight size={14} aria-hidden /></a></>}</div>}
      </header>
      <div className="r-reading">
        <aside><ReadingContents parts={contents} /></aside>
        <div className="r-reading-main">
          {item.demo && <section id="experimento" className="r-reading-part"><h2>Experimento</h2><Lab demo={item.demo} /></section>}
          {item.sections.map((section, index) => <section className="r-reading-part r-arrive" key={section.title} id={`parte-${index + 1}`}><h2>{section.title}</h2><p>{section.body}</p></section>)}
          <section id="referencias" className="r-reading-part"><h2>{sourceTitle}</h2><ul className="r-source-list">{item.sources.map(source => <li key={source.url}><a href={source.url}><span>{source.title}<small>{new URL(source.url).hostname}</small></span><ArrowUpRight size={17} aria-hidden /></a></li>)}</ul>
            <dl className="r-fact-list">{item.catalogOrigin ? <><div><dt>Coleção</dt><dd>{item.catalogOrigin}</dd></div><div><dt>Estado</dt><dd>Catalogado</dd></div></> : <><div><dt>Verificado em</dt><dd><time dateTime={item.reviewedAt}>{fullDate(item.reviewedAt)}</time></dd></div><div><dt>Nível</dt><dd>{item.level}</dd></div></>}{item.license && <div><dt>{item.catalogOrigin ? "Licença registrada no catálogo" : "Licença"}</dt><dd>{item.license}</dd></div>}</dl>
            <ul className="r-tags" aria-label="Temas">{item.tags.map(tag => <li key={tag}><Link href={searchHref({ area: item.area, tema: tag })}>{tag}</Link></li>)}</ul>
          </section>
        </div>
      </div>
    </article>
    <section className="r-section" aria-labelledby="relacionados"><SectionTitle id="relacionados" icon={<ArrowRight size={20} />} title="Continue explorando" text="Mais fichas desta área para avançar no assunto." /><div className="r-grid">{relatedTo(item).map(related => <RecordCard item={related} key={related.slug} />)}</div></section>
  </main>;
}
