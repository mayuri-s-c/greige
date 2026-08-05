import User from '../models/User.js';
import BuyerProfile from '../models/BuyerProfile.js';
import SupplierProfile from '../models/SupplierProfile.js';

export async function getBuyerProfile(req, res) {
  const profile = await BuyerProfile.findOne({ user: req.user.id });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json({ profile });
}

export async function updateBuyerProfile(req, res) {
  const profile = await BuyerProfile.findOneAndUpdate(
    { user: req.user.id },
    { $set: req.body },
    { new: true, upsert: true }
  );

  if (req.body.completeOnboarding) {
    await User.findByIdAndUpdate(req.user.id, { onboardingComplete: true });
  }

  res.json({ profile });
}

export async function getSupplierProfile(req, res) {
  const profile = await SupplierProfile.findOne({ user: req.user.id });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json({ profile });
}

export async function updateSupplierProfile(req, res) {
  const profile = await SupplierProfile.findOneAndUpdate(
    { user: req.user.id },
    { $set: req.body },
    { new: true, upsert: true }
  );

  if (req.body.completeOnboarding) {
    await User.findByIdAndUpdate(req.user.id, { onboardingComplete: true });
  }

  res.json({ profile });
}

export async function supplierDashboard(req, res) {
  const Product = (await import('../models/Product.js')).default;
  const Order = (await import('../models/Order.js')).default;

  const products = await Product.find({ supplier: req.user.id });
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === 'available').length;
  const inventoryAlerts = products.filter((p) => p.stock <= 20).slice(0, 8);

  const orders = await Order.find({ 'items.supplier': req.user.id })
    .populate('buyer', 'name')
    .sort({ createdAt: -1 });

  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const recentOrders = orders.slice(0, 6).map((order) => {
    const obj = order.toObject();
    obj.items = obj.items.filter((i) => String(i.supplier) === req.user.id);
    return obj;
  });

  res.json({
    stats: {
      totalProducts,
      activeProducts,
      pendingOrders,
      inventoryAlertCount: inventoryAlerts.length,
    },
    recentOrders,
    inventoryAlerts,
  });
}
