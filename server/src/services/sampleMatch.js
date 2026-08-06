/**
 * Sample Match — rank catalog cloths by color proximity + optional GSM / category / weave.
 * Distinctive GREIGE workflow: bring a physical swatch (photo or hex) and find mill matches.
 */

const COLORWAY_HEX = {
  ivory: '#f8fafc',
  navy: '#1e3a5f',
  sky: '#7dd3fc',
  indigo: '#0d9488',
  black: '#0f172a',
  natural: '#d7c4a3',
  olive: '#5c6b4a',
  sand: '#d2b48c',
  champagne: '#e8d5b5',
  burgundy: '#6e2430',
  charcoal: '#334155',
  camel: '#c2a275',
  grey: '#94a3b8',
  gray: '#94a3b8',
  'electric blue': '#0284c7',
  ecru: '#d8cfc0',
  sage: '#86a897',
  'dusty rose': '#c49396',
  'off-white': '#f8fafc',
  'heather grey': '#94a3b8',
  forest: '#166534',
  khaki: '#b5a16c',
  raw: '#cfc1a8',
  ink: '#0f172a',
  rust: '#dc2626',
  'buffalo check': '#5c2a2a',
  'navy windowpane': '#1e3a5f',
  storm: '#64748b',
  white: '#ffffff',
  beige: '#d8c9b0',
};

function hexToRgb(hex = '') {
  const n = String(hex).replace('#', '').trim();
  if (n.length !== 6) return null;
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
}

function colorwayHex(label = '') {
  const key = String(label).trim().toLowerCase();
  if (COLORWAY_HEX[key]) return COLORWAY_HEX[key];
  let best = null;
  for (const [name, hex] of Object.entries(COLORWAY_HEX)) {
    if (key === name || key.includes(name)) {
      if (!best || name.length > best.name.length) best = { name, hex };
    }
  }
  return best?.hex || '#94a3b8';
}

/** Euclidean distance in RGB, normalized 0–1 (1 = identical). */
function colorSimilarity(a, b) {
  if (!a || !b) return 0;
  const dist = Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
  return Math.max(0, 1 - dist / 441.67);
}

function gsmSimilarity(productGsm, targetGsm, tolerance = 40) {
  if (!targetGsm || productGsm == null) return null;
  const delta = Math.abs(Number(productGsm) - Number(targetGsm));
  if (delta <= tolerance) return 1 - delta / (tolerance * 2);
  return Math.max(0, 1 - delta / 180);
}

/**
 * @param {object[]} products
 * @param {{ r: number, g: number, b: number }} sampleRgb
 * @param {{ targetGsm?: number, category?: string, weave?: string, handFeel?: string }} filters
 */
export function rankSampleMatches(products, sampleRgb, filters = {}) {
  const targetGsm = filters.targetGsm ? Number(filters.targetGsm) : null;
  const category = String(filters.category || '').trim().toLowerCase();
  const weave = String(filters.weave || '').trim().toLowerCase();
  const handFeel = String(filters.handFeel || '').trim().toLowerCase();

  const ranked = products.map((product) => {
    const colors = product.colors || [];
    let bestColor = null;
    let bestColorScore = 0;
    let bestColorLabel = colors[0] || '';

    for (const label of colors) {
      const rgb = hexToRgb(colorwayHex(label));
      const score = colorSimilarity(sampleRgb, rgb);
      if (score > bestColorScore) {
        bestColorScore = score;
        bestColor = rgb;
        bestColorLabel = label;
      }
    }

    const gsmScore = gsmSimilarity(product.specifications?.gsm, targetGsm);
    const categoryHit = category
      ? String(product.category || '').toLowerCase().includes(category)
      : null;
    const weaveHit = weave
      ? String(product.specifications?.weave || '')
          .toLowerCase()
          .includes(weave)
      : null;
    const handHit = handFeel
      ? String(product.specifications?.handFeel || '')
          .toLowerCase()
          .includes(handFeel)
      : null;

    const weights = { color: 0.55, gsm: 0.25, category: 0.1, weave: 0.05, hand: 0.05 };
    let totalW = weights.color;
    let score = bestColorScore * weights.color;

    if (gsmScore != null) {
      score += gsmScore * weights.gsm;
      totalW += weights.gsm;
    }
    if (categoryHit != null) {
      score += (categoryHit ? 1 : 0.15) * weights.category;
      totalW += weights.category;
    }
    if (weaveHit != null) {
      score += (weaveHit ? 1 : 0.2) * weights.weave;
      totalW += weights.weave;
    }
    if (handHit != null) {
      score += (handHit ? 1 : 0.2) * weights.hand;
      totalW += weights.hand;
    }

    const matchScore = Math.round((score / totalW) * 100);
    const reasons = [];
    if (bestColorLabel) {
      reasons.push(`Closest colorway ${bestColorLabel} (${Math.round(bestColorScore * 100)}% tone)`);
    }
    if (gsmScore != null && targetGsm) {
      reasons.push(
        `GSM ${product.specifications?.gsm ?? '—'} vs sample target ${targetGsm}`,
      );
    }
    if (categoryHit) reasons.push(`Same category · ${product.category}`);
    if (weaveHit) reasons.push(`Weave fit · ${product.specifications?.weave}`);
    if (handHit) reasons.push(`Hand-feel · ${product.specifications?.handFeel}`);

    return {
      product,
      matchScore,
      matchedColor: bestColorLabel,
      matchedHex: bestColor ? `#${[bestColor.r, bestColor.g, bestColor.b].map((v) => v.toString(16).padStart(2, '0')).join('')}` : null,
      reasons,
    };
  });

  return ranked
    .filter((row) => row.matchScore >= 28)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 12);
}

export { colorwayHex, hexToRgb };
