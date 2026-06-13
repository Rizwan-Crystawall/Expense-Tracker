import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  getAllTransactions,
  addTransaction,
  deleteTransaction,
} from '../data/store.js';
import {
  getBalance,
  getMonthlySummary,
  getChartData,
} from '../services/calculations.js';
const router = Router();

router.get('/balance', (req, res) => {
  const transactions = getAllTransactions();
  res.json({ balance: getBalance(transactions) });
});

router.get('/charts', (req, res) => {
  const months = parseInt(req.query.months, 10) || 6;
  const transactions = getAllTransactions();
  res.json(getChartData(transactions, months));
});

router.get('/summary/:year/:month', (req, res) => {
  const year = parseInt(req.params.year, 10);
  const month = parseInt(req.params.month, 10);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return res.status(400).json({ error: 'Invalid year or month' });
  const transactions = getAllTransactions();
  res.json(getMonthlySummary(transactions, year, month));
router.get('/', (req, res) => {
  const transactions = getAllTransactions();
  res.json(transactions);
});

router.post('/', (req, res) => {
  const { type, amount, description, category, date } = req.body;

  if (!type || !['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'Type must be "income" or "expense"' });
  }
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }
  if (!description?.trim()) {
    return res.status(400).json({ error: 'Description is required' });
  }

  const transaction = {
    id: uuidv4(),
    type,
    amount: Number(amount),
    description: description.trim(),
    category: category?.trim() || (type === 'income' ? 'Salary' : 'Other'),
    date: date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };

  addTransaction(transaction);
  res.status(201).json(transaction);
});

router.delete('/:id', (req, res) => {
  const removed = deleteTransaction(req.params.id);
  if (!removed) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  res.json(removed);