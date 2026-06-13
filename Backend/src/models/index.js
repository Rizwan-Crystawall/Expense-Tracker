import sequelize from '../config/database.js';
import User from './User.js';
import Account, { DEFAULT_ACCOUNTS } from './Account.js';
import Transaction from './Transaction.js';
import Transfer from './Transfer.js';
import Budget from './Budget.js';

User.hasMany(Account, { foreignKey: 'userId', as: 'accounts', onDelete: 'CASCADE' });
Account.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Account.hasMany(Transaction, { foreignKey: 'accountId', as: 'transactions', onDelete: 'CASCADE' });
Transaction.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });

User.hasMany(Transfer, { foreignKey: 'userId', as: 'transfers', onDelete: 'CASCADE' });
Transfer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Account.hasMany(Transfer, { foreignKey: 'fromAccountId', as: 'outgoingTransfers', onDelete: 'CASCADE' });
Account.hasMany(Transfer, { foreignKey: 'toAccountId', as: 'incomingTransfers', onDelete: 'CASCADE' });
Transfer.belongsTo(Account, { foreignKey: 'fromAccountId', as: 'fromAccount' });
Transfer.belongsTo(Account, { foreignKey: 'toAccountId', as: 'toAccount' });

User.hasMany(Budget, { foreignKey: 'userId', as: 'budgets', onDelete: 'CASCADE' });
Budget.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Account.hasMany(Budget, { foreignKey: 'accountId', as: 'budgets', onDelete: 'CASCADE' });
Budget.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });

export async function connectDatabase() {
  await sequelize.authenticate();
  const alter = process.env.DB_ALTER === 'true';
  console.log(`Sequelize connected to ${sequelize.getDialect()} database`);
  console.log(`Tables synced: ${Object.keys(sequelize.models).join(', ')}`);
}

export async function createDefaultAccounts(userId) {
  return Account.bulkCreate(
    DEFAULT_ACCOUNTS.map((account) => ({ ...account, userId }))
  );
}

export { sequelize, User, Account, Transaction, Transfer, Budget };
