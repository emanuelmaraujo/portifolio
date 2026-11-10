import { MotionDiv } from "@/components/client/motion-div";
import { getSortedProjetosData } from "@/lib/projetos";
import { Layers } from "lucide-react";
import { ProjectsHeader, ProjectsBadge } from "@/components/PageI18nHelpers";
import { ProjectList } from "@/components/FilteredLists";

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ProjetosPage() {
  const allProjetosData = getSortedProjetosData();

  return (
    <MotionDiv
      className="w-full min-h-screen bg-background pt-24 pb-16 md:pt-28 md:pb-20"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <MotionDiv
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Layers className="w-3.5 h-3.5" />
            <ProjectsBadge />
          </MotionDiv>
          <ProjectsHeader />
        </div>

        {/* Client-side filtered list */}
        <ProjectList allProjects={allProjetosData} />
      </div>
    </MotionDiv>
  );
}
