import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getCategories,
  getFeatured,
  getProduct,
  listProducts,
  myProducts,
  updateProduct,
} from '../controllers/productController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.get('/', listProducts);
router.get('/meta/categories', getCategories);
router.get('/meta/featured', getFeatured);
router.get('/mine', protect, authorize('supplier'), myProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize('supplier'), createProduct);
router.put('/:id', protect, authorize('supplier'), updateProduct);
router.delete('/:id', protect, authorize('supplier'), deleteProduct);

export default router;
