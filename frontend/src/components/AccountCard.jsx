import { formatCurrency } from '../utils/currency';
import Icon from './Icon';

const ACCOUNT_STYLES = {
  salary: {
    icon: 'account_balance_wallet',
    badge: 'Salary',
    iconBg: 'bg-primary/10 text-primary border-primary/20 group-hover:bg-primary group-hover:text-on-primary',
    badgeHover: 'group-hover:border-primary/30',
  },
  savings: {
    icon: 'savings',
    badge: 'Savings',
    iconBg: 'bg-tertiary/10 text-tertiary border-tertiary/20 group-hover:bg-tertiary group-hover:text-on-tertiary',
    badgeHover: 'group-hover:border-tertiary/30',
  },
  current: {
    icon: 'credit_card',
    badge: 'Current',
    iconBg: 'bg-secondary/10 text-secondary border-secondary/20 group-hover:bg-secondary group-hover:text-on-secondary',
    badgeHover: 'group-hover:border-secondary/30',
  },
};

export default function AccountCard({ account, onSelect }) {
  const style = ACCOUNT_STYLES[account.type] || ACCOUNT_STYLES.salary;
  const isPositive = account.balance >= 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(account)}
      className="glass-panel p-8 rounded-3xl flex flex-col h-full group hover:-translate-y-1 transition-all duration-300 text-left w-full"
    >
      <div className="flex justify-between items-start mb-10">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${style.iconBg}`}
        >
          <Icon name={style.icon} />
        </div>
        <span
          className={`px-3 py-1 rounded-full bg-surface-container-high border border-white/5 font-label-md text-[10px] uppercase tracking-widest text-on-surface-variant transition-colors ${style.badgeHover}`}
        >
          {style.badge}
        </span>
      </div>

      <h4 className="font-headline-md text-headline-md text-on-surface mb-2">{account.name}</h4>
      <p
        className={`font-display-lg text-[32px] font-bold mb-8 ${
          isPositive ? 'text-primary' : 'text-error'
        }`}
      >
        {formatCurrency(account.balance)}
      </p>

      <div className="mt-auto">
        <span className="inline-flex items-center gap-2 text-on-surface-variant group-hover:text-primary font-label-md text-label-md transition-colors">
          Manage transactions
          <Icon name="east" className="text-sm group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </button>
  );
}
