import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import FormattedText from './FormattedText';
import { fabricAccent, colorwayGradient } from './ProductCard';
import { SectionEyebrow } from './ui';
import { CheckIcon, CloseIcon } from './Icons';

function ClothChip({ product }) {
  if (!product) return null;
  const accent = fabricAccent(product.name);
  const color = product.colors?.[0];
  return (
    <div className="min-w-0 flex-1 border border-line bg-linen/80 p-3">
      <div
        className="mb-3 h-16 w-full"
        style={{
          background: color
            ? colorwayGradient(color, accent)
            : `linear-gradient(145deg, ${accent}, #e2dfd8)`,
        }}
      />
      <p className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">{product.category}</p>
      <p className="mt-1 font-display text-xl leading-tight">{product.name}</p>
      <p className="mt-1 text-sm text-ink-soft">
        GSM {product.specifications?.gsm ?? '—'} · ₹{product.price}/{product.unit}
      </p>
    </div>
  );
}

function CompareLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-4 py-10 text-center"
    >
      <motion.span
        className="h-10 w-10 rounded-full border-2 border-indigo/25 border-t-indigo"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
      />
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Compare Loom</p>
        <p className="mt-2 font-display text-2xl">Weaving the brief…</p>
        <p className="mt-1 text-sm text-ink-soft">Lining up specs, price, and best use.</p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            className="h-1.5 w-1.5 rounded-full bg-indigo"
            animate={{ opacity: [0.25, 1, 0.25], y: [0, -4, 0] }}
            transition={{ duration: 0.85, repeat: Infinity, delay: dot * 0.16 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function CompareLoomModal({
  open,
  onClose,
  loading,
  reply,
  currentProduct,
  compareProduct,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const html = document.documentElement;
    const scrollbar = Math.max(0, window.innerWidth - html.clientWidth);
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Close Compare Loom"
            className="absolute inset-0 bg-ink/45 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="compare-loom-title"
            initial={{ opacity: 0, y: 36, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative z-10 flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden border border-line bg-linen"
          >
            <div className="relative overflow-hidden border-b border-line px-5 py-4 text-linen">
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(115deg, #1a3654 0%, #1a1e28 55%, #12141a 100%)',
                }}
              />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <SectionEyebrow>
                    <span className="text-linen/65">Side-by-side sourcing</span>
                  </SectionEyebrow>
                  <h2 id="compare-loom-title" className="mt-1 font-display text-3xl leading-none">
                    Compare Loom
                  </h2>
                  <p className="mt-2 text-sm text-linen/75">
                    Mill-true brief for the cloths you lined up.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 border border-linen/25 px-3 py-1.5 text-sm text-linen/90 hover:bg-linen/10"
                >
                  <CloseIcon className="h-4 w-4" />
                  Close
                </button>
              </div>
            </div>

            <div className="overflow-y-auto scroll-thin px-5 py-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.3 }}
                className="mb-5 flex gap-3"
              >
                <ClothChip product={currentProduct} />
                <div className="flex items-center text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                  vs
                </div>
                <ClothChip product={compareProduct} />
              </motion.div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <CompareLoader key="loader" />
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-4"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="border border-line bg-white/40 p-4"
                    >
                      <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                        🧵 Warp brief
                      </p>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.18, duration: 0.45 }}
                        className="mt-3"
                      >
                        <FormattedText text={reply || 'No comparison available.'} className="text-sm text-ink" />
                      </motion.div>
                    </motion.div>

                    {compareProduct && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.28, duration: 0.3 }}
                        className="flex flex-wrap gap-2"
                      >
                        <Link
                          to={`/products/${compareProduct._id}`}
                          onClick={onClose}
                          className="btn-secondary text-sm"
                        >
                          Open compared cloth
                        </Link>
                        <button type="button" onClick={onClose} className="btn-primary inline-flex items-center gap-2 text-sm">
                          <CheckIcon className="h-4 w-4" />
                          Done
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
