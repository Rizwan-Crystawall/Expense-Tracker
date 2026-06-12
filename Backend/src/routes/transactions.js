import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from '../data/transactionRepository.js';
import { validateTransactionInput } from '../utils/validation.js';
import { invalidateUserCache } from '../services/cache.js';

const router = Router();

router.use(authenticate);

router.get('/:id', async (req, res) => {
  try {
    const transaction = await getTransactionById(req.user.id, req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await getTransactionById(req.user.id, req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const validation = validateTransactionInput(req.body, { partial: true });
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const payload = { ...validation.data };
    if (req.body.type) payload.type = req.body.type;
    if (req.body.amount !== undefined) payload.amount = Number(req.body.amount);
    if (req.body.description) payload.description = req.body.description.trim();
    if (req.body.category) payload.category = req.body.category.trim();
    if (req.body.date) payload.date = req.body.date;

    const transaction = await updateTransaction(req.user.id, req.params.id, payload);
    await invalidateUserCache(req.user.id);
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const removed = await deleteTransaction(req.user.id, req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    await invalidateUserCache(req.user.id);
    res.json(removed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
