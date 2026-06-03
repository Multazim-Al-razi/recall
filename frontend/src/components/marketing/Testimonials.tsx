import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  tint: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Found two streaming services I was paying for twice. Recall paid for itself in the first week, except it is free.',
    name: 'Maya Chen',
    role: 'Designer',
    initials: 'MC',
    tint: 'bg-rausch',
  },
  {
    quote:
      'The renewal nudges are the whole thing for me. No more "wait, when did this become $20 a month?" moments.',
    name: 'Devin Park',
    role: 'Software engineer',
    initials: 'DP',
    tint: 'bg-teal',
  },
  {
    quote:
      'Finally a money tool that does not want my bank login. Everything stays on my laptop and it still feels effortless.',
    name: 'Sofia Romano',
    role: 'Freelancer',
    initials: 'SR',
    tint: 'bg-gold',
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-[1100px] px-5 py-16 sm:px-8 md:px-12 md:py-24">
      <div className="mb-10 text-center">
        <div className="text-[11px] font-bold uppercase tracking-[2.5px] text-teal">
          Loved by savers
        </div>
        <h2 className="mt-3 font-display text-[30px] font-light tracking-[-1px] md:text-[38px]">
          People stopped overpaying
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <motion.figure
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="card-premium flex flex-col p-7"
          >
            <span aria-hidden className="font-display text-[44px] leading-[0.6] text-rausch/25">
              &ldquo;
            </span>
            <div className="mt-3 flex gap-0.5" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} size={14} className="fill-gold text-gold" />
              ))}
            </div>
            <blockquote className="mt-4 flex-1 text-[14px] leading-[1.65] text-ink-soft">
              {t.quote}
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${t.tint} text-[13px] font-bold text-white`}
              >
                {t.initials}
              </div>
              <div>
                <div className="text-[14px] font-semibold leading-tight">{t.name}</div>
                <div className="text-[12px] text-muted">{t.role}</div>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
