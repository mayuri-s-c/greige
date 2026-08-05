export function formatOrderDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export function formatOrderDateTime(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export function latestHistory(order) {
  const history = order?.statusHistory || [];
  if (history.length) return history[history.length - 1];
  return {
    status: order?.status,
    summary: order?.status
      ? `Status: ${String(order.status).replaceAll('_', ' ')}`
      : 'No updates yet',
    reason: order?.statusReason || '',
    changedAt: order?.lastModifiedAt || order?.updatedAt || order?.createdAt,
  };
}

export function isClosedOrder(order) {
  return ['completed', 'declined', 'cancelled'].includes(order?.status);
}
