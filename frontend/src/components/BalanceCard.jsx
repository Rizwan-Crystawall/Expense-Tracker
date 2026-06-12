import { formatCurrency } from '../utils/currency';

export default function BalanceCard({ balance, label = 'Total Balance' }) {
  const isPositive = balance >= 0;

  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel p-8 border border-white/10">
      <div className="hero-glow" />
      <div className="relative z-10">
        <p className="font-label-md text-label-md text-primary-container tracking-widest uppercase mb-2 opacity-80">
          {label}
        </p>
        <p className={`font-display-lg text-display-lg font-bold ${isPositive ? 'text-primary' : 'text-error'}`}>
          {formatCurrency(balance)}
        </p>
      </div>
    </div>
  );
}
