import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { fetchAccounts } from './api';
import LoginPage from './pages/LoginPage';
import AccountsPage from './pages/AccountsPage';
import DashboardPage from './pages/DashboardPage';
import TransferPage from './pages/TransferPage';
import BudgetsPage from './pages/BudgetsPage';
import AppLayout from './components/AppLayout';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState('accounts');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const loadAccounts = useCallback(async () => {
    if (!user) return;
    setAccountsLoading(true);
    try {
      const data = await fetchAccounts();
      setAccounts(data.accounts);
      setTotalBalance(data.totalBalance);
    } catch {
      setAccounts([]);
      setTotalBalance(0);
    } finally {
      setAccountsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setSelectedAccount(null);
      setActiveView('accounts');
      setAccounts([]);
      return;
    }
    loadAccounts();
  }, [user, loadAccounts]);

  const handleSelectAccount = (account) => {
    setSelectedAccount(account);
    setActiveView('dashboard');
  };

  const handleGoAccounts = () => {
    setSelectedAccount(null);
    setActiveView('accounts');
    loadAccounts();
  };

  const handleGoTransfer = () => {
    setSelectedAccount(null);
    setActiveView('transfer');
    loadAccounts();
  };

  const handleGoBudgets = () => {
    setSelectedAccount(null);
    setActiveView('budgets');
    loadAccounts();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-surface-variant">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    if (activeView === 'transfer') {
      return <TransferPage accounts={accounts} onDataChange={loadAccounts} />;
    }
    if (activeView === 'budgets') {
      return <BudgetsPage accounts={accounts} onDataChange={loadAccounts} />;
    }
    if (activeView === 'dashboard' && selectedAccount) {
      return (
        <DashboardPage account={selectedAccount} onDataChange={loadAccounts} />
      );
    }
    return (
      <AccountsPage
        accounts={accounts}
        totalBalance={totalBalance}
        loading={accountsLoading}
        onSelectAccount={handleSelectAccount}
      />
    );
  };

  return (
    <AppLayout
      activeView={activeView}
      selectedAccount={selectedAccount}
      onGoAccounts={handleGoAccounts}
      onGoTransfer={handleGoTransfer}
      onGoBudgets={handleGoBudgets}
      onSelectAccount={handleSelectAccount}
      accounts={accounts}
      totalBalance={totalBalance}
    >
      {renderPage()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
