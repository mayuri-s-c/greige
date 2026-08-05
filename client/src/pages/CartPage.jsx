import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { SectionEyebrow, EmptyState } from '../components/ui';
import { colorwayHex, fabricAccent } from '../components/ProductCard';
import { ArrowRightIcon, TrashIcon } from '../components/Icons';

export default function CartPage() {
  const { cart, fetchCart, updateItem, removeItem, loading } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const subtotal = useMemo(() => {
    return (cart?.items || []).reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [cart]);

  const items = useMemo(() => [...(cart?.items || [])].reverse(), [cart]);

  if (loading && !cart) {
    return <p className="mx-auto max-w-7xl px-4 py-16 text-ink-soft md:px-6">Loading cart…</p>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <SectionEyebrow emoji="🛒">Checkout path</SectionEyebrow>
      <h1 className="mt-2 font-display text-5xl leading-none">Cart</h1>
      <p className="mt-3 text-ink-soft">Review yardage and selected colorways before shipping.</p>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Cart is empty"
            body="Shortlist on boards, then move confirmed cloths here."
            action={
              <Link to="/" className="text-sm text-indigo">
                Browse Greige Floor →
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <div className="space-y-4">
            {items.map((item) => {
              if (!item.product) return null;
              const product = item.product;
              const selectedColor = item.color || '';
              const lineTotal = (product.price || 0) * item.quantity;
              const lineKey = `${product._id}-${selectedColor || 'default'}`;
              const previewHex = selectedColor
                ? colorwayHex(selectedColor, fabricAccent(product.name || ''))
                : fabricAccent(product.name || '');

              return (
                <article key={lineKey} className="panel-surface overflow-hidden">
                  <div className="flex flex-col gap-5 p-4 sm:flex-row sm:gap-5 sm:p-5">
                    <div
                      className="h-36 w-full shrink-0 sm:h-28 sm:w-28"
                      style={{
                        background: `linear-gradient(145deg, ${previewHex}, #e2e8f0)`,
                      }}
                      aria-hidden
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                        <div className="min-w-0 space-y-2">
                          <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                            {product.category || 'Fabric'}
                          </p>
                          <Link
                            to={`/products/${product._id}`}
                            className="block truncate font-display text-[1.65rem] leading-tight hover:text-indigo"
                          >
                            {product.name}
                          </Link>
                          <p className="text-sm text-ink-soft">
                            ₹{(product.price || 0).toLocaleString('en-IN')} /{' '}
                            {product.unit || 'meters'}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            <span className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                              Selected
                            </span>
                            {selectedColor ? (
                              <span className="inline-flex items-center gap-2 border border-line bg-white/50 px-2.5 py-1 text-sm">
                                <span
                                  className="h-3 w-3 shrink-0 border border-ink/15"
                                  style={{ background: previewHex }}
                                />
                                {selectedColor}
                              </span>
                            ) : (
                              <span className="text-sm text-ink-soft">No colorway selected</span>
                            )}
                          </div>

                          {product.specifications?.composition && (
                            <p className="line-clamp-2 text-sm leading-relaxed text-ink-soft">
                              {product.specifications.composition}
                              {product.specifications.gsm
                                ? ` · GSM ${product.specifications.gsm}`
                                : ''}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 sm:text-right">
                          <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                            Line total
                          </p>
                          <p className="mt-1 text-xl font-semibold tabular-nums leading-none">
                            ₹{lineTotal.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-line/80 pt-4">
                        <div className="space-y-1.5">
                          <label
                            htmlFor={`qty-${lineKey}`}
                            className="block text-[11px] uppercase tracking-[0.14em] text-ink-soft"
                          >
                            Quantity ({product.unit || 'meters'})
                          </label>
                          <input
                            id={`qty-${lineKey}`}
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(product._id, Number(e.target.value), selectedColor)
                            }
                            className="input-field w-28"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(product._id, selectedColor)}
                          className="inline-flex items-center gap-1.5 border border-line px-3 py-2 text-sm text-rust hover:border-rust"
                        >
                          <TrashIcon className="h-4 w-4 shrink-0" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="panel-surface h-fit overflow-hidden lg:sticky lg:top-24">
            <div className="bg-ink px-5 py-5 text-linen">
              <p className="text-[11px] uppercase tracking-[0.16em] text-linen/60">
                🧾 Order summary
              </p>
              <p className="mt-3 font-display text-4xl leading-none">
                ₹{subtotal.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="space-y-4 p-5">
              <div className="space-y-2 border-b border-line pb-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-soft">Line items</span>
                  <span className="font-medium tabular-nums">{items.length}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-soft">Subtotal</span>
                  <span className="font-medium tabular-nums">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-ink-soft">
                Prototype checkout — shipping next, no payment gateway.
              </p>
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="btn-primary inline-flex w-full items-center justify-center gap-2"
              >
                Continue to checkout
                <ArrowRightIcon className="h-4 w-4" />
              </button>
              <Link to="/" className="block text-center text-sm text-indigo">
                Keep sourcing
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
