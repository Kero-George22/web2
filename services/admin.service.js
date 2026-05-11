const User = require('../models/User.model');
const Movie = require('../models/Movie.model');
const Review = require('../models/Review.model');
const AppError = require('../utils/AppError');
const validateObjectId = require('../utils/validateObjectId');

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function getStats() {
  const [users, movies, reviews, topRatedMovies, recentSignups] = await Promise.all([
    User.countDocuments(),
    Movie.countDocuments(),
    Review.countDocuments(),
    Movie.find().sort({ averageRating: -1 }).limit(10).select('title averageRating reviewCount posterPath').lean(),
    User.find().sort({ createdAt: -1 }).limit(5).select('-password').lean(),
  ]);

  return {
    totals: { users, movies, reviews },
    topRatedMovies,
    recentSignups,
  };
}

async function getUsers({ page = 1, limit = 20, q = '' } = {}) {
  limit = Math.min(Number(limit) || 20, 100);
  page = Math.max(Number(page) || 1, 1);
  const skip = (page - 1) * limit;

  const query = {};
  if (q.trim()) {
    const safe = escapeRegex(q.trim());
    query.$or = [
      { username: { $regex: safe, $options: 'i' } },
      { email: { $regex: safe, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(query)
  ]);

  return { total, page, limit, items };
}

async function getMovies({ page = 1, limit = 20 } = {}) {
  limit = Math.min(Number(limit) || 20, 100);
  page = Math.max(Number(page) || 1, 1);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Movie.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Movie.countDocuments()
  ]);

  return { total, page, limit, items };
}

async function deleteUser(id) {
  validateObjectId(id, 'user ID');
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new AppError('User not found', 404);
  return { ok: true };
}

async function deleteMovie(id) {
  validateObjectId(id, 'movie ID');
  const movie = await Movie.findByIdAndDelete(id);
  if (!movie) throw new AppError('Movie not found', 404);
  return { ok: true };
}

async function deleteReview(id) {
  validateObjectId(id, 'review ID');
  const review = await Review.findByIdAndDelete(id);
  if (!review) throw new AppError('Review not found', 404);
  return { ok: true };
}

module.exports = { getStats, getUsers, getMovies, deleteUser, deleteMovie, deleteReview };
