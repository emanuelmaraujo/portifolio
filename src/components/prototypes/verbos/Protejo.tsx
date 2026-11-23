import Mark from "@/components/site/Mark";
import { links, root, t } from "../shared";
import Player from "./Player";

/**
 * Scene 2 of "Três verbos": the visitor protects the maquette by holding the bell jar down over it.
 * The words are the site's own: the hero sentence is the script, the pillar copy is the evidence.
 */
const BASE = "/prototypes/tres-verbos/protejo";
const pillar = t.pillars.items[0];
const fx = {
  hold: "Segure para proteger", holdKeys: "Espaço ou Enter baixam e levantam a redoma.", again: "Levantar a redoma",
  meter: "integridade", open: "exposto", safe: "protegido", loading: "carregando a cena",
  // The pillar's caption, without the figure's name.
  claim: "Controles em profundidade ao redor do que importa.",
  proof: [t.trajectory.layers[2].gained[3], t.trajectory.layers[2].gained[0], t.trajectory.layers[2].gained[1]],
  evidence: "Ver as evidências", next: "Próximo verbo: orquestro", soon: "em produção",
  scenes: ["projeto", "protejo", "orquestro"],
};

export default function Protejo() {
  return (
    <div className="px-v" data-state="open" data-open={fx.open} data-safe={fx.safe}>
      <a className="v-skip" href="#v-copy">{t.skip}</a>
      <div className="v-stage">
        {/* The sealed frame is the scene when nothing else can run, and the first thing painted when it can. */}
        <picture>
          <source media="(max-aspect-ratio: 17/20)" srcSet={`${BASE}/p/040.jpg`} />
          <img className="v-poster" src={`${BASE}/l/040.jpg`} alt="Uma maquete de cerâmica em três estratos sob uma redoma de vidro, sobre uma mesa de projeto com instrumentos de latão." />
        </picture>
        <Player />

        <header className="v-header">
          <a className="v-identity" href={root} aria-label="Emanuel Araújo"><Mark /><span>Emanuel Araújo</span></a>
          <p className="v-role">{t.contact.role}</p>
        </header>

        {/* The sentence is the script: one verb per scene. */}
        <p className="v-sentence">
          <span className="v-sr">{t.hero.title.map(([text]) => text).join("")}</span>
          <span aria-hidden="true">Eu projeto, <b>protejo</b> e orquestro sistemas inteligentes.</span>
        </p>
        <ol className="v-rail" aria-label="Cenas">
          {fx.scenes.map(scene => <li aria-current={scene === "protejo" ? "step" : undefined} key={scene}>{scene}</li>)}
        </ol>

        <h1 className="v-word">protejo</h1>
        <p className="v-meter" aria-hidden="true"><b>100</b><span>{fx.open}</span><i>{fx.meter}</i></p>

        <div className="v-copy" id="v-copy">
          <p className="v-claim">{fx.claim}</p>
          <p className="v-thesis">{pillar.thesis}</p>
          <ul className="v-proof">{fx.proof.map(item => <li key={item}>{item}</li>)}</ul>
          <p className="v-links">
            <a className="v-link" href="/pt#pillars">{fx.evidence} <span aria-hidden="true">→</span></a>
            <button className="v-again" type="button">{fx.again}</button>
          </p>
          <p className="v-next">{fx.next}<span>{fx.soon}</span></p>
        </div>

        <div className="v-dock">
          <button className="v-hold" type="button" aria-describedby="v-keys">
            <i aria-hidden="true" />
            <span className="v-hold-ask">{fx.hold}</span>
            <span className="v-hold-done">{fx.safe}</span>
          </button>
          <span className="v-sr" id="v-keys">{fx.holdKeys}</span>
          <a className="v-pill" href="/pt#work">{t.hero.primary}</a>
          <a className="v-pill v-pill--quiet" href={links.email}>{t.contact.label}</a>
        </div>
        <p className="v-load" aria-hidden="true"><b className="v-loading">000</b>{fx.loading}</p>
      </div>
    </div>
  );
}
