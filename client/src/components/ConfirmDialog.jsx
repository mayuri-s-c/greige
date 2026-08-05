import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CloseIcon } from './Icons';

const sizeClass = {
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

function lockBodyScroll() {
  const html = document.documentElement;
  const scrollbar = Math.max(0, window.innerWidth - html.clientWidth);
  const prevOverflow = document.body.style.overflow;
  const prevPadding = document.body.style.paddingRight;
  document.body.style.overflow = 'hidden';
  if (scrollbar > 0) {
    document.body.style.paddingRight = `${scrollbar}px`;
  }
  return () => {
    document.body.style.overflow = prevOverflow;
    document.body.style.paddingRight = prevPadding;
  };
}

export default function ConfirmDialog({
  open,
  title,
  body,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  onConfirm,
  onClose,
  confirmDisabled = false,
  showActions = true,
  size = 'md',
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    const unlock = lockBodyScroll();
    return () => {
      window.removeEventListener('keydown', onKey);
      unlock();
    };
  }, [open, onClose]);

  const confirmClass =
    tone === 'danger'
      ? 'bg-rust text-linen hover:bg-[#8f1c14]'
      : 'bg-ink text-linen hover:bg-indigo-deep';

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className={`relative flex max-h-[90vh] w-full flex-col border border-line bg-linen p-5 shadow-[0_24px_60px_rgba(28,25,21,0.18)] ${
              sizeClass[size] || sizeClass.md
            }`}
          >
            <div className="flex shrink-0 items-start justify-between gap-3">
              <div>
                <h2 id="confirm-dialog-title" className="font-display text-3xl leading-none">
                  {title}
                </h2>
                {body ? <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p> : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 border border-line p-1.5 text-ink-soft hover:border-ink hover:text-ink"
                aria-label="Close"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            {children ? (
              <div className="mt-4 min-h-0 flex-1 overflow-y-auto scroll-thin">{children}</div>
            ) : null}

            {showActions ? (
              <div className="mt-6 flex shrink-0 flex-wrap justify-end gap-2">
                <button type="button" onClick={onClose} className="btn-secondary">
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={confirmDisabled}
                  className={`px-4 py-2.5 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    confirmClass
                  }`}
                >
                  {confirmLabel}
                </button>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
