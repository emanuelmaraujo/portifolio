import { getPortfolioData } from "@/data/portfolioData";
import type { Locale } from "./content";

export default function TechnicalAreas({ locale }: { locale: Locale }) {
  const en = locale === "en";
  const data = getPortfolioData(en ? "en" : "pt");
  const areas = [
    { id: "security", title: en ? "Security & compliance" : "Segurança e compliance", groups: [
      ...data.securityInfo.categories.map(category => ({ name: category.title, items: category.items })),
      { name: en ? "Governance & risk" : "Governança e riscos", items: [...data.governance.items.slice(0, 2), ...data.riskManagement.items.slice(0, 2)] },
    ] },
    { id: "infrastructure", title: en ? "Infrastructure & operations" : "Infraestrutura e operações", groups: [
      { name: en ? "Infrastructure" : "Infraestrutura", items: data.infrastructure.items.slice(0, 4) },
      { name: en ? "Service & continuity" : "Serviços e continuidade", items: [...data.operations.items.slice(0, 2), ...data.businessContinuity.items.slice(0, 2)] },
    ] },
    { id: "management", title: en ? "Management & automation" : "Gestão e automação", groups: [
      { name: en ? "Assets & contracts" : "Ativos e contratos", items: [...data.assetManagement.items.slice(0, 2), ...data.contractManagement.items.slice(0, 2)] },
      { name: en ? "Automation & data" : "Automação e dados", items: [...data.automation.items.slice(0, 2), ...data.businessIntelligence.items.slice(0, 2)] },
    ] },
  ];
  return <div className="technical-areas" id="expertise">
    {areas.map((area, index) => <section key={area.id} id={area.id}>
      <p className="mono">/ 0{index + 1}</p><h3>{area.title}</h3>
      {area.groups.map(group => <details key={group.name}>
        <summary>{group.name}<span aria-hidden="true" /></summary>
        <ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul>
      </details>)}
    </section>)}
  </div>;
}
