import { Op } from 'sequelize';
import Transfer, { toTransferDto } from '../models/Transfer.js';
import Account from '../models/Account.js';

const defaultOrder = [
  ['date', 'DESC'],
  ['createdAt', 'DESC'],
];

async function getAccountNameMap(userId, transfers) {
  const accountIds = new Set();
  transfers.forEach((t) => {
    const data = t.toJSON ? t.toJSON() : t;
    accountIds.add(data.fromAccountId);
    accountIds.add(data.toAccountId);
  });

  if (!accountIds.size) return {};

  const accounts = await Account.findAll({
    where: { userId, id: { [Op.in]: [...accountIds] } },
    attributes: ['id', 'name'],
  });

  return Object.fromEntries(accounts.map((a) => [a.id, a.name]));
}

export async function getTransfersForAccount(userId, accountId) {
  const rows = await Transfer.findAll({
    where: {
      userId,
      [Op.or]: [{ fromAccountId: accountId }, { toAccountId: accountId }],
    },
    order: defaultOrder,
  });

  const nameMap = await getAccountNameMap(userId, rows);
  return rows.map((row) => toTransferDto(row, nameMap));
}

export async function getTransfersForUser(userId) {
  const rows = await Transfer.findAll({ where: { userId }, order: defaultOrder });
  const nameMap = await getAccountNameMap(userId, rows);
  return rows.map((row) => toTransferDto(row, nameMap));
}

export async function getTransferById(userId, id) {
  const row = await Transfer.findOne({ where: { id, userId } });
  if (!row) return null;
  const nameMap = await getAccountNameMap(userId, [row]);
  return toTransferDto(row, nameMap);
}

export async function addTransfer(data) {
  const row = await Transfer.create(data);
  const nameMap = await getAccountNameMap(data.userId, [row]);
  return toTransferDto(row, nameMap);
}

export async function deleteTransfer(userId, id) {
  const row = await Transfer.findOne({ where: { id, userId } });
  if (!row) return null;
  const nameMap = await getAccountNameMap(userId, [row]);
  const dto = toTransferDto(row, nameMap);
  await row.destroy();
  return dto;
}
