import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    price: Number,
    quantity: Number,
    color: { type: String, default: '' },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    summary: { type: String, required: true },
    reason: { type: String, default: '', trim: true },
    actorRole: { type: String, enum: ['buyer', 'supplier', 'system'], default: 'system' },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

export const ORDER_STATUSES = [
  'pending',
  'accepted',
  'preparing',
  'ready_for_dispatch',
  'completed',
  'declined',
  'cancelled',
];

export function statusSummary(status, { actorRole = 'system' } = {}) {
  const label = String(status || '').replaceAll('_', ' ');
  switch (status) {
    case 'pending':
      return 'Order placed';
    case 'completed':
      return 'Order completed';
    case 'declined':
      return 'Order declined by supplier';
    case 'cancelled':
      return 'Order cancelled by buyer';
    default:
      return actorRole === 'supplier'
        ? `Status updated to ${label}`
        : `Status changed to ${label}`;
  }
}

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shipping: {
      fullName: String,
      phone: String,
      addressLine1: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      notes: String,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'pending',
    },
    statusReason: { type: String, default: '', trim: true },
    statusHistory: { type: [statusHistorySchema], default: [] },
    lastModifiedAt: { type: Date, default: Date.now },
    subtotal: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
  },
  { timestamps: true }
);

orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ 'items.supplier': 1, status: 1 });

export default mongoose.model('Order', orderSchema);
