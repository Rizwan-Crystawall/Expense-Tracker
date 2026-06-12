import { formatCurrency } from '../utils/currency';
import Icon from './Icon';

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getItemStyles(item) {
  if (item.type === 'income') return { border: 'border-l-primary', amount: 'text-primary', sign: '+' };
  if (item.type === 'expense') return { border: 'border-l-error', amount: 'text-error', sign: '-' };
  if (item.type === 'transfer_in') return { border: 'border-l-tertiary', amount: 'text-tertiary', sign: '+' };
  return { border: 'border-l-secondary', amount: 'text-secondary', sign: '-' };
}

export default function TransactionList({ items, onDelete, onEdit, editingId }) {
  const sorted = [...items].sort(
    (a, b) => new Date(b.date) - new Date(a.date) || new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="glass-panel rounded-3xl p-6 lg:p-8">
      <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Activity</h2>

      {sorted.length === 0 ? (
        <p className="text-center py-12 text-on-surface-variant font-body-md">
          No activity yet. Add income, expenses, or transfer funds above.
        </p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((item) => {
            const styles = getItemStyles(item);
            const isTransfer = item.recordType === 'transfer';
            const isEditing = !isTransfer && editingId === item.id;

            return (
              <li
                key={`${item.recordType}-${item.id}`}
                className={`flex justify-between items-center gap-4 p-4 rounded-xl bg-surface-container-low border-l-4 transition-all ${styles.border} ${
                  isEditing ? 'ring-2 ring-primary/50' : 'border border-white/5'
                }`}
              >
                <div className="min-w-0">
                  <p className="font-label-md text-label-md text-on-surface font-medium truncate">
                    {item.description || (isTransfer ? 'Transfer' : item.category)}
                  </p>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-0.5">
                    {isTransfer
                      ? `${item.type === 'transfer_in' ? 'Transfer in' : 'Transfer out'} · ${item.otherAccountName || 'Account'} · ${formatDate(item.date)}`
                      : `${item.category} · ${formatDate(item.date)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`font-label-md text-label-md font-bold ${styles.amount}`}>
                    {styles.sign}
                    {formatCurrency(item.amount)}
                  </span>
                  {!isTransfer && (
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="p-2 text-on-surface-variant hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"
                      title="Edit"
                    >
                      <Icon name="edit" className="text-lg" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    className="p-2 text-on-surface-variant hover:text-error rounded-lg hover:bg-error/10 transition-colors"
                    title="Delete"
                  >
                    <Icon name="close" className="text-lg" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
