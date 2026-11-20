# The site's guide ("Ask the system")

A button on the home page opens a sheet where a visitor asks about Emanuel's work. Each answer names a topic, and the
particle field takes that topic's figure while the sheet is open.

## Two modes

| Mode | When | Cost | Where the text comes from |
|---|---|---|---|
| Guided | Suggestion chips, any question when no model is configured, and every fallback | none, runs in the browser | `ask/knowledge.ts`, as written on the site |
| Live | A typed question, when `ANTHROPIC_API_KEY` is set on the server | one model call | Claude, restricted to the same facts |

The sheet labels every answer with its mode, and says so when no model is connected. Without a key the site stays fully
static in practice: `/api/ask` answers 503 and nothing is billed.

## What the guide knows

`src/components/site/ask/knowledge.ts` builds the topics from `content.ts`, the same copy the pages render. There is no
second source of facts to keep in sync, and the guide cannot state more than the site does. To teach it something new,
add it to the site's copy and, if it is a new subject, add a topic with its keywords and figure.

## Turning live mode on

1. Create an API key in the Claude Console, in a workspace with a monthly spend limit.
2. Add `ANTHROPIC_API_KEY` to the Vercel project (Preview first, then Production).
3. Add a rate-limit rule for `/api/ask` in the Vercel Firewall, for example 20 requests per hour per IP.
4. Optional: set `ASK_MODEL`. The default is `claude-opus-5-5`.

Cost per question is bounded by the request itself: at most 1,500 output tokens (thinking included) and about 3,500
input tokens of facts, which are cached between requests. With the default model ($4 input, $20 output per million
tokens) that is under $0.05 at the very worst and usually a fraction of it. `ASK_MODEL=claude-haiku-5-5` ($0.10 and
$0.50) lowers it by roughly forty times, at some cost in answer quality.

## Guard rails

- Same-origin requests only. Another site cannot use the route as a proxy.
- Strict input: question up to 400 characters, at most 6 short turns of history, nothing else accepted.
- Rate limits in memory per server instance: 6 a minute and 40 a day per visitor, 400 a day in total. These are a
  courtesy. Instances do not share them, so the firewall rule and the spend limit are the real protection.
- The model has no tools. It can only return text, which the page renders as text.
- The system prompt keeps it to the published facts, in the third person, and tells it to say when the site does not
  cover something. It can still be wrong or be talked into an odd reply, which only the person who typed it sees.
- Refusals, provider errors and empty replies all fall back to a guided answer. Provider details stay in server logs.

## Not done

- No evals yet. Before turning live mode on in production, write 20 to 30 questions (facts, out-of-scope, injection
  attempts) and read the answers.
- No conversation storage and no analytics.
- `/llms.txt` gives language models the same summary without any of this.
