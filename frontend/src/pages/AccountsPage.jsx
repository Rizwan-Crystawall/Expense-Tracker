import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import AccountCard from '../components/AccountCard';
import Icon from '../components/Icon';

export default function AccountsPage({ accounts, totalBalance, loading, onSelectAccount }) {
  const { user } = useAuth();

  if (loading && !accounts.length) {
    return (
      <div className="flex items-center justify-center py-20 text-on-surface-variant">
        Loading accounts...
      </div>
    );
  }

  return (
    <div>
      <section className="mb-12">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Your Accounts</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Welcome back, <span className="text-primary">{user?.username}</span>. Manage your digital
          wealth effortlessly.
        </p>
      </section>

      <section className="relative mb-16 overflow-hidden rounded-3xl glass-panel p-8 lg:p-10 border border-white/10">
        <div className="hero-glow" />
        <div className="relative z-10">
          <p className="font-label-md text-label-md text-primary-container tracking-widest uppercase mb-4 opacity-80">
            Total Balance
          </p>
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div>
              <p
                className={`font-display-lg text-display-lg font-bold mb-2 ${
                  totalBalance >= 0 ? 'text-primary' : 'text-error'
                }`}
              >
                {formatCurrency(totalBalance)}
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md opacity-80">
                This balance is aggregated across all your connected saving, salary, and operational
                current accounts.
              </p>
            </div>
            <div className="md:ml-auto flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => accounts[0] && onSelectAccount(accounts[0])}
                className="px-6 py-3 bg-primary text-on-primary rounded-xl font-label-md text-label-md flex items-center gap-2 hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-primary/20"
              >
                <Icon name="add" />
                Add Funds
              </button>
              <button
                type="button"
                onClick={() => accounts[0] && onSelectAccount(accounts[0])}
                className="px-6 py-3 glass-panel text-on-surface rounded-xl font-label-md text-label-md flex items-center gap-2 active:scale-95"
              >
                <Icon name="analytics" />
                View Insights
              </button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">My Accounts</h3>
            <p className="font-body-md text-body-md text-on-surface-variant opacity-70">
              Select an account to manage transactions
            </p>
          </div>
        </div>

        <div className="bento-grid">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} onSelect={onSelectAccount} />
          ))}
        </div>
      </section>
    </div>
  );
}
