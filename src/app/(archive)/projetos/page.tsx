import { getSortedProjetosData } from "@/lib/projetos";
import { Layers } from "lucide-react";
import { ProjectsHeader, ProjectsBadge } from "@/components/PageI18nHelpers";
import { ProjectList } from "@/components/FilteredLists";

export default function ProjetosPage() {
  const allProjetosData = getSortedProjetosData();

  return (
    <main
      className="w-full min-h-screen bg-background pt-24 pb-16 md:pt-28 md:pb-20"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6"
          >
            <Layers className="w-3.5 h-3.5" />
            <ProjectsBadge />
          </div>
          <ProjectsHeader />
        </div>

        {/* Client-side filtered list */}
        <ProjectList allProjects={allProjetosData} />
      </div>
    </main>
  );
}
