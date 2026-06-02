import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

interface Options {
  /** Set to false to skip wiring the trap. Defaults to true. */
  enabled?: boolean;
  /** When true (default), focus the first focusable child on mount. */
  autoFocus?: boolean;
}

/**
 * Traps keyboard focus within a container while it's mounted.
 *
 * - On mount, optionally moves focus to the first focusable child so the trap
 *   is engaged seamlessly.
 * - Tab and Shift+Tab cycle within the container, preventing focus from
 *   escaping to underlying page chrome.
 *
 * Pairs with `aria-modal="true"` on the dialog element.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  { enabled = true, autoFocus = true }: Options = {},
): void {
  useEffect(() => {
    if (!enabled) return;
    const node = containerRef.current;
    if (!node) return;

    const getFocusable = (): HTMLElement[] =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = getFocusable();
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && active === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };

    if (autoFocus) {
      // Defer to the next frame so the modal contents are mounted before we
      // try to focus the first one — see audit 2.5.
      const focusFirst = () => getFocusable()[0]?.focus();
      const rafId = requestAnimationFrame(focusFirst);
      node.addEventListener("keydown", onKey);
      return () => {
        cancelAnimationFrame(rafId);
        node.removeEventListener("keydown", onKey);
      };
    }

    node.addEventListener("keydown", onKey);
    return () => node.removeEventListener("keydown", onKey);
  }, [containerRef, enabled, autoFocus]);
}
