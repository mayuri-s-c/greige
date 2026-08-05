import mongoose from 'mongoose';

const buyerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    businessType: { type: String, default: '' },
    industry: { type: String, default: '' },
    categoriesOfInterest: [{ type: String }],
    preferredFabricTypes: [{ type: String }],
    typicalOrderQuantity: { type: String, default: '' },
    budgetRange: { type: String, default: '' },
    additionalPreferences: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('BuyerProfile', buyerProfileSchema);
