const mongoose = require('mongoose');
const AppError = require('./AppError');

function validateObjectId(id, label = 'ID') {
  // TMDB IDs are integers, so bypass MongoId check for them
  if (label === 'TMDB ID') {
    const parsed = parseInt(id, 10);
    if (isNaN(parsed) || parsed < 1) throw new AppError(`Invalid ${label}`, 400);
    return parsed;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${label}`, 400);
  }
  return id;
}

module.exports = validateObjectId;
