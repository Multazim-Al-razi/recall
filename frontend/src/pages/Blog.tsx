import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { MaskDivider } from '@/components/layout/MaskDivider';
import { POSTS } from '@/lib/blog';

const PAGE_SIZE = 5;

export function BlogPage() {
  const [page, setPage] = useState(1);

  const sorted = useMemo(
    () => [...POSTS].sort((a, b) => (a.date > b.date ? -1 : 1)),
    [],
  );

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const pagePosts = sorted.slice(start, start + PAGE_SIZE);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-[800px] px-5 sm:px-8 md:px-12">
        {/* Hero */}
        <section className="pt-12 pb-10 text-center md:pt-16">
          <h1 className="font-display text-[34px] font-light leading-[1.1] tracking-[-2px] sm:text-[42px]">
            The Recall Blog
          </h1>
          <p className="mx-auto mt-4 max-w-[460px] text-[16px] leading-[1.65] text-muted">
            Tips, guides, and insights on managing subscriptions, cutting waste,
            and taking control of recurring spending.
          </p>
        </section>

        {/* Post list */}
        <section className="flex flex-col gap-4 pb-6">
          {pagePosts.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <Link
                to={`/blog/${post.slug}`}
                className="group block rounded-xl bg-surface p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:p-7"
              >
                <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[1px] text-rausch">
                  {post.category}
                </div>
                <h2 className="mt-2 font-display text-[20px] font-semibold leading-[1.3] tracking-[-0.3px] transition-colors group-hover:text-rausch sm:text-[22px]">
                  {post.title}
                </h2>
                <p className="mt-2 text-[14px] leading-[1.6] text-muted">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-2.5 text-[12px] text-muted">
                  <span>{format(parseISO(post.date), 'MMM d, yyyy')}</span>
                  <span className="text-ink/20">&middot;</span>
                  <span>{post.readTime}</span>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-[13px] font-semibold text-rausch transition-all group-hover:gap-2.5">
                  Read more <ArrowRight size={14} />
                </div>
              </Link>
            </motion.article>
          ))}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            aria-label="Blog pagination"
            className="flex items-center justify-center gap-3 pb-16"
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-muted transition-colors hover:border-rausch/30 hover:text-ink disabled:opacity-30 disabled:hover:border-hairline"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  aria-current={n === page ? 'page' : undefined}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-medium transition-colors ${
                    n === page
                      ? 'bg-rausch text-white'
                      : 'text-muted hover:bg-ink/5 hover:text-ink'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-muted transition-colors hover:border-rausch/30 hover:text-ink disabled:opacity-30 disabled:hover:border-hairline"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </nav>
        )}
      </div>

      <MaskDivider />
      <section className="mx-auto max-w-[800px] px-5 pt-6 pb-16 text-center sm:px-8 md:px-12">
        <div className="rounded-xl bg-surface p-8 shadow-[0_0_0_1px_var(--color-hairline)]">
          <p className="text-[16px] font-semibold text-ink">
            Ready to take control?
          </p>
          <p className="mt-2 text-[14px] leading-[1.65] text-muted">
            Start tracking your subscriptions in under a minute. No sign-up required.
          </p>
          <Link
            to="/onboarding"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-rausch px-6 py-3 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]"
          >
            Get started free
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </motion.div>
  );
}
