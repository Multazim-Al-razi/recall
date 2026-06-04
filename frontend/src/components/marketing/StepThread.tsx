import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface ThreadStep {
  num: string;
  title: string;
  body: string;
}

interface Props {
  steps: ThreadStep[];
}

/**
 * "Setup in under a minute" steps as a vertical timeline. Each bead sits in the
 * same flex row as its copy, so the two can never overlap or drift apart. A
 * column of round dots connects each bead to the next — drawn with a repeating
 * radial-gradient so the dots stay perfectly round and centred under the bead.
 */
export function StepThread({ steps }: Props) {
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-col">
      {steps.map((s, i) => {
        const isLast = i === steps.length - 1;
        return (
          <div key={s.num} className="flex gap-4 sm:gap-5">
            {/* Rail — bead + dotted connector, centred as one column */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                whileInView={reduce ? undefined : { scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rausch font-display text-[18px] font-normal text-white shadow-[var(--shadow-sm)]"
              >
                {s.num}
              </motion.div>
              {!isLast && (
                <motion.div
                  initial={reduce ? false : { opacity: 0 }}
                  whileInView={reduce ? undefined : { opacity: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.2 }}
                  className="my-1.5 w-0 flex-1 border-l-2 border-dashed border-rausch/40"
                  aria-hidden
                />
              )}
            </div>

            {/* Copy */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.12 }}
              className={isLast ? 'pt-2' : 'pb-12 pt-2'}
            >
              <h3 className="text-[16px] font-semibold">{s.title}</h3>
              <p className="mt-1.5 max-w-[340px] text-[14px] leading-[1.6] text-muted">{s.body}</p>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
