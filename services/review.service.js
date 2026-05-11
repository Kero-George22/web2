const mongoose         = require('mongoose');
const Review           = require('../models/Review.model');
const Movie            = require('../models/Movie.model');
const AppError         = require('../utils/AppError');
const validateObjectId = require('../utils/validateObjectId');

function enrichReviewForViewer(review, callerId = null) {
  const likedBy = review.likedBy || [];
  const comments = review.comments || [];
  return {
    ...review,
    likeCount: likedBy.length,
    commentCount: comments.length,
    isLikedByMe: callerId ? likedBy.some(id => String(id) === String(callerId)) : false,
  };
}

// Recalculate and persist averageRating + reviewCount on the Movie row
async function recalcMovieStats(movieId) {
  const stats = await Review.aggregate([
    { $match: { movieId: new mongoose.Types.ObjectId(movieId) } },
    { $group: { _id: '$movieId', avg: { $avg: '$rating' }, cnt: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    const { avg, cnt } = stats[0];
    await Movie.findByIdAndUpdate(movieId, {
      averageRating: Math.round(avg * 10) / 10,
      reviewCount: cnt
    });
  } else {
    await Movie.findByIdAndUpdate(movieId, { averageRating: 0, reviewCount: 0 });
  }
}

async function getByMovie(movieId, { page = 1, limit = 20, sortBy = 'newest', callerId = null } = {}) {
  validateObjectId(movieId, 'movie ID');
  limit = Math.min(Number(limit) || 20, 100);
  page  = Math.max(Number(page)  || 1,  1);
  const skip = (page - 1) * limit;

  let sortObj = { createdAt: -1 };
  if (sortBy === 'oldest') sortObj = { createdAt: 1 };
  else if (sortBy === 'highest') sortObj = { rating: -1, createdAt: -1 };
  else if (sortBy === 'lowest') sortObj = { rating: 1, createdAt: -1 };

  const [items, total] = await Promise.all([
    Review.find({ movieId })
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username avatar')
      .populate('comments.userId', 'username avatar')
      .lean(),
    Review.countDocuments({ movieId })
  ]);

  return { total, page, limit, items: items.map(item => enrichReviewForViewer(item, callerId)) };
}

async function getByUser(userId, { page = 1, limit = 20, callerId = null } = {}) {
  validateObjectId(userId, 'user ID');
  limit = Math.min(Number(limit) || 20, 100);
  page  = Math.max(Number(page)  || 1,  1);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Review.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('movieId', 'title posterPath releaseDate')
      .populate('comments.userId', 'username avatar')
      .lean(),
    Review.countDocuments({ userId })
  ]);

  return { total, page, limit, items: items.map(item => enrichReviewForViewer(item, callerId)) };
}

async function upsert(userId, { movieId, rating, content, liked, watchedDate }) {
  validateObjectId(movieId, 'movie ID');

  if (rating < 0.5 || rating > 5)
    throw new AppError('Rating must be between 0.5 and 5', 400);
  if ((rating * 2) % 1 !== 0)
    throw new AppError('Rating must be in 0.5 increments', 400);

  const movie = await Movie.findById(movieId).lean();
  if (!movie) throw new AppError('Movie not found', 404);

  // Try to find an existing review
  let review = await Review.findOne({ userId, movieId });
  const created = !review;

  if (!review) {
    review = await Review.create({ userId, movieId, rating, content, liked, watchedDate });
  } else {
    if (rating      !== undefined) review.rating      = rating;
    if (content     !== undefined) review.content     = content;
    if (liked       !== undefined) review.liked       = liked;
    if (watchedDate !== undefined) review.watchedDate = watchedDate;
    await review.save();
  }

  await recalcMovieStats(movieId);

  return { review: review.toObject(), created };
}

async function remove(id, callerId, isAdmin) {
  validateObjectId(id, 'review ID');
  
  const review = await Review.findById(id);
  if (!review) throw new AppError('Review not found', 404);

  if (!isAdmin && String(review.userId) !== String(callerId)) {
    throw new AppError('Not authorized', 403);
  }

  const movieId = review.movieId;
  // Letterboxd logic: delete the review completely, along with any comments on it.
  await Review.findByIdAndDelete(id);
  
  await recalcMovieStats(movieId);

  return { ok: true };
}

async function toggleLike(reviewId, callerId) {
  validateObjectId(reviewId, 'review ID');
  validateObjectId(callerId, 'user ID');

  const review = await Review.findById(reviewId);
  if (!review) throw new AppError('Review not found', 404);

  const alreadyLiked = (review.likedBy || []).some(id => String(id) === String(callerId));
  if (alreadyLiked) {
    review.likedBy = review.likedBy.filter(id => String(id) !== String(callerId));
  } else {
    if (!review.likedBy) review.likedBy = [];
    review.likedBy.push(callerId);
  }
  await review.save();

  return {
    ok: true,
    isLikedByMe: !alreadyLiked,
    likeCount: review.likedBy.length,
  };
}

async function addComment(reviewId, callerId, content) {
  validateObjectId(reviewId, 'review ID');
  validateObjectId(callerId, 'user ID');

  const text = String(content || '').trim();
  if (!text) throw new AppError('Comment content is required', 400);
  if (text.length > 500) throw new AppError('Comment is too long (max 500 chars)', 400);

  const review = await Review.findById(reviewId);
  if (!review) throw new AppError('Review not found', 404);

  review.comments.push({ userId: callerId, content: text });
  await review.save();
  await review.populate('comments.userId', 'username avatar');

  const comment = review.comments[review.comments.length - 1];
  return { ok: true, comment: comment.toObject() };
}

async function removeComment(reviewId, commentId, callerId, isAdmin) {
  validateObjectId(reviewId, 'review ID');
  validateObjectId(commentId, 'comment ID');
  validateObjectId(callerId, 'user ID');

  const review = await Review.findById(reviewId);
  if (!review) throw new AppError('Review not found', 404);

  const comment = review.comments.id(commentId);
  if (!comment) throw new AppError('Comment not found', 404);

  const isCommentOwner = String(comment.userId) === String(callerId);
  // Only the comment owner or an admin can delete the comment
  if (!isAdmin && !isCommentOwner) {
    throw new AppError('Not authorized', 403);
  }

  comment.deleteOne();
  await review.save();

  return { ok: true, commentCount: review.comments ? review.comments.length : 0 };
}

module.exports = { getByMovie, getByUser, upsert, remove, toggleLike, addComment, removeComment };
