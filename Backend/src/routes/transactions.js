import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getTransactionsForUser,
  getTransactionById,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '../data/transactionRepository.js';
import {
  getBalance,
  getMonthlySummary,
  getChartData,
} from '../services/calculations.js';
import { validateTransactionInput } from '../utils/validation.js';
import { invalidateUserCache } from '../services/cache.js';

const router = Router();

router.use(authenticate);

router.get('/balance', async (req, res) => {
  try {
    const transactions = await getTransactionsForUser(req.user.id);
    res.json({ balance: getBalance(transactions) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/charts', async (req, res) => {
  try {
    const months = parseInt(req.query.months, 10) || 6;
    const transactions = await getTransactionsForUser(req.user.id);
    res.json(getChartData(transactions, months));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/summary/:year/:month', async (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    const transactions = await getTransactionsForUser(req.user.id);
    res.json(getMonthlySummary(transactions, year, month));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const transactions = await getTransactionsForUser(req.user.id);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

router.post('/', async (req, res) => {
  try {
    const { accountId } = req.body;
    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    const validation = validateTransactionInput(req.body);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const transaction = await addTransaction({
      ...validation.data,
      accountId,
      userId: req.user.id,
    });

    await invalidateUserCache(req.user.id);
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const transaction = await getTransactionById(req.user.id, req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const validation = validateTransactionInput(req.body, { partial: true });
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const updated = await updateTransaction(req.user.id, req.params.id, validation.data);
    if (!updated) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await invalidateUserCache(req.user.id);
    res.json(updated);
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