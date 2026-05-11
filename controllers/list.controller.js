const asyncWrapper  = require('../utils/asyncWrapper');
const { success }   = require('../utils/apiResponse');
const listService   = require('../services/list.service');

exports.getByUser = asyncWrapper(async (req, res) => {
  const lists = await listService.getByUser(
    req.params.userId,
    req.user?._id,
    req.user?.isAdmin
  );
  return success(res, lists, 'Lists retrieved');
});

exports.getById = asyncWrapper(async (req, res) => {
  const list = await listService.getById(
    req.params.id,
    req.user?._id,
    req.user?.isAdmin
  );
  return success(res, list, 'List retrieved');
});

exports.create = asyncWrapper(async (req, res) => {
  const list = await listService.create(req.user._id, req.body);
  return success(res, list, 'List created', 201);
});

exports.update = asyncWrapper(async (req, res) => {
  const list = await listService.update(
    req.params.id,
    req.user._id,
    req.user.isAdmin,
    req.body
  );
  return success(res, list, 'List updated');
});

exports.remove = asyncWrapper(async (req, res) => {
  await listService.remove(req.params.id, req.user._id, req.user.isAdmin);
  return success(res, null, 'List deleted');
});

exports.addMovie = asyncWrapper(async (req, res) => {
  await listService.addMovie(
    req.params.id,
    req.user._id,
    req.user.isAdmin,
    req.body.movieId
  );
  return success(res, null, 'Movie added to list', 201);
});

exports.removeMovie = asyncWrapper(async (req, res) => {
  await listService.removeMovie(
    req.params.id,
    req.user._id,
    req.user.isAdmin,
    req.params.movieId
  );
  return success(res, null, 'Movie removed from list');
});
