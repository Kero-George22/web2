const { validationResult } = require('express-validator');
const AppError             = require('../utils/AppError');

/**
 * Reads express-validator results and short-circuits with a 400
 * if any validation rule failed.  Place this after your validator
 * chains and before the controller.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map(e => e.msg)
      .join(', ');
    throw new AppError(message, 400);
  }
  next();
}

module.exports = { validate };
