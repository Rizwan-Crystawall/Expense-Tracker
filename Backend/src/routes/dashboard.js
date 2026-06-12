import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAccountsForUser, getAccountForUser } from '../data/accountRepository.js';
import { getTransactionsForUser, getTransactionsByAccount } from '../data/transactionRepository.js';
import { getTransfersForUser, getTransfersForAccount } from '../data/transferRepository.js';
import { getBudgetsForAccount } from '../data/budgetRepository.js';
import {
  getBalance,
  getMonthlySummary,
  getChartData,
  getMonthlyCashflow,
  getBudgetStatus,
} from '../services/calculations.js';
import { getCache, setCache, cacheKeys } from '../services/cache.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { accountId } = req.query;
    const now = new Date();
    const year = parseInt(req.query.year, 10) || now.getFullYear();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const chartMonths = parseInt(req.query.months, 10) || 6;

    const cacheKey = cacheKeys(req.user.id).dashboard(accountId, year, month, chartMonths);
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    let transactions;
    let transfers = [];
    let account = null;
    let accounts = [];

    if (accountId) {
      account = await getAccountForUser(req.user.id, accountId);
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }
      [transactions, transfers] = await Promise.all([
        getTransactionsByAccount(req.user.id, accountId),
        getTransfersForAccount(req.user.id, accountId),
      ]);
    } else {
      accounts = await getAccountsForUser(req.user.id);
      [transactions, transfers] = await Promise.all([
        getTransactionsForUser(req.user.id),
        getTransfersForUser(req.user.id),
      ]);
    }

    const balance = accountId
      ? getBalance(transactions, transfers, accountId)
      : getBalance(transactions);
    const summary = getMonthlySummary(transactions, year, month);
    const charts = getChartData(transactions, chartMonths);
    const cashflow = getMonthlyCashflow(transactions, chartMonths);

    let budgets = null;
    if (accountId) {
      const accountBudgets = await getBudgetsForAccount(req.user.id, accountId);
      budgets = getBudgetStatus(accountBudgets, summary.expensesByCategory);
    }

    const payload = {
      account,
      accounts,
      totalBalance: account ? account.balance : accounts.reduce((sum, a) => sum + a.balance, 0),
      balance,
      summary,
      charts,
      cashflow,
      budgets,
      year,
      month,
    };

    await setCache(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
