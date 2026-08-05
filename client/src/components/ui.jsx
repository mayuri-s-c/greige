const statusMeta = {
  pending: { className: 'bg-[#e2dfd8] text-[#12141a]', emoji: '⏳' },
  accepted: { className: 'bg-[#d7e4f2] text-[#1a3654]', emoji: '✅' },
  preparing: { className: 'bg-[#e8eef5] text-[#1a3654]', emoji: '🧵' },
  ready_for_dispatch: { className: 'bg-[#d0e0f0] text-[#102538]', emoji: '📦' },
  completed: { className: 'bg-[#d8efe0] text-[#14532d]', emoji: '🎉' },
  declined: { className: 'bg-[#fce8e6] text-[#b42318]', emoji: '⛔' },
  cancelled: { className: 'bg-[#ebeae6] text-[#5c6170]', emoji: '🚫' },
  available: { className: 'bg-[#d8efe0] text-[#14532d]', emoji: '🟢' },
  out_of_stock: { className: 'bg-[#fce8e6] text-[#b42318]', emoji: '⚠️' },
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
