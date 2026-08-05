import { useEffect, useMemo, useState } from 'react';
import api from '../../api/client';
import ConfirmDialog from '../../components/ConfirmDialog';
import { OrderActivityList, OrderDatesMeta } from '../../components/OrderActivity';
import { SectionEyebrow, StatusBadge, EmptyState } from '../../components/ui';
import { ArrowRightIcon } from '../../components/Icons';
import { useToastStore } from '../../store/toastStore';
import {
  formatOrderDate,
  formatOrderDateTime,
  latestHistory,
} from '../../utils/orderHistory';

const PIPELINE = [
  { status: 'pending', label: 'Pending', hint: 'Awaiting mill accept', terminal: false },
  { status: 'accepted', label: 'Accepted', hint: 'Confirmed for loom', terminal: false },
  { status: 'preparing', label: 'Preparing', hint: 'Cutting & packing', terminal: false },
  { status: 'ready_for_dispatch', label: 'Ready', hint: 'Ready to ship', terminal: false },
  { status: 'completed', label: 'Completed', hint: 'Fulfilled', terminal: true },
  { status: 'declined', label: 'Declined', hint: 'Cannot complete', terminal: true },
  { status: 'cancelled', label: 'Cancelled', hint: 'Cancelled by buyer', terminal: true },
];

const CLOSED_STATUSES = new Set(['completed', 'declined', 'cancelled']);

function nextStatus(current) {
  const idx = PIPELINE.findIndex((s) => s.status === current);
  if (idx < 0 || PIPELINE[idx].terminal) return null;
  const following = PIPELINE.slice(idx + 1).find((s) => !s.terminal);
  return following || null;
}

function orderMatchesQuery(order, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  const latest = latestHistory(order);
  const haystack = [
    order._id,
    order.buyer?.name,
    order.buyer?.email,
    order.statusReason,
    latest.summary,
    ...(order.items || []).flatMap((item) => [item.name, item.color]),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

export default function SupplierOrdersPage() {
  const pushToast = useToastStore((s) => s.pushToast);
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/supplier');
      setOrders(data.orders || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const map = Object.fromEntries(PIPELINE.map((s) => [s.status, 0]));
    for (const order of orders) {
      if (map[order.status] != null) map[order.status] += 1;
    }
    return map;
  }, [orders]);

  const activeCount = useMemo(
    () => orders.filter((o) => !CLOSED_STATUSES.has(o.status)).length,
    [orders],
  );

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (stageFilter === 'active') {
      list = list.filter((o) => !CLOSED_STATUSES.has(o.status));
    } else if (stageFilter !== 'all') {
      list = list.filter((o) => o.status === stageFilter);
    }
    list = list.filter((o) => orderMatchesQuery(o, query.trim()));
    return [...list].sort(
      (a, b) =>
        new Date(b.lastModifiedAt || b.updatedAt || b.createdAt) -
        new Date(a.lastModifiedAt || a.updatedAt || a.createdAt),
    );
  }, [orders, stageFilter, query]);

  const activeStage = PIPELINE.find((s) => s.status === stageFilter);

  async function updateStatus(orderId, status, statusReason = '') {
    if (updating) return;
    setUpdating(true);
    try {
      await api.patch(`/orders/${orderId}/status`, { status, statusReason });
      await load();
      const { data } = await api.get(`/orders/${orderId}`);
      setSelected(data.order);
      if (status === 'declined') {
        pushToast({
          title: 'Order declined',
          body: 'Buyer can see the reason on their studio.',
          tone: 'info',
        });
      }
    } catch (err) {
      pushToast({
        title: 'Could not update status',
        body: err.response?.data?.message || err.message || 'Please try again.',
        tone: 'error',
      });
    } finally {
      setUpdating(false);
    }
  }

  function requestStatusChange(status) {
    if (!selected || status === selected.status) return;
    if (status === 'declined') {
      setDeclineReason(selected.statusReason || '');
      setDeclineOpen(true);
      return;
    }
    updateStatus(selected._id, status);
  }

  async function confirmDecline() {
    if (!selected) return;
    const reason = declineReason.trim();
    if (reason.length < 3) {
      pushToast({
        title: 'Reason required',
        body: 'Explain why this order cannot be completed (at least 3 characters).',
        tone: 'error',
      });
      return;
    }
    await updateStatus(selected._id, 'declined', reason);
    setDeclineOpen(false);
    setDeclineReason('');
  }

  const advance = selected ? nextStatus(selected.status) : null;

  return (
    <div className="space-y-5 md:space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-4">
        <div>
          <SectionEyebrow>Fulfillment</SectionEyebrow>
          <h1 className="mt-1 font-display text-3xl leading-none md:mt-2 md:text-5xl">
            Order pipeline
          </h1>
          <p className="mt-2 hidden text-ink-soft md:mt-3 md:block">
            Filter by stage, advance fulfillment, or decline with a clear reason.
          </p>
        </div>
        <div className="flex gap-5 text-sm md:gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">Active</p>
            <p className="mt-0.5 font-display text-2xl leading-none tabular-nums md:mt-1 md:text-3xl">
              {activeCount}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">Total</p>
            <p className="mt-0.5 font-display text-2xl leading-none tabular-nums md:mt-1 md:text-3xl">
              {orders.length}
            </p>
          </div>
        </div>
      </div>

      <div
        className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 scroll-thin md:mx-0 md:flex-wrap md:gap-2 md:overflow-visible md:px-0 md:pb-0"
        role="tablist"
        aria-label="Order stage filter"
      >
        {[
          { key: 'all', label: 'All', count: orders.length },
          { key: 'active', label: 'Active', count: activeCount },
          ...PIPELINE.map((s) => ({ key: s.status, label: s.label, count: counts[s.status] || 0 })),
        ].map((tab) => {
          const active = stageFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setStageFilter(tab.key)}
              className={`inline-flex shrink-0 items-center gap-1.5 border px-2.5 py-1.5 text-xs transition md:gap-2 md:px-3 md:py-2 md:text-sm ${
                active
                  ? 'border-ink bg-ink text-linen'
                  : 'border-line bg-panel text-ink-soft hover:border-ink/40 hover:text-ink'
              }`}
            >
              {tab.label}
              <span
                className={`tabular-nums ${
                  active ? 'text-linen/70' : 'text-ink-soft'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {loading && orders.length === 0 ? (
        <p className="text-ink-soft">Loading pipeline…</p>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          body="When buyers checkout, orders will land in Pending."
          emoji="📦"
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
            <div>
              <p className="font-display text-2xl leading-none md:text-3xl">
                {stageFilter === 'all'
                  ? 'All orders'
                  : stageFilter === 'active'
                    ? 'Active orders'
                    : activeStage?.label || 'Orders'}
              </p>
              <p className="mt-1 text-xs text-ink-soft md:text-sm">
                {filteredOrders.length} shown
                {activeStage?.hint ? ` · ${activeStage.hint}` : ''}
              </p>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search order, buyer, cloth…"
              className="input-field w-full py-2 text-sm sm:max-w-xs"
            />
          </div>

          {filteredOrders.length === 0 ? (
            <div className="flex min-h-[min(40vh,280px)] items-center justify-center border border-dashed border-line px-4 py-10 text-center text-sm text-ink-soft">
              No orders match this filter
              {query.trim() ? ' and search' : ''}.
            </div>
          ) : (
            <div className="panel-surface overflow-hidden">
              <div className="min-h-[min(40vh,280px)] max-h-[min(52vh,560px)] overflow-auto scroll-thin md:max-h-[min(60vh,640px)] lg:max-h-[min(70vh,720px)]">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-ink text-linen">
                    <tr className="text-[11px] uppercase tracking-[0.14em] text-linen/65">
                      <th className="px-4 py-3 font-medium">Order</th>
                      <th className="px-4 py-3 font-medium">Buyer</th>
                      <th className="px-4 py-3 font-medium">Latest update</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                      <th className="px-4 py-3 font-medium">Modified</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const latest = latestHistory(order);
                      return (
                        <tr
                          key={order._id}
                          onClick={() => setSelected(order)}
                          className="cursor-pointer border-t border-line/80 transition hover:bg-white/50"
                        >
                          <td className="px-4 py-3 align-top">
                            <p className="font-medium tabular-nums">#{order._id.slice(-8)}</p>
                            <p className="mt-0.5 text-xs text-ink-soft">
                              {order.items?.length || 0} line
                              {(order.items?.length || 0) === 1 ? '' : 's'}
                            </p>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <p className="font-medium">{order.buyer?.name || 'Buyer'}</p>
                            <p className="mt-0.5 text-xs text-ink-soft">{order.buyer?.email}</p>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <p className="max-w-[220px] text-sm font-medium leading-snug">
                              {latest.summary}
                            </p>
                            {latest.reason ? (
                              <p className="mt-1 max-w-[220px] truncate text-xs text-ink-soft">
                                {latest.reason}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-4 py-3 align-top text-ink-soft">
                            {formatOrderDate(order.createdAt)}
                          </td>
                          <td className="px-4 py-3 align-top text-ink-soft">
                            {formatOrderDate(
                              order.lastModifiedAt || order.updatedAt || latest.changedAt,
                            )}
                          </td>
                          <td className="px-4 py-3 align-top font-semibold tabular-nums">
                            ₹{(order.subtotal || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 align-top">
                            <StatusBadge status={order.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(selected) && !declineOpen}
        title={selected ? `Order #${selected._id.slice(-8)}` : 'Order'}
        body={
          selected
            ? `${selected.buyer?.name || 'Buyer'} · created ${formatOrderDateTime(selected.createdAt)}`
            : ''
        }
        showActions={false}
        size="lg"
        onClose={() => !updating && setSelected(null)}
      >
        {selected ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusBadge status={selected.status} />
              <p className="font-display text-3xl leading-none tabular-nums">
                ₹{(selected.subtotal || 0).toLocaleString('en-IN')}
              </p>
            </div>

            <OrderDatesMeta order={selected} />

            {(selected.status === 'declined' || selected.status === 'cancelled') &&
            selected.statusReason ? (
              <div className="border border-rust/30 bg-[#fce8e6]/70 px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-rust">
                  {selected.status === 'cancelled' ? 'Cancellation reason' : 'Decline reason'}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink">{selected.statusReason}</p>
              </div>
            ) : null}

            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                Activity
              </p>
              <OrderActivityList order={selected} />
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">Buyer</p>
              <p className="mt-1 text-sm font-medium">{selected.buyer?.name}</p>
              <p className="text-sm text-ink-soft">{selected.buyer?.email}</p>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">Line items</p>
              <ul className="mt-2 max-h-48 divide-y divide-line/80 overflow-y-auto border border-line scroll-thin">
                {(selected.items || []).map((item, i) => (
                  <li
                    key={`${item.product}-${i}`}
                    className="flex justify-between gap-3 px-3 py-2.5 text-sm"
                  >
                    <span className="min-w-0">
                      <span className="font-medium">{item.name}</span>
                      <span className="mt-0.5 block text-ink-soft">
                        × {item.quantity}
                        {item.color ? ` · ${item.color}` : ''}
                      </span>
                    </span>
                    <span className="shrink-0 tabular-nums">
                      ₹{((item.price || 0) * (item.quantity || 0)).toLocaleString('en-IN')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {selected.shipping ? (
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">Ship to</p>
                <p className="mt-1 text-sm text-ink">
                  {selected.shipping.fullName}
                  {selected.shipping.phone ? ` · ${selected.shipping.phone}` : ''}
                </p>
                <p className="text-sm text-ink-soft">
                  {[
                    selected.shipping.addressLine1,
                    selected.shipping.city,
                    selected.shipping.state,
                    selected.shipping.postalCode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            ) : null}

            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                Pipeline stage
              </p>
              {CLOSED_STATUSES.has(selected.status) && selected.status !== 'completed' ? (
                <p className="text-sm text-ink-soft">
                  This order is {selected.status.replaceAll('_', ' ')} and can no longer be advanced.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {PIPELINE.filter((stage) => stage.status !== 'cancelled').map((stage) => {
                    const isCurrent = stage.status === selected.status;
                    return (
                      <button
                        key={stage.status}
                        type="button"
                        disabled={updating || isCurrent || CLOSED_STATUSES.has(selected.status)}
                        onClick={() => requestStatusChange(stage.status)}
                        className={`px-2.5 py-1.5 text-xs capitalize transition disabled:cursor-default ${
                          isCurrent
                            ? stage.status === 'declined'
                              ? 'bg-rust text-linen'
                              : 'bg-ink text-linen'
                            : stage.status === 'declined'
                              ? 'border border-rust/40 text-rust hover:border-rust'
                              : 'border border-line text-ink-soft hover:border-ink/40 hover:text-ink'
                        }`}
                      >
                        {stage.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {advance ? (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => requestStatusChange(advance.status)}
                  className="btn-primary inline-flex flex-1 items-center justify-center gap-2 disabled:opacity-60"
                >
                  {updating ? 'Updating…' : `Advance to ${advance.label}`}
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              ) : selected.status === 'completed' ? (
                <p className="flex-1 border border-line bg-white/40 px-3 py-2.5 text-center text-sm text-ink-soft">
                  This order is fully completed.
                </p>
              ) : selected.status === 'declined' ? (
                <p className="flex-1 border border-rust/30 bg-[#fce8e6]/50 px-3 py-2.5 text-center text-sm text-ink-soft">
                  Order declined — reason shared with buyer.
                </p>
              ) : selected.status === 'cancelled' ? (
                <p className="flex-1 border border-line bg-white/40 px-3 py-2.5 text-center text-sm text-ink-soft">
                  Buyer cancelled this order.
                </p>
              ) : null}

              {!CLOSED_STATUSES.has(selected.status) ? (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => requestStatusChange('declined')}
                  className="border border-rust/40 px-4 py-2.5 text-sm text-rust hover:border-rust disabled:opacity-60"
                >
                  Decline order
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </ConfirmDialog>

      <ConfirmDialog
        open={declineOpen}
        title="Decline order?"
        body="Tell the buyer why this order cannot be completed. This reason is required and visible to both sides."
        confirmLabel={updating ? 'Declining…' : 'Decline order'}
        cancelLabel="Keep order"
        tone="danger"
        confirmDisabled={updating || declineReason.trim().length < 3}
        onClose={() => {
          if (updating) return;
          setDeclineOpen(false);
          setDeclineReason('');
        }}
        onConfirm={confirmDecline}
      >
        <label className="block text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          Reason
          <textarea
            autoFocus
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            rows={4}
            placeholder="e.g. MOQ not met, yarn shortage, colorway discontinued…"
            className="input-field mt-2 resize-y normal-case tracking-normal"
          />
        </label>
        <p className="mt-2 text-xs text-ink-soft">Minimum 3 characters.</p>
      </ConfirmDialog>
    </div>
  );
}
