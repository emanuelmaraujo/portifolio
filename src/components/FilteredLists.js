"use client";

import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, Clock, ExternalLink, Code } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

// ═══════════════════════════════════════════
// Blog Post List — filters by current language
// ═══════════════════════════════════════════
export function BlogPostList({ allPosts }) {
  const { t, lang } = useLanguage();

  // Filter posts by current language (default to 'pt' if no lang set)
  const filtered = allPosts.filter(p => (p.lang || 'pt') === lang);

  if (filtered.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-foreground/60 text-lg mb-2">{t('blog.empty')}</p>
        <p className="text-foreground/40 text-sm">{t('blog.emptySub')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {filtered.map((post) => (
        <div
          key={post.id}
          className="group relative"
        >
          <Link href={`/blog/${post.id}`} className="block">
            <div className="premium-card p-6 md:p-8 hover:border-primary/20 transition-all duration-300">
              <div className="relative z-10">
                {/* Date + Read time */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString(lang === 'en' ? "en-US" : "pt-BR", {
                        year: "numeric", month: "long", day: "numeric", timeZone: 'UTC'
                      })}
                    </time>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    5 {t('blog.readTime')}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-lg md:text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors leading-snug">
                  {post.title}
                </h2>

                {/* Read more */}
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary/80 group-hover:text-primary transition-colors">
                  {t('blog.readMore')}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// Project List — filters by current language
// ═══════════════════════════════════════════
export function ProjectList({ allProjects }) {
  const { t, lang } = useLanguage();

  // Filter projects by current language (default to 'pt' if no lang set)
  const filtered = allProjects.filter(p => (p.lang || 'pt') === lang);

  if (filtered.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-foreground/60 text-lg mb-2">{t('projectsPage.empty')}</p>
        <p className="text-foreground/40 text-sm">{t('projectsPage.emptySub')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto grid gap-5">
      {filtered.map((projeto) => (
        <div
          key={projeto.id}
          className="premium-card p-6 md:p-8 group hover:border-primary/20 transition-all duration-300"
        >
          <div className="relative z-10">
            {/* Date */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <time dateTime={projeto.date}>
                {new Date(projeto.date).toLocaleDateString(lang === 'en' ? "en-US" : "pt-BR", {
                  year: "numeric", month: "long", day: "numeric", timeZone: 'UTC'
                })}
              </time>
            </div>

            {/* Title */}
            <h2 className="text-lg md:text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors leading-snug">
              <Link href={`/projetos/${projeto.id}`}>
                {projeto.title}
              </Link>
            </h2>

            {/* Summary */}
            {projeto.summary && (
              <p className="text-sm text-foreground/60 mb-4 leading-relaxed">{projeto.summary}</p>
            )}

            {/* Tags */}
            {projeto.tags && projeto.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {projeto.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg border border-primary/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Links */}
            <div className="flex flex-wrap gap-4 items-center pt-4 border-t border-border/20">
              <Link
                href={`/projetos/${projeto.id}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                {t('projectsPage.viewDetails')}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              {projeto.liveUrl && projeto.liveUrl !== '#' && (
                <a
                  href={projeto.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Live
                </a>
              )}
              {projeto.repoUrl && projeto.repoUrl !== '#' && (
                <a
                  href={projeto.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Code className="w-3.5 h-3.5" /> {t('projectsPage.code')}
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
