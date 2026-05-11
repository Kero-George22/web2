const asyncWrapper = require('../utils/asyncWrapper');
const { success } = require('../utils/apiResponse');
const movieService = require('../services/movie.service');

exports.getAll = asyncWrapper(async (req, res) => {
  const { page, limit, genre, year, minRating, type } = req.query;
  const result = await movieService.getAll({ page, limit, genre, year, minRating, type });
  return success(res, result, 'Movies retrieved');
});

exports.search = asyncWrapper(async (req, res) => {
  const { q, page, limit } = req.query;
  const result = await movieService.search({ q, page, limit });
  return success(res, result, 'Search results');
});

exports.getById = asyncWrapper(async (req, res) => {
  const movie = await movieService.getById(req.params.id);
  return success(res, movie, 'Movie retrieved');
});

exports.getSimilar = asyncWrapper(async (req, res) => {
  const limit = Number(req.query.limit) || 6;
  const items = await movieService.getSimilar(req.params.id, { limit });
  return success(res, items, 'Similar titles retrieved');
});

exports.trackView = asyncWrapper(async (req, res) => {
  const type = req.body?.type || 'pageview';
  await movieService.recordView(req.params.id, req.user?._id, type);
  return success(res, null, 'View recorded', 201);
});

exports.startWatching = asyncWrapper(async (req, res) => {
  await movieService.setWatching(req.params.id, req.user._id, true);
  return success(res, null, 'Watching set', 201);
});

exports.stopWatching = asyncWrapper(async (req, res) => {
  await movieService.setWatching(req.params.id, req.user._id, false);
  return success(res, null, 'Watching cleared');
});

exports.topRated = asyncWrapper(async (req, res) => {
  const limit = Number(req.query.limit) || 20;
  const minReviews = Number(req.query.minReviews) || 5;
  const items = await movieService.getTopRated({ limit, minReviews });
  return success(res, items, 'Top rated movies');
});

exports.trending = asyncWrapper(async (req, res) => {
  const limit = Number(req.query.limit) || 20;
  const days = Number(req.query.days) || 7;
  const items = await movieService.getTrending({ limit, days });
  return success(res, items, 'Trending movies');
});

exports.create = asyncWrapper(async (req, res) => {
  const movie = await movieService.fetchFromTmdb(req.body.tmdbId);
  return success(res, movie, 'Movie fetched from TMDB', 201);
});

exports.update = asyncWrapper(async (req, res) => {
  const movie = await movieService.update(req.params.id, req.body);
  return success(res, movie, 'Movie updated');
});

exports.remove = asyncWrapper(async (req, res) => {
  await movieService.remove(req.params.id);
  return success(res, null, 'Movie deleted');
});
