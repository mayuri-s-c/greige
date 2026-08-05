import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '../store/toastStore';

const toneStyles = {
  success: 'border-indigo/30 bg-linen text-ink',
  error: 'border-rust/40 bg-linen text-ink',
  info: 'border-line bg-linen text-ink',
};

const toneEmoji = {
  success: '✅',
  error: '⚠️',
  info: 'ℹ️',
};

export default function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[80] flex flex-col items-center gap-2 px-4 md:top-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className={`pointer-events-auto flex w-full max-w-md items-start gap-3 border px-4 py-3 shadow-none ${
              toneStyles[toast.tone] || toneStyles.success
            }`}
          >
            <span className="mt-0.5 text-base" aria-hidden="true">
              {toneEmoji[toast.tone] || '✅'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug">{toast.title}</p>
              {toast.body ? (
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{toast.body}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-xs text-ink-soft hover:text-ink"
            >
              Close
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
