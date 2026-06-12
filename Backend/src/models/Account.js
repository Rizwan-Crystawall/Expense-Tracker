import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const DEFAULT_ACCOUNTS = [
  { name: 'Salary Account', type: 'salary' },
  { name: 'Savings Account', type: 'savings' },
  { name: 'Current Account', type: 'current' },
];

const Account = sequelize.define(
  'Account',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('salary', 'savings', 'current'),
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
  },
  { tableName: 'accounts' }
);

export function toAccountDto(account, balance = 0) {
  const data = account.toJSON();
  return {
    id: data.id,
    name: data.name,
    type: data.type,
    userId: data.userId,
    balance,
    createdAt: data.createdAt,
  };
}

export default Account;
