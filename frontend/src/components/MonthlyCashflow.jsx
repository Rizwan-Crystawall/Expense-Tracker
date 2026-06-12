import { formatCurrency } from '../utils/currency';
import { filterMonthsWithData } from '../utils/cashflow';

export default function MonthlyCashflow({ cashflow = [], highlightYear, highlightMonth }) {
  const rows = filterMonthsWithData(cashflow);

  if (!rows.length) {
    return (
      <section className="glass-panel rounded-3xl p-6 lg:p-8">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Monthly Cashflow</h2>
        <p className="font-body-md text-body-md text-on-surface-variant text-center py-8">
          No transaction data yet. Add income or expenses to see monthly cashflow.
        </p>
      </section>
    );
  }

  const totalIncome = rows.reduce((sum, m) => sum + m.income, 0);
  const totalExpenses = rows.reduce((sum, m) => sum + m.expenses, 0);
  const totalCashflow = rows.reduce((sum, m) => sum + m.cashflow, 0);

  return (
    <section className="glass-panel rounded-3xl p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Monthly Cashflow</h2>
          <p className="font-body-md text-body-md text-on-surface-variant opacity-80 mt-1">
            Months with transactions only
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          {/* <div className="px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <span className="text-on-surface-variant block text-xs">Total In</span>
            <span className="text-primary font-bold">{formatCurrency(totalIncome)}</span>
          </div> */}
          {/* <div className="px-3 py-2 rounded-lg bg-error/10 border border-error/20">
            <span className="text-on-surface-variant block text-xs">Total Out</span>
            <span className="text-error font-bold">{formatCurrency(totalExpenses)}</span>
          </div> */}
          <div className="px-3 py-2 rounded-lg bg-surface-container-high border border-white/10">
            <span className="text-on-surface-variant block text-xs">Net</span>
            <span className={`font-bold ${totalCashflow >= 0 ? 'text-primary' : 'text-error'}`}>
              {formatCurrency(totalCashflow)}
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px]">
          <thead>
            <tr className="text-left border-b border-white/10">
              <th className="pb-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Month
              </th>
              <th className="pb-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                Income
              </th>
              <th className="pb-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                Expenses
              </th>
              <th className="pb-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                Cashflow
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isHighlighted = row.year === highlightYear && row.month === highlightMonth;
              const isPositive = row.cashflow >= 0;

              return (
                <tr
                  key={`${row.year}-${row.month}`}
                  className={`border-b border-white/5 transition-colors ${
                    isHighlighted ? 'bg-primary/10' : 'hover:bg-surface-bright/20'
                  }`}
                >
                  <td className="py-3.5 font-label-md text-label-md text-on-surface">
                    <span className={isHighlighted ? 'text-primary font-semibold' : ''}>
                      {row.monthName} {row.year}
                    </span>
                    <span className="block text-xs text-on-surface-variant mt-0.5">
                      {row.transactionCount} txn{row.transactionCount !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="py-3.5 text-right font-label-md text-label-md text-primary">
                    {formatCurrency(row.income)}
                  </td>
                  <td className="py-3.5 text-right font-label-md text-label-md text-error">
                    {formatCurrency(row.expenses)}
                  </td>
                  <td
                    className={`py-3.5 text-right font-label-md text-label-md font-bold ${
                      isPositive ? 'text-primary' : 'text-error'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {formatCurrency(row.cashflow)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
