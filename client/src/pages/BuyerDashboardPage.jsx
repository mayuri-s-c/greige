import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useWarpStore } from '../store/warpStore';
import { useToastStore } from '../store/toastStore';
import ConfirmDialog from '../components/ConfirmDialog';
import { OrderActivityList, OrderDatesMeta } from '../components/OrderActivity';
import { MetricTile, SectionEyebrow, StatusBadge, EmptyState } from '../components/ui';
import WarpIcon from '../components/WarpIcon';
import { BoardIcon, CartIcon, HomeIcon, LoginIcon } from '../components/Icons';
import {
  formatOrderDate,
  formatOrderDateTime,
  isClosedOrder,
  latestHistory,
} from '../utils/orderHistory';

const progressSteps = ['pending', 'accepted', 'preparing', 'ready_for_dispatch', 'completed'];

const guestServices = [
  {
    emoji: '🧵',
    title: 'Greige Floor',
    body: 'Browse mill-true fabrics by GSM, composition, weave, and colorway — no account needed.',
    to: '/',
    cta: 'Browse floor',
    open: true,
  },
  {
    emoji: '✦',
    title: 'Warp assistant',
    body: 'Ask sourcing questions in plain language. Warp matches cloths from the live catalog.',
    action: 'warp',
    cta: 'Ask Warp',
    open: true,
  },
  {
    emoji: '📋',
    title: 'Collection boards',
    body: 'Shortlist fabrics into named boards for programs, seasons, or buyer reviews.',
    to: '/boards',
    cta: 'Sign in to use',
    open: false,
  },
  {
    emoji: '🛒',
    title: 'Cart & checkout',
    body: 'Move confirmed cloths to cart, set quantities, and place mill orders.',
    to: '/cart',
    cta: 'Sign in to use',
    open: false,
  },
  {
    emoji: '📦',
    title: 'Order studio',
    body: 'Track open orders, history, cancellations, and mill status updates in one desk.',
    to: '/login',
    cta: 'Sign in to track',
    open: false,
  },
];


function GuestStudio({ openWarp }) {
  const location = useLocation();

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <SectionEyebrow emoji="🏢">Buyer studio</SectionEyebrow>
          <h1 className="mt-2 font-display text-5xl leading-none">Explore GREIGE</h1>
          <p className="mt-3 max-w-xl text-ink-soft">
            Browse the floor, try Warp, and see what the sourcing desk unlocks once you create a
            buyer account.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/" className="btn-primary inline-flex items-center gap-2 text-sm">
            <HomeIcon className="h-4 w-4" />
            Browse floor
          </Link>
          <Link to="/match" className="btn-accent inline-flex items-center gap-2 text-sm">
            Sample Match
          </Link>
          <button
            type="button"
            onClick={() => openWarp('Suggest fabrics for a summer shirt program under 180 GSM')}
            className="btn-secondary inline-flex items-center gap-2 text-sm"
          >
            <WarpIcon className="h-4 w-4" />
            Ask Warp
          </button>
          <Link
            to="/login"
            state={{ from: location }}
            className="btn-secondary inline-flex items-center gap-2 text-sm"
          >
            <LoginIcon className="h-4 w-4" />
            Sign in
          </Link>
        </div>
      </div>

      <section className="panel-surface border border-indigo/20 bg-indigo/[0.04] p-6">
        <p className="text-[11px] uppercase tracking-[0.16em] text-indigo">Open without login</p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink">
          Greige Floor, Cloth Passports, Studio overview, and Warp are available to guests. Boards,
          cart, checkout, and live order tracking need a buyer account.
        </p>
      </section>

      <section>
        <SectionEyebrow emoji="✦">What you can do</SectionEyebrow>
        <h2 className="mt-1 font-display text-3xl">Services on GREIGE</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {guestServices.map((service) => (
            <article key={service.title} className="panel-surface flex flex-col p-5">
              <p className="text-2xl" aria-hidden>
                {service.emoji}
              </p>
              <div className="mt-3 flex items-start justify-between gap-2">
                <h3 className="font-display text-2xl leading-tight">{service.title}</h3>
                <span
                  className={`shrink-0 text-[10px] uppercase tracking-[0.14em] ${
                    service.open ? 'text-indigo' : 'text-ink-soft'
                  }`}
                >
                  {service.open ? 'Open now' : 'Account'}
                </span>
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{service.body}</p>
              {service.action === 'warp' ? (
                <button
                  type="button"
                  onClick={() => openWarp('What cotton fabrics do you have under 200 GSM?')}
                  className="btn-accent mt-5 inline-flex items-center gap-2 self-start text-sm"
                >
                  <WarpIcon className="h-4 w-4" />
                  {service.cta}
                </button>
              ) : (
                <Link
                  to={service.to}
                  state={service.open ? undefined : { from: location }}
                  className={`mt-5 inline-flex items-center gap-2 self-start text-sm ${
                    service.open ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {service.title === 'Collection boards' ? (
                    <BoardIcon className="h-4 w-4" />
                  ) : service.title === 'Cart & checkout' ? (
                    <CartIcon className="h-4 w-4" />
                  ) : service.open ? (
                    <HomeIcon className="h-4 w-4" />
                  ) : (
                    <LoginIcon className="h-4 w-4" />
                  )}
                  {service.cta}
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="panel-surface p-6 md:p-8">
        <SectionEyebrow emoji="📦">Orders after sign-in</SectionEyebrow>
        <h2 className="mt-1 font-display text-3xl">Your sourcing desk</h2>
        <p className="mt-2 max-w-xl text-sm text-ink-soft">
          Once signed in you’ll see open orders, history, spend, and mill status updates here —
          plus cancel with a reason when plans change.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <MetricTile emoji="📦" label="Open orders" value="—" tone="accent" />
          <MetricTile emoji="📜" label="History" value="—" />
          <MetricTile emoji="💰" label="Lifetime spend" value="—" />
        </div>
        <Link to="/register/buyer" className="btn-primary mt-6 inline-flex items-center gap-2 text-sm">
          Create buyer account
        </Link>
      </section>
    </div>
  );
}

function OrderProgress({ status }) {
  if (status === 'declined' || status === 'cancelled') return null;
  const activeIndex = progressSteps.indexOf(status);
  return (
    <div className="flex gap-1">
      {progressSteps.map((step, stepIndex) => (
        <span
          key={step}
          className={`h-1.5 w-8 ${stepIndex <= activeIndex ? 'bg-indigo' : 'bg-stone'}`}
          title={step.replaceAll('_', ' ')}
        />
      ))}
    </div>
  );
}

export default function BuyerDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const openWarp = useWarpStore((s) => s.openWarp);
  const pushToast = useToastStore((s) => s.pushToast);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [ordersTab, setOrdersTab] = useState('current');
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const isGuest = !token || !user;

  async function loadOrders() {
    const { data } = await api.get('/orders/mine');
    setOrders(data.orders || []);
  }

  useEffect(() => {
    if (isGuest) {
      setOrders([]);
      setProfile(null);
      setSelected(null);
      setQuery('');
      setCancelOpen(false);
      setCancelReason('');
      return;
    }
    loadOrders();
    api.get('/profiles/buyer').then(({ data }) => setProfile(data.profile));
  }, [isGuest]);

  const current = useMemo(
    () =>
      [...orders.filter((o) => !isClosedOrder(o))].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
    [orders],
  );
  const previous = useMemo(
    () =>
      [...orders.filter((o) => isClosedOrder(o))].sort(
        (a, b) =>
          new Date(b.lastModifiedAt || b.updatedAt || b.createdAt) -
          new Date(a.lastModifiedAt || a.updatedAt || a.createdAt),
      ),
    [orders],
  );
  const spend = useMemo(
    () => orders.reduce((sum, o) => sum + (o.subtotal || 0), 0),
    [orders],
  );

  const showingHistory = ordersTab === 'history';
  const tabOrders = showingHistory ? previous : current;

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tabOrders;
    return tabOrders.filter((order) => {
      const latest = latestHistory(order);
      const haystack = [
        order._id,
        order.status,
        order.statusReason,
        latest.summary,
        ...(order.items || []).flatMap((item) => [item.name, item.color]),
        order.shipping?.fullName,
        order.shipping?.city,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [tabOrders, query]);

  function switchTab(tab) {
    setOrdersTab(tab);
    setQuery('');
  }

  async function openOrder(order) {
    setSelected(order);
    try {
      const { data } = await api.get(`/orders/${order._id}`);
      setSelected(data.order);
    } catch {
      // keep list payload if detail fetch fails
    }
  }

  async function confirmCancel() {
    if (!selected) return;
    const reason = cancelReason.trim();
    if (reason.length < 3) {
      pushToast({
        title: 'Reason required',
        body: 'Explain why you are cancelling (at least 3 characters).',
        tone: 'error',
      });
      return;
    }

    setCancelling(true);
    try {
      const { data } = await api.patch(`/orders/${selected._id}/cancel`, {
        statusReason: reason,
      });
      setSelected(data.order);
      setCancelOpen(false);
      setCancelReason('');
      await loadOrders();
      pushToast({
        title: 'Order cancelled',
        body: 'The mill can see your cancellation reason.',
        tone: 'success',
      });
    } catch (err) {
      pushToast({
        title: 'Could not cancel order',
        body: err.response?.data?.message || err.message || 'Please try again.',
        tone: 'error',
      });
    } finally {
      setCancelling(false);
    }
  }

  if (isGuest) {
    return <GuestStudio openWarp={openWarp} />;
  }

  return (
    <>
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <SectionEyebrow emoji="🏢">Buyer studio</SectionEyebrow>
          <h1 className="mt-2 font-display text-5xl leading-none">Sourcing desk</h1>
          <p className="mt-3 text-ink-soft">
            {user?.name} · track orders, preferences, and active programs
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/" className="btn-primary inline-flex items-center gap-2 text-sm">
            <HomeIcon className="h-4 w-4" />
            Browse floor
          </Link>
          <Link to="/match" className="btn-accent inline-flex items-center gap-2 text-sm">
            Sample Match
          </Link>
          <button
            type="button"
            onClick={() => openWarp('Suggest fabrics for my next program')}
            className="btn-secondary inline-flex items-center gap-2 text-sm"
          >
            <WarpIcon className="h-4 w-4" />
            Ask Warp
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricTile emoji="📦" label="Open orders" value={current.length} tone="accent" />
        <MetricTile emoji="📜" label="History" value={previous.length} />
        <MetricTile emoji="💰" label="Lifetime spend" value={`₹${spend.toLocaleString('en-IN')}`} />
      </div>

      {profile && (
        <section className="panel-surface overflow-hidden">
          <div className="grid md:grid-cols-[1.2fr_0.8fr]">
            <div className="border-b border-line p-6 md:border-b-0 md:border-r">
              <SectionEyebrow emoji="👤">Buyer profile</SectionEyebrow>
              <h2 className="mt-2 font-display text-3xl">
                {profile.businessType || 'Business profile'}
              </h2>
              <p className="mt-3 text-ink-soft">
                {profile.industry || 'Industry unset'} · typical qty{' '}
                {profile.typicalOrderQuantity || '—'}
              </p>
              <p className="mt-2 text-sm text-ink-soft">Budget {profile.budgetRange || '—'}</p>
            </div>
            <div className="p-6">
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">Interest map</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(profile.categoriesOfInterest || []).map((c) => (
                  <span key={c} className="border border-line bg-white/40 px-3 py-1 text-sm">
                    {c}
                  </span>
                ))}
                {(profile.preferredFabricTypes || []).map((c) => (
                  <span key={c} className="bg-indigo/10 px-3 py-1 text-sm text-indigo">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionEyebrow emoji="📦">Orders</SectionEyebrow>
            <h2 className="mt-1 font-display text-3xl">
              {showingHistory ? 'Order history' : 'Current orders'}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              {filteredOrders.length} shown
              {query.trim() ? ' · filtered' : ''} · created + last update on each row
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="inline-flex border border-line bg-panel p-1">
              <button
                type="button"
                onClick={() => switchTab('current')}
                className={`px-3 py-2 text-sm transition ${
                  !showingHistory ? 'bg-ink text-linen' : 'text-ink-soft hover:text-ink'
                }`}
              >
                Current
                <span className="ml-1.5 tabular-nums opacity-70">{current.length}</span>
              </button>
              <button
                type="button"
                onClick={() => switchTab('history')}
                className={`px-3 py-2 text-sm transition ${
                  showingHistory ? 'bg-ink text-linen' : 'text-ink-soft hover:text-ink'
                }`}
              >
                History
                <span className="ml-1.5 tabular-nums opacity-70">{previous.length}</span>
              </button>
            </div>
            {tabOrders.length > 0 ? (
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search order, cloth, update…"
                className="input-field w-full sm:w-64"
              />
            ) : null}
          </div>
        </div>

        {tabOrders.length === 0 ? (
          showingHistory ? (
            <EmptyState
              title="No history yet"
              body="Completed, declined, and cancelled orders will appear here."
              emoji="📜"
            />
          ) : (
            <EmptyState
              title="No open orders"
              body="Build a board, then checkout when the shortlist is ready."
              action={
                <Link to="/boards" className="text-sm text-indigo">
                  Open boards →
                </Link>
              }
            />
          )
        ) : filteredOrders.length === 0 ? (
          <div className="border border-dashed border-line px-4 py-12 text-center text-sm text-ink-soft">
            No orders match “{query.trim()}”.
          </div>
        ) : (
          <div className="panel-surface overflow-hidden">
            <div className="max-h-[min(65vh,680px)] overflow-auto scroll-thin">
              <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-ink text-linen">
                  <tr className="text-[11px] uppercase tracking-[0.14em] text-linen/65">
                    <th className="px-4 py-3 font-medium">Order</th>
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
                        onClick={() => openOrder(order)}
                        className="cursor-pointer border-t border-line/80 transition hover:bg-white/50"
                      >
                        <td className="px-4 py-3 align-top">
                          <p className="font-medium tabular-nums">#{order._id.slice(-8)}</p>
                          <p className="mt-0.5 text-xs text-ink-soft">
                            {order.items?.length || 0} line
                            {(order.items?.length || 0) === 1 ? '' : 's'}
                          </p>
                          {!showingHistory ? (
                            <div className="mt-2">
                              <OrderProgress status={order.status} />
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="max-w-[240px] text-sm font-medium leading-snug">
                            {latest.summary}
                          </p>
                          {latest.reason ? (
                            <p className="mt-1 max-w-[240px] truncate text-xs text-ink-soft">
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
      </section>
    </div>

      <ConfirmDialog
        open={Boolean(selected) && !cancelOpen}
        title={selected ? `Order #${selected._id.slice(-8)}` : 'Order'}
        body={selected ? `Placed ${formatOrderDateTime(selected.createdAt)}` : ''}
        showActions={false}
        size="lg"
        onClose={() => setSelected(null)}
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

            {selected.status !== 'declined' && selected.status !== 'cancelled' ? (
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                  Fulfillment progress
                </p>
                <OrderProgress status={selected.status} />
              </div>
            ) : null}

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
              <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">Line items</p>
              <ul className="mt-2 max-h-44 divide-y divide-line/80 overflow-y-auto border border-line scroll-thin">
                {(selected.items || []).map((item, i) => (
                  <li
                    key={`${item.product?._id || item.product || item.name}-${i}`}
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
                    selected.shipping.country,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            ) : null}

            {!isClosedOrder(selected) ? (
              <button
                type="button"
                onClick={() => {
                  setCancelReason('');
                  setCancelOpen(true);
                }}
                className="w-full border border-rust/40 px-4 py-2.5 text-sm text-rust hover:border-rust"
              >
                Cancel order
              </button>
            ) : null}
          </div>
        ) : null}
      </ConfirmDialog>

      <ConfirmDialog
        open={cancelOpen}
        title="Cancel order?"
        body="Share a clear reason. This is required and visible to the mill."
        confirmLabel={cancelling ? 'Cancelling…' : 'Cancel order'}
        cancelLabel="Keep order"
        tone="danger"
        confirmDisabled={cancelling || cancelReason.trim().length < 3}
        onClose={() => {
          if (cancelling) return;
          setCancelOpen(false);
          setCancelReason('');
        }}
        onConfirm={confirmCancel}
      >
        <label className="block text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          Reason
          <textarea
            autoFocus
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={4}
            placeholder="e.g. Program on hold, wrong colorway ordered, timeline changed…"
            className="input-field mt-2 resize-y normal-case tracking-normal"
          />
        </label>
        <p className="mt-2 text-xs text-ink-soft">Minimum 3 characters.</p>
      </ConfirmDialog>
    </>
  );
}
