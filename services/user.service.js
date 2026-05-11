const bcrypt           = require('bcryptjs');
const User             = require('../models/User.model');
const Movie            = require('../models/Movie.model');
const Review           = require('../models/Review.model');
const AppError         = require('../utils/AppError');
const validateObjectId = require('../utils/validateObjectId');

async function getAll({ page = 1, limit = 20 } = {}) {
  limit  = Math.min(Number(limit) || 20, 100);
  page   = Math.max(Number(page)  || 1,  1);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(),
  ]);

  return { total, page, limit, items };
}

function toPublicUser(user, callerId = null) {
  return {
    _id: user._id,
    username: user.username,
    avatar: user.avatar || null,
    bio: user.bio || '',
    isAdmin: Boolean(user.isAdmin),
    profileTheme: user.profileTheme || 'classic',
    createdAt: user.createdAt,
    followersCount: user.followers?.length || 0,
    followingCount: user.following?.length || 0,
    isFollowing: callerId ? (user.followers || []).some(f => String(f) === String(callerId)) : false,
    pinnedFavorites: user.pinnedFavorites || [],
    recentReviews: user.recentReviews || [],
  };
}

async function getById(id, callerId = null) {
  validateObjectId(id, 'user ID');

  const user = await User.findById(id)
    .select('username avatar bio isAdmin profileTheme createdAt followers following pinnedFavorites')
    .populate('pinnedFavorites', 'title posterPath releaseDate averageRating genres')
    .lean();
  if (!user) throw new AppError('User not found', 404);

  // Recent 5 reviews with movie info
  const recentReviews = await Review.find({ userId: id })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('movieId', 'title posterPath releaseDate')
    .lean();

  return toPublicUser({ ...user, recentReviews }, callerId);
}

async function update(id, callerId, isAdmin, { username, bio, avatar, password, profileTheme, pinnedFavorites }) {
  validateObjectId(id, 'user ID');
  
  if (!isAdmin && String(id) !== String(callerId)) {
    throw new AppError('Not authorized', 403);
  }

  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);

  if (username !== undefined) user.username = username;
  if (bio      !== undefined) user.bio      = bio;
  if (avatar   !== undefined) user.avatar   = avatar;
  if (profileTheme !== undefined) user.profileTheme = profileTheme;
  if (pinnedFavorites !== undefined) {
    const uniqueIds = [...new Set((pinnedFavorites || []).map(String))].slice(0, 6);
    if (uniqueIds.length > 0) {
      const count = await Movie.countDocuments({ _id: { $in: uniqueIds } });
      if (count !== uniqueIds.length) throw new AppError('One or more pinned favorites are invalid', 400);
    }
    user.pinnedFavorites = uniqueIds;
  }
  if (password) {
    user.password = await bcrypt.hash(password, 12);
  }

  await user.save();

  const plain = user.toObject();
  delete plain.password;
  return plain;
}

async function remove(id, callerId, isAdmin) {
  validateObjectId(id, 'user ID');

  if (!isAdmin && String(id) !== String(callerId)) {
    throw new AppError('Not authorized', 403);
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) throw new AppError('User not found', 404);

  return { ok: true };
}

async function follow(targetUserId, callerId) {
  validateObjectId(targetUserId, 'user ID');
  validateObjectId(callerId, 'user ID');

  if (String(targetUserId) === String(callerId)) {
    throw new AppError('You cannot follow yourself', 400);
  }

  const [target, caller] = await Promise.all([
    User.findById(targetUserId),
    User.findById(callerId),
  ]);

  if (!target) throw new AppError('User not found', 404);
  if (!caller) throw new AppError('User not found', 404);

  const alreadyFollowing = (caller.following || []).some(id => String(id) === String(targetUserId));
  if (!alreadyFollowing) {
    if (!caller.following) caller.following = [];
    if (!target.followers) target.followers = [];
    caller.following.push(target._id);
    target.followers.push(caller._id);
    await Promise.all([caller.save(), target.save()]);
  }

  return {
    ok: true,
    isFollowing: true,
    followersCount: target.followers.length,
  };
}

async function unfollow(targetUserId, callerId) {
  validateObjectId(targetUserId, 'user ID');
  validateObjectId(callerId, 'user ID');

  if (String(targetUserId) === String(callerId)) {
    throw new AppError('You cannot unfollow yourself', 400);
  }

  const [target, caller] = await Promise.all([
    User.findById(targetUserId),
    User.findById(callerId),
  ]);

  if (!target) throw new AppError('User not found', 404);
  if (!caller) throw new AppError('User not found', 404);

  caller.following = (caller.following || []).filter(id => String(id) !== String(targetUserId));
  target.followers = (target.followers || []).filter(id => String(id) !== String(callerId));
  await Promise.all([caller.save(), target.save()]);

  return {
    ok: true,
    isFollowing: false,
    followersCount: target.followers.length,
  };
}

module.exports = { getAll, getById, update, remove, follow, unfollow };
