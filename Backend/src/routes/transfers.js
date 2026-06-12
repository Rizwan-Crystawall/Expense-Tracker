import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAccountForUser } from '../data/accountRepository.js';
import { getTransactionsByAccount } from '../data/transactionRepository.js';
import {
  addTransfer,
  deleteTransfer,
  getTransferById,
  getTransfersForUser,
} from '../data/transferRepository.js';
import { getBalance } from '../services/calculations.js';
import { validateTransferInput } from '../utils/validation.js';
import { invalidateUserCache } from '../services/cache.js';

const router = Router();

router.use(authenticate);

router.post('/', async (req, res) => {
  try {
    const validation = validateTransferInput(req.body);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const { fromAccountId, toAccountId, amount, description, date } = validation.data;

    const [fromAccount, toAccount] = await Promise.all([
      getAccountForUser(req.user.id, fromAccountId),
      getAccountForUser(req.user.id, toAccountId),
    ]);

    if (!fromAccount || !toAccount) {
      return res.status(404).json({ error: 'One or both accounts were not found' });
    }

    const [transactions, transfers] = await Promise.all([
      getTransactionsByAccount(req.user.id, fromAccountId),
      getTransfersForUser(req.user.id),
    ]);

    const availableBalance = getBalance(transactions, transfers, fromAccountId);
    if (amount > availableBalance) {
      return res.status(400).json({
        error: `Insufficient balance in ${fromAccount.name}. Available: ${availableBalance.toFixed(2)} AED`,
      });
    }

    const transfer = await addTransfer({
      fromAccountId,
      toAccountId,
      amount,
      description,
      date,
      userId: req.user.id,
    });

    await invalidateUserCache(req.user.id);
    res.status(201).json(transfer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const removed = await deleteTransfer(req.user.id, req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Transfer not found' });
    }

    await invalidateUserCache(req.user.id);
    res.json(removed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const transfer = await getTransferById(req.user.id, req.params.id);
    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }
    res.json(transfer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
