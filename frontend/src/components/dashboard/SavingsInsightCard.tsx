import { Link } from 'react-router';
import { PiggyBank, TrendingDown, ArrowRight } from 'lucide-react';
import { useSubscriptionStore, getSavingsOpportunities, getByCategory, getMonthlySpend } from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import { formatMoney } from '@/lib/format';
import { CATEGORY_CONFIG } from '@/types/subscription';

export function SavingsInsightCard() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const currency = useAccountStore((s) => s.profile.currency);
  
  const { totalSavings, top } = getSavingsOpportunities(subscriptions);
  const monthlySpend = getMonthlySpend(subscriptions);
  
  // Determine the primary insight to show
  let title = "Spending Insight";
  let content = "Review your analytics to find ways to optimize your stack.";
  let highlight = "";
  
  if (totalSavings > 0 && top) {
    title = "Consolidation Target";
    content = `You have multiple overlapping subscriptions. Consolidating down to one could save you `;
    highlight = formatMoney(totalSavings, currency) + "/mo";
  } else if (monthlySpend > 0) {
    const categories = getByCategory(subscriptions);
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      const catName = CATEGORY_CONFIG[topCategory[0] as keyof typeof CATEGORY_CONFIG]?.label || topCategory[0];
      title = "Highest Spend";
      content = `Your largest category is ${catName}, making up a significant portion of your `;
      highlight = formatMoney(monthlySpend, currency) + " monthly burn.";
    }
  } else {
    title = "Build Your Stack";
    content = "Add more subscriptions to unlock personalized savings insights and trends.";
  }

  return (
    <div className="card-premium flex flex-col justify-between gap-5 overflow-hidden p-6 relative min-h-[220px]">
      {/* Enlarged watermark icon instead of circular background */}
      <TrendingDown 
        size={180} 
        className="absolute -right-8 -bottom-8 text-teal opacity-[0.04] pointer-events-none" 
        strokeWidth={1} 
      />

      <div className="relative z-10">
        <div className="mb-3 flex items-center gap-1.5 text-teal">
          <PiggyBank size={16} strokeWidth={2} />
          <span className="text-[11px] font-semibold uppercase tracking-[1.5px]">Insight</span>
        </div>
        <h3 className="font-display text-[22px] font-medium leading-snug tracking-tight text-ink">
          {title}
        </h3>
        <p className="mt-2 text-[14px] leading-relaxed text-muted max-w-[220px]">
          {content}
          {highlight && <span className="font-semibold text-ink">{highlight}</span>}
        </p>
      </div>

      <Link
        to="/dashboard/analytics"
        className="relative z-10 inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--color-hairline)] bg-canvas/80 backdrop-blur-sm px-4 py-2 text-[13px] font-medium text-ink transition-all hover:bg-surface hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]"
      >
        View analytics
        <ArrowRight size={14} className="text-muted" />
      </Link>
    </div>
  );
}
