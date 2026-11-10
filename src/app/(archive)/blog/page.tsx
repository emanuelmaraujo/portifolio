import { MotionDiv } from "@/components/client/motion-div";
import { getSortedPostsData } from "@/lib/posts";
import { BookOpen } from "lucide-react";
import { BlogHeader } from "@/components/PageI18nHelpers";
import { BlogPostList } from "@/components/FilteredLists";

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function BlogPage() {
  const allPostsData = getSortedPostsData();

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
            <BookOpen className="w-3.5 h-3.5" />
            Blog
          </MotionDiv>
          <BlogHeader />
        </div>

        {/* Client-side filtered list */}
        <BlogPostList allPosts={allPostsData} />
      </div>
    </MotionDiv>
  );
}
