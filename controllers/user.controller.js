const asyncWrapper = require('../utils/asyncWrapper');
const { success }  = require('../utils/apiResponse');
const userService  = require('../services/user.service');

exports.getAll = asyncWrapper(async (req, res) => {
  const { page, limit } = req.query;
  const result = await userService.getAll({ page, limit });
  return success(res, result, 'Users retrieved');
});

exports.getById = asyncWrapper(async (req, res) => {
  const user = await userService.getById(req.params.id, req.user?._id);
  return success(res, user, 'User retrieved');
});

exports.update = asyncWrapper(async (req, res) => {
  const updated = await userService.update(
    req.params.id,
    req.user._id,
    req.user.isAdmin,
    req.body
  );
  return success(res, updated, 'User updated');
});

exports.remove = asyncWrapper(async (req, res) => {
  await userService.remove(req.params.id, req.user._id, req.user.isAdmin);
  return success(res, null, 'User deleted');
});

exports.follow = asyncWrapper(async (req, res) => {
  const result = await userService.follow(req.params.id, req.user._id);
  return success(res, result, 'User followed');
});

exports.unfollow = asyncWrapper(async (req, res) => {
  const result = await userService.unfollow(req.params.id, req.user._id);
  return success(res, result, 'User unfollowed');
});
