import { useSubscriptionStore, getByCategory, getMonthlySpend } from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import { formatMoney } from '@/lib/format';
import { CATEGORY_CONFIG, type Category } from '@/types/subscription';
import { PieChart } from 'lucide-react';
import { CATEGORY_COLORS } from '@/types/subscription';

export function TopCategoriesWidget() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const currency = useAccountStore((s) => s.profile.currency);
  
  const monthlySpend = getMonthlySpend(subscriptions);
  const categories = getByCategory(subscriptions);
  
  // Get top 3 categories by spend
  const topCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (topCategories.length === 0 || monthlySpend === 0) {
    return (
      <div className="card-premium flex flex-col items-center justify-center gap-3 p-6 text-center overflow-hidden min-h-[220px]">
        <PieChart size={140} className="absolute -right-6 -bottom-6 text-ink opacity-[0.03] pointer-events-none" strokeWidth={1} />
        <div className="relative z-10">
          <p className="text-[14px] font-medium text-ink">No spending data</p>
          <p className="mt-1.5 text-[13px] text-muted max-w-[200px]">
            Add active subscriptions to see your top spending categories.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-premium flex flex-col justify-between overflow-hidden p-6 relative min-h-[220px]">
      <PieChart size={180} className="absolute -right-8 -top-8 text-ink opacity-[0.02] pointer-events-none" strokeWidth={1} />

      <div className="relative z-10 mb-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted mb-4">
          Top Categories
        </h3>
        
        <div className="flex flex-col gap-3.5">
          {topCategories.map(([cat, amount]) => {
            const config = CATEGORY_CONFIG[cat as Category];
            const label = config?.label || cat;
            const color = CATEGORY_COLORS[cat as Category] || 'var(--color-ink)';
            const percentage = (amount / monthlySpend) * 100;
            
            return (
              <div key={cat} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2 font-medium text-ink">
                    <span 
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {label}
                  </div>
                  <span className="font-semibold tabular-nums text-ink">
                    {formatMoney(amount, currency)}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-surface shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ 
                      width: `${Math.max(percentage, 2)}%`,
                      backgroundColor: color
                    }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="relative z-10 mt-auto pt-2 border-t border-ink/5 flex items-center justify-between">
        <span className="text-[12px] text-muted">Total Monthly</span>
        <span className="text-[13px] font-bold text-ink tabular-nums">
          {formatMoney(monthlySpend, currency)}
        </span>
      </div>
    </div>
  );
}
