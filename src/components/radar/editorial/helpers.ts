export function creator(name: string, handle: string, repo: string) {
  return { name, handle, github: `https://github.com/${handle}/${repo}` };
}

export function sources(...links: [title: string, url: string][]) {
  return links.map(([title, url]) => ({ title, url }));
}

export function guide(context: string, practice: string, limitation: string) {
  return [
    { title: "Entenda o contexto", body: context },
    { title: "Aplique na prática", body: practice },
    { title: "O que observar", body: limitation },
  ];
}
