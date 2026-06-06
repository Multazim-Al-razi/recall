import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { trackEvent } from '@/lib/telemetry';

const CHECKIN_INTERVAL = 14 * 24 * 60 * 60 * 1000; // 14 days
const STORAGE_KEY = 'recall_quick_checkin';

const EMOTES = [
  { score: 1, emoji: '☹️', label: 'Terrible' },
  { score: 2, emoji: '🙁', label: 'Bad' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 5, emoji: '🤩', label: 'Great' },
];

export function QuickCheckinModal() {
  const [show, setShow] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Check if we should show the check-in
    const lastPromptStr = localStorage.getItem(STORAGE_KEY);
    const lastPrompt = lastPromptStr ? parseInt(lastPromptStr, 10) : 0;
    
    // Only show if enough time has passed (or it's the first time)
    if (Date.now() - lastPrompt > CHECKIN_INTERVAL || lastPrompt === 0) {
      // Add a small delay so it doesn't pop up instantly on load
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  const handleSelect = async (score: number) => {
    setSubmitted(true);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    
    // Send to telemetry
    await trackEvent('quick_checkin_response', { category: `score_${score}` });
    
    // Hide after a brief thank you
    setTimeout(() => {
      setShow(false);
    }, 600);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-50 w-full max-w-[360px] md:bottom-8 md:right-8"
        >
          <div className="card-premium relative overflow-hidden bg-surface p-6 shadow-[0_16px_40px_rgba(0,0,0,0.12)] border border-ink/5">
            {!submitted ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
                    Quick Check-in
                  </h3>
                  <button
                    onClick={dismiss}
                    className="text-muted hover:text-ink transition-colors"
                    aria-label="Dismiss"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <h4 className="font-display text-[22px] font-medium leading-tight text-ink mb-6">
                  How do you feel about your subscription spend?
                </h4>
                
                <div className="flex items-center justify-between gap-2">
                  {EMOTES.map((emote) => (
                    <button
                      key={emote.score}
                      onClick={() => handleSelect(emote.score)}
                      className="group flex h-[48px] w-[48px] items-center justify-center rounded-full bg-canvas shadow-[var(--shadow-xs)] transition-all hover:-translate-y-1 hover:bg-canvas hover:shadow-[var(--shadow-sm)] border border-ink/5"
                      aria-label={`Rate ${emote.label}`}
                    >
                      <span className="text-[24px] transition-transform group-hover:scale-110">
                        {emote.emoji}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex flex-col items-center justify-center py-6 text-center"
              >
                <h4 className="font-display text-[20px] font-medium text-ink">
                  Thanks for sharing!
                </h4>
                <p className="mt-1 text-[14px] text-muted">
                  Your feedback helps us improve.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
