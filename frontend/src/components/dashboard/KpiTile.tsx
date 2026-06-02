interface Props {
  label: string;
  value: string;
  sub?: string;
  /** Tints the accent rule. Defaults to Rausch. */
  tone?: "rausch" | "success" | "warning" | "ink" | "teal";
}

const RULE: Record<NonNullable<Props["tone"]>, string> = {
  rausch: "bg-rausch",
  success: "bg-success",
  warning: "bg-warning",
  ink: "bg-ink",
  teal: "bg-teal",
};

/**
 * Editorial metric tile. The serif numeral is the hero; the label reads like a
 * ledger caption. A short tone-coloured rule anchors the value — no icon chip,
 * so the row of KPIs feels composed, not templated.
 */
export function KpiTile({ label, value, sub, tone = "rausch" }: Props) {
  return (
    <div className="card-premium overflow-hidden p-5">
      <span className="text-[10px] font-bold uppercase tracking-[1.8px] text-muted">
        {label}
      </span>

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
