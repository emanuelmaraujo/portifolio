// /home/ubuntu/portfolio-profissional/src/app/blog/[slug]/page.tsx
// Convertido para Server Component para buscar dados no build time
import Link from "next/link";
import { MotionDiv } from "@/components/client/motion-div";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { getPostData, getAllPostIds } from "@/lib/posts";
import { notFound } from "next/navigation";
import { BackToBlog, BlogDateFormatter } from "@/components/PageI18nHelpers";
import { LanguageRedirect } from "@/components/LanguageRedirect";

// Tipagem para os dados do post (ajustada para corresponder ao retorno de getPostData)
interface PostData {
  slug: string;
  title: string;
  date: string;
  contentHtml: string;
  author?: string; // Mantido como opcional
  image?: string; // Mantido como opcional
  tags?: string[]; // Mantido como opcional
}

// Função para gerar os caminhos estáticos (equivalente a getStaticPaths)
export async function generateStaticParams() {
  const paths = getAllPostIds();
  // paths é [{ params: { slug: "..." } }, ...]
  return paths.map((path) => ({ slug: path.params.slug }));
}

// Função para buscar os dados do post específico (equivalente a getStaticProps)
async function getPost(slug: string): Promise<PostData | null> {
  const postData = await getPostData(slug);
  if (!postData) {
    return null;
  }
  // Define autor padrão se não vier do Markdown
  return { ...postData, author: postData.author || "Emanuel Araújo" };
}

// Variantes de animação (mantidas)
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// Removido tipo Props explícito, tentando tipo inline com `any` para params devido ao erro persistente
// type Props = {
//   params: { slug: string };
// };

// Componente da página de Post (Agora Server Component)
// Usando { params: any } para tentar contornar o erro de tipo na exportação estática
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function BlogPostPage({ params }: { params: any }) {
  const slug = params.slug; // Acessa slug de params (agora tipo any)

  // Validação adicional caso params ou slug não sejam como esperado
  if (typeof slug !== "string") {
    console.error("Invalid slug type received:", slug);
    notFound(); // Ou outra forma de tratamento de erro
  }

  const post = await getPost(slug);

  // Se o post não for encontrado (getPostData retornou null), retorna 404
  if (!post) {
    notFound();
  }

  // Renderiza o post usando os dados buscados no servidor
  return (
    // Envolve com a tag <main> e remove a prop 'as' do MotionDiv
    <main className="flex min-h-screen flex-col items-center pt-24 pb-16 md:pt-28 md:pb-20 bg-background">
      <LanguageRedirect currentSlug={slug} basePath="/blog" />
      <MotionDiv
        // as="main" // Removido: A prop 'as' não é suportada pelo MotionDiv simples
        className="container mx-auto px-4 max-w-3xl"
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="mb-8">
          <Link href="/blog" className="text-primary hover:underline flex items-center gap-1 text-sm">
            <ArrowLeft size={16} /> <BackToBlog />
          </Link>
        </div>
        <header className="mb-8 border-b border-border/50 pb-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-foreground/60 gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5">
              <User size={14} />
              <span>{post.author}</span> {/* Usa o autor definido em getPost */}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <BlogDateFormatter date={post.date} />
            </div>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>
        {post.image && (
          <div className="relative w-full h-64 md:h-80 mb-8 rounded-lg overflow-hidden bg-card/50">
            {/* Mantido o aviso de lint desabilitado, pois a imagem pode vir do frontmatter */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt={post.title}
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
          dangerouslySetInnerHTML={{ __html: post.contentHtml }} // Usa contentHtml buscado no servidor
        />
      </MotionDiv>
    </main>
  );
}

