const axios = require('axios');
const asyncWrapper = require('../utils/asyncWrapper');
const { success }  = require('../utils/apiResponse');
const aiService    = require('../services/ai.service');
const movieService = require('../services/movie.service');
const AppError = require('../utils/AppError');

// Ensure we have access to fetchFromTmdb if needed or just use TMDB search API
const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/multi';

exports.recommend = asyncWrapper(async (req, res) => {
  const recs = await aiService.recommend(req.user._id);
  return success(res, recs, 'Recommendations generated');
});

exports.identify = asyncWrapper(async (req, res) => {
  const identifyResult = await aiService.identify(req.body);
  
  let movieObject = null;
  let localMovie = null;
  
  // Try to actually find this movie in TMDB to give realistic data
  if (identifyResult && identifyResult.title && process.env.TMDB_API_KEY) {
    try {
      const tmdbRes = await axios.get(TMDB_SEARCH_URL, {
        params: {
          api_key: process.env.TMDB_API_KEY,
          query: identifyResult.title,
          include_adult: false,
          language: 'en-US'
        }
      });
      
      const results = tmdbRes.data.results || [];
      if (results.length > 0) {
        // filter out pure persons
        const validResults = results.filter(r => r.media_type === 'movie' || r.media_type === 'tv');
        if (validResults.length > 0) {
          movieObject = validResults[0];
        } else {
           movieObject = results[0];
        }
        
        // Import into local DB so frontend can navigate using local _id
        if (movieObject && movieObject.id) {
          if (movieObject.media_type === 'tv') {
            localMovie = await movieService.fetchTvFromTmdb(movieObject.id);
          } else {
            localMovie = await movieService.fetchFromTmdb(movieObject.id);
          }
        }
      }
    } catch (error) {
      console.warn("Could not fetch exact movie from TMDB, returning AI parsed data.");
    }
  }

  return success(res, { ai: identifyResult, movie: movieObject, localMovie }, 'Movie identified');
});

exports.chat = asyncWrapper(async (req, res) => {
  const { prompt } = req.body;
  const result = await aiService.chat(prompt);
  return success(res, result, 'Chat reply generated');
});

exports.summarizeReviews = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const result = await aiService.summarizeReviews(id);
  return success(res, result, 'Reviews summarized');
});
