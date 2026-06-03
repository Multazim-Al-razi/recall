export function Logo({ className = '' }: { className?: string }) {
  return (
    <span
      className={`font-bold tracking-tight ${className}`}
      style={{ lineHeight: 1 }}
    >
      recall<span className="text-rausch">.</span>
    </span>
  );
}
