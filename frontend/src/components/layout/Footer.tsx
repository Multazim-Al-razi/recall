import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="flex shrink-0 items-center justify-between px-6 py-3 text-[13px] text-muted">
      <span>&copy; {new Date().getFullYear()} Recall</span>
      <div className="flex items-center gap-4">
        <Link to="/about" className="transition-colors hover:text-ink">
          About
        </Link>
        <Link to="/pricing" className="transition-colors hover:text-ink">
          Pricing
        </Link>
        <span>v1.0.0</span>
      </div>
    </footer>
  );
}
