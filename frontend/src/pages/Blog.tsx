import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { MaskDivider } from '@/components/layout/MaskDivider';
import { POSTS } from '@/lib/blog';

export function BlogPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-[800px] px-5 sm:px-8 md:px-12">
        {/* Hero */}
        <section className="pt-[110px] pb-10 text-center md:pt-[130px]">
          <h1 className="text-[34px] font-light leading-[1.1] tracking-[-2px] sm:text-[42px]">
            The Recall <strong className="font-bold">Blog</strong>
          </h1>
          <p className="mx-auto mt-4 max-w-[460px] text-[16px] leading-[1.65] text-muted">
            Tips, guides, and insights on managing subscriptions, cutting waste,
            and taking control of recurring spending.
          </p>
        </section>

        {/* Post list */}
        <section className="flex flex-col gap-4 pb-16">
          {POSTS.map((post, i) => (
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
                <h2 className="mt-2 text-[20px] font-semibold leading-[1.3] tracking-[-0.3px] transition-colors group-hover:text-rausch sm:text-[22px]">
                  {post.title}
                </h2>
                <p className="mt-2 text-[14px] leading-[1.6] text-muted">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-4 text-[12px] text-muted">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {format(parseISO(post.date), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} />
                    {post.readTime}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-[13px] font-semibold text-rausch transition-all group-hover:gap-2.5">
                  Read more <ArrowRight size={14} />
                </div>
              </Link>
            </motion.article>
          ))}
        </section>
      </div>

      <MaskDivider />
      <section className="pb-24 pt-8 text-center text-[13px] text-muted">
        Recall — track every subscription, never forget to cancel.
      </section>
    </motion.div>
  );
}
