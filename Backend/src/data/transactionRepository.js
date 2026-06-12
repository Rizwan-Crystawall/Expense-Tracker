import { Op } from 'sequelize';
import Transaction, { toTransactionDto } from '../models/Transaction.js';

const defaultOrder = [
  ['date', 'DESC'],
  ['createdAt', 'DESC'],
];

export async function getTransactionsByAccount(userId, accountId) {
  const rows = await Transaction.findAll({
    where: { userId, accountId },
    order: defaultOrder,
  });
  return rows.map(toTransactionDto);
}

export async function getTransactionsForUser(userId, accountIds = null) {
  const where = { userId };
  if (accountIds?.length) {
    where.accountId = { [Op.in]: accountIds };
  }

  const rows = await Transaction.findAll({ where, order: defaultOrder });
  return rows.map(toTransactionDto);
}

export async function getTransactionById(userId, id) {
  const row = await Transaction.findOne({ where: { id, userId } });
  return row ? toTransactionDto(row) : null;
}

export async function addTransaction(data) {
  const row = await Transaction.create(data);
  return toTransactionDto(row);
}

export async function updateTransaction(userId, id, data) {
  const row = await Transaction.findOne({ where: { id, userId } });
  if (!row) return null;
  await row.update(data);
  return toTransactionDto(row);
}

export async function deleteTransaction(userId, id) {
  const row = await Transaction.findOne({ where: { id, userId } });
  if (!row) return null;
  const dto = toTransactionDto(row);
  await row.destroy();
  return dto;
}
