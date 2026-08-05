import Board from '../models/Board.js';

export async function listBoards(req, res) {
  const boards = await Board.find({ buyer: req.user.id })
    .populate('products')
    .collation({ locale: 'en', strength: 2 })
    .sort({ name: 1 });
  res.json({ boards });
}

export async function createBoard(req, res) {
  const board = await Board.create({
    buyer: req.user.id,
    name: req.body.name || 'Untitled board',
    products: [],
  });
  res.status(201).json({ board });
}

export async function addToBoard(req, res) {
  const board = await Board.findOne({ _id: req.params.id, buyer: req.user.id });
  if (!board) return res.status(404).json({ message: 'Board not found' });

  const productId = req.body.productId;
  if (!board.products.some((p) => String(p) === productId)) {
    board.products.push(productId);
    await board.save();
  }

  const populated = await Board.findById(board._id).populate('products');
  res.json({ board: populated });
}

export async function removeFromBoard(req, res) {
  const board = await Board.findOne({ _id: req.params.id, buyer: req.user.id });
  if (!board) return res.status(404).json({ message: 'Board not found' });

  board.products = board.products.filter((p) => String(p) !== req.params.productId);
  await board.save();
  const populated = await Board.findById(board._id).populate('products');
  res.json({ board: populated });
}

export async function moveBetweenBoards(req, res) {
  const { productId, targetBoardId } = req.body;
  if (!productId || !targetBoardId) {
    return res.status(400).json({ message: 'productId and targetBoardId are required' });
  }
  if (String(req.params.id) === String(targetBoardId)) {
    return res.status(400).json({ message: 'Choose a different board' });
  }

  const [source, target] = await Promise.all([
    Board.findOne({ _id: req.params.id, buyer: req.user.id }),
    Board.findOne({ _id: targetBoardId, buyer: req.user.id }),
  ]);

  if (!source || !target) {
    return res.status(404).json({ message: 'Board not found' });
  }

  const hasProduct = source.products.some((p) => String(p) === String(productId));
  if (!hasProduct) {
    return res.status(404).json({ message: 'Product not on this board' });
  }

  source.products = source.products.filter((p) => String(p) !== String(productId));
  if (!target.products.some((p) => String(p) === String(productId))) {
    target.products.push(productId);
  }

  await Promise.all([source.save(), target.save()]);

  const [sourcePopulated, targetPopulated] = await Promise.all([
    Board.findById(source._id).populate('products'),
    Board.findById(target._id).populate('products'),
  ]);

  res.json({ source: sourcePopulated, target: targetPopulated });
}

export async function deleteBoard(req, res) {
  const board = await Board.findOneAndDelete({ _id: req.params.id, buyer: req.user.id });
  if (!board) return res.status(404).json({ message: 'Board not found' });
  res.json({ message: 'Board deleted' });
}
