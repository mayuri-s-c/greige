import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ConfirmDialog from '../components/ConfirmDialog';
import { fabricAccent, colorwayHex, pickPreviewColorway } from '../components/ProductCard';
import { EmptyState, SectionEyebrow } from '../components/ui';
import { useToastStore } from '../store/toastStore';
import { PlusIcon, TrashIcon } from '../components/Icons';

export default function BoardsPage() {
  const pushToast = useToastStore((s) => s.pushToast);
  const [boards, setBoards] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [creating, setCreating] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [moveProduct, setMoveProduct] = useState(null);
  const [moveTargetId, setMoveTargetId] = useState('');
  const [moving, setMoving] = useState(false);

  async function load(preferId) {
    setLoading(true);
    try {
      const { data } = await api.get('/boards');
      const next = [...(data.boards || [])].sort((a, b) =>
        String(a.name || '').localeCompare(String(b.name || ''), undefined, {
          sensitivity: 'base',
        }),
      );
      setBoards(next);

      setSelectedId((current) => {
        const want = preferId ?? current;
        if (want && next.some((b) => b._id === want)) return want;
        return next[0]?._id || null;
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const selected = useMemo(
    () => boards.find((b) => b._id === selectedId) || null,
    [boards, selectedId],
  );

  const otherBoards = useMemo(
    () => boards.filter((b) => b._id !== selectedId),
    [boards, selectedId],
  );

  const productCount = selected?.products?.length || 0;

  async function handleCreate() {
    const name = createName.trim();
    if (!name || creating) return;
    setCreating(true);
    try {
      const { data } = await api.post('/boards', { name });
      setCreateOpen(false);
      setCreateName('');
      pushToast({ title: 'Board created', body: `"${data.board.name}" is ready.`, tone: 'success' });
      await load(data.board._id);
    } catch (err) {
      pushToast({
        title: 'Could not create board',
        body: err.response?.data?.message || err.message,
        tone: 'error',
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!selected || deleting) return;
    setDeleting(true);
    try {
      const name = selected.name;
      await api.delete(`/boards/${selected._id}`);
      setDeleteOpen(false);
      pushToast({ title: 'Board deleted', body: `"${name}" was removed.`, tone: 'success' });
      await load(null);
    } catch (err) {
      pushToast({
        title: 'Could not delete board',
        body: err.response?.data?.message || err.message,
        tone: 'error',
      });
    } finally {
      setDeleting(false);
    }
  }

  async function removeItem(productId) {
    if (!selected) return;
    try {
      await api.delete(`/boards/${selected._id}/products/${productId}`);
      pushToast({ title: 'Removed from board', tone: 'success' });
      await load(selected._id);
    } catch (err) {
      pushToast({
        title: 'Could not remove item',
        body: err.response?.data?.message || err.message,
        tone: 'error',
      });
    }
  }

  async function handleMove() {
    if (!selected || !moveProduct || !moveTargetId || moving) return;
    setMoving(true);
    try {
      await api.post(`/boards/${selected._id}/move`, {
        productId: moveProduct._id,
        targetBoardId: moveTargetId,
      });
      const targetName = boards.find((b) => b._id === moveTargetId)?.name || 'another board';
      setMoveProduct(null);
      setMoveTargetId('');
      pushToast({
        title: 'Moved to board',
        body: `${moveProduct.name} → ${targetName}`,
        tone: 'success',
      });
      await load(selected._id);
    } catch (err) {
      pushToast({
        title: 'Could not move item',
        body: err.response?.data?.message || err.message,
        tone: 'error',
      });
    } finally {
      setMoving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <SectionEyebrow>Shortlists</SectionEyebrow>
          <h1 className="mt-1 font-display text-3xl leading-none md:text-4xl">Boards</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreateName('');
            setCreateOpen(true);
          }}
          className="btn-primary inline-flex shrink-0 items-center gap-1.5 px-3 py-2 text-sm"
        >
          <PlusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">New board</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {loading && boards.length === 0 ? (
        <p className="mt-8 text-sm text-ink-soft">Loading boards…</p>
      ) : boards.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No boards yet"
            body="Create a collection, then save cloths from any Cloth Passport."
            action={
              <button type="button" onClick={() => setCreateOpen(true)} className="text-sm text-indigo">
                Create your first board →
              </button>
            }
          />
        </div>
      ) : (
        <div className="mt-5 space-y-4 md:mt-6">
          {/* Board switcher — chips, not a heavy sidebar */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scroll-thin md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
            {boards.map((board) => {
              const count = board.products?.length || 0;
              const active = board._id === selectedId;
              return (
                <button
                  key={board._id}
                  type="button"
                  onClick={() => setSelectedId(board._id)}
                  className={`inline-flex shrink-0 items-center gap-2 border px-3 py-2 text-sm transition ${
                    active
                      ? 'border-ink bg-ink text-linen'
                      : 'border-line bg-white/40 text-ink-soft hover:border-ink/40 hover:text-ink'
                  }`}
                >
                  <span className="max-w-[10rem] truncate font-medium md:max-w-[14rem]">
                    {board.name}
                  </span>
                  <span
                    className={`tabular-nums text-[11px] ${
                      active ? 'text-linen/65' : 'text-ink-soft'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {selected ? (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                <p className="text-sm text-ink-soft">
                  {productCount === 0
                    ? 'Empty board'
                    : `${productCount} cloth${productCount === 1 ? '' : 's'}`}
                </p>
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-rust hover:underline"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  Delete board
                </button>
              </div>

              {productCount > 0 ? (
                <ul className="divide-y divide-line/80 border border-line bg-white/30">
                  {selected.products.map((product) => {
                    const accent = fabricAccent(product.name || '');
                    const colorway = pickPreviewColorway(product.colors);
                    const preview = colorway ? colorwayHex(colorway, accent) : accent;
                    return (
                      <li
                        key={product._id}
                        className="flex items-center gap-3 px-3 py-2.5 md:gap-4 md:px-4 md:py-3"
                      >
                        <Link
                          to={`/products/${product._id}`}
                          className="flex min-w-0 flex-1 items-center gap-3 md:gap-4"
                        >
                          <span
                            className="h-11 w-11 shrink-0 border border-line/60 md:h-12 md:w-12"
                            style={{
                              background: `linear-gradient(145deg, ${preview}, #e2dfd8)`,
                            }}
                            aria-hidden
                          />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-ink md:text-[15px]">
                              {product.name}
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] text-ink-soft md:text-xs">
                              {product.category || 'Fabric'}
                              {colorway ? ` · ${colorway}` : ''}
                              {' · '}
                              ₹{(product.price || 0).toLocaleString('en-IN')}/
                              {product.unit || 'm'}
                            </span>
                          </span>
                        </Link>

                        <div className="flex shrink-0 items-center gap-1 md:gap-2">
                          {otherBoards.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                setMoveProduct(product);
                                setMoveTargetId(otherBoards[0]._id);
                              }}
                              className="px-2 py-1.5 text-[11px] text-ink-soft hover:text-ink md:text-xs"
                            >
                              Move
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => removeItem(product._id)}
                            aria-label={`Remove ${product.name}`}
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-[11px] text-rust hover:underline md:text-xs"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState
                  title="Nothing shortlisted"
                  body="Open a Cloth Passport and save fabrics into this board."
                  action={
                    <Link to="/" className="text-sm text-indigo">
                      Browse Greige Floor →
                    </Link>
                  }
                />
              )}
            </>
          ) : null}
        </div>
      )}

      <ConfirmDialog
        open={createOpen}
        title="Create board"
        body="Name a collection for this sourcing shortlist."
        confirmLabel={creating ? 'Creating…' : 'Create board'}
        confirmDisabled={!createName.trim() || creating}
        onClose={() => !creating && setCreateOpen(false)}
        onConfirm={handleCreate}
      >
        <label className="block text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          Board name
          <input
            autoFocus
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreate();
              }
            }}
            placeholder="e.g. Resort SS27"
            className="input-field mt-2"
          />
        </label>
      </ConfirmDialog>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete board?"
        body={
          selected
            ? `"${selected.name}" and its shortlist references will be removed. Cloths stay in the catalog.`
            : ''
        }
        confirmLabel={deleting ? 'Deleting…' : 'Delete board'}
        cancelLabel="Keep board"
        tone="danger"
        confirmDisabled={deleting}
        onClose={() => !deleting && setDeleteOpen(false)}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={Boolean(moveProduct)}
        title="Change board"
        body={moveProduct ? `Move “${moveProduct.name}” to another collection.` : ''}
        confirmLabel={moving ? 'Moving…' : 'Move item'}
        confirmDisabled={!moveTargetId || moving}
        onClose={() => {
          if (moving) return;
          setMoveProduct(null);
          setMoveTargetId('');
        }}
        onConfirm={handleMove}
      >
        <label className="block text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          Destination board
          <select
            value={moveTargetId}
            onChange={(e) => setMoveTargetId(e.target.value)}
            className="input-field mt-2"
          >
            {otherBoards.map((board) => (
              <option key={board._id} value={board._id}>
                {board.name}
              </option>
            ))}
          </select>
        </label>
      </ConfirmDialog>
    </div>
  );
}
