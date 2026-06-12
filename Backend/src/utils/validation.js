export function validateTransactionInput(body, { partial = false } = {}) {
  const { type, amount, description, category, date } = body;
  const errors = [];

  if (!partial || type !== undefined) {
    if (!type || !['income', 'expense'].includes(type)) {
      errors.push('Type must be "income" or "expense"');
    }
  }

  if (!partial || amount !== undefined) {
    if (amount === undefined || amount === null || Number(amount) <= 0) {
      errors.push('Amount must be a positive number');
    }
  }

  if (errors.length) {
    return { error: errors[0] };
  }

  const resolvedType = type ?? body.type;
  const payload = {};
  if (resolvedType !== undefined) payload.type = resolvedType;
  if (amount !== undefined) payload.amount = Number(amount);

  if (!partial || description !== undefined) {
    payload.description = description?.trim() || '';
  }

  if (!partial || category !== undefined) {
    payload.category = category?.trim() || (resolvedType === 'income' ? 'Salary' : 'Other');
  }

  if (!partial || date !== undefined) {
    payload.date = date || new Date().toISOString().split('T')[0];
  }

  return { data: payload };
}

export function validateTransferInput(body) {
  const { fromAccountId, toAccountId, amount, description, date } = body;
  const errors = [];

  if (!fromAccountId) {
    errors.push('Source account is required');
  }
  if (!toAccountId) {
    errors.push('Destination account is required');
  }
  if (fromAccountId && toAccountId && fromAccountId === toAccountId) {
    errors.push('Source and destination accounts must be different');
  }
  if (amount === undefined || amount === null || Number(amount) <= 0) {
    errors.push('Amount must be a positive number');
  }

  if (errors.length) {
    return { error: errors[0] };
  }

  return {
    data: {
      fromAccountId,
      toAccountId,
      amount: Number(amount),
      description: description?.trim() || '',
      date: date || new Date().toISOString().split('T')[0],
    },
  };
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Other',
];

export function validateBudgetInput(body, { partial = false } = {}) {
  const { category, monthlyLimit } = body;
  const errors = [];

  if (!partial || category !== undefined) {
    if (!category?.trim()) {
      errors.push('Category is required');
    } else if (!EXPENSE_CATEGORIES.includes(category.trim())) {
      errors.push('Invalid expense category');
    }
  }

  if (!partial || monthlyLimit !== undefined) {
    if (monthlyLimit === undefined || monthlyLimit === null || Number(monthlyLimit) <= 0) {
      errors.push('Monthly limit must be a positive number');
    }
  }

  if (errors.length) {
    return { error: errors[0] };
  }

  const payload = {};
  if (category !== undefined) payload.category = category.trim();
  if (monthlyLimit !== undefined) payload.monthlyLimit = Number(monthlyLimit);

  return { data: payload };
}
