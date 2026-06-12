import { formatCurrency } from '../utils/currency';

export default function DashboardStats({ balance, income, expenses, budgetTotals }) {
  const budgetAlert =
    budgetTotals?.status === 'over'
      ? `Over budget by ${formatCurrency(Math.abs(budgetTotals.remaining))}`
      : budgetTotals?.status === 'warning'
        ? `${formatCurrency(budgetTotals.remaining)} left in tracked budgets`
        : null;

  return (
    <div className="space-y-4">
      {budgetAlert && (
        <div
          className={`rounded-xl px-4 py-3 border font-body-md text-body-md ${
            budgetTotals.status === 'over'
              ? 'bg-error/10 border-error/20 text-error'
              : 'bg-secondary/10 border-secondary/20 text-secondary'
          }`}
        >
          {budgetAlert}
        </div>
      )}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="glass-panel rounded-2xl p-5">
        <span className="font-label-md text-label-md text-on-surface-variant block mb-1">Balance</span>
        <span className={`font-headline-md text-headline-md font-bold ${balance >= 0 ? 'text-primary' : 'text-error'}`}>
          {formatCurrency(balance)}
        </span>
      </div>
      <div className="glass-panel rounded-2xl p-5 border-primary/20">
        <span className="font-label-md text-label-md text-on-surface-variant block mb-1">Income (This Month)</span>
        <span className="font-headline-md text-headline-md font-bold text-primary">{formatCurrency(income)}</span>
      </div>
      <div className="glass-panel rounded-2xl p-5 border-error/20">
        <span className="font-label-md text-label-md text-on-surface-variant block mb-1">Expenses (This Month)</span>
        <span className="font-headline-md text-headline-md font-bold text-error">{formatCurrency(expenses)}</span>
      </div>
    </div>
    </div>
  );
}
