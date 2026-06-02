import { useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router';

const FACES = [
  { key: 'bad', emoji: '☹️', label: 'Too much' },
  { key: 'meh', emoji: '😕', label: 'A bit high' },
  { key: 'ok', emoji: '😐', label: 'Okay' },
  { key: 'good', emoji: '🙂', label: 'Healthy' },
  { key: 'great', emoji: '😄', label: 'Great' },
] as const;

/**
 * Light feedback card mirroring the reference's "How is your business going?"
 * rating. Asks how the user feels about their subscription spend and routes the
 * answer toward analytics — a soft, dismissible nudge.
 */
export function SpendHealthCard() {
  const [picked, setPicked] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="card-premium relative flex h-full flex-col justify-between gap-5 p-5">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
      >
        <X size={14} />
      </button>

      <div>
        <div className="text-[10px] font-bold uppercase tracking-[2px] text-muted">
          Quick check-in
        </div>
        <h3 className="mt-2 max-w-[240px] font-display text-[19px] font-light leading-snug tracking-tight">
          How do you feel about your subscription spend?
        </h3>
      </div>

      <div className="flex items-center justify-between">
        {FACES.map((face) => {
          const isPicked = picked === face.key;
          return (
            <button
              key={face.key}
              type="button"
              title={face.label}
              aria-label={face.label}
              aria-pressed={isPicked}
              onClick={() => setPicked(face.key)}
              className={`flex h-11 w-11 items-center justify-center rounded-full text-[20px] transition-all ${
                isPicked
                  ? 'scale-110 bg-rausch/12 ring-2 ring-rausch/40'
                  : 'bg-canvas hover:scale-105'
              }`}
            >
              <span aria-hidden>{face.emoji}</span>
            </button>
          );
        })}
      </div>

      {picked && (
        <Link
          to="/dashboard/analytics"
          className="text-[12px] font-medium text-rausch"
        >
          See where your money goes →
        </Link>
      )}
    </div>
  );
}
