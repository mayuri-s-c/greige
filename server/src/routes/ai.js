import { Router } from 'express';
import Product from '../models/Product.js';
import { chatWithWarp, compareProducts, searchFromMessage } from '../services/warp.js';
import { hexToRgb, rankSampleMatches } from '../services/sampleMatch.js';

const router = Router();

/** Warp is available without login so guests can explore the catalog. */
router.post('/chat', async (req, res) => {
  const { message, mode } = req.body;
  if (!message?.trim()) return res.status(400).json({ message: 'Message required' });

  const intent = searchFromMessage(message);
  const filter = { status: 'available' };
  if (intent.filters.composition) {
    filter['specifications.composition'] = { $regex: intent.filters.composition, $options: 'i' };
  }
  if (intent.filters.color) filter.colors = { $regex: intent.filters.color, $options: 'i' };
  if (intent.filters.maxGsm) filter['specifications.gsm'] = { $lte: intent.filters.maxGsm };
  if (intent.q && !intent.filters.composition) {
    filter.$or = [
      { name: { $regex: intent.q, $options: 'i' } },
      { description: { $regex: intent.q, $options: 'i' } },
      { category: { $regex: intent.q, $options: 'i' } },
    ];
  }

  const products = await Product.find(Object.keys(filter).length ? filter : { status: 'available' })
    .limit(12)
    .sort({ featured: -1, updatedAt: -1 });

  const result = await chatWithWarp({ message, products, mode: mode || 'chat' });
  res.json(result);
});

router.post('/search', async (req, res) => {
  const { message } = req.body;
  const intent = searchFromMessage(message || '');
  const filter = { status: 'available' };

  if (intent.filters.composition) {
    filter['specifications.composition'] = { $regex: intent.filters.composition, $options: 'i' };
  }
  if (intent.filters.color) filter.colors = { $regex: intent.filters.color, $options: 'i' };
  if (intent.filters.maxGsm) filter['specifications.gsm'] = { $lte: intent.filters.maxGsm };
  if (intent.q) {
    filter.$or = [
      { name: { $regex: intent.q, $options: 'i' } },
      { category: { $regex: intent.q, $options: 'i' } },
      { description: { $regex: intent.q, $options: 'i' } },
    ];
  }

  const products = await Product.find(filter).limit(20);
  res.json({ intent, products });
});

/**
 * Sample Match — GREIGE signature feature.
 * Body: { hex? | r,g,b?, targetGsm?, category?, weave?, handFeel? }
 */
router.post('/match-sample', async (req, res) => {
  let sampleRgb = null;
  if (req.body.hex) {
    sampleRgb = hexToRgb(req.body.hex);
  } else if (
    Number.isFinite(req.body.r) &&
    Number.isFinite(req.body.g) &&
    Number.isFinite(req.body.b)
  ) {
    sampleRgb = {
      r: Math.min(255, Math.max(0, Math.round(req.body.r))),
      g: Math.min(255, Math.max(0, Math.round(req.body.g))),
      b: Math.min(255, Math.max(0, Math.round(req.body.b))),
    };
  }

  if (!sampleRgb) {
    return res.status(400).json({
      message: 'Provide a sample color as hex or r/g/b from a swatch photo.',
    });
  }

  const products = await Product.find({ status: 'available' }).limit(80);
  const matches = rankSampleMatches(products, sampleRgb, {
    targetGsm: req.body.targetGsm,
    category: req.body.category,
    weave: req.body.weave,
    handFeel: req.body.handFeel,
  });

  res.json({
    sample: {
      rgb: sampleRgb,
      hex: `#${[sampleRgb.r, sampleRgb.g, sampleRgb.b]
        .map((v) => v.toString(16).padStart(2, '0'))
        .join('')}`,
    },
    matches: matches.map((row) => ({
      ...row.product.toObject(),
      matchScore: row.matchScore,
      matchedColor: row.matchedColor,
      matchedHex: row.matchedHex,
      reasons: row.reasons,
    })),
    count: matches.length,
  });
});

router.post('/compare', async (req, res) => {
  const ids = req.body.productIds || [];
  const products = await Product.find({ _id: { $in: ids } });
  const result = await compareProducts(products);
  res.json({ ...result, products });
});

router.post('/similar', async (req, res) => {
  const product = await Product.findById(req.body.productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const similar = await Product.find({
    _id: { $ne: product._id },
    status: 'available',
    $or: [
      { category: product.category },
      { 'specifications.composition': product.specifications?.composition },
    ],
  }).limit(6);

  res.json({ products: similar });
});

export default router;
