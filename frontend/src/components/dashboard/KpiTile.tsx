import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string;
  sub?: string;
  /** Tints the accent rule. Defaults to Rausch. */
  tone?: "rausch" | "success" | "warning" | "ink" | "teal";
  /** Optional icon to display alongside the label for visual distinction */
  icon?: LucideIcon;
}

const RULE: Record<NonNullable<Props["tone"]>, string> = {
  rausch: "bg-rausch",
  success: "bg-success",
  warning: "bg-warning",
  ink: "bg-ink",
  teal: "bg-teal",
};

const ICON_BG: Record<NonNullable<Props["tone"]>, string> = {
  rausch: "bg-rausch/10 text-rausch",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  ink: "bg-ink/10 text-ink",
  teal: "bg-teal/10 text-teal",
};

/**
 * Editorial metric tile with optional icon for visual distinction.
 * The serif numeral is the hero; the label reads like a ledger caption.
 * A short tone-coloured rule anchors the value.
 */
export function KpiTile({ label, value, sub, tone = "rausch", icon: Icon }: Props) {
  return (
    <div className="card-premium overflow-hidden p-5">
      <div className="flex items-center gap-2">
        {Icon && (
          <span className={`flex h-6 w-6 items-center justify-center rounded-full ${ICON_BG[tone]}`}>
            <Icon size={14} />
          </span>
        )}
        <span className="text-[10px] font-bold uppercase tracking-[1.8px] text-muted">
          {label}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-2.5">
        <span className={`h-7 w-0.5 shrink-0 rounded-full ${RULE[tone]}`} />
        <span className="font-display text-[33px] font-light leading-none tracking-[-1px] tabular-nums">
          {value}
        </span>
      </div>

      {sub && <div className="mt-2.5 text-[12px] text-ink-soft">{sub}</div>}
    </div>
  );
}
