import mongoose from 'mongoose';

const supplierProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    businessName: { type: String, default: '' },
    businessType: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    address: {
      line1: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: '' },
      postalCode: { type: String, default: '' },
    },
    operatingHours: { type: String, default: '' },
    productCategories: [{ type: String }],
    fabricTypesOffered: [{ type: String }],
    moq: { type: String, default: '' },
    additionalInfo: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('SupplierProfile', supplierProfileSchema);
