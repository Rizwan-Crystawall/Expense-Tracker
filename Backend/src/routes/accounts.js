import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAccountsForUser, getAccountForUser } from '../data/accountRepository.js';
import {
  getTransactionsByAccount,
  addTransaction,
} from '../data/transactionRepository.js';
import { getTransfersForAccount } from '../data/transferRepository.js';
import {
  getBalance,
  getMonthlySummary,
  getChartData,
} from '../services/calculations.js';
import { mergeActivity } from '../services/activity.js';
import { validateTransactionInput } from '../utils/validation.js';
import { getCache, setCache, invalidateUserCache, cacheKeys } from '../services/cache.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const key = cacheKeys(req.user.id).accounts;
    const cached = await getCache(key);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    const accounts = await getAccountsForUser(req.user.id);
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    const payload = { accounts, totalBalance };
    await setCache(key, payload);
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:accountId', async (req, res) => {
  try {
    const account = await getAccountForUser(req.user.id, req.params.accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:accountId/transactions', async (req, res) => {
  try {
    const account = await getAccountForUser(req.user.id, req.params.accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const key = cacheKeys(req.user.id).transactions(req.params.accountId);
    const cached = await getCache(key);
    if (cached) {
      return res.json(cached);
    }

    const transactions = await getTransactionsByAccount(req.user.id, req.params.accountId);
    await setCache(key, transactions);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:accountId/activity', async (req, res) => {
  try {
    const account = await getAccountForUser(req.user.id, req.params.accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const [transactions, transfers] = await Promise.all([
      getTransactionsByAccount(req.user.id, req.params.accountId),
      getTransfersForAccount(req.user.id, req.params.accountId),
    ]);

    res.json(mergeActivity(transactions, transfers, req.params.accountId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:accountId/transactions', async (req, res) => {
  try {
    const account = await getAccountForUser(req.user.id, req.params.accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const validation = validateTransactionInput(req.body);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const transaction = await addTransaction({
      ...validation.data,
      accountId: req.params.accountId,
      userId: req.user.id,
    });

    await invalidateUserCache(req.user.id);
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:accountId/balance', async (req, res) => {
  try {
    const account = await getAccountForUser(req.user.id, req.params.accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const [transactions, transfers] = await Promise.all([
      getTransactionsByAccount(req.user.id, req.params.accountId),
      getTransfersForAccount(req.user.id, req.params.accountId),
    ]);
    res.json({
      balance: getBalance(transactions, transfers, req.params.accountId),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:accountId/summary/:year/:month', async (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    const account = await getAccountForUser(req.user.id, req.params.accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const transactions = await getTransactionsByAccount(req.user.id, req.params.accountId);
    res.json(getMonthlySummary(transactions, year, month));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:accountId/charts', async (req, res) => {
  try {
    const months = parseInt(req.query.months, 10) || 6;
    const account = await getAccountForUser(req.user.id, req.params.accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const transactions = await getTransactionsByAccount(req.user.id, req.params.accountId);
    res.json(getChartData(transactions, months));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
