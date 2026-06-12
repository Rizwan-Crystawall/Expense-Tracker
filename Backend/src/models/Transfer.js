import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Transfer = sequelize.define(
  'Transfer',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fromAccountId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'from_account_id',
      references: { model: 'accounts', key: 'id' },
      onDelete: 'CASCADE',
    },
    toAccountId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'to_account_id',
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
  { tableName: 'transfers' }
);

export function toTransferDto(transfer, accountNames = {}) {
  const data = transfer.toJSON();
  return {
    id: data.id,
    amount: Number(data.amount),
    description: data.description || '',
    date: data.date,
    fromAccountId: data.fromAccountId,
    toAccountId: data.toAccountId,
    fromAccountName: accountNames[data.fromAccountId] || null,
    toAccountName: accountNames[data.toAccountId] || null,
    userId: data.userId,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export default Transfer;
