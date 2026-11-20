"use client";

import { useEffect, useRef, useState } from "react";
import type { Copy, Locale } from "../content";
import { match, type Topic } from "./match";
import "./ask.css";

type Turn = { role: "user" | "assistant"; text: string; topic?: Topic; mode?: "live" | "guided"; pending?: boolean };

const TAG = /^\s*<topic>([\w-]*)<\/topic>\s*/;

/**
 * The site's guide. A button opens a sheet (from the bottom on phones, at the side on wide screens) where a visitor
 * asks about Emanuel's work. Each answer names a topic, and the particle field above takes that topic's figure.
 *
 * Suggestions and anything the keyword matcher recognises are answered from the site's own text, at once and at no
 * cost. Free questions go to the model when the server has one configured, and fall back to guided answers when it
 * does not, when the limit is reached or when the request fails. The sheet always says which kind of answer it gave.
 */
export default function Ask({ t, locale, topics }: { t: Copy["ask"]; locale: Locale; topics: Topic[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState(true); // assumed until the server says otherwise
  const abort = useRef<AbortController | null>(null);

  const show = (topic?: Topic) => dispatchEvent(new CustomEvent("scene:show", { detail: topic?.form ?? null }));
  const open = () => { dialog.current?.showModal(); document.documentElement.dataset.asking = "1"; };
  const close = () => dialog.current?.close();
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onClose = () => { abort.current?.abort(); show(); delete document.documentElement.dataset.asking; };
    el.addEventListener("close", onClose);
    return () => { el.removeEventListener("close", onClose); abort.current?.abort(); };
  }, []);
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" }); }, [turns]);

  const settle = (patch: Partial<Turn>) => setTurns(all => [...all.slice(0, -1), { ...all[all.length - 1], ...patch }]);
  const answerGuided = (question: string, topic = match(question, topics) ?? undefined) => {
    settle({ text: topic ? topic.text : t.unknown, topic, mode: "guided", pending: false });
    show(topic);
  };

  const ask = async (question: string, chip?: Topic) => {
    const text = question.trim();
    if (!text || busy) return;
    const history = turns.filter(turn => !turn.pending).slice(-4).map(turn => ({ role: turn.role, text: turn.text.slice(0, 700) }));
    setTurns(all => [...all, { role: "user", text }, { role: "assistant", text: "", pending: true }]);
    if (chip) return answerGuided(text, chip);
    if (!live) return answerGuided(text);

    setBusy(true);
    abort.current = new AbortController();
    try {
      const response = await fetch("/api/ask", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: abort.current.signal,
        body: JSON.stringify({ question: text.slice(0, 400), locale, history }),
      });
      if (!response.ok || !response.body) {
        if (response.status === 503) setLive(false);
        return answerGuided(text);
      }
      const reader = response.body.getReader(), decoder = new TextDecoder();
      let raw = "", topic: Topic | undefined, tagged = false;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });
        if (raw.includes("\u0000")) return answerGuided(text);
        // The reply opens with a topic tag. Hold the text back until the tag has arrived in full.
        if (!tagged) {
          const found = raw.match(TAG);
          if (found) { tagged = true; topic = topics.find(item => item.id === found[1]); raw = raw.replace(TAG, ""); show(topic); }
          else if (raw.length > 48 || !"<topic>".startsWith(raw.trimStart().slice(0, 7))) tagged = true;
          else continue;
        }
        settle({ text: raw, topic, mode: "live", pending: true });
      }
      if (!raw.trim()) return answerGuided(text);
      settle({ text: raw.trim(), topic, mode: "live", pending: false });
    } catch {
      if (!abort.current?.signal.aborted) answerGuided(text);
    } finally {
      setBusy(false);
    }
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = input.current?.value ?? "";
    if (input.current) input.current.value = "";
    void ask(value);
  };

  return (
    <>
      <button type="button" className="ask-launch" onClick={open} aria-haspopup="dialog">
        <span className="ask-orb" aria-hidden="true" />{t.launch}
      </button>
      <dialog className="ask" ref={dialog} aria-labelledby="ask-title" onClick={event => { if (event.target === dialog.current) close(); }}>
        <div className="ask-sheet">
          <header className="ask-head">
            <span className="ask-orb" aria-hidden="true" />
            <h2 id="ask-title">{t.title}</h2>
            <span className="badge">{live ? t.live : t.guided}</span>
            <button type="button" className="chip-button" onClick={close} aria-label={t.close}><span aria-hidden="true">×</span></button>
          </header>
          <div className="ask-log" ref={log} role="log" aria-live="polite" aria-busy={busy}>
            {turns.length === 0 && <p className="ask-intro">{t.intro}</p>}
            {turns.map((turn, i) => (
              <article className={"ask-turn ask-turn--" + turn.role} key={i}>
                <p className="ask-who">{turn.role === "user" ? t.you : <>{t.guide}{turn.mode && <i>{turn.mode === "live" ? t.live : t.guided}</i>}</>}</p>
                {turn.text ? <p className="ask-text">{turn.text}</p> : <p className="ask-thinking">{t.thinking}<span aria-hidden="true" /></p>}
                {turn.role === "assistant" && turn.topic && !turn.pending && (
                  <a className="proof" href={turn.topic.href} onClick={close}>{t.see}: {turn.topic.title}<span aria-hidden="true">→</span></a>
                )}
              </article>
            ))}
          </div>
          <div className="ask-chips" role="group" aria-label={t.title}>
            {t.chips.map(([id, label]) => {
              const topic = topics.find(item => item.id === id);
              return topic && <button type="button" className="chip-button" disabled={busy} onClick={() => void ask(label, topic)} key={id}>{label}</button>;
            })}
          </div>
          <form className="ask-form" onSubmit={submit}>
            <input ref={input} type="text" name="question" maxLength={400} placeholder={t.placeholder} aria-label={t.placeholder} autoComplete="off" enterKeyHint="send" />
            <button type="submit" className="button button--accent" disabled={busy}>{t.send}</button>
          </form>
          <p className="note">{live ? t.note : t.noteGuided}</p>
        </div>
      </dialog>
    </>
  );
}
