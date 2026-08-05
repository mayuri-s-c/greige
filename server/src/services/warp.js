/**
 * Warp AI service — Hugging Face grounded assistant.
 * Works without HF_TOKEN using deterministic fallbacks so demos never break.
 */

function productContext(products) {
  return products
    .slice(0, 8)
    .map((p, i) => {
      const s = p.specifications || {};
      return [
        `${i + 1}. ${p.name}`,
        `Category: ${p.category || 'n/a'}`,
        `Composition: ${s.composition || 'n/a'}`,
        `GSM: ${s.gsm ?? 'n/a'}`,
        `Weave: ${s.weave || 'n/a'}`,
        `Hand-Feel: ${s.handFeel || 'n/a'}`,
        `Price: ₹${p.price}/${p.unit}`,
        `Colors: ${(p.colors || []).join(', ') || 'n/a'}`,
        `Stock: ${p.stock} ${p.unit}`,
        `id: ${p._id}`,
      ].join('\n');
    })
    .join('\n\n');
}

const FORMAT_RULES = `Structure every multi-product answer like this (plain text, no markdown ** or #):

1. Exact Product Name
Composition: ...
GSM: ...
Weave: ...
Hand-Feel: ...
Suitable For: ...

2. Next Exact Product Name
Composition: ...
GSM: ...

Rules:
- Always put the product name on its own numbered line BEFORE its attributes.
- Never dump Composition/GSM lines for different products without a product heading between them.
- NEVER use pipe-separated one-liners (no "Name | Category | GSM …").
- Keep one blank line between products.
- For nested detail under a point, indent with two spaces and a dash.
- Prefer 3-5 products max unless the user asks for more.
- Omit internal product ids from the buyer-facing reply.`;

function parseSearchIntent(message = '') {
  const text = message.toLowerCase();
  const intent = { q: message, filters: {} };

  const gsmMatch = text.match(/(\d+)\s*gsm/);
  if (gsmMatch) intent.filters.maxGsm = Number(gsmMatch[1]);

  const underGsm = text.match(/under\s+(\d+)/);
  if (underGsm && text.includes('gsm')) intent.filters.maxGsm = Number(underGsm[1]);

  const categories = ['cotton', 'linen', 'silk', 'wool', 'denim', 'polyester', 'blend'];
  for (const cat of categories) {
    if (text.includes(cat)) {
      intent.filters.composition = cat;
      intent.q = cat;
      break;
    }
  }

  const colors = ['navy', 'ivory', 'white', 'black', 'beige', 'olive', 'burgundy', 'grey', 'gray'];
  for (const color of colors) {
    if (text.includes(color)) {
      intent.filters.color = color === 'gray' ? 'grey' : color;
      break;
    }
  }

  return intent;
}

async function callHuggingFaceChat(system, user) {
  const token = process.env.HF_TOKEN;
  const model = process.env.HF_CHAT_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
  if (!token) return null;

  const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: 700,
      temperature: 0.35,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.warn('HF chat failed:', response.status, errText.slice(0, 200));
    return null;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}

function structuredProductBrief(products, intro) {
  if (!products.length) {
    return `I couldn't find fabrics for that yet. Try browsing the Greige Floor or ask for cotton, linen, silk, or a GSM range.`;
  }

  const sections = products.map((p, i) => {
    const s = p.specifications || {};
    return [
      `${i + 1}. ${p.name}`,
      `Composition: ${s.composition || 'n/a'}`,
      `GSM: ${s.gsm ?? 'n/a'}`,
      `Weave: ${s.weave || 'n/a'}`,
      `Hand-Feel: ${s.handFeel || 'n/a'}`,
      `Price: ₹${p.price}/${p.unit}`,
      `Colors: ${(p.colors || []).join(', ') || 'n/a'}`,
      `Stock: ${p.stock} ${p.unit}`,
      `Suitable For: ${p.category} programs and related apparel`,
    ].join('\n');
  });

  return `${intro}\n\n${sections.join('\n\n')}\n\nOpen any Cloth Passport for full details, or ask me to narrow by GSM, color, or composition.`;
}

export async function chatWithWarp({ message, products = [], mode = 'chat' }) {
  const catalog = productContext(products);
  const system = `You are Warp, the GREIGE textile marketplace assistant.
Answer using ONLY the catalog context when recommending fabrics.
Be concise, practical, and use textile terms (GSM, weave, hand-feel, MOQ).
Mode: ${mode}.

${FORMAT_RULES}

Catalog:
${catalog || 'No products loaded.'}`;

  const hfReply = await callHuggingFaceChat(system, message);
  if (hfReply) {
    return { reply: hfReply, source: 'huggingface', products: products.slice(0, 5) };
  }

  const intent = parseSearchIntent(message);
  const ranked = products.slice(0, 5);
  const reply = structuredProductBrief(
    ranked,
    `I pulled mill-true matches from GREIGE for "${message}".`
  );

  return { reply, source: 'fallback', intent, products: ranked };
}

export function searchFromMessage(message) {
  return parseSearchIntent(message);
}

export async function compareProducts(products) {
  if (!products.length) return { reply: 'Select fabrics to compare.', source: 'fallback' };

  const catalog = productContext(products);
  const prompt = `Compare these fabrics for a B2B buyer. Cover composition, GSM, price, and best use case.\n${catalog}`;
  const hfReply = await callHuggingFaceChat(
    `You are Warp on GREIGE.
${FORMAT_RULES}
For comparisons, also end with:
Recommendation
- Best overall: ...
- Why: ...`,
    prompt
  );

  if (hfReply) return { reply: hfReply, source: 'huggingface' };

  return {
    reply: structuredProductBrief(products, 'Compare Loom brief:'),
    source: 'fallback',
  };
}
