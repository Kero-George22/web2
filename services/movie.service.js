const axios = require('axios');
const Movie = require('../models/Movie.model');
const MovieView = require('../models/MovieView.model');
const AppError = require('../utils/AppError');
const validateObjectId = require('../utils/validateObjectId');
const Review = require('../models/Review.model');

const TMDB_BASE = 'https://api.themoviedb.org/3';

const POSTER_FALLBACKS = {
  238: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
  278: '/lyQBXzOQSuE59IsHyhrp0qIiPAz.jpg',
  13: '/saHP97rTPS5eLmrLQEcANmKrsFl.jpg',
  155: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  680: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
  27205: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
  497: '/velWPhVMQeQKcxggNEU8YmU1K8W.jpg',
  129: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
  424: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
};

function tmdbUrl(path) {
  return `${TMDB_BASE}${path}?api_key=${process.env.TMDB_API_KEY}`;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizePosterPath(movie) {
  if (!movie) return movie;

  const fallbackPoster = POSTER_FALLBACKS[movie.tmdbId];
  const posterLooksBroken =
    movie.tmdbId === 238 && movie.posterPath && movie.posterPath.includes('LlegkAozFVw');

  if (posterLooksBroken) {
    return { ...movie, posterPath: fallbackPoster };
  }

  if (!movie.posterPath && fallbackPoster) {
    return { ...movie, posterPath: fallbackPoster };
  }

  return movie;
}

function isPlaceholderTitle(title) {
  return typeof title === 'string' && /^TMDB\s+\d+$/i.test(title.trim());
}

function needsMetadataRefresh(movie) {
  if (!movie?.tmdbId) return false;
  return isPlaceholderTitle(movie.title) || !movie.posterPath || !movie.overview;
}

async function refreshMetadataIfNeeded(movie) {
  if (!needsMetadataRefresh(movie)) return movie;

  try {
    if (movie.type === 'tv') {
      return await fetchTvFromTmdb(movie.tmdbId);
    }
    return await fetchFromTmdb(movie.tmdbId);
  } catch {
    // Keep the existing record if TMDB is unavailable.
    return movie;
  }
}

async function getAll({ page = 1, limit = 20, genre, year, minRating, language, type } = {}) {
  limit = Math.min(Number(limit) || 20, 100);
  page = Math.max(Number(page) || 1, 1);
  const skip = (page - 1) * limit;

  const query = {};
  if (genre) query.genres = genre;
  if (language) query.language = language;
  if (year) query.releaseDate = { $regex: `^${escapeRegex(String(year))}` };
  if (minRating) query.averageRating = { $gte: parseFloat(minRating) };
  if (type) query.type = type;

  const [items, total] = await Promise.all([
    Movie.find(query).sort({ averageRating: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Movie.countDocuments(query)
  ]);

  return { total, page, limit, items: items.map(normalizePosterPath) };
}

async function search({ q = '', page = 1, limit = 20 } = {}) {
  if (!q.trim()) throw new AppError('Search query is required', 400);

  limit = Math.min(Number(limit) || 20, 100);
  page = Math.max(Number(page) || 1, 1);
  const skip = (page - 1) * limit;

  const safe = escapeRegex(q.trim());
  const query = { title: { $regex: safe, $options: 'i' } };

  const [items, total] = await Promise.all([
    Movie.find(query).sort({ averageRating: -1 }).skip(skip).limit(limit).lean(),
    Movie.countDocuments(query)
  ]);

  return { total, page, limit, items: items.map(normalizePosterPath) };
}

async function getById(id) {
  validateObjectId(id, 'movie ID');
  let movie = await Movie.findById(id).lean();

  // Fallback for links that may carry TMDB ids or legacy numeric ids
  if (!movie && /^\d+$/.test(String(id))) {
    movie = await Movie.findOne({ tmdbId: Number(id) }).lean();
  }

  if (!movie) throw new AppError('Movie not found', 404);
  movie = await refreshMetadataIfNeeded(movie);
  return normalizePosterPath(movie);
}

async function getSimilar(movieId, { limit = 6 } = {}) {
  validateObjectId(movieId, 'movie ID');
  limit = Math.min(Math.max(Number(limit) || 6, 1), 24);

  const sourceMovie = await Movie.findById(movieId).lean();
  if (!sourceMovie) throw new AppError('Movie not found', 404);

  const type = sourceMovie.type || 'movie';

  // 1. Try to fetch realistic recommendations from TMDB
  if (sourceMovie.tmdbId && process.env.TMDB_API_KEY) {
    try {
      const { data: recData } = await axios.get(tmdbUrl(`/${type}/${sourceMovie.tmdbId}/recommendations`));
      
      let results = recData.results || [];
      if (results.length === 0) {
        const { data: simData } = await axios.get(tmdbUrl(`/${type}/${sourceMovie.tmdbId}/similar`));
        results = simData.results || [];
      }

      if (results.length > 0) {
        const topIds = results.slice(0, limit).map(r => r.id);
        
        // Import/Fetch from TMDB in parallel to our local DB
        const movies = await Promise.all(
          topIds.map(id => type === 'tv' ? fetchTvFromTmdb(id) : fetchFromTmdb(id))
        ).catch(err => {
          console.warn('TMDB parallel fetch partially failed:', err.message);
          return []; // Graceful fallback
        });
        
        const validMovies = (movies || [])
          .filter(m => m && m._id && String(m._id) !== String(sourceMovie._id));
          
        if (validMovies.length > 0) {
          return validMovies.slice(0, limit);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch TMDB similar, falling back to local:', err.message);
    }
  }

  const sourceGenres = sourceMovie.genres || [];
  const query = {
    _id: { $ne: sourceMovie._id },
    type: sourceMovie.type || 'movie',
  };

  if (sourceGenres.length > 0) {
    query.genres = { $in: sourceGenres };
  }

  const candidates = await Movie.find(query)
    .sort({ averageRating: -1, views: -1, createdAt: -1 })
    .limit(50)
    .lean();

  const scored = candidates
    .map((candidate) => {
      const overlap = (candidate.genres || []).filter((genre) => sourceGenres.includes(genre)).length;
      return { candidate, overlap };
    })
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      if ((b.candidate.averageRating || 0) !== (a.candidate.averageRating || 0)) {
        return (b.candidate.averageRating || 0) - (a.candidate.averageRating || 0);
      }
      return (b.candidate.views || 0) - (a.candidate.views || 0);
    })
    .slice(0, limit)
    .map((item) => normalizePosterPath(item.candidate));

  return scored;
}

async function recordView(movieId, userId = null, type = 'pageview') {
  validateObjectId(movieId, 'movie ID');

  const validTypes = ['pageview', 'play', 'watching'];
  if (!validTypes.includes(type)) type = 'pageview';

  const mv = await MovieView.create({ movieId, userId: userId || null, type });

  // Increment lightweight counter on Movie
  await Movie.findByIdAndUpdate(movieId, { $inc: { views: 1 } }).exec();
  return mv.toObject();
}

async function setWatching(movieId, userId, watching = true) {
  validateObjectId(movieId, 'movie ID');
  validateObjectId(userId, 'user ID');

  if (watching) {
    await MovieView.create({ movieId, userId, type: 'watching' });
  } else {
    // remove the latest watching records for this user/movie
    await MovieView.deleteMany({ movieId, userId, type: 'watching' });
  }
  return { ok: true };
}

async function getTopRated({ limit = 20, minReviews = 5 } = {}) {
  limit = Math.min(Number(limit) || 20, 100);
  minReviews = Math.max(Number(minReviews) || 1, 1);

  const globalStats = await Review.aggregate([
    { $group: { _id: null, avgRating: { $avg: '$rating' } } },
  ]).exec();

  const priorAverage = globalStats[0]?.avgRating ?? 3.5;
  const priorWeight = 5;

  const agg = await Movie.aggregate([
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'movieId',
        as: 'reviews',
      },
    },
    {
      $addFields: {
        reviewCount: { $size: '$reviews' },
        averageRating: {
          $round: [{ $ifNull: [{ $avg: '$reviews.rating' }, 0] }, 1],
        },
      },
    },
    {
      $addFields: {
        rankingScore: {
          $cond: [
            { $gte: ['$reviewCount', minReviews] },
            {
              $add: [
                {
                  $multiply: [
                    {
                      $divide: ['$reviewCount', { $add: ['$reviewCount', priorWeight] }],
                    },
                    '$averageRating',
                  ],
                },
                {
                  $multiply: [
                    {
                      $divide: [priorWeight, { $add: ['$reviewCount', priorWeight] }],
                    },
                    priorAverage,
                  ],
                },
              ],
            },
            {
              $add: [
                {
                  $multiply: [
                    {
                      $divide: ['$reviewCount', { $add: ['$reviewCount', priorWeight] }],
                    },
                    '$averageRating',
                  ],
                },
                {
                  $multiply: [
                    {
                      $divide: [priorWeight, { $add: ['$reviewCount', priorWeight] }],
                    },
                    priorAverage,
                  ],
                },
              ],
            },
          ],
        },
      },
    },
    { $sort: { rankingScore: -1, reviewCount: -1, createdAt: -1 } },
    { $limit: limit },
    {
      $project: {
        reviews: 0,
        rankingScore: 0,
      },
    },
  ]).exec();

  return agg.map(normalizePosterPath);
}

async function getTrending({ limit = 20, days = 7 } = {}) {
  limit = Math.min(Number(limit) || 20, 100);
  days = Math.max(Number(days) || 7, 1);

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const agg = await Movie.aggregate([
    {
      $lookup: {
        from: 'movieviews',
        let: { movieId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$movieId', '$$movieId'] },
                  { $gte: ['$createdAt', since] },
                ],
              },
            },
          },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 },
            },
          },
        ],
        as: 'recentViews',
      },
    },
    {
      $addFields: {
        trendingScore: {
          $sum: {
            $map: {
              input: '$recentViews',
              as: 'view',
              in: {
                $multiply: [
                  '$$view.count',
                  {
                    $switch: {
                      branches: [
                        { case: { $eq: ['$$view._id', 'play'] }, then: 1.5 },
                        { case: { $eq: ['$$view._id', 'watching'] }, then: 2.0 },
                      ],
                      default: 1.0,
                    },
                  },
                ],
              },
            },
          },
        },
      },
    },
    { $sort: { trendingScore: -1, views: -1, createdAt: -1 } },
    { $limit: limit },
    { $project: { recentViews: 0 } },
  ]).exec();

  return agg.map(normalizePosterPath);
}

async function fetchFromTmdb(tmdbId) {
  validateObjectId(tmdbId, 'TMDB ID'); // Will pass through for TMDB IDs (integers)

  let details, credits;
  try {
    [{ data: details }, { data: credits }] = await Promise.all([
      axios.get(tmdbUrl(`/movie/${tmdbId}`)),
      axios.get(tmdbUrl(`/movie/${tmdbId}/credits`)),
    ]);
  } catch (err) {
    if (err.response?.status === 404)
      throw new AppError(`TMDB movie ${tmdbId} not found`, 404);
    throw new AppError('TMDB request failed: ' + err.message, 502);
  }

  const genres = (details.genres || []).map(g => g.name);
  const director = (credits.crew || []).find(c => c.job === 'Director')?.name || null;
  const cast = (credits.cast || []).slice(0, 5).map(c => c.name);

  const payload = {
    tmdbId,
    title: details.title,
    overview: details.overview || null,
    posterPath: details.poster_path || null,
    backdropPath: details.backdrop_path || null,
    releaseDate: details.release_date || null,
    genres,
    director,
    cast,
    runtime: details.runtime || null,
    language: details.original_language || 'en',
    type: 'movie'
  };

  const movie = await Movie.findOneAndUpdate(
    { tmdbId },
    payload,
    { upsert: true, setDefaultsOnInsert: true, returnDocument: 'after' }
  ).lean();

  return movie;
}

async function fetchTvFromTmdb(tmdbId) {
  validateObjectId(tmdbId, 'TMDB ID');

  let details, credits;
  try {
    [{ data: details }, { data: credits }] = await Promise.all([
      axios.get(tmdbUrl(`/tv/${tmdbId}`)),
      axios.get(tmdbUrl(`/tv/${tmdbId}/credits`)),
    ]);
  } catch (err) {
    if (err.response?.status === 404)
      throw new AppError(`TMDB TV show ${tmdbId} not found`, 404);
    throw new AppError('TMDB TV request failed: ' + err.message, 502);
  }

  const genres = (details.genres || []).map(g => g.name);
  let director = null;
  if (details.created_by && details.created_by.length > 0) {
    director = details.created_by[0].name;
  }
  const cast = (credits.cast || []).slice(0, 5).map(c => c.name);
  const runtime = details.episode_run_time && details.episode_run_time.length > 0
    ? details.episode_run_time[0]
    : null;

  const payload = {
    tmdbId,
    title: details.name, // TV shows use 'name' instead of 'title'
    overview: details.overview || null,
    posterPath: details.poster_path || null,
    backdropPath: details.backdrop_path || null,
    releaseDate: details.first_air_date || null, // TV shows use 'first_air_date'
    genres,
    director,
    cast,
    runtime,
    language: details.original_language || 'en',
    type: 'tv',
    seasonsCount: details.number_of_seasons || null,
    episodesCount: details.number_of_episodes || null,
  };

  const tvShow = await Movie.findOneAndUpdate(
    { tmdbId },
    payload,
    { upsert: true, setDefaultsOnInsert: true, returnDocument: 'after' }
  ).lean();

  return tvShow;
}

async function update(id, body) {
  validateObjectId(id, 'movie ID');
  const movie = await Movie.findById(id);
  if (!movie) throw new AppError('Movie not found', 404);

  const allowed = [
    'title', 'overview', 'posterPath', 'backdropPath',
    'releaseDate', 'genres', 'director', 'cast', 'runtime',
  ];
  allowed.forEach(field => {
    if (body[field] !== undefined) movie[field] = body[field];
  });

  await movie.save();
  return movie.toObject();
}

async function remove(id) {
  validateObjectId(id, 'movie ID');
  const movie = await Movie.findByIdAndDelete(id);
  if (!movie) throw new AppError('Movie not found', 404);
  return { ok: true };
}

module.exports = {
  getAll, search, getById, fetchFromTmdb, fetchTvFromTmdb, update, remove,
  recordView, setWatching, getTopRated, getTrending, getSimilar
};
