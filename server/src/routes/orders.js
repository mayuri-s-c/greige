import { Router } from 'express';
import {
  cancelOrder,
  getOrder,
  myOrders,
  placeOrder,
  supplierOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, authorize('buyer'), placeOrder);
router.get('/mine', protect, authorize('buyer'), myOrders);
router.get('/supplier', protect, authorize('supplier'), supplierOrders);
router.get('/:id', protect, getOrder);
router.patch('/:id/status', protect, authorize('supplier'), updateOrderStatus);
router.patch('/:id/cancel', protect, authorize('buyer'), cancelOrder);

export default router;
