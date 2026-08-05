import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCartStore } from '../store/cartStore';

const accents = ['#1a3654', '#2a3344', '#3d4a3a', '#4a5568', '#5c4a3a', '#364152'];

const COLORWAY_MAP = {
  ivory: '#f5f4f1',
  navy: '#1a3654',
  sky: '#8eacc4',
  indigo: '#1a3654',
  black: '#12141a',
  natural: '#d7c4a3',
  olive: '#5c6b4a',
  sand: '#d2b48c',
  champagne: '#e8d5b5',
  burgundy: '#6e2430',
  charcoal: '#2f2c2a',
  camel: '#c2a275',
  grey: '#8a8680',
  gray: '#8a8680',
  'electric blue': '#2f5f9e',
  ecru: '#d8cfc0',
  sage: '#8ea58a',
  'dusty rose': '#c49396',
  'off-white': '#f2eee6',
  'heather grey': '#9a9691',
  forest: '#355640',
  khaki: '#b5a16c',
  raw: '#cfc1a8',
  ink: '#12141a',
  rust: '#b42318',
  'buffalo check': '#5c2a2a',
  'navy windowpane': '#1a3654',
  storm: '#5a6675',
  white: '#f7f4ee',
  beige: '#d8c9b0',
};

/** Lower score = more commonly ordered in greige / ready-dye programs. */
const BUYER_FAVORITE_RANK = [
  'navy',
  'black',
  'ivory',
  'white',
  'off-white',
  'charcoal',
  'indigo',
  'grey',
  'gray',
  'heather grey',
  'natural',
  'ecru',
  'camel',
  'khaki',
  'olive',
  'sand',
  'beige',
  'ink',
  'storm',
  'forest',
  'sage',
  'sky',
  'champagne',
  'burgundy',
  'rust',
  'dusty rose',
  'electric blue',
  'raw',
  'buffalo check',
  'navy windowpane',
];

export function fabricAccent(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i) * (i + 1)) % accents.length;
  }
  return accents[hash];
}

/** Map a colorway label to a fabric preview hex. */
export function colorwayHex(label = '', fallback = '#c4baa8') {
  const key = String(label).trim().toLowerCase();
  if (!key) return fallback;
  if (COLORWAY_MAP[key]) return COLORWAY_MAP[key];

  // Prefer longest substring match so "heather grey" wins over bare "grey".
  let best = null;
  for (const [name, hex] of Object.entries(COLORWAY_MAP)) {
    if (key === name || key.includes(name)) {
      if (!best || name.length > best.name.length) best = { name, hex };
    }
  }
  if (best) return best.hex;

  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash + key.charCodeAt(i) * 17) % accents.length;
  return accents[hash] || fallback;
}

/**
 * Pick a preview colorway only from colors available on the product.
 * Prefers an explicit buyer choice (cart / prior order), then the most
 * commonly bought shade among the remaining available options.
 */
export function pickPreviewColorway(colors = [], preferred = []) {
  const available = (colors || []).map((c) => String(c).trim()).filter(Boolean);
  if (!available.length) return '';

  const lowerIndex = new Map(available.map((c, i) => [c.toLowerCase(), i]));

  for (const hint of preferred) {
    const key = String(hint || '').trim().toLowerCase();
    if (!key) continue;
    const idx = lowerIndex.get(key);
    if (idx != null) return available[idx];
  }

  let best = available[0];
  let bestRank = Number.POSITIVE_INFINITY;
  for (const color of available) {
    const key = color.toLowerCase();
    let rank = BUYER_FAVORITE_RANK.findIndex(
      (fav) => key === fav || key.includes(fav) || fav.includes(key)
    );
    if (rank < 0) rank = BUYER_FAVORITE_RANK.length + available.indexOf(color);
    if (rank < bestRank) {
      bestRank = rank;
      best = color;
    }
  }
  return best;
}

/** Hex for product grid/list preview — always from available colorways when present. */
export function fabricPreviewHex(product, preferred = []) {
  const accent = fabricAccent(product?.name || '');
  const colorway = pickPreviewColorway(product?.colors, preferred);
  return colorway ? colorwayHex(colorway, accent) : accent;
}

function mixToward(hex, toward = '#f5f4f1', amount = 0.35) {
  const parse = (h) => {
    const n = h.replace('#', '');
    return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
  };
  try {
    const [r1, g1, b1] = parse(hex);
    const [r2, g2, b2] = parse(toward);
    const mix = (a, b) => Math.round(a + (b - a) * amount);
    return `#${[mix(r1, r2), mix(g1, g2), mix(b1, b2)]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')}`;
  } catch {
    return hex;
  }
}

export function colorwayGradient(label, fallbackAccent) {
  const base = colorwayHex(label, fallbackAccent);
  const mid = mixToward(base, '#e2dfd8', 0.28);
  const edge = mixToward(base, '#f5f4f1', 0.55);
  return `linear-gradient(150deg, ${base} 0%, ${mid} 42%, ${edge} 100%)`;
}

export default function ProductCard({ product, index = 0 }) {
  const cartItems = useCartStore((s) => s.cart?.items);
  const cartColor = (cartItems || []).find(
    (item) => String(item.product?._id || item.product) === String(product._id) && item.color
  )?.color;

  const previewColorway = pickPreviewColorway(product.colors, cartColor ? [cartColor] : []);
  const accent = fabricAccent(product.name);
  const preview = previewColorway ? colorwayHex(previewColorway, accent) : accent;
  const lowStock = product.stock <= 20;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: Math.min(index * 0.04, 0.24), duration: 0.45 }}
    >
      <Link
        to={`/products/${product._id}`}
        className="group relative block overflow-hidden border border-line/90 bg-white/25 transition duration-300 hover:-translate-y-1 hover:border-ink/35"
      >
        <div
          className="relative aspect-[4/5] overflow-hidden"
          style={{
            background: `linear-gradient(155deg, ${preview}e6 0%, ${preview}88 42%, #e2dfd8 100%)`,
          }}
        >
          <div className="weave-overlay absolute inset-0 opacity-40 transition duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {product.featured && (
              <span className="bg-linen/95 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-ink">
                Featured
              </span>
            )}
            {lowStock && (
              <span className="bg-rust px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-linen">
                Low stock
              </span>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 translate-y-2 p-4 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="grid grid-cols-3 gap-2 text-[10px] uppercase tracking-wider text-linen/90">
              <div>
                <p className="text-linen/55">GSM</p>
                <p className="mt-0.5 text-sm normal-case tracking-normal">
                  {product.specifications?.gsm ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-linen/55">Weave</p>
                <p className="mt-0.5 text-sm normal-case tracking-normal">
                  {product.specifications?.weave || '—'}
                </p>
              </div>
              <div>
                <p className="text-linen/55">Stock</p>
                <p className="mt-0.5 text-sm normal-case tracking-normal">{product.stock}</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5 transition group-hover:opacity-0">
            {(product.colors || []).slice(0, 4).map((c) => (
              <span
                key={c}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                  c === previewColorway
                    ? 'bg-linen text-ink ring-1 ring-indigo/40'
                    : 'bg-linen/90 text-ink'
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full border border-ink/15"
                  style={{ background: colorwayHex(c, accent) }}
                />
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">{product.category}</p>
            <p className="text-sm font-semibold tabular-nums">₹{product.price}</p>
          </div>
          <h3 className="font-display text-[1.65rem] leading-[1.05]">{product.name}</h3>
          <p className="line-clamp-2 text-sm text-ink-soft">
            {product.specifications?.composition || product.description}
          </p>
          <div className="flex items-center justify-between pt-1 text-xs text-ink-soft">
            <span>{product.specifications?.handFeel || 'Mill finish'}</span>
            <span className="text-indigo opacity-0 transition group-hover:opacity-100">
              Open passport →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
