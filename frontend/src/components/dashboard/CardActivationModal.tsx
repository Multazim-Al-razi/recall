import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface CardActivationModalProps {
  open: boolean;
  onClose: () => void;
  onActivate: (code: string) => Promise<void>;
}

export function CardActivationModal({ open, onClose, onActivate }: CardActivationModalProps) {
  const [code, setCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) {
      setCode('');
      setProcessing(false);
    }
  }, [open]);

  const handleActivate = async () => {
    if (!code || processing) return;
    setProcessing(true);
    try {
      await onActivate(code);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-[440px]">
      <div className="flex items-center justify-center pt-2 pb-1">
        <motion.div
          initial={reduce ? false : { y: -16, opacity: 0 }}
          animate={reduce ? undefined : { y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative flex h-48 w-80 flex-col justify-between overflow-hidden rounded-[20px] p-6 text-white shadow-[0_20px_50px_rgba(32,28,24,0.35)]"
          style={{ background: 'linear-gradient(135deg, #2a241f 0%, #201c18 100%)' }}
        >
          {/* Blob art background */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <motion.span
              className="absolute -left-10 -top-12 h-40 w-40 rounded-full blur-2xl"
              style={{ background: 'radial-gradient(circle, var(--color-rausch) 0%, transparent 70%)', opacity: 0.55 }}
              animate={reduce ? undefined : { x: [0, 12, 0], y: [0, 8, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="absolute -bottom-14 right-2 h-44 w-44 rounded-full blur-2xl"
              style={{ background: 'radial-gradient(circle, var(--color-gold) 0%, transparent 70%)', opacity: 0.4 }}
              animate={reduce ? undefined : { x: [0, -14, 0], y: [0, -6, 0] }}
              transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="absolute right-16 top-6 h-28 w-28 rounded-full blur-2xl"
              style={{ background: 'radial-gradient(circle, var(--color-teal) 0%, transparent 70%)', opacity: 0.35 }}
              animate={reduce ? undefined : { x: [0, 10, 0], y: [0, 12, 0] }}
              transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Card content */}
          <div className="relative z-10 flex items-start justify-between">
            <div className="h-8 w-11 rounded-[6px] bg-gradient-to-br from-amber-200 to-amber-400 shadow-inner" />
            <p className="text-[12px] font-medium tracking-[2px] text-white/85">VIRTUAL CARD</p>
          </div>

          <div className="relative z-10">
            <p className="font-display text-[18px] font-light tracking-[3px] tabular-nums">
              ···· ···· ···· 1234
            </p>
            <div className="mt-2 flex justify-between text-[12px] text-white/80">
              <span className="font-semibold tracking-wide">RECALL</span>
              <span className="tabular-nums">12/28</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-6 text-center">
        <h2 className="font-display text-[20px] font-light tracking-[-0.5px]">
          Activate your <strong className="font-bold">virtual card</strong>
        </h2>
        <p className="mx-auto mt-2 max-w-[340px] text-[13px] leading-[1.55] text-muted">
          Enter the activation code to enable your digital card for use.
        </p>
      </div>

      <div className="mt-5">
        <Input
          id="activation-code"
          placeholder="Enter activation code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={processing}
          onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
        />
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={processing}>
          Cancel
        </Button>
        <Button onClick={handleActivate} disabled={!code || processing} loading={processing}>
          {processing ? 'Activating…' : 'Activate'}
        </Button>
      </div>
    </Modal>
  );
}
