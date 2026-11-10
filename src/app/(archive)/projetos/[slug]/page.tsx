import Link from "next/link";
import { MotionDiv } from "@/components/client/motion-div";
import { Calendar, User, ArrowLeft, ExternalLink, Code } from "lucide-react";
import { getProjetoData, getAllProjetoIds } from "@/lib/projetos";
import { notFound } from "next/navigation";
import { BackToProjects, BlogDateFormatter } from "@/components/PageI18nHelpers";
import { LanguageRedirect } from "@/components/LanguageRedirect";

interface ProjetoData {
  slug: string;
  title: string;
  date: string;
  contentHtml: string;
  author?: string;
  image?: string;
  tags?: string[];
  liveUrl?: string;
  repoUrl?: string;
}

// Função para gerar os caminhos estáticos - CORRIGIDA
// Deve retornar um array de objetos onde cada objeto tem a chave `slug`
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  console.log("Generating static params for projetos..."); // Log para depuração
  try {
    const paths = getAllProjetoIds(); // Isso retorna [{ params: { slug: '...' } }, ...]
    console.log("Paths from getAllProjetoIds:", JSON.stringify(paths));
    // Mapeia para o formato esperado: [{ slug: '...' }, ...]
    const mappedPaths = paths.map((path) => ({ slug: path.params.slug }));
    console.log("Mapped paths for generateStaticParams:", JSON.stringify(mappedPaths));
    return mappedPaths;
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
    return []; // Retorna array vazio em caso de erro
  }
}

// Função para buscar os dados do projeto específico
async function getProjeto(slug: string): Promise<ProjetoData | null> {
  const projetoData = await getProjetoData(slug);
  if (!projetoData) {
    return null;
  }
  // Define autor padrão se não vier do Markdown
  return { ...projetoData, author: projetoData.author || "Emanuel Araújo" };
}

// Variantes de animação
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// Componente da página de Projeto
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function ProjetoPage({ params }: { params: any }) {
  const slug = params.slug;

  // Validação adicional caso params ou slug não sejam como esperado
  if (typeof slug !== "string") {
    console.error("Invalid slug type received:", slug);
    notFound();
  }

  const projeto = await getProjeto(slug);

  // Se o projeto não for encontrado, retorna 404
  if (!projeto) {
    notFound();
  }

  // Renderiza o projeto usando os dados buscados no servidor
  return (
    <main className="flex min-h-screen flex-col items-center pt-24 pb-16 md:pt-28 md:pb-20 bg-background">
      <LanguageRedirect currentSlug={slug} basePath="/projetos" />
      <MotionDiv
        className="container mx-auto px-4 max-w-3xl"
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="mb-8">
          <Link href="/projetos" className="text-primary hover:underline flex items-center gap-1 text-sm">
            <ArrowLeft size={16} /> <BackToProjects />
          </Link>
        </div>
        <header className="mb-8 border-b border-border/50 pb-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
            {projeto.title}
          </h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-foreground/60 gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5">
              <User size={14} />
              <span>{projeto.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <BlogDateFormatter date={projeto.date} />
            </div>
          </div>
          {projeto.tags && projeto.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {projeto.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Links para o projeto online e repositório */}
          {(projeto.liveUrl || projeto.repoUrl) && (
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border/30">
              {projeto.liveUrl && projeto.liveUrl !== '#'
                && (
                  <a
                    href={projeto.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <ExternalLink size={16} /> Live
                  </a>
                )}
              {projeto.repoUrl && projeto.repoUrl !== '#'
                && (
                  <a
                    href={projeto.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Code size={16} /> Code
                  </a>
                )}
            </div>
          )}
        </header>
        {projeto.image && (
          <div className="relative w-full h-64 md:h-80 mb-8 rounded-lg overflow-hidden bg-card/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={projeto.image} // Caminho relativo já tratado pelo assetPrefix
              alt={projeto.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <article
          className="prose prose-invert prose-lg max-w-none 
                     prose-headings:text-foreground prose-headings:font-semibold 
                     prose-p:text-foreground/90 
                     prose-a:text-primary hover:prose-a:underline 
                     prose-blockquote:border-primary prose-blockquote:text-foreground/80 
                     prose-strong:text-foreground 
                     prose-code:text-primary/90 prose-code:bg-card prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm 
                     prose-pre:bg-card prose-pre:p-4 prose-pre:rounded-md prose-pre:overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: projeto.contentHtml }}
        />
      </MotionDiv>
    </main>
  );
}

