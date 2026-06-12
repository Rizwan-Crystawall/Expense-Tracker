import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './currency';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function filterTransactionsForMonth(transactions, year, month) {
  return transactions.filter((t) => {
    const d = new Date(`${t.date}T00:00:00`);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });
}

function formatDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-AE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function downloadMonthlyStatement({
  accountName,
  username,
  year,
  month,
  summary,
  transactions = [],
  accountBalance = 0,
}) {
  const monthTransactions = filterTransactionsForMonth(transactions, year, month).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const periodLabel = `${MONTHS[month - 1]} ${year}`;
  const generatedAt = new Date().toLocaleString('en-AE');

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129);
  doc.text('Expense Tracker', 14, 20);

  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('Monthly Account Statement', 14, 30);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Account: ${accountName}`, 14, 40);
  doc.text(`Account Holder: ${username}`, 14, 46);
  doc.text(`Statement Period: ${periodLabel}`, 14, 52);
  doc.text(`Generated: ${generatedAt}`, 14, 58);
  doc.text(`Current Account Balance: ${formatCurrency(accountBalance)}`, 14, 64);

  doc.setDrawColor(200, 200, 200);
  doc.line(14, 68, pageWidth - 14, 68);

  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('Summary', 14, 78);

  autoTable(doc, {
    startY: 82,
    head: [['Description', 'Amount (AED)']],
    body: [
      ['Total Income', formatCurrency(summary.income)],
      ['Total Expenses', formatCurrency(summary.expenses)],
      ['Net Cashflow', `${summary.balance >= 0 ? '+' : ''}${formatCurrency(summary.balance)}`],
      ['Transactions', String(summary.transactionCount)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129], textColor: 255 },
    styles: { fontSize: 10 },
    columnStyles: { 1: { halign: 'right' } },
  });

  const afterSummaryY = doc.lastAutoTable.finalY + 12;

  doc.setFontSize(12);
  doc.text('Transactions', 14, afterSummaryY);

  if (monthTransactions.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text('No transactions recorded for this period.', 14, afterSummaryY + 8);
  } else {
    autoTable(doc, {
      startY: afterSummaryY + 4,
      head: [['Date', 'Type', 'Category', 'Description', 'Amount (AED)']],
      body: monthTransactions.map((t) => [
        formatDate(t.date),
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        t.category,
        t.description || '-',
        `${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [23, 31, 51], textColor: 255 },
      styles: { fontSize: 9 },
      columnStyles: {
        4: { halign: 'right' },
      },
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Expense Tracker · ${accountName} · ${periodLabel} · Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const filename = `statement-${accountName.replace(/\s+/g, '-').toLowerCase()}-${year}-${String(month).padStart(2, '0')}.pdf`;
  doc.save(filename);
}
