function amountOf(t) {
  return Number(t.amount);
}

export function getTransferNetForAccount(accountId, transfers = []) {
  if (!accountId) return 0;

  return transfers.reduce((sum, transfer) => {
    const amount = Number(transfer.amount);
    if (transfer.fromAccountId === accountId) return sum - amount;
    if (transfer.toAccountId === accountId) return sum + amount;
    return sum;
  }, 0);
}

export function getBalance(transactions, transfers = [], accountId = null) {
  const transactionBalance = transactions.reduce((sum, t) => {
    const amount = amountOf(t);
    return t.type === 'income' ? sum + amount : sum - amount;
  }, 0);

  if (!accountId) {
    return transactionBalance;
  }

  return transactionBalance + getTransferNetForAccount(accountId, transfers);
}

export function getMonthlySummary(transactions, year, month) {
  const filtered = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });

  const income = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + amountOf(t), 0);

  const expenses = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + amountOf(t), 0);

  const byCategory = {};
  filtered
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const amount = amountOf(t);
      byCategory[t.category] = (byCategory[t.category] || 0) + amount;
    });

  return {
    year,
    month,
    income,
    expenses,
    balance: income - expenses,
    transactionCount: filtered.length,
    expensesByCategory: byCategory,
  };
}

export function getMonthlyCashflow(transactions, months = 12) {
  const now = new Date();
  const monthly = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const summary = getMonthlySummary(transactions, year, month);

    monthly.push({
      year,
      month,
      label: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
      monthName: d.toLocaleString('default', { month: 'long' }),
      income: summary.income,
      expenses: summary.expenses,
      cashflow: summary.balance,
      transactionCount: summary.transactionCount,
    });
  }

  return monthly;
}

export function getChartData(transactions, months = 6) {
  const cashflowMonths = getMonthlyCashflow(transactions, months);
  const labels = cashflowMonths.map((m) => m.label);
  const incomeData = cashflowMonths.map((m) => m.income);
  const expenseData = cashflowMonths.map((m) => m.expenses);
  const cashflowData = cashflowMonths.map((m) => m.cashflow);

  const categoryTotals = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const amount = amountOf(t);
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
    });

  return {
    monthlyTrend: { labels, income: incomeData, expenses: expenseData },
    monthlyCashflow: { labels, values: cashflowData },
    cashflow: cashflowMonths,
    categoryBreakdown: {
      labels: Object.keys(categoryTotals),
      values: Object.values(categoryTotals),
    },
  };
}

export function getBudgetStatus(budgets, expensesByCategory = {}) {
  const items = budgets.map((budget) => {
    const limit = Number(budget.monthlyLimit);
    const spent = Number(expensesByCategory[budget.category] || 0);
    const remaining = limit - spent;
    const usagePercent = limit > 0 ? Math.round((spent / limit) * 100) : 0;

    let status = 'ok';
    if (spent > limit) status = 'over';
    else if (spent >= limit * 0.8) status = 'warning';

    return {
      ...budget,
      spent,
      remaining,
      usagePercent,
      status,
    };
  });

  const totalLimit = items.reduce((sum, item) => sum + item.monthlyLimit, 0);
  const totalSpent = items.reduce((sum, item) => sum + item.spent, 0);

  return {
    items: items.sort((a, b) => b.spent - a.spent),
    totals: {
      limit: totalLimit,
      spent: totalSpent,
      remaining: totalLimit - totalSpent,
      usagePercent: totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0,
      status:
        totalSpent > totalLimit ? 'over' : totalSpent >= totalLimit * 0.8 ? 'warning' : 'ok',
    },
  };
}
