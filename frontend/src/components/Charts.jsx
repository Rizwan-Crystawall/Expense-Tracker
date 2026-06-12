import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { formatCurrency } from '../utils/currency';
import { filterMonthsWithData } from '../utils/cashflow';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TICK_COLOR = '#bbcabf';
const GRID_COLOR = 'rgba(255,255,255,0.06)';

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: TICK_COLOR } },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
      },
    },
  },
  scales: {
    x: { ticks: { color: TICK_COLOR }, grid: { color: GRID_COLOR } },
    y: {
      ticks: { color: TICK_COLOR, callback: (value) => formatCurrency(value) },
      grid: { color: GRID_COLOR },
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right', labels: { color: TICK_COLOR, padding: 12 } },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.parsed)}`,
      },
    },
  },
};

const CATEGORY_COLORS = ['#4edea3', '#c0c1ff', '#ffb3b0', '#60a5fa', '#fbbf24', '#a78bfa', '#38bdf8', '#fb923c'];

const lineOptions = {
  ...chartOptions,
  plugins: {
    ...chartOptions.plugins,
    legend: { labels: { color: TICK_COLOR } },
  },
};

export default function Charts({ data }) {
  const { categoryBreakdown, cashflow = [] } = data;
  const activeMonths = filterMonthsWithData(cashflow);

  const barData = {
    labels: activeMonths.map((m) => m.label),
    datasets: [
      {
        label: 'Income',
        data: activeMonths.map((m) => m.income),
        backgroundColor: 'rgba(78, 222, 163, 0.7)',
        borderColor: '#4edea3',
        borderWidth: 1,
        borderRadius: 8,
      },
      {
        label: 'Expenses',
        data: activeMonths.map((m) => m.expenses),
        backgroundColor: 'rgba(255, 180, 171, 0.7)',
        borderColor: '#ffb4ab',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const hasCategories = categoryBreakdown.labels.length > 0;

  const doughnutData = {
    labels: hasCategories ? categoryBreakdown.labels : ['No expenses yet'],
    datasets: [
      {
        data: hasCategories ? categoryBreakdown.values : [1],
        backgroundColor: hasCategories
          ? categoryBreakdown.labels.map((_, i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length])
          : ['#2d3449'],
        borderColor: '#0b1326',
        borderWidth: 2,
      },
    ],
  };

  const cashflowLineData = activeMonths.length
    ? {
        labels: activeMonths.map((m) => m.label),
        datasets: [
          {
            label: 'Net Cashflow',
            data: activeMonths.map((m) => m.cashflow),
            borderColor: '#4edea3',
            backgroundColor: 'rgba(78, 222, 163, 0.15)',
            fill: true,
            tension: 0.35,
            pointRadius: 5,
            pointBackgroundColor: activeMonths.map((m) =>
              m.cashflow >= 0 ? '#4edea3' : '#ffb4ab'
            ),
            segment: {
              borderColor: (ctx) =>
                ctx.p1.parsed.y >= 0 ? '#4edea3' : '#ffb4ab',
            },
          },
        ],
      }
    : null;

  const cashflowLineOptions = {
    ...lineOptions,
    plugins: {
      ...lineOptions.plugins,
      tooltip: {
        callbacks: {
          label: (ctx) => `Cashflow: ${formatCurrency(ctx.parsed.y)}`,
        },
      },
    },
  };

  return (
    <section>
      <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Charts &amp; Graphs</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeMonths.length > 0 && (
          <div className="glass-panel rounded-3xl p-6">
            <h3 className="font-label-md text-label-md text-on-surface-variant mb-4">Monthly Income vs Expenses</h3>
            <div className="h-72">
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>
        )}
        <div className="glass-panel rounded-3xl p-6">
          <h3 className="font-label-md text-label-md text-on-surface-variant mb-4">Expenses by Category</h3>
          <div className="h-72">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
        {cashflowLineData && (
          <div className="glass-panel rounded-3xl p-6 lg:col-span-2">
            <h3 className="font-label-md text-label-md text-on-surface-variant mb-4">
              Monthly Cashflow Trend
            </h3>
            <div className="h-72">
              <Line data={cashflowLineData} options={cashflowLineOptions} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
