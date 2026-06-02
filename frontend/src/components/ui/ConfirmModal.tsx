import { useEffect, useRef } from 'react';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    dialogRef.current?.querySelector<HTMLElement>('button[data-autofocus]')?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/30 p-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-[360px] rounded-xl bg-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-sm font-medium text-muted hover:text-ink"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            data-autofocus
            onClick={onConfirm}
            className={`rounded-full px-5 py-2 text-sm font-semibold text-white ${
              variant === 'danger'
                ? 'bg-rausch hover:bg-rausch-hover'
                : 'bg-ink hover:bg-ink/80'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}