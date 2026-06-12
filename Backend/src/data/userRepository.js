import User, { toUserDto } from '../models/User.js';

export async function findUserByUsername(username) {
  return User.findOne({ where: { username } });
}

export async function findUserById(id) {
  const user = await User.findByPk(id);
  return user ? toUserDto(user) : null;
}

export async function createUser({ username, password }) {
  const user = await User.create({ username, password });
  return toUserDto(user);
}

export async function getUserModelById(id) {
  return User.findByPk(id);
}
