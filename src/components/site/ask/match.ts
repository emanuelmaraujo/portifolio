/** Kept free of imports: this is the only part of the guide's knowledge that ships to the browser as code. */
export type Topic = { id: string; title: string; text: string; form: string; href: string; keywords: string[] };

const plain = (text: string) => text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Guided mode: the topic whose keywords appear most in the question, or null when nothing matches. */
export function match(question: string, all: Topic[]) {
  const words = plain(question);
  let best: Topic | null = null, score = 0;
  for (const topic of all) {
    const hits = topic.keywords.filter(keyword => words.includes(keyword)).length;
    if (hits > score) { score = hits; best = topic; }
  }
  return best;
}
