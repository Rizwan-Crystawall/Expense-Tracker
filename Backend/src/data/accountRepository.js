import Account, { toAccountDto } from '../models/Account.js';
import { getBalance } from '../services/calculations.js';
import { getTransactionsByAccount } from './transactionRepository.js';
import { getTransfersForUser } from './transferRepository.js';

export async function getAccountsForUser(userId) {
  const accounts = await Account.findAll({
    where: { userId },
    order: [['createdAt', 'ASC']],
  });
  const transfers = await getTransfersForUser(userId);

  return Promise.all(
    accounts.map(async (account) => {
      const transactions = await getTransactionsByAccount(userId, account.id);
      return toAccountDto(account, getBalance(transactions, transfers, account.id));
    })
  );
}

export async function getAccountForUser(userId, accountId) {
  const account = await Account.findOne({ where: { id: accountId, userId } });
  if (!account) return null;

  const [transactions, transfers] = await Promise.all([
    getTransactionsByAccount(userId, accountId),
    getTransfersForUser(userId),
  ]);

  return toAccountDto(account, getBalance(transactions, transfers, accountId));
}
