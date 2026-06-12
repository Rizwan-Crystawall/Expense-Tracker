import Budget, { toBudgetDto } from '../models/Budget.js';

export async function getBudgetsForAccount(userId, accountId) {
  const rows = await Budget.findAll({
    where: { userId, accountId },
    order: [['category', 'ASC']],
  });
  return rows.map(toBudgetDto);
}

export async function getBudgetById(userId, id) {
  const row = await Budget.findOne({ where: { id, userId } });
  return row ? toBudgetDto(row) : null;
}

export async function findBudgetByCategory(userId, accountId, category) {
  const row = await Budget.findOne({ where: { userId, accountId, category } });
  return row ? toBudgetDto(row) : null;
}

export async function addBudget(data) {
  const row = await Budget.create(data);
  return toBudgetDto(row);
}

export async function updateBudget(userId, id, data) {
  const row = await Budget.findOne({ where: { id, userId } });
  if (!row) return null;
  await row.update(data);
  return toBudgetDto(row);
}

export async function deleteBudget(userId, id) {
  const row = await Budget.findOne({ where: { id, userId } });
  if (!row) return null;
  const dto = toBudgetDto(row);
  await row.destroy();
  return dto;
}
