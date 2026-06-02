import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

interface Testimonial {
  quote: string;
  name: string;
  designation: string;
  src: string;
}

interface CircularTestimonialsProps {
  testimonials: Testimonial[];
  autoplay?: boolean;
  className?: string;
}

function calculateGap(width: number) {
  const minWidth = 1024;
  const maxWidth = 1456;
  const minGap = 60;
  const maxGap = 86;
  if (width <= minWidth) return minGap;
  if (width >= maxWidth)
    return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth));
  return (
    minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth))
  );
}

export function CircularTestimonials({
  testimonials,
  autoplay = true,
  className,
}: CircularTestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(1200);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const autoplayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const testimonialsLength = useMemo(
    () => testimonials.length,
    [testimonials]
  );
  const activeTestimonial = useMemo(
    () => testimonials[activeIndex],
    [activeIndex, testimonials]
  );

  useEffect(() => {
    function handleResize() {
      if (imageContainerRef.current) {
        setContainerWidth(imageContainerRef.current.offsetWidth);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (autoplay) {
      autoplayIntervalRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % testimonialsLength);
      }, 5000);
    }
    return () => {
      if (autoplayIntervalRef.current)
        clearInterval(autoplayIntervalRef.current);
    };
  }, [autoplay, testimonialsLength]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonialsLength);
    if (autoplayIntervalRef.current)
      clearInterval(autoplayIntervalRef.current);
  }, [testimonialsLength]);

  const handlePrev = useCallback(() => {
    setActiveIndex(
      (prev) => (prev - 1 + testimonialsLength) % testimonialsLength
    );
    if (autoplayIntervalRef.current)
      clearInterval(autoplayIntervalRef.current);
  }, [testimonialsLength]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handlePrev, handleNext]);

  function getImageStyle(index: number): React.CSSProperties {
    const gap = calculateGap(containerWidth);
    const maxStickUp = gap * 0.8;
    const isActive = index === activeIndex;
    const isLeft =
      (activeIndex - 1 + testimonialsLength) % testimonialsLength === index;
    const isRight =
      (activeIndex + 1) % testimonialsLength === index;

    if (isActive) {
      return {
        zIndex: 3,
        opacity: 1,
        pointerEvents: 'auto',
        transform: `translateX(0px) translateY(0px) scale(1) rotateY(0deg)`,
        transition: 'all 0.8s cubic-bezier(.4,2,.3,1)',
      };
    }
    if (isLeft) {
      return {
        zIndex: 2,
        opacity: 1,
        pointerEvents: 'auto',
        transform: `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(15deg)`,
        transition: 'all 0.8s cubic-bezier(.4,2,.3,1)',
      };
    }
    if (isRight) {
      return {
        zIndex: 2,
        opacity: 1,
        pointerEvents: 'auto',
        transform: `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(-15deg)`,
        transition: 'all 0.8s cubic-bezier(.4,2,.3,1)',
      };
    }
    return {
      zIndex: 1,
      opacity: 0,
      pointerEvents: 'none',
      transition: 'all 0.8s cubic-bezier(.4,2,.3,1)',
    };
  }

  const quoteVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className={clsx('w-full max-w-4xl p-8', className)}>
      <div className="grid gap-20 md:grid-cols-2">
        {/* Images */}
        <div
          ref={imageContainerRef}
          className="relative w-full h-96"
          style={{ perspective: '1000px' }}
        >
          {testimonials.map((testimonial, index) => (
            <img
              key={testimonial.src}
              src={testimonial.src}
              alt={testimonial.name}
              className="absolute w-full h-full object-cover rounded-xl shadow-lg"
              data-index={index}
              style={getImageStyle(index)}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              variants={quoteVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <h3 className="text-2xl font-bold text-ink mb-1">
                {activeTestimonial.name}
              </h3>
              <p className="text-sm text-muted mb-8">
                {activeTestimonial.designation}
              </p>
              <p className="text-base leading-relaxed text-ink/80">
                {activeTestimonial.quote.split(' ').map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ filter: 'blur(10px)', opacity: 0, y: 5 }}
                    animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.22,
                      ease: 'easeInOut',
                      delay: 0.025 * i,
                    }}
                    className="inline-block"
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-6 pt-12 md:pt-0">
            <button
              onClick={handlePrev}
              aria-label="Previous testimonial"
              className="flex size-11 items-center justify-center rounded-full bg-ink text-surface transition-colors hover:bg-rausch"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next testimonial"
              className="flex size-11 items-center justify-center rounded-full bg-ink text-surface transition-colors hover:bg-rausch"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
