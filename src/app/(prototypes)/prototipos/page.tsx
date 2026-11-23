import { directions, root, type Direction } from "@/components/prototypes/shared";

/** The comparison sheet: same copy, same structure, two directions. */
export default function Page() {
  const row = { display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) repeat(2, minmax(0, 1fr))", gap: 16, padding: "14px 0", borderTop: "1px solid #c9c9c4", alignItems: "baseline" } as const;
  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "48px 20px", font: "16px/1.6 system-ui, sans-serif", color: "#1b1c1a" }}>
      <p style={{ font: "12px/1.5 ui-monospace, monospace", letterSpacing: ".1em", textTransform: "uppercase", color: "#5c5d58" }}>Protótipos locais · não indexados</p>
      <h1 style={{ fontSize: 32, lineHeight: 1.1, margin: "8px 0 12px" }}>Duas direções, a mesma página</h1>
      <p style={{ maxWidth: "58ch", margin: 0 }}>As duas usam a mesma copy em português, os mesmos projetos e os mesmos ativos. Muda a autoria: composição, material, tipografia e ritmo. Abra cada par no desktop e no celular.</p>
      <div style={{ marginTop: 32 }}>
        {(Object.keys(directions) as Direction[]).map(id => (
          <div style={row} key={id}>
            <span><b>{directions[id].letter}</b> · {directions[id].name}</span>
            <a href={`${root}/${id}`}>Abertura</a>
            <a href={`${root}/${id}/prumo`}>Estudo de caso · Prumo</a>
          </div>
        ))}
        <div style={row}><span><b>C</b> · Feixe (motion, gesto e caso em uma cena)</span><a href={`${root}/feixe?intro`}>Abertura, com a chegada</a><a href={`${root}/feixe#caso`}>Direto no caso · Prumo</a></div>
        <div style={row}><span><b>D</b> · Três verbos (maquete renderizada, cena “protejo”)</span><a href={`${root}/tres-verbos`}>Cena protejo</a><span /></div>
        <div style={row}><span><b>F</b> · Três verbos, percurso completo no scroll</span><a href={`${root}/percurso`}>Percurso</a><span /></div>
        <div style={row}><span><b>E</b> · Núcleo (cyberpunk, percurso em loop)</span><a href={`${root}/nucleo`}>Percurso completo</a><span /></div>
        <div style={row}><span>Controle</span><a href="/pt">Página atual</a><span /></div>
      </div>
    </main>
  );
}
