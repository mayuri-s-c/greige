import { Router } from 'express';
import {
  getBuyerProfile,
  getSupplierProfile,
  supplierDashboard,
  updateBuyerProfile,
  updateSupplierProfile,
} from '../controllers/profileController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.get('/buyer', protect, authorize('buyer'), getBuyerProfile);
router.put('/buyer', protect, authorize('buyer'), updateBuyerProfile);
router.get('/supplier', protect, authorize('supplier'), getSupplierProfile);
router.put('/supplier', protect, authorize('supplier'), updateSupplierProfile);
router.get('/supplier/dashboard', protect, authorize('supplier'), supplierDashboard);

export default router;
