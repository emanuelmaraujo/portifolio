import Image from "next/image";
import { getPortfolioData } from "@/data/portfolioData";
import type { Locale } from "./content";

export default function ProfessionalRecord({ locale }: { locale: Locale }) {
  const en = locale === "en";
  const { experience, techStack, badges, courses, personalProjects } = getPortfolioData(en ? "en" : "pt");
  return <div className="professional-record">
    <section id="experience" className="record-timeline" aria-labelledby="record-title">
      <h3 id="record-title">{en ? "Professional timeline" : "Trajetória profissional"}</h3>
      <ol>
        {experience.map(item => <li key={item.role}>
          <span className="mono">{item.period}</span>
          <h4>{item.role}</h4>
          <p>{item.company}</p>
          <p>{item.description}</p>
        </li>)}
      </ol>
      <details className="record-courses">
        <summary>{en ? "Additional courses" : "Cursos complementares"}<span aria-hidden="true" /></summary>
        <ul>{courses.map(course => <li key={course.name}><b>{course.name}</b> · {course.institution} · {course.year}</li>)}</ul>
      </details>
    </section>
    <div className="record-side">
      <section aria-labelledby="stack-title">
        <h3 id="stack-title">{en ? "Technical stack" : "Stack técnica"}</h3>
        <ul className="record-stack">
          {techStack.map(tool => <li key={tool.name}><b>{tool.name}</b><small>{tool.category}</small></li>)}
        </ul>
      </section>
      <section aria-labelledby="badge-title">
        <h3 id="badge-title">{en ? "Badges & coursework" : "Badges e formação complementar"}</h3>
        <ul className="record-badges">
          {badges.filter(badge => badge.url?.startsWith("https://www.credly.com/")).map(badge => <li key={badge.name}>
            <a href={badge.url}>
              <Image src={"/" + badge.image} width={40} height={40} alt="" />
              <span>{badge.name}</span>
            </a>
          </li>)}
        </ul>
      </section>
      {personalProjects.map(project => <section key={project.name} className="record-project">
        <h3><a href={project.url}>{project.name} ↗</a></h3><p>{project.description}</p>
      </section>)}
    </div>
  </div>;
}
