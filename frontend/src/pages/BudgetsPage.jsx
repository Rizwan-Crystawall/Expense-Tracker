import { useState, useEffect, useCallback } from 'react';
import { fetchDashboard } from '../api';
import BudgetPanel from '../components/BudgetPanel';
import DashboardStats from '../components/DashboardStats';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function BudgetsPage({ accounts, onDataChange }) {
  const now = new Date();
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const account = accounts.find((a) => a.id === accountId);

  const loadData = useCallback(async () => {
    if (!accountId) return;
    try {
      setError(null);
      setLoading(true);
      const data = await fetchDashboard({
        accountId,
        year: selectedYear,
        month: selectedMonth,
        months: 6,
      });
      setDashboard(data);
      await onDataChange?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accountId, selectedYear, selectedMonth, onDataChange]);

  useEffect(() => {
    if (accounts.length && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!accounts.length) {
    return (
      <div className="text-center py-20 text-on-surface-variant">
        No accounts available.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Budgets</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Set monthly spending limits and track how much you have left in each category.
        </p>
      </section>

      <div className="glass-panel rounded-2xl p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="block">
            <span className="font-label-md text-label-md text-on-surface-variant mb-1.5 block">
              Account
            </span>
            <select className="form-input" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {accounts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="font-label-md text-label-md text-on-surface-variant mb-1.5 block">
              Month
            </span>
            <select
              className="form-input"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {MONTHS.map((name, i) => (
                <option key={name} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="font-label-md text-label-md text-on-surface-variant mb-1.5 block">
              Year
            </span>
            <select
              className="form-input"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error && (
        <div className="text-error font-body-md bg-error/10 border border-error/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-on-surface-variant">
          Loading budgets...
        </div>
      ) : (
        <>
          {dashboard && (
            <DashboardStats
              balance={dashboard.balance}
              income={dashboard.summary.income}
              expenses={dashboard.summary.expenses}
              budgetTotals={dashboard.budgets?.totals}
            />
          )}

          <BudgetPanel
            budgets={dashboard?.budgets}
            accountId={accountId}
            year={selectedYear}
            month={selectedMonth}
            onChange={loadData}
          />
        </>
      )}
    </div>
  );
}
