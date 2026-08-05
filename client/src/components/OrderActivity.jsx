import { formatOrderDateTime, latestHistory } from '../utils/orderHistory';

export function OrderActivityList({ order, compact = false }) {
  const history = order?.statusHistory?.length
    ? order.statusHistory
    : [latestHistory(order)].filter((h) => h?.summary);

  if (!history.length) {
    return <p className="text-sm text-ink-soft">No activity recorded yet.</p>;
  }

  const items = compact ? history.slice(-3).reverse() : [...history].reverse();

  return (
    <ul className={`space-y-2 ${compact ? '' : 'max-h-48 overflow-y-auto scroll-thin'}`}>
      {items.map((entry, index) => (
        <li
          key={`${entry.status}-${entry.changedAt}-${index}`}
          className="border border-line/80 bg-white/35 px-3 py-2 text-sm"
        >
          <p className="font-medium">{entry.summary}</p>
          <p className="mt-0.5 text-xs text-ink-soft">
            {formatOrderDateTime(entry.changedAt)}
            {entry.actorRole ? ` · ${entry.actorRole}` : ''}
          </p>
          {entry.reason ? (
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">Reason: {entry.reason}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function OrderDatesMeta({ order }) {
  const latest = latestHistory(order);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">Created</p>
        <p className="mt-1 text-sm">{formatOrderDateTime(order.createdAt)}</p>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">Last modified</p>
        <p className="mt-1 text-sm">
          {formatOrderDateTime(order.lastModifiedAt || order.updatedAt || latest.changedAt)}
        </p>
        <p className="mt-0.5 text-xs text-ink-soft">{latest.summary}</p>
      </div>
    </div>
  );
}
