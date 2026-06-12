import { useState } from 'react';
import { createTransfer } from '../api';
import { formatCurrency } from '../utils/currency';
import Icon from '../components/Icon';

export default function TransferPage({ accounts, onDataChange }) {
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || accounts[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fromAccount = accounts.find((a) => a.id === fromAccountId);
  const toAccounts = accounts.filter((a) => a.id !== fromAccountId);
  const toAccount = accounts.find((a) => a.id === toAccountId);

  const handleFromChange = (id) => {
    setFromAccountId(id);
    if (id === toAccountId) {
      const next = accounts.find((a) => a.id !== id);
      setToAccountId(next?.id || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);

    if (!fromAccountId || !toAccountId) {
      setFormError('Select both accounts');
      return;
    }
    if (fromAccountId === toAccountId) {
      setFormError('Source and destination must be different');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setFormError('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      await createTransfer({
        fromAccountId,
        toAccountId,
        amount: parseFloat(amount),
        description: description.trim(),
        date,
      });
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setSuccess(`Transferred ${formatCurrency(parseFloat(amount))} successfully`);
      await onDataChange?.();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (accounts.length < 2) {
    return (
      <div className="text-center py-20 text-on-surface-variant">
        You need at least two accounts to transfer money.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <section>
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Transfer Money</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Move funds between your accounts. Transfers do not count as income or expense.
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            className={`glass-panel rounded-2xl p-4 border ${
              account.id === fromAccountId
                ? 'border-primary/30'
                : account.id === toAccountId
                  ? 'border-tertiary/30'
                  : 'border-white/5'
            }`}
          >
            <p className="font-label-md text-label-md text-on-surface-variant mb-1">{account.name}</p>
            <p className="font-headline-md text-headline-md font-bold text-primary">
              {formatCurrency(account.balance)}
            </p>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-tertiary/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-tertiary/20 flex items-center justify-center text-tertiary">
            <Icon name="swap_horiz" />
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">New Transfer</h3>
            {fromAccount && toAccount && (
              <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                {fromAccount.name} → {toAccount.name}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="font-label-md text-label-md text-on-surface-variant mb-1.5 block">
                From account
              </span>
              <select className="form-input" value={fromAccountId} onChange={(e) => handleFromChange(e.target.value)}>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({formatCurrency(account.balance)})
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="font-label-md text-label-md text-on-surface-variant mb-1.5 block">
                To account
              </span>
              <select
                className="form-input"
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
              >
                {toAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({formatCurrency(account.balance)})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="font-label-md text-label-md text-on-surface-variant mb-1.5 block">
                Amount (AED)
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="font-label-md text-label-md text-on-surface-variant mb-1.5 block">
                Date
              </span>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </div>

          <label className="block">
            <span className="font-label-md text-label-md text-on-surface-variant mb-1.5 block">
              Note <span className="opacity-60">(optional)</span>
            </span>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Monthly savings"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          {formError && (
            <p className="text-error text-sm bg-error/10 border border-error/20 rounded-xl px-4 py-2">
              {formError}
            </p>
          )}
          {success && (
            <p className="text-primary text-sm bg-primary/10 border border-primary/20 rounded-xl px-4 py-2">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-tertiary text-on-tertiary rounded-xl font-label-md text-label-md hover:brightness-110 transition-all disabled:opacity-60"
          >
            {submitting ? 'Transferring...' : 'Transfer Funds'}
          </button>
        </form>
      </div>
    </div>
  );
}
