const Movie            = require('../models/Movie.model');
const List             = require('../models/List.model');
const AppError         = require('../utils/AppError');
const validateObjectId = require('../utils/validateObjectId');

const WATCHLIST_TITLE = '__watchlist__';

async function getOrCreateWatchlist(userId) {
  let list = await List.findOne({ userId, title: WATCHLIST_TITLE });
  if (!list) {
    list = await List.create({
      userId,
      title: WATCHLIST_TITLE,
      isPublic: false,
      description: 'User watchlist'
    });
  }
  return list;
}

async function getWatchlist(userId) {
  const list = await getOrCreateWatchlist(userId);
  await list.populate({
    path: 'movies',
    select: 'id title posterPath releaseDate averageRating genres',
    options: { sort: { title: 1 } }
  });
  
  return { count: list.movies.length, movies: list.movies };
}

async function addMovie(userId, movieId) {
  validateObjectId(movieId, 'movie ID');
  
  const movie = await Movie.findById(movieId).lean();
  if (!movie) throw new AppError('Movie not found', 404);

  const list = await getOrCreateWatchlist(userId);
  if (!list.movies.includes(movieId)) {
    list.movies.push(movieId);
    await list.save();
  }
  
  return { ok: true };
}

async function removeMovie(userId, movieId) {
  validateObjectId(movieId, 'movie ID');
  
  const list = await getOrCreateWatchlist(userId);
  list.movies.pull(movieId);
  await list.save();
  
  return { ok: true };
}

module.exports = { getWatchlist, addMovie, removeMovie };
