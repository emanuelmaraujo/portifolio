import { isValidElement, type ComponentProps, type ReactElement, type ReactNode } from "react";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { FlowStep } from "../Flow";
import { Callout, CodeBlock, DataFlowDiagram, DecisionSimulator, RiskMatrix, type Lang } from "./widgets";

/**
 * Turns an article's source into React at build time. `.md` files are read as plain Markdown, `.mdx` files may also use
 * the components below. The source is trusted code: it comes from this repository and is compiled during the build.
 * Nothing here accepts or evaluates text from visitors.
 *
 * Code is highlighted at build time (no highlighter is sent to the browser) and tables follow GitHub's syntax.
 */

/** The components an `.mdx` article can use, bound to the article's language. */
function components(lang: Lang) {
  return {
    DecisionSimulator: () => <DecisionSimulator lang={lang} />,
    InteractiveRiskMatrix: () => <RiskMatrix lang={lang} />,
    DataFlowDiagram: (props: { title: string; steps: FlowStep[]; note?: string }) => <DataFlowDiagram lang={lang} {...props} />,
    Callout,
    pre: ({ children }: { children?: ReactNode }) => {
      const code = isValidElement(children) ? (children as ReactElement<{ className?: string }>) : null;
      const language = code?.props.className?.match(/language-([\w-]+)/)?.[1];
      return <CodeBlock lang={lang} language={language}>{children}</CodeBlock>;
    },
    a: ({ href = "", children, ...rest }: ComponentProps<"a">) => (/^https?:/.test(href)
      ? <a href={href} target="_blank" rel="noreferrer" {...rest}>{children}</a>
      : <a href={href} {...rest}>{children}</a>),
    table: (props: ComponentProps<"table">) => <div className="table-wrap" tabIndex={0} role="region" aria-label={lang === "en" ? "Table" : "Tabela"}><table {...props} /></div>,
  };
}

/** Splits a text at its second-level headings, ignoring anything inside code fences. */
export function sections(source: string) {
  const parts: { title: string; body: string[] }[] = [];
  const opening: string[] = [];
  let fence = "";
  for (const line of source.replace(/\r\n/g, "\n").split("\n")) {
    const mark = line.match(/^\s*(```+|~~~+)/)?.[1];
    if (mark) fence = fence ? (mark.startsWith(fence[0]) && mark.length >= fence.length ? "" : fence) : mark;
    const heading = fence ? null : line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (heading) parts.push({ title: heading[1].replace(/[*_`]/g, ""), body: [] });
    else (parts.length ? parts[parts.length - 1].body : opening).push(line);
  }
  return { opening: opening.join("\n").trim(), parts: parts.map(part => ({ title: part.title, body: part.body.join("\n").trim() })) };
}

export async function render(source: string, format: "md" | "mdx", lang: Lang) {
  if (!source) return null;
  const { default: Content } = await evaluate(source, { ...runtime, format, remarkPlugins: [remarkGfm], rehypePlugins: [rehypeHighlight] });
  return <Content components={components(lang)} />;
}
