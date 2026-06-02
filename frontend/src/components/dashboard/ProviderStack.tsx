import { useMemo } from 'react';
import { Link } from 'react-router';
import { Plus } from 'lucide-react';
import { useSubscriptionStore, getActiveSubscriptions } from '@/stores/subscription';
import { CATEGORY_CONFIG } from '@/types/subscription';
import { ProviderIcon } from '@/components/ui/ProviderIcon';

/** A single provider chip with logo + graceful initial fallback. */
function ProviderChip({ name, icon, gradient }: { name: string; icon?: string; gradient: string }) {
  return (
    <div
      title={name}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] shadow-[inset_0_0_0_1px_rgba(26,26,26,0.05)] transition-transform duration-300 hover:-translate-y-1"
      style={{ background: gradient }}
    >
      <ProviderIcon icon={icon} name={name} size={22} />
    </div>
  );
}

/**
 * Logo-forward "your stack" row — instant recognition of everything the
 * user is paying for. Reuses the Simple Icons pattern + category gradients.
 */
export function ProviderStack() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const active = useMemo(() => getActiveSubscriptions(subscriptions), [subscriptions]);

  if (active.length === 0) return null;

  return (
    <div className="card-premium flex flex-wrap items-center gap-3 p-5">
      <div className="mr-1 text-[10px] font-bold uppercase tracking-[2px] text-muted">
        Your stack
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        {active.map((sub) => (
          <ProviderChip
            key={sub.id}
            name={sub.name}
            icon={sub.providerIcon}
            gradient={CATEGORY_CONFIG[sub.category].gradient}
          />
        ))}
        <Link
          to="/dashboard/subscriptions"
          aria-label="Add subscription"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-dashed border-ink/15 text-muted transition-colors hover:border-rausch/40 hover:text-rausch"
        >
          <Plus size={18} />
        </Link>
      </div>
    </div>
  );
}
