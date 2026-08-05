import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    colors: [{ type: String }],
    specifications: {
      composition: { type: String, default: '' },
      gsm: { type: Number, default: null },
      width: { type: String, default: '' },
      weave: { type: String, default: '' },
      finish: { type: String, default: '' },
      handFeel: { type: String, default: '' },
    },
    stock: { type: Number, default: 0, min: 0 },
    unit: { type: String, default: 'meters' },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    images: [{ type: String }],
    status: { type: String, enum: ['available', 'out_of_stock'], default: 'available' },
    featured: { type: Boolean, default: false },
    embedding: [{ type: Number }],
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', category: 'text' });
productSchema.index({ category: 1, price: 1, status: 1 });

export default mongoose.model('Product', productSchema);
