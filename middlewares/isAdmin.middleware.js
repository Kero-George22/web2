const AppError = require('../utils/AppError');

module.exports = (req, res, next) => {
  if (!req.user?.isAdmin) throw new AppError('Admin access required', 403);
  next();
};
