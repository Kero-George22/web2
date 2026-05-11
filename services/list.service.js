const List             = require('../models/List.model');
const Movie            = require('../models/Movie.model');
const AppError         = require('../utils/AppError');
const validateObjectId = require('../utils/validateObjectId');

const WATCHLIST_TITLE = '__watchlist__';

async function getByUser(userId, callerId, isAdmin) {
  validateObjectId(userId, 'user ID');

  const isOwner = isAdmin || String(userId) === String(callerId);
  const query   = { userId, title: { $ne: WATCHLIST_TITLE } };
  if (!isOwner) query.isPublic = true;

  const lists = await List.find(query)
    .sort({ createdAt: -1 })
    .populate('movies', 'title posterPath averageRating releaseDate')
    .lean();

  return lists;
}

async function create(userId, { title, description, isPublic }) {
  if (!title?.trim()) throw new AppError('List title is required', 400);

  const list = await List.create({
    userId,
    title:       title.trim(),
    description: description || null,
    isPublic:    isPublic !== undefined ? Boolean(isPublic) : true,
    movies:      []
  });

  return list.toObject();
}

async function update(id, callerId, isAdmin, { title, description, isPublic }) {
  validateObjectId(id, 'list ID');
  
  const list = await List.findById(id);
  if (!list) throw new AppError('List not found', 404);
  if (list.title === WATCHLIST_TITLE) throw new AppError('Cannot modify watchlist directly', 400);

  if (!isAdmin && String(list.userId) !== String(callerId))
    throw new AppError('Not authorized', 403);

  if (title       !== undefined) list.title       = title.trim();
  if (description !== undefined) list.description = description;
  if (isPublic    !== undefined) list.isPublic    = Boolean(isPublic);

  await list.save();
  return list.toObject();
}

async function remove(id, callerId, isAdmin) {
  validateObjectId(id, 'list ID');
  
  const list = await List.findById(id);
  if (!list) throw new AppError('List not found', 404);
  if (list.title === WATCHLIST_TITLE) throw new AppError('Cannot delete watchlist directly', 400);

  if (!isAdmin && String(list.userId) !== String(callerId))
    throw new AppError('Not authorized', 403);

  await List.findByIdAndDelete(id);
  return { ok: true };
}

async function addMovie(listId, callerId, isAdmin, movieId) {
  validateObjectId(listId,  'list ID');
  validateObjectId(movieId, 'movie ID');

  const [list, movie] = await Promise.all([
    List.findById(listId),
    Movie.findById(movieId).lean(),
  ]);

  if (!list)  throw new AppError('List not found',  404);
  if (!movie) throw new AppError('Movie not found', 404);
  if (list.title === WATCHLIST_TITLE) throw new AppError('Use /watchlist to manage watchlist', 400);

  if (!isAdmin && String(list.userId) !== String(callerId))
    throw new AppError('Not authorized', 403);

  if (!list.movies.includes(movieId)) {
    list.movies.push(movieId);
    await list.save();
  }
  return { ok: true };
}

async function removeMovie(listId, callerId, isAdmin, movieId) {
  validateObjectId(listId,  'list ID');
  validateObjectId(movieId, 'movie ID');

  const list = await List.findById(listId);
  if (!list) throw new AppError('List not found', 404);
  if (list.title === WATCHLIST_TITLE) throw new AppError('Use /watchlist to manage watchlist', 400);

  if (!isAdmin && String(list.userId) !== String(callerId))
    throw new AppError('Not authorized', 403);

  list.movies.pull(movieId);
  await list.save();
  
  return { ok: true };
}

async function getById(id, callerId, isAdmin) {
  validateObjectId(id, 'list ID');

  const list = await List.findById(id)
    .populate('movies', 'title posterPath averageRating releaseDate')
    .populate('userId', 'username')
    .lean();

  if (!list) throw new AppError('List not found', 404);

  const isOwner = isAdmin || String(list.userId?._id || list.userId) === String(callerId);
  if (!isOwner && !list.isPublic) throw new AppError('List not found', 404);

  return list;
}

module.exports = { getByUser, getById, create, update, remove, addMovie, removeMovie };
