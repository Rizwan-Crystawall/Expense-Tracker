import { useState } from 'react';
import { createBudget, updateBudget, deleteBudget } from '../api';
import { formatCurrency } from '../utils/currency';
import { EXPENSE_CATEGORIES } from '../utils/categories';
import Icon from './Icon';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function statusStyles(status) {
  if (status === 'over') {
    return { bar: 'bg-error', text: 'text-error', badge: 'bg-error/15 text-error border-error/30' };
  }
  if (status === 'warning') {
    return {
      bar: 'bg-secondary',
      text: 'text-secondary',
      badge: 'bg-secondary/15 text-secondary border-secondary/30',
    };
  }
  return { bar: 'bg-primary', text: 'text-primary', badge: 'bg-primary/15 text-primary border-primary/30' };
}

function statusLabel(status) {
  if (status === 'over') return 'Over budget';
  if (status === 'warning') return 'Almost full';
  return 'On track';
}

function BudgetRow({ item, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [limit, setLimit] = useState(item.monthlyLimit.toString());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const styles = statusStyles(item.status);
  const barWidth = Math.min(item.usagePercent, 100);

  const handleSave = async () => {
    setError(null);
    const value = parseFloat(limit);
    if (!value || value <= 0) {
      setError('Enter a valid limit');
      return;
    }

    setSaving(true);
    try {
      await onUpdate(item.id, { monthlyLimit: value });
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="p-4 rounded-xl bg-surface-container-low border border-white/5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-label-md text-label-md text-on-surface font-medium">{item.category}</p>
          <p className={`font-body-md text-body-md text-sm mt-0.5 ${styles.text}`}>
            {formatCurrency(item.spent)} of {formatCurrency(item.monthlyLimit)}
          </p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full border font-label-md ${styles.badge}`}>
          {statusLabel(item.status)}
        </span>
      </div>

      <div className="h-2 rounded-full bg-surface-container-high overflow-hidden mb-3">
        <div className={`h-full rounded-full transition-all ${styles.bar}`} style={{ width: `${barWidth}%` }} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="font-body-md text-body-md text-on-surface-variant text-sm">
          {item.remaining >= 0
            ? `${formatCurrency(item.remaining)} left`
            : `${formatCurrency(Math.abs(item.remaining))} over`}
          {' · '}
          {item.usagePercent}% used
        </p>
        <div className="flex items-center gap-1">
          {editing ? (
            <>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input !py-1.5 !px-2 w-28"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="p-2 text-primary hover:bg-primary/10 rounded-lg"
                title="Save"
              >
                <Icon name="check" className="text-lg" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setLimit(item.monthlyLimit.toString());
                  setError(null);
                }}
                className="p-2 text-on-surface-variant hover:bg-white/5 rounded-lg"
                title="Cancel"
              >
                <Icon name="close" className="text-lg" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="p-2 text-on-surface-variant hover:text-primary rounded-lg hover:bg-primary/10"
                title="Edit limit"
              >
                <Icon name="edit" className="text-lg" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="p-2 text-on-surface-variant hover:text-error rounded-lg hover:bg-error/10"
                title="Remove budget"
              >
                <Icon name="delete" className="text-lg" />
              </button>
            </>
          )}
        </div>
      </div>

      {error && <p className="text-error text-xs mt-2">{error}</p>}
    </li>
  );
}

export default function BudgetPanel({ budgets, accountId, year, month, onChange }) {
  const [category, setCategory] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const usedCategories = new Set((budgets?.items || []).map((item) => item.category));
  const availableCategories = EXPENSE_CATEGORIES.filter((cat) => !usedCategories.has(cat));

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!category) {
      setFormError('Select a category');
      return;
    }
    if (!monthlyLimit || parseFloat(monthlyLimit) <= 0) {
      setFormError('Enter a valid monthly limit');
      return;
    }

    setSubmitting(true);
    try {
      await createBudget({
        accountId,
        category,
        monthlyLimit: parseFloat(monthlyLimit),
      });
      setCategory('');
      setMonthlyLimit('');
      await onChange?.();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id, data) => {
    await updateBudget(id, data);
    await onChange?.();
  };

  const handleDelete = async (id) => {
    await deleteBudget(id);
    await onChange?.();
  };

  const totals = budgets?.totals;
  const items = budgets?.items || [];
  const totalStyles = totals ? statusStyles(totals.status) : statusStyles('ok');

  return (
    <div className="glass-panel rounded-3xl p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Monthly Budgets</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Set spending limits by category for {MONTHS[month - 1]} {year}
          </p>
        </div>
        {totals && items.length > 0 && (
          <div className={`px-4 py-2 rounded-xl border ${totalStyles.badge}`}>
            <span className="font-label-md text-label-md">
              Total: {formatCurrency(totals.spent)} / {formatCurrency(totals.limit)}
            </span>
          </div>
        )}
      </div>

      {items.length > 0 ? (
        <ul className="space-y-3 mb-6">
          {items.map((item) => (
            <BudgetRow key={item.id} item={item} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </ul>
      ) : (
        <p className="text-center py-8 text-on-surface-variant font-body-md mb-6">
          No budgets yet. Add limits for categories like Food, Transport, or Bills.
        </p>
      )}

      {availableCategories.length > 0 && (
        <form onSubmit={handleAdd} className="border-t border-white/10 pt-6">
          <h3 className="font-label-md text-label-md text-on-surface mb-4">Add category budget</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <label className="block">
              <span className="font-label-md text-label-md text-on-surface-variant mb-1.5 block">
                Category
              </span>
              <select
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select category</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="font-label-md text-label-md text-on-surface-variant mb-1.5 block">
                Monthly limit (AED)
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                placeholder="1500.00"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
              />
            </label>
          </div>

          {formError && (
            <p className="text-error text-sm bg-error/10 border border-error/20 rounded-xl px-4 py-2 mb-4">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 bg-primary text-on-primary rounded-xl font-label-md text-label-md hover:brightness-110 transition-all disabled:opacity-60"
          >
            {submitting ? 'Adding...' : 'Add Budget'}
          </button>
        </form>
      )}
    </div>
  );
}
