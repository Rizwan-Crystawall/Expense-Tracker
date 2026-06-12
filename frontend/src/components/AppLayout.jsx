import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import ProfileAvatar from './ProfileAvatar';
import Icon from './Icon';

export default function AppLayout({
  children,
  activeView,
  selectedAccount,
  onGoAccounts,
  onGoTransfer,
  onGoBudgets,
  onSelectAccount,
  accounts = [],
  totalBalance,
}) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeView={activeView}
        selectedAccount={selectedAccount}
        onGoAccounts={() => {
          onGoAccounts();
          setMobileOpen(false);
        }}
        onGoTransfer={() => {
          onGoTransfer();
          setMobileOpen(false);
        }}
        onGoBudgets={() => {
          onGoBudgets();
          setMobileOpen(false);
        }}
        onSelectAccount={onSelectAccount}
        accounts={accounts}
        totalBalance={totalBalance}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <main className="lg:ml-[280px] min-h-screen">
        <header className="flex justify-between items-center w-full px-6 lg:px-12 py-6 bg-transparent sticky top-0 z-40 backdrop-blur-sm border-b border-white/5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="lg:hidden p-2 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-bright/20"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Icon name="menu" />
            </button>
            <h1 className="font-headline-md text-headline-md font-extrabold text-on-surface">
              Expense Tracker
            </h1>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <div className="hidden sm:flex gap-2">
              <button
                type="button"
                className="p-2 text-on-surface-variant hover:text-primary transition-all active:scale-95 rounded-lg hover:bg-surface-bright/20"
              >
                {/* <Icon name="notifications" /> */}
              </button>
              <button
                type="button"
                className="p-2 text-on-surface-variant hover:text-primary transition-all active:scale-95 rounded-lg hover:bg-surface-bright/20"
              >
                {/* <Icon name="settings" /> */}
              </button>
            </div>
            <div className="flex items-center gap-3 pl-4 lg:pl-6 border-l border-white/10">
              <ProfileAvatar username={user?.username} size="sm" />
            </div>
          </div>
        </header>

        <div className="px-6 lg:px-12 pb-20 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
