import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/client';
import { MetricTile, SectionEyebrow, StatusBadge, EmptyState } from '../../components/ui';
import { OrdersIcon, PlusIcon } from '../../components/Icons';

export default function SupplierDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/profiles/supplier/dashboard').then((res) => setData(res.data));
  }, []);

  const fillRate = useMemo(() => {
    if (!data) return 0;
    const { totalProducts, activeProducts } = data.stats;
    if (!totalProducts) return 0;
    return Math.round((activeProducts / totalProducts) * 100);
  }, [data]);

  if (!data) {
    return (
      <div className="panel-surface px-6 py-16 text-center text-ink-soft">
        Syncing mill console…
      </div>
    );
  }

  const { stats, recentOrders, inventoryAlerts } = data;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <SectionEyebrow emoji="🏭">Live operations</SectionEyebrow>
          <h1 className="mt-2 font-display text-5xl leading-none">Mill Console</h1>
          <p className="mt-3 max-w-xl text-ink-soft">
            One view for inventory health, inbound demand, and dispatch readiness.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/supplier/inventory" className="btn-primary inline-flex items-center gap-2 text-sm">
            <PlusIcon className="h-4 w-4" />
            Add cloth
          </Link>
          <Link to="/supplier/orders" className="btn-secondary inline-flex items-center gap-2 text-sm">
            <OrdersIcon className="h-4 w-4" />
            Open pipeline
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile emoji="🧵" label="Total products" value={stats.totalProducts} hint="Listed on GREIGE" />
        <MetricTile
          emoji="🟢"
          label="Active products"
          value={stats.activeProducts}
          hint={`${fillRate}% catalog available`}
          tone="accent"
        />
        <MetricTile
          emoji="⏳"
          label="Pending orders"
          value={stats.pendingOrders}
          hint="Awaiting acceptance"
          tone={stats.pendingOrders > 0 ? 'alert' : 'default'}
        />
        <MetricTile
          emoji="⚠️"
          label="Inventory alerts"
          value={stats.inventoryAlertCount}
          hint="Stock ≤ 20 units"
          tone={stats.inventoryAlertCount > 0 ? 'alert' : 'default'}
        />
      </div>

      <section className="panel-surface overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <SectionEyebrow emoji="⚙️">Throughput</SectionEyebrow>
          <h2 className="mt-1 font-display text-3xl">Order flow at a glance</h2>
        </div>
        <div className="grid gap-px bg-line md:grid-cols-4 lg:grid-cols-7">
          {['pending', 'accepted', 'preparing', 'ready_for_dispatch', 'completed', 'declined', 'cancelled'].map((status) => {
            const count = recentOrders.filter((o) => o.status === status).length;
            return (
              <div key={status} className="bg-linen px-4 py-5">
                <p className="text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                  {status.replaceAll('_', ' ')}
                </p>
                <p className="mt-2 font-display text-3xl">{count}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="panel-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <SectionEyebrow emoji="📥">Inbound</SectionEyebrow>
              <h2 className="font-display text-2xl">Recent orders</h2>
            </div>
            <Link to="/supplier/orders" className="text-sm text-indigo">
              Full pipeline →
            </Link>
          </div>
          <div className="divide-y divide-line">
            {recentOrders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between gap-3 px-5 py-4"
              >
                <div>
                  <p className="font-medium">#{order._id.slice(-8)}</p>
                  <p className="text-sm text-ink-soft">
                    {order.buyer?.name} · ₹{order.subtotal?.toLocaleString('en-IN')}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </motion.div>
            ))}
            {recentOrders.length === 0 && (
              <div className="px-5 py-8">
                <EmptyState
                  title="No orders yet"
                  body="When buyers place orders, they land here first."
                  action={
                    <Link to="/supplier/inventory" className="text-sm text-indigo">
                      Prep inventory →
                    </Link>
                  }
                />
              </div>
            )}
          </div>
        </section>

        <section className="panel-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <SectionEyebrow emoji="⚠️">Risk</SectionEyebrow>
              <h2 className="font-display text-2xl">Inventory alerts</h2>
            </div>
            <Link to="/supplier/inventory" className="text-sm text-indigo">
              Manage stock →
            </Link>
          </div>
          <div className="divide-y divide-line">
            {inventoryAlerts.map((p) => {
              const pct = Math.min(100, Math.round((p.stock / 100) * 100));
              return (
                <div key={p._id} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-rust">
                        {p.stock} {p.unit} remaining
                      </p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden bg-stone">
                    <div className="h-full bg-rust" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {inventoryAlerts.length === 0 && (
              <p className="px-5 py-8 text-sm text-ink-soft">Stock levels look healthy across the mill.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
