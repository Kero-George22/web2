const asyncWrapper   = require('../utils/asyncWrapper');
const { success }    = require('../utils/apiResponse');
const reviewService  = require('../services/review.service');

exports.getByMovie = asyncWrapper(async (req, res) => {
  const { page, limit, sortBy } = req.query;
  const result = await reviewService.getByMovie(req.params.movieId, { page, limit, sortBy, callerId: req.user?._id });
  return success(res, result, 'Reviews retrieved');
});

exports.getByUser = asyncWrapper(async (req, res) => {
  const { page, limit } = req.query;
  const result = await reviewService.getByUser(req.params.userId, { page, limit, callerId: req.user?._id });
  return success(res, result, 'Reviews retrieved');
});

exports.upsert = asyncWrapper(async (req, res) => {
  const { review, created } = await reviewService.upsert(req.user._id, req.body);
  return success(res, review, created ? 'Review created' : 'Review updated', created ? 201 : 200);
});

exports.remove = asyncWrapper(async (req, res) => {
  await reviewService.remove(req.params.id, req.user._id, req.user.isAdmin);
  return success(res, null, 'Review deleted');
});

exports.toggleLike = asyncWrapper(async (req, res) => {
  const result = await reviewService.toggleLike(req.params.id, req.user._id);
  return success(res, result, result.isLikedByMe ? 'Review liked' : 'Review unliked');
});

exports.addComment = asyncWrapper(async (req, res) => {
  const result = await reviewService.addComment(req.params.id, req.user._id, req.body.content);
  return success(res, result, 'Comment added', 201);
});

exports.removeComment = asyncWrapper(async (req, res) => {
  const result = await reviewService.removeComment(
    req.params.id,
    req.params.commentId,
    req.user._id,
    req.user.isAdmin
  );
  return success(res, result, 'Comment deleted');
});
