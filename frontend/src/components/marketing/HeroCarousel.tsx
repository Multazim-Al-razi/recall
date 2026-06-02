import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { clsx } from "clsx";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { HeroPreview } from "./HeroPreview";
import { ReminderPreview } from "./ReminderPreview";
import { ProjectionPreview } from "./ProjectionPreview";

const SLIDES: { key: string; label: string; node: ReactNode }[] = [
  { key: "burn", label: "Monthly burn overview", node: <HeroPreview /> },
  { key: "reminder", label: "Cancel reminder", node: <ReminderPreview /> },
  {
    key: "projection",
    label: "Yearly projection",
    node: <ProjectionPreview />,
  },
];

const AUTOPLAY_MS = 5000;

/**
 * Side-card peek offset, scaled to the measured card width. Mirrors the
 * CircularTestimonials ratio (≈60px peek for a ~400px card) so the three-card
 * stack reads identically. The outer box's padding absorbs the peek.
 */
function calculateGap(width: number) {
  return width * 0.15;
}

/**
 * Rotating hero deck — the exact CircularTestimonials stacking effect, applied
 * to three distinct product previews. All three cards are the same size and
 * stacked: the active one sits centre, the previous/next peek out to the side,
 * lift above the top edge (translateY) and tilt in 3D (scale 0.85, rotateY
 * ±15°). Autoplay with hover/focus pause; flat cross-fade under reduced-motion.
 */
export function HeroCarousel({ className }: { className?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [stageWidth, setStageWidth] = useState(360);
  const [paused, setPaused] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const count = SLIDES.length;

  useEffect(() => {
    function handleResize() {
      if (stageRef.current) {
        setStageWidth(stageRef.current.offsetWidth);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, reduceMotion, count]);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(((index % count) + count) % count);
    },
    [count],
  );

  const getSlideStyle = useCallback(
    (index: number): CSSProperties => {
      const isActive = index === activeIndex;
      const isLeft = (activeIndex - 1 + count) % count === index;
      const isRight = (activeIndex + 1) % count === index;
      const transition = "all 0.8s cubic-bezier(.4,2,.3,1)";

      if (reduceMotion) {
        return {
          zIndex: isActive ? 3 : 1,
          opacity: isActive ? 1 : 0,
          pointerEvents: isActive ? "auto" : "none",
          transition: "opacity 0.5s ease",
        };
      }

      const gap = calculateGap(stageWidth);
      const maxStickUp = gap * 0.8;

      if (isActive) {
        return {
          zIndex: 3,
          opacity: 1,
          pointerEvents: "auto",
          transform: "translateX(0px) translateY(0px) scale(1) rotateY(0deg)",
          transition,
        };
      }
      if (isLeft) {
        return {
          zIndex: 2,
          opacity: 1,
          pointerEvents: "auto",
          cursor: "pointer",
          transform: `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(15deg)`,
          transition,
        };
      }
      if (isRight) {
        return {
          zIndex: 2,
          opacity: 1,
          pointerEvents: "auto",
          cursor: "pointer",
          transform: `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(-15deg)`,
          transition,
        };
      }
      return {
        zIndex: 1,
        opacity: 0,
        pointerEvents: "none",
        transition,
      };
    },
    [activeIndex, stageWidth, count, reduceMotion],
  );

  return (
    <div
      className={clsx("mx-auto w-fit px-10", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Card-sized stage with a definite width so it can't collapse. */}
      <div
        ref={stageRef}
        className="relative h-115 w-90 max-w-full"
        style={{ perspective: "1000px" }}
        aria-roledescription="carousel"
        aria-label="Product preview"
      >
        {SLIDES.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={slide.key}
              className="absolute inset-0"
              style={getSlideStyle(index)}
              aria-hidden={!isActive}
              onClick={() => !isActive && goTo(index)}
            >
              {slide.node}
            </div>
          );
        })}
      </div>
    </div>
  );
}
