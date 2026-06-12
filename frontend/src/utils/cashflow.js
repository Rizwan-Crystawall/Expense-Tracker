export function filterMonthsWithData(months = []) {
  return months.filter((m) => m.transactionCount > 0);
}
