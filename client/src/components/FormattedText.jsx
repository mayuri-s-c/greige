/**
 * Warp response formatter:
 * headings, nested bullets, Label: value rows, and pipe-delimited fabric cards.
 */

function renderInline(text, keyPrefix) {
  const parts = [];
  const cleaned = String(text)
    .replace(/\*\*([^*\n]+?)\*\*/g, '$1')
    .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '$1');
  const pattern = /(`[^`\n]+?`)/g;
  let last = 0;
  let match;
  let i = 0;

  while ((match = pattern.exec(cleaned)) !== null) {
    if (match.index > last) parts.push(cleaned.slice(last, match.index));
    const token = match[0];
    parts.push(
      <code key={`${keyPrefix}-c-${i}`} className="rounded bg-stone px-1 text-[0.9em]">
        {token.slice(1, -1)}
      </code>,
    );
    last = match.index + token.length;
    i += 1;
  }
  if (last < cleaned.length) parts.push(cleaned.slice(last));
  return parts.length ? parts : cleaned;
}

function getIndent(line) {
  const spaces = line.match(/^(\s*)/)?.[1].length || 0;
  return Math.floor(spaces / 2);
}

function isBullet(line) {
  return /^\s*[-*•]\s+/.test(line);
}

function isNumbered(line) {
  return /^\s*\d+[.)]\s+/.test(line);
}

function stripBullet(line) {
  return line.replace(/^\s*[-*•]\s+/, '').replace(/^\s*\d+[.)]\s+/, '').trim();
}

function isAttributeLine(line) {
  return /^[A-Za-z][A-Za-z0-9 /&-]{0,40}:\s+\S/.test(line.trim());
}

function isHeadingCandidate(line) {
  const t = line.trim();
  if (!t) return false;
  if (isBullet(line) || isAttributeLine(t) || isPipeFabricLine(t)) return false;
  if (/^#{1,3}\s+/.test(t)) return true;
  if (/^\d+[.)]\s+\S/.test(t) && !isAttributeLine(t.replace(/^\d+[.)]\s+/, ''))) {
    // Numbered product titles like "1. Stonewash Midweight Denim" without pipes
    if (!t.includes('|')) return true;
  }
  if (/:$/.test(t) && t.length < 80 && !isAttributeLine(t)) return true;
  return false;
}

function cleanHeading(line) {
  return line
    .trim()
    .replace(/^#{1,3}\s+/, '')
    .replace(/^\d+[.)]\s+/, '')
    .replace(/:$/, '')
    .trim();
}

function parseAttribute(line) {
  const t = line.trim();
  const idx = t.indexOf(':');
  if (idx <= 0) return null;
  return {
    label: t.slice(0, idx).trim(),
    value: t.slice(idx + 1).trim(),
  };
}

function isPipeFabricLine(line) {
  const t = String(line || '').trim();
  const pipes = (t.match(/\|/g) || []).length;
  if (pipes < 2) return false;
  return /gsm|stock|weave|hand-?feel|suitable|composition|cotton|denim|linen|silk|wool|elastane|meters|₹/i.test(
    t,
  );
}

function parsePipeSegment(segment, index) {
  const p = segment.trim();
  if (!p) return null;
  if (/^id\s*:/i.test(p)) return null;

  const labeled = p.match(/^([A-Za-z][A-Za-z0-9 /&-]{0,40})\s*:\s*(.+)$/);
  if (labeled) {
    return { label: labeled[1].trim(), value: labeled[2].trim() };
  }

  const gsm = p.match(/^GSM\s+(.+)$/i);
  if (gsm) return { label: 'GSM', value: gsm[1].trim() };

  const weave = p.match(/^weave\s+(.+)$/i);
  if (weave) return { label: 'Weave', value: weave[1].trim() };

  const hand = p.match(/^hand[-\s]?feel\s+(.+)$/i);
  if (hand) return { label: 'Hand-feel', value: hand[1].trim() };

  const stock = p.match(/^stock\s+(.+)$/i);
  if (stock) return { label: 'Stock', value: stock[1].trim() };

  const price = p.match(/^₹\s*(.+)$/);
  if (price) return { label: 'Price', value: `₹${price[1].trim()}` };

  if (index === 1 && !/%/.test(p) && p.length < 40) {
    return { label: 'Category', value: p };
  }

  if (/%/.test(p) || /\b(cotton|linen|silk|wool|elastane|polyester|viscose|nylon)\b/i.test(p)) {
    return { label: 'Composition', value: p };
  }

  return { label: 'Detail', value: p };
}

function parsePipeFabricLine(line) {
  const parts = String(line)
    .split('|')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length < 3) return null;

  const name = parts[0].replace(/^\d+[.)]\s*/, '').trim();
  const rows = [];
  for (let i = 1; i < parts.length; i += 1) {
    const row = parsePipeSegment(parts[i], i);
    if (row) rows.push(row);
  }
  if (!name || rows.length < 2) return null;
  return { name, rows };
}

function buildTree(items) {
  const root = [];
  const stack = [{ depth: -1, children: root }];

  for (const item of items) {
    while (stack.length > 1 && item.depth <= stack[stack.length - 1].depth) {
      stack.pop();
    }
    const node = { text: item.text, children: [] };
    stack[stack.length - 1].children.push(node);
    stack.push({ depth: item.depth, children: node.children });
  }
  return root;
}

function ListTree({ nodes, keyPrefix }) {
  if (!nodes?.length) return null;
  return (
    <ul className="space-y-1.5 border-l border-line/80 pl-3">
      {nodes.map((node, i) => (
        <li key={`${keyPrefix}-${i}`} className="leading-relaxed">
          <div className="relative pl-1">
            <span className="absolute -left-[0.85rem] top-[0.55rem] h-1 w-1 rounded-full bg-indigo/70" />
            {renderInline(node.text, `${keyPrefix}-${i}`)}
          </div>
          {node.children?.length > 0 && (
            <div className="mt-1.5 ml-2">
              <ListTree nodes={node.children} keyPrefix={`${keyPrefix}-${i}-c`} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function AttributeBlock({ rows, keyPrefix }) {
  return (
    <dl className="space-y-2 p-3">
      {rows.map((row, i) => (
        <div
          key={`${keyPrefix}-attr-${i}`}
          className="grid gap-0.5 sm:grid-cols-[130px_1fr] sm:gap-3"
        >
          <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
            {row.label}
          </dt>
          <dd className="text-sm leading-relaxed text-ink">
            {renderInline(row.value, `${keyPrefix}-v-${i}`)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function FabricCard({ fabric, index }) {
  return (
    <article className="overflow-hidden border border-line/80 bg-white/40">
      <div className="flex items-start justify-between gap-3 border-b border-line/70 bg-ink/[0.04] px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">Cloth {index + 1}</p>
          <p className="mt-0.5 font-display text-xl leading-tight text-ink">{fabric.name}</p>
        </div>
      </div>
      <AttributeBlock rows={fabric.rows} keyPrefix={`fabric-${index}`} />
    </article>
  );
}

export default function FormattedText({ text = '', className = '' }) {
  const lines = String(text).replace(/\r\n/g, '\n').split('\n');
  const blocks = [];

  let para = [];
  let bullets = [];
  let attrs = [];
  let fabrics = [];

  function flushPara() {
    if (!para.length) return;
    blocks.push({ type: 'para', text: para.join(' ').trim() });
    para = [];
  }

  function flushBullets() {
    if (!bullets.length) return;
    blocks.push({ type: 'tree', nodes: buildTree(bullets) });
    bullets = [];
  }

  function flushAttrs() {
    if (!attrs.length) return;
    blocks.push({ type: 'attrs', rows: [...attrs] });
    attrs = [];
  }

  function flushFabrics() {
    if (!fabrics.length) return;
    blocks.push({ type: 'fabrics', items: [...fabrics] });
    fabrics = [];
  }

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      flushBullets();
      flushAttrs();
      flushFabrics();
      flushPara();
      continue;
    }

    if (isPipeFabricLine(trimmed)) {
      flushBullets();
      flushAttrs();
      flushPara();
      const fabric = parsePipeFabricLine(trimmed);
      if (fabric) {
        fabrics.push(fabric);
        continue;
      }
    }

    if (isHeadingCandidate(raw)) {
      flushBullets();
      flushAttrs();
      flushFabrics();
      flushPara();
      blocks.push({ type: 'heading', text: cleanHeading(raw) });
      continue;
    }

    if (isBullet(raw) || (isNumbered(raw) && !isAttributeLine(stripBullet(raw)))) {
      flushAttrs();
      flushFabrics();
      flushPara();
      bullets.push({ depth: getIndent(raw), text: stripBullet(raw) });
      continue;
    }

    if (isAttributeLine(trimmed)) {
      flushBullets();
      flushFabrics();
      flushPara();
      const attr = parseAttribute(trimmed);
      if (attr) attrs.push(attr);
      continue;
    }

    flushBullets();
    flushAttrs();
    flushFabrics();
    para.push(trimmed);
  }

  flushBullets();
  flushAttrs();
  flushFabrics();
  flushPara();

  const normalized = [];
  for (const block of blocks) {
    if (block.type === 'attrs' && block.rows.length > 6) {
      const groups = [];
      let current = [];
      for (const row of block.rows) {
        if (/^composition$/i.test(row.label) && current.length) {
          groups.push(current);
          current = [row];
        } else {
          current.push(row);
        }
      }
      if (current.length) groups.push(current);
      if (groups.length > 1) {
        groups.forEach((rows, gi) => {
          normalized.push({ type: 'heading', text: `Option ${gi + 1}` });
          normalized.push({ type: 'attrs', rows });
        });
        continue;
      }
    }
    normalized.push(block);
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {normalized.map((block, idx) => {
        if (block.type === 'heading') {
          return (
            <div key={`h-${idx}`} className="border-b border-line pb-1.5 pt-1">
              <p className="font-display text-xl leading-tight text-ink">{block.text}</p>
            </div>
          );
        }
        if (block.type === 'tree') {
          return <ListTree key={`t-${idx}`} nodes={block.nodes} keyPrefix={`t-${idx}`} />;
        }
        if (block.type === 'attrs') {
          return (
            <div key={`a-${idx}`} className="border border-line/70 bg-white/35">
              <AttributeBlock rows={block.rows} keyPrefix={`a-${idx}`} />
            </div>
          );
        }
        if (block.type === 'fabrics') {
          return (
            <div key={`f-${idx}`} className="space-y-3">
              {block.items.map((fabric, fi) => (
                <FabricCard key={`f-${idx}-${fi}`} fabric={fabric} index={fi} />
              ))}
            </div>
          );
        }
        return (
          <p key={`p-${idx}`} className="leading-relaxed">
            {renderInline(block.text, `p-${idx}`)}
          </p>
        );
      })}
    </div>
  );
}
