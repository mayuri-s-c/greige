const statusMeta = {
  pending: { className: 'bg-[#e2e8f0] text-[#0f172a]', emoji: '⏳' },
  accepted: { className: 'bg-[#ccfbf1] text-[#0f766e]', emoji: '✅' },
  preparing: { className: 'bg-[#e0f2fe] text-[#0369a1]', emoji: '🧵' },
  ready_for_dispatch: { className: 'bg-[#cffafe] text-[#0e7490]', emoji: '📦' },
  completed: { className: 'bg-[#dcfce7] text-[#166534]', emoji: '🎉' },
  declined: { className: 'bg-[#fee2e2] text-[#b91c1c]', emoji: '⛔' },
  cancelled: { className: 'bg-[#f1f5f9] text-[#64748b]', emoji: '🚫' },
  available: { className: 'bg-[#dcfce7] text-[#166534]', emoji: '🟢' },
  out_of_stock: { className: 'bg-[#fee2e2] text-[#b91c1c]', emoji: '⚠️' },
};

export function StatusBadge({ status }) {
  const meta = statusMeta[status] || { className: 'bg-stone text-ink-soft', emoji: '•' };
  const label = String(status || '').replaceAll('_', ' ');
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider ${meta.className}`}
    >
      <span aria-hidden="true">{meta.emoji}</span>
      {label}
    </span>
  );
}

export function SectionEyebrow({ children, emoji }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-soft">
      {emoji ? <span className="mr-1.5 normal-case tracking-normal">{emoji}</span> : null}
      {children}
    </p>
  );
}

export function EmptyState({ title, body, action, emoji = '🧺' }) {
  return (
    <div className="panel-surface flex flex-col items-start gap-3 px-6 py-10">
      <p className="text-2xl" aria-hidden="true">
        {emoji}
      </p>
      <p className="font-display text-2xl">{title}</p>
      <p className="max-w-md text-sm text-ink-soft">{body}</p>
      {action}
    </div>
  );
}

export function MetricTile({ label, value, hint, tone = 'default', emoji }) {
  const tones = {
    default: 'from-white/50 to-transparent',
    alert: 'from-rust/10 to-transparent',
    accent: 'from-indigo/10 to-transparent',
  };
  return (
    <div className="panel-surface relative overflow-hidden p-5">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tones[tone]}`} />
      <p className="relative text-[11px] uppercase tracking-[0.16em] text-ink-soft">
        {emoji ? <span className="mr-1 normal-case tracking-normal">{emoji}</span> : null}
        {label}
      </p>
      <p className="relative mt-3 font-display text-4xl leading-none md:text-5xl">{value}</p>
      {hint && <p className="relative mt-3 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}
