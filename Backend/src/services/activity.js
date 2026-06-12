export function transferToActivityItems(transfers, accountId) {
  return transfers.flatMap((transfer) => {
    if (transfer.fromAccountId === accountId) {
      return [
        {
          id: transfer.id,
          recordType: 'transfer',
          type: 'transfer_out',
          amount: transfer.amount,
          description: transfer.description || `Transfer to ${transfer.toAccountName || 'account'}`,
          date: transfer.date,
          fromAccountId: transfer.fromAccountId,
          toAccountId: transfer.toAccountId,
          otherAccountId: transfer.toAccountId,
          otherAccountName: transfer.toAccountName,
          createdAt: transfer.createdAt,
        },
      ];
    }

    if (transfer.toAccountId === accountId) {
      return [
        {
          id: transfer.id,
          recordType: 'transfer',
          type: 'transfer_in',
          amount: transfer.amount,
          description: transfer.description || `Transfer from ${transfer.fromAccountName || 'account'}`,
          date: transfer.date,
          fromAccountId: transfer.fromAccountId,
          toAccountId: transfer.toAccountId,
          otherAccountId: transfer.fromAccountId,
          otherAccountName: transfer.fromAccountName,
          createdAt: transfer.createdAt,
        },
      ];
    }

    return [];
  });
}

export function transactionsToActivityItems(transactions) {
  return transactions.map((txn) => ({
    ...txn,
    recordType: 'transaction',
  }));
}

export function mergeActivity(transactions, transfers, accountId) {
  const items = [
    ...transactionsToActivityItems(transactions),
    ...transferToActivityItems(transfers, accountId),
  ];

  return items.sort(
    (a, b) =>
      new Date(b.date) - new Date(a.date) ||
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
}
