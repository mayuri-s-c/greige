import Order, { ORDER_STATUSES, statusSummary } from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const TERMINAL = new Set(['completed', 'declined', 'cancelled']);

function pushHistory(order, { status, reason = '', actorRole = 'system' }) {
  const entry = {
    status,
    summary: statusSummary(status, { actorRole }),
    reason: reason || '',
    actorRole,
    changedAt: new Date(),
  };
  order.statusHistory = [...(order.statusHistory || []), entry];
  order.lastModifiedAt = entry.changedAt;
  return entry;
}

export async function placeOrder(req, res) {
  const cart = await Cart.findOne({ buyer: req.user.id }).populate('items.product');
  if (!cart?.items?.length) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const items = [];
  let subtotal = 0;

  for (const line of cart.items) {
    const product = line.product;
    if (!product || product.status !== 'available' || product.stock < line.quantity) {
      return res.status(400).json({
        message: `Insufficient stock for ${product?.name || 'a product'}`,
      });
    }

    items.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: line.quantity,
      color: line.color || '',
      supplier: product.supplier,
    });
    subtotal += product.price * line.quantity;
  }

  const now = new Date();
  const order = await Order.create({
    buyer: req.user.id,
    items,
    shipping: req.body.shipping,
    subtotal,
    status: 'pending',
    statusReason: '',
    lastModifiedAt: now,
    statusHistory: [
      {
        status: 'pending',
        summary: statusSummary('pending', { actorRole: 'buyer' }),
        reason: '',
        actorRole: 'buyer',
        changedAt: now,
      },
    ],
  });

  for (const line of cart.items) {
    await Product.findByIdAndUpdate(line.product._id, {
      $inc: { stock: -line.quantity },
    });
    const updated = await Product.findById(line.product._id);
    if (updated.stock <= 0) {
      updated.status = 'out_of_stock';
      await updated.save();
    }
  }

  cart.items = [];
  await cart.save();

  res.status(201).json({ order });
}

export async function myOrders(req, res) {
  const orders = await Order.find({ buyer: req.user.id })
    .populate('items.product', 'name images category')
    .sort({ createdAt: -1 });
  res.json({ orders });
}

export async function getOrder(req, res) {
  const order = await Order.findById(req.params.id)
    .populate('items.product', 'name images category')
    .populate('buyer', 'name email');

  if (!order) return res.status(404).json({ message: 'Order not found' });

  const isBuyer = String(order.buyer._id || order.buyer) === req.user.id;
  const isSupplier = order.items.some((i) => String(i.supplier) === req.user.id);

  if (!isBuyer && !isSupplier) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  res.json({ order });
}

export async function supplierOrders(req, res) {
  const orders = await Order.find({ 'items.supplier': req.user.id })
    .populate('buyer', 'name email')
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 });

  const scoped = orders.map((order) => {
    const obj = order.toObject();
    obj.items = obj.items.filter((i) => String(i.supplier) === req.user.id);
    return obj;
  });

  res.json({ orders: scoped });
}

export async function updateOrderStatus(req, res) {
  const { status, statusReason = '' } = req.body;
  if (!ORDER_STATUSES.includes(status) || status === 'cancelled') {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const reason = String(statusReason || '').trim();
  if (status === 'declined' && reason.length < 3) {
    return res.status(400).json({
      message: 'A reason is required when declining an order (min 3 characters)',
    });
  }

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const owns = order.items.some((i) => String(i.supplier) === req.user.id);
  if (!owns) return res.status(403).json({ message: 'Forbidden' });

  if (TERMINAL.has(order.status)) {
    return res.status(400).json({
      message: `Order is already ${order.status.replaceAll('_', ' ')}`,
    });
  }

  if (order.status === status) {
    return res.json({ order });
  }

  order.status = status;
  order.statusReason = status === 'declined' ? reason : '';
  pushHistory(order, { status, reason, actorRole: 'supplier' });
  await order.save();
  res.json({ order });
}

export async function cancelOrder(req, res) {
  const reason = String(req.body.statusReason || req.body.reason || '').trim();
  if (reason.length < 3) {
    return res.status(400).json({
      message: 'A reason is required when cancelling an order (min 3 characters)',
    });
  }

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (String(order.buyer) !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (TERMINAL.has(order.status)) {
    return res.status(400).json({
      message: `Order is already ${order.status.replaceAll('_', ' ')}`,
    });
  }

  order.status = 'cancelled';
  order.statusReason = reason;
  pushHistory(order, { status: 'cancelled', reason, actorRole: 'buyer' });
  await order.save();
  res.json({ order });
}
