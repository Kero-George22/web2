const asyncWrapper      = require('../utils/asyncWrapper');
const { success }       = require('../utils/apiResponse');
const watchlistService  = require('../services/watchlist.service');

exports.get = asyncWrapper(async (req, res) => {
  const result = await watchlistService.getWatchlist(req.user._id);
  return success(res, result, 'Watchlist retrieved');
});

exports.add = asyncWrapper(async (req, res) => {
  await watchlistService.addMovie(req.user._id, req.params.movieId);
  return success(res, null, 'Added to watchlist', 201);
});

exports.remove = asyncWrapper(async (req, res) => {
  await watchlistService.removeMovie(req.user._id, req.params.movieId);
  return success(res, null, 'Removed from watchlist');
});
