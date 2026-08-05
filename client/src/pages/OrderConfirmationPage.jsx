import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order));
  }, [id]);

  if (!order) return <p className="mx-auto max-w-3xl px-4 py-16">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">🎉 Order confirmed</p>
      <h1 className="mt-3 font-display text-5xl">From loom to ledger</h1>
      <p className="mt-4 text-ink-soft">
        Order <span className="text-ink">{order._id.slice(-8)}</span> is {order.status.replaceAll('_', ' ')}.
      </p>
      <p className="mt-2 text-xl">₹{order.subtotal.toLocaleString('en-IN')}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
        <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
          Buyer dashboard
        </Link>
        <Link to="/" className="btn-secondary inline-flex items-center gap-2">
          Keep sourcing
        </Link>
      </div>
    </div>
  );
}
