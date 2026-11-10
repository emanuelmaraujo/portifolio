import { getSortedPostsData } from "@/lib/posts";
import { BookOpen } from "lucide-react";
import { BlogHeader } from "@/components/PageI18nHelpers";
import { BlogPostList } from "@/components/FilteredLists";

export default function BlogPage() {
  const allPostsData = getSortedPostsData();

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
            <BookOpen className="w-3.5 h-3.5" />
            Blog
          </div>
          <BlogHeader />
        </div>

        {/* Client-side filtered list */}
        <BlogPostList allPosts={allPostsData} />
      </div>
    </main>
  );
}
