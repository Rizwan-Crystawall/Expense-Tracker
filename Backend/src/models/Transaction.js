import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Transaction = sequelize.define(
  'Transaction',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM('income', 'expense'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0.01 },
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: '',
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Other',
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'account_id',
      references: { model: 'accounts', key: 'id' },
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
  },
  { tableName: 'transactions' }
);

export function toTransactionDto(transaction) {
  const data = transaction.toJSON();
  return {
    id: data.id,
    type: data.type,
    amount: Number(data.amount),
    description: data.description || '',
    category: data.category,
    date: data.date,
    accountId: data.accountId,
    userId: data.userId,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export default Transaction;
