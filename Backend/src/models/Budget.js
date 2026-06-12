import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Budget = sequelize.define(
  'Budget',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    monthlyLimit: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'monthly_limit',
      validate: { min: 0.01 },
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
  {
    tableName: 'budgets',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'account_id', 'category'],
      },
    ],
  }
);

export function toBudgetDto(budget) {
  const data = budget.toJSON();
  return {
    id: data.id,
    category: data.category,
    monthlyLimit: Number(data.monthlyLimit),
    accountId: data.accountId,
    userId: data.userId,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export default Budget;
