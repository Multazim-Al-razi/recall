import { useState } from 'react';
import { Cloud, CloudOff, RefreshCw, Loader2 } from 'lucide-react';
import { useConnectionStore } from '@/stores/connection';
import { useRetrySync } from '@/hooks/useApiSync';

interface Props {
  /** Compact icon-only mode for tight chrome (e.g. header). */
  compact?: boolean;
  className?: string;
}

/**
 * Live backend connection indicator. The app is local-first, so "Offline"
 * is a perfectly healthy state — this just tells the user whether their data
 * is also being mirrored to the optional backend, with a one-click retry.
 */
export function SyncBadge({ compact = false, className = '' }: Props) {
  const status = useConnectionStore((s) => s.status);
  const retry = useRetrySync();
  const [spinning, setSpinning] = useState(false);

  const handleRetry = async () => {
    setSpinning(true);
    await retry();
    setSpinning(false);
  };

  const config = {
    connecting: {
      icon: Loader2,
      label: 'Connecting',
      tip: 'Reaching the backend…',
      dot: 'bg-warning',
      text: 'text-muted',
      spin: true,
    },
    online: {
      icon: Cloud,
      label: 'Synced',
      tip: 'Your data is mirrored to the backend.',
      dot: 'bg-success',
      text: 'text-success',
      spin: false,
    },
    offline: {
      icon: CloudOff,
      label: 'Local only',
      tip: 'Backend offline — everything still works and stays on this device. Click to retry.',
      dot: 'bg-muted',
      text: 'text-muted',
      spin: false,
    },
    error: {
      icon: CloudOff,
      label: 'Sync error',
      tip: 'Could not reach the backend. Click to retry.',
      dot: 'bg-rausch',
      text: 'text-rausch',
      spin: false,
    },
  }[status];

  const Icon = spinning ? Loader2 : config.icon;
  const isInteractive = status === 'offline' || status === 'error';

  if (compact) {
    return (
      <button
        onClick={handleRetry}
        title={config.tip}
        aria-label={`Backend: ${config.label}. ${config.tip}`}
        className={`relative flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink ${className}`}
      >
        <Icon size={18} className={spinning || config.spin ? 'animate-spin' : ''} />
        <span
          className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-[var(--color-header-bg)] ${config.dot}`}
        />
      </button>
    );
  }

  return (
    <button
      onClick={isInteractive ? handleRetry : undefined}
      title={config.tip}
      aria-label={`Backend: ${config.label}. ${config.tip}`}
      className={`group inline-flex items-center gap-2 rounded-full border border-ink/8 bg-surface/60 px-3 py-1.5 text-[12px] font-medium transition-colors ${
        isInteractive ? 'cursor-pointer hover:border-rausch/30 hover:text-rausch' : 'cursor-default'
      } ${config.text} ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dot} ${status === 'online' ? '' : ''}`} />
      {config.label}
      {isInteractive && (
        <RefreshCw size={12} className={`opacity-60 ${spinning ? 'animate-spin' : ''}`} />
      )}
    </button>
  );
}
