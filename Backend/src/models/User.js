import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  { tableName: 'users' }
);

export function toUserDto(user) {
  const data = user.toJSON();
  return {
    id: data.id,
    username: data.username,
    createdAt: data.createdAt,
  };
}

export default User;
