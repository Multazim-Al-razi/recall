import { useParams, Link } from 'react-router';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { POSTS } from '@/lib/blog';
import { Illustration } from '@/components/ui/Illustration';

export function BlogPostPage() {
  const { slug } = useParams();
  const post = POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="mx-auto max-w-[700px] px-5 pt-[140px] text-center">
        <h1 className="text-[28px] font-semibold">Post not found</h1>
        <Link to="/blog" className="mt-4 inline-block text-rausch">
          &larr; Back to blog
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-[700px] px-5 sm:px-8 md:px-12">
        <section className="pt-[110px] pb-8 md:pt-[130px]">
          <Link
            to="/blog"
            className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-rausch"
          >
            <ArrowLeft size={14} />
            Back to blog
          </Link>

          <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[1px] text-rausch">
            {post.category}
          </div>
          <h1 className="text-[30px] font-light leading-[1.1] tracking-[-1.5px] sm:text-[38px]">
            {post.title}
          </h1>
          <div className="mt-4 flex items-center gap-4 text-[13px] text-muted">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {format(parseISO(post.date), 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {post.readTime}
            </span>
            <span>{post.author}</span>
          </div>
        </section>

        <div className="mx-auto mb-10 max-w-[400px]">
          <Illustration
            name={post.illustration}
            decorative={false}
            className="w-full object-contain"
          />
        </div>

        <article className="pb-10">
          {post.blocks.map((block, i) => {
            if (block.type === 'heading') {
              return (
                <h2
                  key={i}
                  className="mb-3 mt-8 text-[22px] font-semibold leading-[1.3] tracking-[-0.3px]"
                >
                  {block.text}
                </h2>
              );
            }
            if (block.type === 'list') {
              return (
                <ul key={i} className="mb-5 ml-5 list-disc space-y-1.5 text-[15px] leading-[1.7] text-ink/80">
                  {block.items?.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={i} className="mb-5 text-[16px] leading-[1.75] text-ink/80">
                {block.text}
              </p>
            );
          })}
        </article>

        {post.takeaways.length > 0 && (
          <section className="mb-16 rounded-xl bg-surface p-7">
            <h3 className="text-[14px] font-bold uppercase tracking-[1px] text-rausch">
              Key takeaways
            </h3>
            <ul className="mt-3 space-y-2">
              {post.takeaways.map((t, i) => (
                <li key={i} className="text-[14px] leading-[1.6] text-ink/80">
                  {t}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mb-16 rounded-xl bg-ink px-8 py-10 text-center">
          <h2 className="text-[22px] font-light tracking-[-0.5px] text-white">
            Ready to take control?
          </h2>
          <p className="mx-auto mt-2 max-w-[360px] text-[14px] leading-[1.6] text-white/60">
            Start tracking your subscriptions in under a minute. No sign-up required.
          </p>
          <Link
            to="/onboarding"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-rausch px-8 py-3.5 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5"
          >
            Get started free
          </Link>
        </section>
      </div>
    </motion.div>
  );
}
