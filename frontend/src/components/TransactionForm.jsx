import { useState, useEffect } from 'react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories';

export default function TransactionForm({ onSubmit, initialData = null, onCancel = null }) {
  const isEditing = Boolean(initialData);
  const [type, setType] = useState(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || 'Food');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setDescription(initialData.description);
      setCategory(initialData.category);
      setDate(initialData.date);
    }
  }, [initialData]);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!amount || parseFloat(amount) <= 0) {
      setFormError('Please enter a valid amount');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        type,
        amount: parseFloat(amount),
        description: description.trim() || '',
        category,
        date,
      });
      if (!isEditing) {
        setAmount('');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 lg:p-8">
      <h2 className="font-headline-md text-headline-md text-on-surface mb-6">
        {isEditing ? 'Edit Transaction' : 'Add Transaction'}
      </h2>

      <div className="grid grid-cols-2 gap-2 mb-6">
        {['income', 'expense'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setType(t);
              if (!isEditing) setCategory(t === 'income' ? 'Salary' : 'Food');
            }}
            className={`py-2.5 rounded-xl font-label-md text-label-md capitalize transition-all ${
              type === t
                ? t === 'income'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-error/20 text-error border border-error/30'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="font-label-md text-label-md text-on-surface-variant mb-1.5 block">Amount (AED)</span>
            <input type="number" step="0.01" min="0.01" className="form-input" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label className="block">
            <span className="font-label-md text-label-md text-on-surface-variant mb-1.5 block">Date</span>
            <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>

        <label className="block">
          <span className="font-label-md text-label-md text-on-surface-variant mb-1.5 block">
            Description <span className="opacity-60">(optional)</span>
          </span>
          <input type="text" className="form-input" placeholder="What was this for? (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <label className="block">
          <span className="font-label-md text-label-md text-on-surface-variant mb-1.5 block">Category</span>
          <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>

        {formError && <p className="text-error text-sm bg-error/10 border border-error/20 rounded-xl px-4 py-2">{formError}</p>}

        <div className="flex gap-3 pt-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="flex-1 py-3 glass-panel rounded-xl font-label-md text-label-md text-on-surface-variant">
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="flex-[2] py-3 bg-primary text-on-primary rounded-xl font-label-md text-label-md hover:brightness-110 transition-all disabled:opacity-60"
          >
            {submitting ? 'Saving...' : isEditing ? 'Update Transaction' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
          </button>
        </div>
      </form>
    </div>
  );
}
