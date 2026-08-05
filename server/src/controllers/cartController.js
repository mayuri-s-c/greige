import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

function sameLine(item, productId, color = '') {
  const itemProductId = String(item.product._id || item.product);
  const itemColor = (item.color || '').trim();
  return itemProductId === String(productId) && itemColor === String(color || '').trim();
}

async function getOrCreateCart(buyerId) {
  let cart = await Cart.findOne({ buyer: buyerId }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ buyer: buyerId, items: [] });
    cart = await Cart.findById(cart._id).populate('items.product');
  }
  return cart;
}

export async function getCart(req, res) {
  const cart = await getOrCreateCart(req.user.id);
  res.json({ cart });
}

export async function addToCart(req, res) {
  const { productId, quantity = 1, color = '' } = req.body;
  const selectedColor = String(color || '').trim();

  const product = await Product.findById(productId);
  if (!product || product.status !== 'available') {
    return res.status(400).json({ message: 'Product unavailable' });
  }

  if (selectedColor && product.colors?.length && !product.colors.includes(selectedColor)) {
    return res.status(400).json({ message: 'Selected colorway is not available for this product' });
  }

  const cart = await getOrCreateCart(req.user.id);
  const existing = cart.items.find((item) => sameLine(item, productId, selectedColor));

  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    cart.items.push({
      product: productId,
      quantity: Number(quantity),
      color: selectedColor,
    });
  }

  await cart.save();
  const populated = await Cart.findById(cart._id).populate('items.product');
  res.json({ cart: populated });
}

export async function updateCartItem(req, res) {
  const { productId, quantity, color = '' } = req.body;
  const selectedColor = String(color || '').trim();
  const cart = await getOrCreateCart(req.user.id);
  const item = cart.items.find((i) => sameLine(i, productId, selectedColor));
  if (!item) return res.status(404).json({ message: 'Item not in cart' });

  if (Number(quantity) <= 0) {
    cart.items = cart.items.filter((i) => !sameLine(i, productId, selectedColor));
  } else {
    item.quantity = Number(quantity);
  }

  await cart.save();
  const populated = await Cart.findById(cart._id).populate('items.product');
  res.json({ cart: populated });
}

export async function removeFromCart(req, res) {
  const selectedColor = String(req.query.color || '').trim();
  const cart = await getOrCreateCart(req.user.id);
  cart.items = cart.items.filter((i) => !sameLine(i, req.params.productId, selectedColor));
  await cart.save();
  const populated = await Cart.findById(cart._id).populate('items.product');
  res.json({ cart: populated });
}

export async function clearCart(req, res) {
  const cart = await getOrCreateCart(req.user.id);
  cart.items = [];
  await cart.save();
  res.json({ cart });
}
