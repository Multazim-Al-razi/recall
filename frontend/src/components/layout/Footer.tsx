import { Link } from "react-router";
import { SyncBadge } from "@/components/ui/SyncBadge";

export function Footer() {
  return (
    <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-[var(--color-sidebar-border)] px-6 py-3 text-[13px] text-muted">
      <div className="flex items-center gap-3">
        <span>&copy; {new Date().getFullYear()} Recall</span>
        <span className="hidden sm:inline-flex">
          <SyncBadge />
        </span>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/about" className="transition-colors hover:text-ink">
          About
        </Link>
        <Link to="/donate" className="transition-colors hover:text-rausch">
          Donate
        </Link>
        <span>v1.1.0</span>
      </div>
    </footer>
  );
}
