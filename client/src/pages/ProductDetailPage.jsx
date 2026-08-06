import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWarpStore } from '../store/warpStore';
import { useToastStore } from '../store/toastStore';
import { fabricAccent, colorwayHex, colorwayGradient } from '../components/ProductCard';
import ProductCard from '../components/ProductCard';
import { SectionEyebrow, StatusBadge } from '../components/ui';
import WarpIcon from '../components/WarpIcon';
import CompareLoomModal from '../components/CompareLoomModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { BoardIcon, CartIcon, CompareIcon, CheckIcon, SampleIcon } from '../components/Icons';

function sortBoards(list = []) {
  return [...list].sort((a, b) =>
    String(a.name || '').localeCompare(String(b.name || ''), undefined, {
      sensitivity: 'base',
    }),
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const openWarp = useWarpStore((s) => s.openWarp);
  const pushToast = useToastStore((s) => s.pushToast);
  const isGuest = !token || !user;

  function requireBuyer(actionLabel) {
    if (!isGuest) return true;
    pushToast({
      title: 'Sign in to continue',
      body: `${actionLabel} needs a buyer account. You can still browse and ask Warp as a guest.`,
      tone: 'error',
    });
    navigate('/login', { state: { from: location } });
    return false;
  }
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [qty, setQty] = useState(50);
  const [boards, setBoards] = useState([]);
  const [activeColor, setActiveColor] = useState('');
  const [cartAction, setCartAction] = useState('idle'); // idle | adding | added
  const cartResetRef = useRef(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareNote, setCompareNote] = useState('');
  const [compareProduct, setCompareProduct] = useState(null);
  const [boardPickerOpen, setBoardPickerOpen] = useState(false);
  const [boardPickerMode, setBoardPickerMode] = useState('save'); // 'save' | 'change'
  const [changeFromBoard, setChangeFromBoard] = useState(null);
  const [boardQuery, setBoardQuery] = useState('');
  const [savingBoardId, setSavingBoardId] = useState('');

  useEffect(() => {
    return () => {
      if (cartResetRef.current) clearTimeout(cartResetRef.current);
    };
  }, []);

  useEffect(() => {
    setProduct(null);
    setCartAction('idle');
    setCompareOpen(false);
    setCompareNote('');
    setCompareProduct(null);
    setBoardPickerOpen(false);
    setChangeFromBoard(null);
    api.get(`/products/${id}`).then(({ data }) => {
      setProduct(data.product);
      setActiveColor(data.product?.colors?.[0] || '');
    });
    api.post('/ai/similar', { productId: id }).then(({ data }) => setSimilar(data.products || []));
    if (token) {
      api.get('/boards').then(({ data }) => setBoards(sortBoards(data.boards || []))).catch(() => setBoards([]));
    } else {
      setBoards([]);
    }
  }, [id, token]);

  const savedBoards = useMemo(() => {
    if (!id) return [];
    return boards.filter((board) =>
      (board.products || []).some((p) => String(p._id || p) === String(id)),
    );
  }, [boards, id]);

  const filteredBoards = useMemo(() => {
    const q = boardQuery.trim().toLowerCase();
    if (!q) return boards;
    return boards.filter((b) => b.name.toLowerCase().includes(q));
  }, [boards, boardQuery]);

  function openBoardPicker() {
    if (!requireBuyer('Saving to a board')) return;
    setBoardQuery('');
    if (savedBoards.length > 0) {
      setBoardPickerMode('change');
      setChangeFromBoard(savedBoards[0]);
    } else {
      setBoardPickerMode('save');
      setChangeFromBoard(null);
    }
    setBoardPickerOpen(true);
  }

  function resetBoardPicker() {
    setBoardPickerOpen(false);
    setBoardQuery('');
    setChangeFromBoard(null);
    setBoardPickerMode('save');
  }

  function closeBoardPicker() {
    if (savingBoardId) return;
    resetBoardPicker();
  }

  async function refreshBoards() {
    const { data } = await api.get('/boards');
    setBoards(sortBoards(data.boards || []));
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-ink-soft md:px-6">
        Loading cloth passport…
      </div>
    );
  }

  const accent = fabricAccent(product.name);
  const previewColor = colorwayHex(activeColor, accent);
  const specs = product.specifications || {};
  const outOfStock =
    product.status === 'out_of_stock' ||
    product.status !== 'available' ||
    Number(product.stock) <= 0;
  const isLight =
    ['ivory', 'white', 'off-white', 'champagne', 'ecru', 'sand', 'natural', 'beige', 'sky'].some(
      (c) => activeColor.toLowerCase().includes(c),
    );

  async function addToCart() {
    if (!requireBuyer('Adding to cart')) return;
    if (cartAction === 'adding' || cartAction === 'added') return;

    if (outOfStock) {
      pushToast({
        title: 'Out of stock',
        body: 'This cloth is currently unavailable to add to cart.',
        tone: 'error',
      });
      return;
    }

    if (!activeColor && (product.colors || []).length > 0) {
      pushToast({
        title: 'Select a colorway',
        body: 'Choose a color before adding this cloth to your cart.',
        tone: 'error',
      });
      return;
    }

    setCartAction('adding');
    try {
      await addItem(product._id, qty, activeColor || '');
      setCartAction('added');
      if (cartResetRef.current) clearTimeout(cartResetRef.current);
      cartResetRef.current = setTimeout(() => setCartAction('idle'), 2000);
    } catch (err) {
      setCartAction('idle');
      pushToast({
        title: 'Could not add to cart',
        body: err.response?.data?.message || err.message || 'Please try again.',
        tone: 'error',
      });
    }
  }

  async function addToBoard(board) {
    if (!board || savingBoardId) return;
    setSavingBoardId(board._id);
    try {
      await api.post(`/boards/${board._id}/products`, { productId: product._id });
      resetBoardPicker();
      pushToast({
        title: 'Saved to board',
        body: `${product.name} → ${board.name}`,
        tone: 'success',
      });
      await refreshBoards();
    } catch (err) {
      pushToast({
        title: 'Could not save to board',
        body: err.response?.data?.message || err.message || 'Please try again.',
        tone: 'error',
      });
    } finally {
      setSavingBoardId('');
    }
  }

  async function changeBoard(targetBoard) {
    if (!targetBoard || !changeFromBoard || savingBoardId) return;
    const fromName = changeFromBoard.name;
    const fromId = changeFromBoard._id;
    setSavingBoardId(targetBoard._id);
    try {
      await api.post(`/boards/${fromId}/move`, {
        productId: product._id,
        targetBoardId: targetBoard._id,
      });
      resetBoardPicker();
      pushToast({
        title: 'Board updated',
        body: `${product.name}: ${fromName} → ${targetBoard.name}`,
        tone: 'success',
      });
      await refreshBoards();
    } catch (err) {
      pushToast({
        title: 'Could not change board',
        body: err.response?.data?.message || err.message || 'Please try again.',
        tone: 'error',
      });
    } finally {
      setSavingBoardId('');
    }
  }

  async function removeFromCurrentBoard() {
    if (!changeFromBoard || savingBoardId) return;
    const fromName = changeFromBoard.name;
    const fromId = changeFromBoard._id;
    setSavingBoardId(fromId);
    try {
      await api.delete(`/boards/${fromId}/products/${product._id}`);
      resetBoardPicker();
      pushToast({
        title: 'Removed from board',
        body: `${product.name} left “${fromName}”.`,
        tone: 'success',
      });
      await refreshBoards();
    } catch (err) {
      pushToast({
        title: 'Could not remove from board',
        body: err.response?.data?.message || err.message || 'Please try again.',
        tone: 'error',
      });
    } finally {
      setSavingBoardId('');
    }
  }

  async function askCompare() {
    if (!similar[0]) {
      pushToast({
        title: 'Nothing to compare yet',
        body: 'Similar cloths are still loading or unavailable.',
        tone: 'error',
      });
      return;
    }

    const other = similar[0];
    setCompareProduct(other);
    setCompareOpen(true);
    setCompareLoading(true);
    setCompareNote('');

    try {
      const { data } = await api.post('/ai/compare', {
        productIds: [product._id, other._id],
      });
      setCompareNote(data.reply || '');
    } catch {
      setCompareNote('Compare Loom could not finish this brief. Try again in a moment.');
    } finally {
      setCompareLoading(false);
    }
  }

  return (
    <div>
      <div className="border-b border-line bg-ink text-linen">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm md:px-6">
          <p className="text-linen/70">
            <Link to="/" className="hover:text-linen">
              Greige Floor
            </Link>
            <span className="mx-2 text-linen/40">/</span>
            <span>{product.category}</span>
            <span className="mx-2 text-linen/40">/</span>
            <span className="text-linen">{product.name}</span>
          </p>
          <StatusBadge status={product.status} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            key={activeColor || product._id}
            initial={{ opacity: 0.35, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="relative min-h-[520px] overflow-hidden"
            style={{
              background: colorwayGradient(activeColor, accent),
            }}
          >
            <div className="weave-overlay absolute inset-0 opacity-35" />
            <div
              className="absolute inset-0 opacity-25 mix-blend-multiply"
              style={{
                background: `radial-gradient(circle at 30% 25%, ${previewColor}, transparent 55%)`,
              }}
            />
            <div
              className={`absolute inset-x-0 bottom-0 bg-gradient-to-t p-6 ${
                isLight ? 'from-ink/40 to-transparent text-ink' : 'from-ink/55 to-transparent text-linen'
              }`}
            >
              <p
                className={`text-[11px] uppercase tracking-[0.2em] ${
                  isLight ? 'text-ink/60' : 'text-linen/70'
                }`}
              >
                Texture preview
              </p>
              <p className="mt-2 font-display text-3xl">{activeColor || 'Mill colorway'}</p>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className="h-5 w-5 border border-white/40"
                  style={{ background: previewColor }}
                />
                <span className={`text-xs ${isLight ? 'text-ink/70' : 'text-linen/75'}`}>
                  {previewColor.toUpperCase()}
                </span>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            <div>
              <SectionEyebrow emoji="🪪">Cloth passport</SectionEyebrow>
              <h1 className="mt-2 font-display text-5xl leading-[0.95] md:text-6xl">
                {product.name}
              </h1>
              <p className="mt-4 text-ink-soft">{product.description}</p>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4 border-y border-line py-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">Price</p>
                <p className="font-display text-4xl">
                  ₹{product.price}
                  <span className="ml-2 text-lg text-ink-soft">/ {product.unit}</span>
                </p>
              </div>
              <div className="text-right text-sm text-ink-soft">
                <p>
                  {product.stock} {product.unit} available
                </p>
                <p>{specs.composition}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-ink-soft">Colorways</p>
              <div className="flex flex-wrap gap-2">
                {(product.colors || []).map((c) => {
                  const swatch = colorwayHex(c, accent);
                  const selected = activeColor === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setActiveColor(c)}
                      className={`inline-flex items-center gap-2 border px-3 py-1.5 text-sm transition ${
                        selected
                          ? 'border-indigo bg-indigo text-linen'
                          : 'border-line hover:border-ink/40'
                      }`}
                    >
                      <span
                        className={`h-3.5 w-3.5 border ${
                          selected ? 'border-linen/50' : 'border-ink/20'
                        }`}
                        style={{ background: swatch }}
                      />
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px overflow-hidden border border-line bg-line sm:grid-cols-4">
              {[
                ['GSM', specs.gsm],
                ['Weave', specs.weave],
                ['Width', specs.width],
                ['Hand-feel', specs.handFeel],
                ['Finish', specs.finish],
                ['Composition', specs.composition],
                ['Unit', product.unit],
                ['Status', product.status?.replaceAll('_', ' ')],
              ].map(([k, v]) => (
                <div key={k} className="bg-linen p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">{k}</p>
                  <p className="mt-1 text-sm font-medium capitalize">{v || '—'}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="number"
                min={1}
                value={qty}
                disabled={outOfStock}
                onChange={(e) => setQty(Number(e.target.value))}
                className="input-field w-28 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="button"
                onClick={addToCart}
                disabled={outOfStock || cartAction === 'adding'}
                aria-live="polite"
                className={`inline-flex min-w-[10.5rem] items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium tracking-wide transition-colors duration-200 disabled:cursor-not-allowed ${
                  outOfStock
                    ? 'cursor-not-allowed border border-line bg-stone text-ink-soft opacity-70'
                    : cartAction === 'added'
                      ? 'border border-indigo/25 bg-indigo text-linen'
                      : cartAction === 'adding'
                        ? 'bg-ink text-linen'
                        : 'btn-primary'
                }`}
              >
                {outOfStock ? (
                  'Out of stock'
                ) : cartAction === 'adding' ? (
                  <>
                    <span
                      className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-linen/30 border-t-linen"
                      aria-hidden
                    />
                    Adding
                  </>
                ) : cartAction === 'added' ? (
                  <>
                    <CheckIcon className="h-4 w-4 shrink-0" />
                    Added to cart
                  </>
                ) : (
                  <>
                    <CartIcon className="h-4 w-4 shrink-0" />
                    Add to cart
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={openBoardPicker}
                className={`inline-flex max-w-[220px] items-center gap-2 ${
                  savedBoards.length > 0
                    ? 'border border-indigo/30 bg-indigo/10 px-4 py-2.5 text-indigo hover:border-indigo'
                    : 'btn-secondary'
                }`}
                title={
                  savedBoards.length > 0
                    ? 'Change or remove board'
                    : 'Save this cloth to a collection board'
                }
              >
                <BoardIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {savedBoards.length === 0
                    ? 'Save to board'
                    : savedBoards.length === 1
                      ? savedBoards[0].name
                      : `${savedBoards[0].name} +${savedBoards.length - 1}`}
                </span>
              </button>
              <button
                type="button"
                onClick={askCompare}
                disabled={compareLoading}
                className="btn-secondary inline-flex items-center gap-2 disabled:opacity-60"
              >
                <CompareIcon className="h-4 w-4" />
                {compareLoading ? 'Opening…' : 'Compare Loom'}
              </button>
              <Link
                to="/match"
                state={{
                  hex: colorwayHex(activeColor, accent),
                  targetGsm: product.specifications?.gsm,
                  category: product.category,
                }}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <SampleIcon className="h-4 w-4" />
                Sample Match
              </Link>
              <button
                type="button"
                onClick={() =>
                  openWarp(`Tell me about ${product.name} and similar alternatives`)
                }
                className="btn-accent inline-flex items-center gap-2"
              >
                <WarpIcon className="h-4 w-4" />
                Ask Warp
              </button>
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <section className="mt-16">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <SectionEyebrow emoji="✨">Adjacent cloths</SectionEyebrow>
                <h2 className="mt-2 font-display text-4xl">Similar on the floor</h2>
              </div>
              <Link to="/" className="text-sm text-indigo">
                Back to floor →
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {similar.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      <ConfirmDialog
        open={boardPickerOpen}
        title={boardPickerMode === 'change' ? 'Change board' : 'Save to board'}
        body={
          boardPickerMode === 'change'
            ? `Currently on “${changeFromBoard?.name || 'board'}”. Pick another board to move it, or remove it.`
            : 'Search and pick a collection for this cloth.'
        }
        showActions={false}
        onClose={closeBoardPicker}
      >
        {boards.length === 0 ? (
          <div className="space-y-3 py-2">
            <p className="text-sm text-ink-soft">No boards yet. Create one first.</p>
            <Link
              to="/boards"
              className="inline-block text-sm text-indigo"
              onClick={resetBoardPicker}
            >
              Open collection boards →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {boards.length > 5 ? (
              <input
                autoFocus
                value={boardQuery}
                onChange={(e) => setBoardQuery(e.target.value)}
                placeholder="Search boards…"
                className="input-field"
              />
            ) : null}
            <ul className="max-h-64 divide-y divide-line/80 overflow-y-auto border border-line scroll-thin">
              {filteredBoards.length === 0 ? (
                <li className="px-3 py-4 text-sm text-ink-soft">No boards match that search.</li>
              ) : (
                filteredBoards.map((board) => {
                  const count = board.products?.length || 0;
                  const busy = savingBoardId === board._id;
                  const isCurrent =
                    boardPickerMode === 'change' && changeFromBoard?._id === board._id;
                  const alreadySaved =
                    boardPickerMode === 'save' &&
                    (board.products || []).some((p) => String(p._id || p) === String(product._id));

                  return (
                    <li key={board._id}>
                      <button
                        type="button"
                        disabled={Boolean(savingBoardId) || isCurrent || alreadySaved}
                        onClick={() =>
                          boardPickerMode === 'change'
                            ? changeBoard(board)
                            : addToBoard(board)
                        }
                        className={`flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition disabled:opacity-60 ${
                          isCurrent ? 'bg-indigo/10 text-indigo' : 'hover:bg-white/50'
                        }`}
                      >
                        <span className="min-w-0 truncate font-medium">
                          {busy
                            ? boardPickerMode === 'change'
                              ? 'Moving…'
                              : 'Saving…'
                            : isCurrent
                              ? `${board.name} · current`
                              : alreadySaved
                                ? `${board.name} · saved`
                                : board.name}
                        </span>
                        {count > 0 ? (
                          <span className="shrink-0 text-xs tabular-nums text-ink-soft">{count}</span>
                        ) : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
            {boardPickerMode === 'change' ? (
              <button
                type="button"
                disabled={Boolean(savingBoardId)}
                onClick={removeFromCurrentBoard}
                className="text-sm text-rust hover:underline disabled:opacity-60"
              >
                Remove from “{changeFromBoard?.name}”
              </button>
            ) : (
              <Link
                to="/boards"
                className="inline-block text-sm text-indigo"
                onClick={resetBoardPicker}
              >
                Manage boards →
              </Link>
            )}
          </div>
        )}
      </ConfirmDialog>

      <CompareLoomModal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        loading={compareLoading}
        reply={compareNote}
        currentProduct={product}
        compareProduct={compareProduct}
      />
    </div>
  );
}
