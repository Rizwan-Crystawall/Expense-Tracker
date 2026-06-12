import { useState, useEffect, useCallback } from 'react';
import {
  fetchDashboard,
  fetchTransactions,
  fetchAccountActivity,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  deleteTransfer,
} from '../api';
import BalanceCard from '../components/BalanceCard';
import TransactionForm from '../components/TransactionForm';
import MonthlySummary from '../components/MonthlySummary';
import Charts from '../components/Charts';
import MonthlyCashflow from '../components/MonthlyCashflow';
import TransactionList from '../components/TransactionList';
import DashboardStats from '../components/DashboardStats';
export default function DashboardPage({ account, onDataChange }) {
  const [transactions, setTransactions] = useState([]);
  const [activity, setActivity] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchDashboard({
        accountId: account.id,
        year: selectedYear,
        month: selectedMonth,
        months: 12,
      });
      setDashboard(data);
      const [txnData, activityData] = await Promise.all([
        fetchTransactions(account.id),
        fetchAccountActivity(account.id),
      ]);
      setTransactions(txnData);
      setActivity(activityData);
      await onDataChange?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [account.id, selectedYear, selectedMonth, onDataChange]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const handleAdd = async (data) => {
    await addTransaction(account.id, data);
    setEditingTransaction(null);
    await loadData();
  };

  const handleUpdate = async (data) => {
    await updateTransaction(editingTransaction.id, data);
    setEditingTransaction(null);
    await loadData();
  };

  const handleDelete = async (item) => {
    if (item.recordType === 'transfer') {
      await deleteTransfer(item.id);
    } else {
      await deleteTransaction(item.id);
      if (editingTransaction?.id === item.id) setEditingTransaction(null);
    }
    await loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-on-surface-variant">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="mb-4">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">{account.name}</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Manage income and expenses for this account
        </p>
      </section>

      {error && (
        <div className="text-error font-body-md bg-error/10 border border-error/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {dashboard && (
        <DashboardStats
          balance={dashboard.balance}
          income={dashboard.summary.income}
          expenses={dashboard.summary.expenses}
          budgetTotals={dashboard.budgets?.totals}
        />
      )}

      <BalanceCard balance={dashboard?.balance ?? 0} label="Account Balance" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransactionForm
          key={editingTransaction?.id || 'new'}
          onSubmit={editingTransaction ? handleUpdate : handleAdd}
          initialData={editingTransaction}
          onCancel={editingTransaction ? () => setEditingTransaction(null) : null}
        />
        <MonthlySummary
          summary={dashboard?.summary}
          year={selectedYear}
          month={selectedMonth}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
          account={account}
          transactions={transactions}
          accountBalance={dashboard?.balance ?? 0}
        />
      </div>

      {dashboard?.cashflow && (
        <MonthlyCashflow
          cashflow={dashboard.cashflow}
          highlightYear={selectedYear}
          highlightMonth={selectedMonth}
        />
      )}

      {dashboard?.charts && <Charts data={dashboard.charts} />}

      <TransactionList
        items={activity}
        onDelete={handleDelete}
        onEdit={(txn) => {
          setEditingTransaction(txn);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        editingId={editingTransaction?.id}
      />
    </div>
  );
}
