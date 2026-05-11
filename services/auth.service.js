const bcrypt   = require('bcryptjs');
const User     = require('../models/User.model');
const AppError = require('../utils/AppError');

async function register({ username, email, password }) {
  const existing = await User.findOne({ email: email.toLowerCase() }).lean();
  if (existing) throw new AppError('Email already in use', 409);

  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({ username, email, password: hash });

  const plainUser = user.toObject();
  delete plainUser.password;

  return plainUser;
}

async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new AppError('Invalid credentials', 401);

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new AppError('Invalid credentials', 401);

  const plainUser = user.toObject();
  delete plainUser.password;

  return plainUser;
}

async function me(userId) {
  const user = await User.findById(userId).select('-password').lean();
  if (!user) throw new AppError('User not found', 404);
  return user;
}

module.exports = { register, login, me };
