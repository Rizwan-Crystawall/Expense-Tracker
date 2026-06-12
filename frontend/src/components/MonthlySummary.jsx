import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import { downloadMonthlyStatement } from '../utils/generateMonthlyStatement';
import Icon from './Icon';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function MonthlySummary({
  summary,
  year,
  month,
  onYearChange,
  onMonthChange,
  account,
  transactions = [],
  accountBalance = 0,
}) {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (!summary) return null;

  const handleDownload = () => {
    downloadMonthlyStatement({
      accountName: account?.name || 'Account',
      username: user?.username || 'User',
      year,
      month,
      summary,
      transactions,
      accountBalance,
    });
  };

  return (
    <div className="glass-panel rounded-3xl p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="font-headline-md text-headline-md text-on-surface">Monthly Summary</h2>
        <button
          type="button"
          onClick={handleDownload}
          className="px-4 py-2.5 bg-primary text-on-primary rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          <Icon name="download" className="text-lg" />
          Download PDF Statement
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <select className="form-input" value={month} onChange={(e) => onMonthChange(Number(e.target.value))}>
          {MONTHS.map((name, i) => (
            <option key={name} value={i + 1}>{name}</option>
          ))}
        </select>
        <select className="form-input" value={year} onChange={(e) => onYearChange(Number(e.target.value))}>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center p-4 rounded-xl bg-primary/10 border border-primary/20">
          <span className="font-label-md text-label-md text-on-surface-variant">Income</span>
          <span className="font-headline-md text-headline-md font-bold text-primary">{formatCurrency(summary.income)}</span>
        </div>
        <div className="flex justify-between items-center p-4 rounded-xl bg-error/10 border border-error/20">
          <span className="font-label-md text-label-md text-on-surface-variant">Expenses</span>
          <span className="font-headline-md text-headline-md font-bold text-error">{formatCurrency(summary.expenses)}</span>
        </div>
        <div className="flex justify-between items-center p-4 rounded-xl bg-surface-container-high border border-white/10">
          <span className="font-label-md text-label-md text-on-surface-variant">Cashflow</span>
          <span className={`font-headline-md text-headline-md font-bold ${summary.balance >= 0 ? 'text-primary' : 'text-error'}`}>
            {summary.balance >= 0 ? '+' : ''}
            {formatCurrency(summary.balance)}
          </span>
        </div>
      </div>

      <p className="font-body-md text-body-md text-on-surface-variant opacity-70 mt-6 text-center">
        {summary.transactionCount} transaction{summary.transactionCount !== 1 ? 's' : ''} this month
      </p>
    </div>
  );
}
