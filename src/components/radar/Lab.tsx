"use client";

import { useId, useState } from "react";
import { ArrowLeft, ArrowRight, Play, RotateCcw } from "lucide-react";
import type { RadarRecord } from "./content";

type Demo = NonNullable<RadarRecord["demo"]>;
type Frame = { title: string; text: string; evidence?: { title: string; text: string }[] };

const lessons: Record<Demo, { control: string; options: string[]; steps: string[] }> = {
  rag: { control: "Pergunta", options: ["Até que horas posso pegar livros no sábado?", "A biblioteca tem estacionamento?"], steps: ["Pergunta", "Recuperação", "Contexto", "Resposta"] },
  skills: { control: "Tarefa editorial", options: ["Conferir fonte de uma ficha", "Revisar uma interface"], steps: ["Tarefa", "Descoberta", "Instruções", "Validação"] },
  mcp: { control: "Solicitação", options: ["Ler ficha pública", "Editar ficha"], steps: ["Host", "Cliente", "Servidor", "Resultado"] },
  triagem: { control: "Contexto do ativo", options: ["Manutenção programada", "Sem manutenção confirmada"], steps: ["Evento", "Contexto", "Prioridade", "Decisão"] },
  interface: { control: "Resultado simulado", options: ["Busca disponível", "Serviço indisponível"], steps: ["Padrão", "Foco", "Carregando", "Resultado"] },
};

const opening = { title: "[1] Grade de horários", text: "A Biblioteca Horizonte abre aos sábados das 9h às 13h." };
const service = { title: "[2] Serviços de sábado", text: "O balcão de atendimento encerra 30 minutos antes do fechamento." };
const access = { title: "[3] Como chegar", text: "A biblioteca fica perto da estação Central. O acesso principal tem rampa." };

function ragFrames(option: number, topK: number): Frame[] {
  const relevant = option === 0;
  const selected = (relevant ? [opening, service, access] : [access, opening, service]).slice(0, topK);
  return [
    { title: "A pergunta entra na busca", text: relevant ? "O leitor quer saber até que horas pode pegar um livro emprestado no sábado." : "O leitor quer verificar se há vagas para carro na biblioteca." },
    { title: `${topK} ${topK === 1 ? "trecho recuperado" : "trechos recuperados"}`, text: "Neste acervo fictício, os trechos são ordenados pela relação com a pergunta. Ajuste o limite e compare quais informações chegam ao gerador.", evidence: selected },
    { title: "O contexto fica disponível para responder", text: relevant && topK >= 2 ? "O contexto inclui tanto o horário do prédio quanto o intervalo do balcão." : "O contexto atual cobre apenas parte da informação pedida. O gerador deve explicitar a lacuna.", evidence: selected },
    { title: "Resposta com evidência", text: relevant ? topK >= 2 ? "O prédio fica aberto das 9h às 13h [1]. Para pegar livros emprestados, chegue antes das 12h30, quando o balcão fecha [2]." : "O prédio fica aberto das 9h às 13h [1]. O trecho recuperado não informa até que horas é possível pegar livros emprestados." : "O acervo informa proximidade com a estação e rampa no acesso [3]. Não há informação suficiente para confirmar estacionamento." },
  ];
}

function lessonFrames(demo: Exclude<Demo, "rag">, option: number): Frame[] {
  const alternate = option === 1;
  switch (demo) {
    case "skills": return [
      { title: "Uma tarefa chega ao agente", text: alternate ? "Revisar navegação e acessibilidade da busca do Radar." : "Conferir a versão e a licença citadas em uma ficha de projeto." },
      { title: "A descrição faz a seleção", text: alternate ? "A descrição da skill revisar-interface menciona estados, foco e navegação por teclado." : "A descrição da skill verificar-fonte menciona documentação primária, versão e licença." },
      { title: "O agente carrega o SKILL.md", text: alternate ? "As instruções pedem teste por teclado, registro da falha e verificação em uma tela pequena." : "As instruções pedem a URL canônica, a versão associada e evidência da licença." },
      { title: "O avaliador confere o resultado", text: alternate ? "A entrega inclui o fluxo testado, o foco observado e um caminho simples para repetir a verificação." : "A entrega vincula a versão ao release e a licença ao arquivo oficial. Um campo sem evidência volta para revisão." },
    ];
    case "mcp": return [
      { title: "O host recebe a intenção", text: alternate ? "O assistente recebe um pedido para editar uma ficha técnica." : "O assistente precisa consultar uma ficha técnica pública." },
      { title: "O cliente MCP verifica as capacidades", text: "O servidor anuncia uma ferramenta de leitura. O cliente conhece seu nome e o formato da entrada aceita." },
      { title: alternate ? "O pedido de escrita fica bloqueado" : "O servidor devolve a ficha", text: alternate ? "Neste exemplo, a política do host aceita apenas leitura. O cliente não encaminha a edição ao servidor." : "O servidor executa a leitura autorizada e retorna os campos públicos da ficha." },
      { title: "O host mostra o resultado", text: alternate ? "A ficha permanece como estava. O host informa que essa integração opera em modo de leitura." : "O assistente resume a ficha e identifica a origem retornada pelo servidor." },
    ];
    case "triagem": return [
      { title: "A telemetria registra um evento", text: "Um endpoint de teste registrou cinco autenticações negadas em três minutos. O evento sozinho precisa de contexto." },
      { title: "A equipe consulta o contexto", text: alternate ? "O inventário identifica um serviço sensível e a agenda não mostra manutenção confirmada." : "O chamado de manutenção confirma teste de autenticação na janela, no mesmo ativo e com o responsável esperado." },
      { title: alternate ? "Prioridade para investigação" : "Prioridade baixa", text: alternate ? "A combinação de criticidade e ausência de mudança planejada justifica investigar o caso no mesmo turno." : "As evidências correspondem à atividade programada. A triagem registra o chamado e mantém a monitoração." },
      { title: "A decisão fica documentada", text: alternate ? "Abra um caso, agregue a telemetria disponível e confirme o responsável pelo serviço. Registre os próximos passos e o que ainda é incerto." : "Encerre como atividade esperada, vincule o chamado e registre o que é necessário conferir se o evento reaparecer." },
    ];
    case "interface": return [
      { title: "Padrão", text: "O campo apresenta um rótulo e deixa claro o que pode ser pesquisado." },
      { title: "Foco visível", text: "Uma borda destaca o elemento que recebe o teclado. O rótulo permanece disponível durante a interação." },
      { title: "Carregando", text: "O campo mantém seu espaço e o texto sinaliza a busca em andamento. A animação pode ser reduzida sem perder o estado." },
      { title: alternate ? "Erro com recuperação" : "Resultados visíveis", text: alternate ? "A mensagem explica a indisponibilidade e oferece uma nova tentativa. O termo pesquisado continua visível." : "A interface anuncia o total de resultados e mantém o campo disponível para um ajuste." },
    ];
  }
}

export default function Lab({ demo }: { demo: Demo }) {
  const [option, setOption] = useState(0);
  const [step, setStep] = useState(0);
  const [topK, setTopK] = useState(2);
  const id = useId();
  const lesson = lessons[demo];
  const frames = demo === "rag" ? ragFrames(option, topK) : lessonFrames(demo, option);
  const frame = frames[step];

  return <div className="r-lab">
    <div className="r-lab-controls">
      <div className="r-field"><label htmlFor={`${id}-scenario`}>{lesson.control}</label><select id={`${id}-scenario`} value={option} onChange={event => setOption(Number(event.target.value))}>{lesson.options.map((label, index) => <option key={label} value={index}>{label}</option>)}</select></div>
      {demo === "rag" && <div className="r-field r-range"><label htmlFor={`${id}-count`}>Trechos recuperados</label><output htmlFor={`${id}-count`}>{topK}</output><input id={`${id}-count`} type="range" min={1} max={3} value={topK} onChange={event => setTopK(Number(event.target.value))} /></div>}
    </div>
    <ol className="r-lab-steps" aria-label="Etapas do experimento">{lesson.steps.map((label, index) => <li key={label}>
      <button type="button" aria-current={step === index ? "step" : undefined} aria-controls={`${id}-frame`} onClick={() => setStep(index)}><span>{index + 1}</span>{label}</button>
    </li>)}</ol>
    <div id={`${id}-frame`} className="r-lab-output" aria-live="polite">
      <div className="r-lab-frame" key={`${step}-${option}-${topK}`}>
        <h3>{frame.title}</h3><p>{frame.text}</p>
        {frame.evidence && <ul>{frame.evidence.map(chunk => <li key={chunk.title}><strong>{chunk.title}</strong><span>{chunk.text}</span></li>)}</ul>}
        {demo === "interface" && <div className="r-demo-ui" data-step={step} data-error={option === 1 && step === 3} aria-hidden>
          <span>Buscar na biblioteca</span><div>Motion {step === 2 && <i />}</div>
          {step >= 2 && <small>{step === 2 ? "Buscando…" : option === 1 ? "Serviço indisponível. Tente novamente." : "3 resultados encontrados"}</small>}
        </div>}
      </div>
    </div>
    <div className="r-lab-actions">
      <button type="button" className="r-action r-action-muted" onClick={() => { setStep(0); setOption(0); setTopK(2); }}><RotateCcw size={15} aria-hidden /> Reiniciar</button>
      <div><button type="button" className="r-action r-action-muted" disabled={!step} onClick={() => setStep(step - 1)} aria-label="Etapa anterior"><ArrowLeft size={17} /></button>
        <button type="button" className="r-action r-action-primary" disabled={step === frames.length - 1} onClick={() => setStep(step + 1)}>{step ? "Avançar" : "Começar"}{step ? <ArrowRight size={16} aria-hidden /> : <Play size={15} aria-hidden />}</button></div>
    </div>
  </div>;
}
