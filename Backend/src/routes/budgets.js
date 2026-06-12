import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAccountForUser } from '../data/accountRepository.js';
import { getTransactionsByAccount } from '../data/transactionRepository.js';
import {
  getBudgetsForAccount,
  getBudgetById,
  findBudgetByCategory,
  addBudget,
  updateBudget,
  deleteBudget,
} from '../data/budgetRepository.js';
import { getMonthlySummary, getBudgetStatus } from '../services/calculations.js';
import { validateBudgetInput } from '../utils/validation.js';
import { invalidateUserCache } from '../services/cache.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { accountId } = req.query;
    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    const now = new Date();
    const year = parseInt(req.query.year, 10) || now.getFullYear();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;

    const account = await getAccountForUser(req.user.id, accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const [budgets, transactions] = await Promise.all([
      getBudgetsForAccount(req.user.id, accountId),
      getTransactionsByAccount(req.user.id, accountId),
    ]);

    const summary = getMonthlySummary(transactions, year, month);
    const budgetStatus = getBudgetStatus(budgets, summary.expensesByCategory);

    res.json({
      year,
      month,
      budgets,
      ...budgetStatus,
    });
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

    const account = await getAccountForUser(req.user.id, accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const validation = validateBudgetInput(req.body);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const existing = await findBudgetByCategory(
      req.user.id,
      accountId,
      validation.data.category
    );
    if (existing) {
      return res.status(409).json({ error: 'A budget already exists for this category' });
    }

    const budget = await addBudget({
      ...validation.data,
      accountId,
      userId: req.user.id,
    });

    await invalidateUserCache(req.user.id);
    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await getBudgetById(req.user.id, req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    const validation = validateBudgetInput(req.body, { partial: true });
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    if (validation.data.category && validation.data.category !== existing.category) {
      const duplicate = await findBudgetByCategory(
        req.user.id,
        existing.accountId,
        validation.data.category
      );
      if (duplicate) {
        return res.status(409).json({ error: 'A budget already exists for this category' });
      }
    }

    const budget = await updateBudget(req.user.id, req.params.id, validation.data);
    await invalidateUserCache(req.user.id);
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const removed = await deleteBudget(req.user.id, req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await invalidateUserCache(req.user.id);
    res.json(removed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
