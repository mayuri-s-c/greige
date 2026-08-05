import { Router } from 'express';
import {
  addToBoard,
  createBoard,
  deleteBoard,
  listBoards,
  moveBetweenBoards,
  removeFromBoard,
} from '../controllers/boardController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize('buyer'));
router.get('/', listBoards);
router.post('/', createBoard);
router.post('/:id/products', addToBoard);
router.post('/:id/move', moveBetweenBoards);
router.delete('/:id/products/:productId', removeFromBoard);
router.delete('/:id', deleteBoard);

export default router;
