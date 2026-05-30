import type { ComponentType } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  sub?: string;
  trend?: { direction: 'up' | 'down'; text: string };
  /** Tints the icon chip + accents. Defaults to Rausch. */
  tone?: 'rausch' | 'success' | 'warning' | 'ink';
}

const TONE: Record<NonNullable<Props['tone']>, string> = {
  rausch: 'bg-rausch/10 text-rausch',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  ink: 'bg-ink/8 text-ink',
};

/** Compact, dashboard-grade metric tile (not the large marketing StatCard). */
export function KpiTile({ icon: Icon, label, value, sub, trend, tone = 'rausch' }: Props) {
  return (
    <div className="flex flex-col rounded-[18px] bg-surface p-5">
      <div className="flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-[11px] ${TONE[tone]}`}>
          <Icon size={17} strokeWidth={2.2} />
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              trend.direction === 'up' ? 'bg-rausch/7 text-rausch' : 'bg-success/7 text-success'
            }`}
          >
            {trend.direction === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend.text}
          </span>
        )}
      </div>
      <div className="mt-4 text-[26px] font-bold leading-none tracking-[-1px]">{value}</div>
      <div className="mt-1.5 text-[11px] font-bold uppercase tracking-[1.5px] text-muted">{label}</div>
      {sub && <div className="mt-1 text-[12px] text-muted">{sub}</div>}
    </div>
  );
}
