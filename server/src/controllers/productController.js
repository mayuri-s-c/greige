import Product from '../models/Product.js';

function buildFilter(query) {
  const filter = {};

  if (query.category) filter.category = query.category;
  if (query.status) filter.status = query.status;
  if (query.featured === 'true') filter.featured = true;
  if (query.supplier) filter.supplier = query.supplier;

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  if (query.minGsm || query.maxGsm) {
    filter['specifications.gsm'] = {};
    if (query.minGsm) filter['specifications.gsm'].$gte = Number(query.minGsm);
    if (query.maxGsm) filter['specifications.gsm'].$lte = Number(query.maxGsm);
  }

  if (query.color) filter.colors = { $regex: query.color, $options: 'i' };
  if (query.composition) {
    filter['specifications.composition'] = { $regex: query.composition, $options: 'i' };
  }

  if (query.q) {
    filter.$or = [
      { name: { $regex: query.q, $options: 'i' } },
      { description: { $regex: query.q, $options: 'i' } },
      { category: { $regex: query.q, $options: 'i' } },
    ];
  }

  return filter;
}

export async function listProducts(req, res) {
  const filter = buildFilter(req.query);
  const products = await Product.find(filter)
    .populate('supplier', 'name email')
    .sort({ featured: -1, createdAt: -1 });
  res.json({ products });
}

export async function getProduct(req, res) {
  const product = await Product.findById(req.params.id).populate('supplier', 'name email');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ product });
}

export async function getCategories(_req, res) {
  const categories = await Product.distinct('category');
  res.json({ categories: categories.sort() });
}

export async function getFeatured(_req, res) {
  const products = await Product.find({ featured: true, status: 'available' })
    .populate('supplier', 'name')
    .limit(8)
    .sort({ updatedAt: -1 });
  res.json({ products });
}

export async function createProduct(req, res) {
  const payload = {
    ...req.body,
    supplier: req.user.id,
    images: req.body.images || [],
  };

  if (payload.stock === 0) payload.status = 'out_of_stock';
  const product = await Product.create(payload);
  res.status(201).json({ product });
}

export async function updateProduct(req, res) {
  const product = await Product.findOne({ _id: req.params.id, supplier: req.user.id });
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const fields = [
    'name',
    'category',
    'description',
    'colors',
    'specifications',
    'stock',
    'unit',
    'price',
    'currency',
    'images',
    'status',
    'featured',
  ];

  for (const field of fields) {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  }

  if (product.stock === 0) product.status = 'out_of_stock';
  if (product.stock > 0 && product.status === 'out_of_stock' && req.body.status !== 'out_of_stock') {
    product.status = 'available';
  }

  await product.save();
  res.json({ product });
}

export async function deleteProduct(req, res) {
  const product = await Product.findOneAndDelete({
    _id: req.params.id,
    supplier: req.user.id,
  });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted' });
}

export async function myProducts(req, res) {
  const products = await Product.find({ supplier: req.user.id }).sort({ updatedAt: -1 });
  res.json({ products });
}
