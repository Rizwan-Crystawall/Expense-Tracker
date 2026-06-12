import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import ProfileAvatar from './ProfileAvatar';
import Icon from './Icon';

const ACCOUNT_NAV = {
  salary: { icon: 'account_balance_wallet', label: 'Salary Account' },
  savings: { icon: 'savings', label: 'Savings Account' },
  current: { icon: 'credit_card', label: 'Current Account' },
};

function NavButton({ active, onClick, icon, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-label-md text-label-md transition-all ${
        active
          ? 'bg-surface-variant/40 text-on-surface border-l-4 border-primary rounded-r-lg'
          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/20'
      } ${className}`}
    >
      <Icon name={icon} className={active ? 'text-primary' : 'group-hover:text-primary'} />
      <span>{children}</span>
    </button>
  );
}

export default function Sidebar({
  activeView,
  selectedAccount,
  onGoAccounts,
  onGoTransfer,
  onGoBudgets,
  onSelectAccount,
  accounts = [],
  totalBalance,
  mobileOpen,
  onCloseMobile,
}) {
  const { user, logout } = useAuth();

  const handleNav = (callback) => {
    callback();
    onCloseMobile?.();
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-label="Close menu"
        />
      )}

      <aside
        className={`w-[280px] h-screen fixed left-0 top-0 border-r border-white/10 bg-surface-container-low/50 backdrop-blur-xl shadow-2xl flex flex-col py-8 overflow-y-auto z-50 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-on-primary-container shadow-lg shadow-primary/20 flex-shrink-0">
            <Icon name="payments" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-headline-md font-headline-md font-bold text-on-surface leading-tight truncate">
              {user?.username}
            </h2>
            <p className="font-label-md text-label-md text-on-surface-variant opacity-70">
              Account Holder
            </p>
          </div>
          {/* <ProfileAvatar username={user?.username} size="sm" /> */}
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <p className="px-2 pb-2 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest opacity-50">
            Main Menu
          </p>

          <NavButton
            active={activeView === 'accounts'}
            onClick={() => handleNav(onGoAccounts)}
            icon="grid_view"
          >
            All Accounts
          </NavButton>

          <NavButton
            active={activeView === 'transfer'}
            onClick={() => handleNav(onGoTransfer)}
            icon="swap_horiz"
          >
            Transfer Money
          </NavButton>

          <NavButton
            active={activeView === 'budgets'}
            onClick={() => handleNav(onGoBudgets)}
            icon="pie_chart"
          >
            Budgets
          </NavButton>

          <p className="px-2 pt-4 pb-2 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest opacity-50">
            Accounts
          </p>

          {accounts.map((account) => {
            const nav = ACCOUNT_NAV[account.type] || { icon: 'account_balance', label: account.name };
            const isActive = activeView === 'dashboard' && selectedAccount?.id === account.id;

            return (
              <NavButton
                key={account.id}
                active={isActive}
                onClick={() => handleNav(() => onSelectAccount(account))}
                icon={nav.icon}
              >
                {account.name}
              </NavButton>
            );
          })}
        </nav>

        <div className="mt-auto px-4 pt-8">
          {totalBalance !== undefined && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 mb-6">
              <p className="font-label-md text-label-md text-primary mb-1">Total Balance</p>
              <p className="font-headline-md text-headline-md text-primary font-bold">
                {formatCurrency(totalBalance)}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-3 w-full text-on-surface-variant hover:text-error px-4 py-3 transition-colors hover:bg-error/10 rounded-lg"
          >
            <Icon name="logout" />
            <span className="font-label-md text-label-md">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
