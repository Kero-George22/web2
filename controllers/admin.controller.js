const asyncWrapper = require('../utils/asyncWrapper');
const { success } = require('../utils/apiResponse');
const adminService = require('../services/admin.service');

exports.getStats = asyncWrapper(async (req, res) => {
  const stats = await adminService.getStats();
  return success(res, stats, 'Stats retrieved');
});

exports.getUsers = asyncWrapper(async (req, res) => {
  const { page, limit, q } = req.query;
  const result = await adminService.getUsers({ page, limit, q });
  return success(res, result, 'Users retrieved');
});

exports.getMovies = asyncWrapper(async (req, res) => {
  const { page, limit } = req.query;
  const result = await adminService.getMovies({ page, limit });
  return success(res, result, 'Movies retrieved');
});

exports.deleteUser = asyncWrapper(async (req, res) => {
  await adminService.deleteUser(req.params.id);
  return success(res, null, 'User deleted');
});

exports.deleteMovie = asyncWrapper(async (req, res) => {
  await adminService.deleteMovie(req.params.id);
  return success(res, null, 'Movie deleted');
});

exports.deleteReview = asyncWrapper(async (req, res) => {
  await adminService.deleteReview(req.params.id);
  return success(res, null, 'Review deleted');
});
