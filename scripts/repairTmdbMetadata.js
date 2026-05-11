#!/usr/bin/env node
require('dotenv').config();
const connectDB = require('../config/database');
const Movie = require('../models/Movie.model');
const movieService = require('../services/movie.service');

function isPlaceholderTitle(title) {
  return typeof title === 'string' && /^TMDB\s+\d+$/i.test(title.trim());
}

function needsRepair(movie) {
  return isPlaceholderTitle(movie.title) || !movie.posterPath || !movie.overview;
}

(async function repair() {
  await connectDB();

  const targets = await Movie.find({}).lean();
  const broken = targets.filter(needsRepair);

  console.log(`Found ${broken.length} movies/series needing TMDB metadata repair.`);

  let fixed = 0;
  let failed = 0;

  for (const item of broken) {
    try {
      if (item.type === 'tv') {
        await movieService.fetchTvFromTmdb(item.tmdbId);
      } else {
        await movieService.fetchFromTmdb(item.tmdbId);
      }
      fixed += 1;
      console.log(`✓ Repaired ${item.type || 'movie'} ${item.tmdbId}`);
    } catch (err) {
      failed += 1;
      console.log(`✗ Failed ${item.type || 'movie'} ${item.tmdbId}: ${err.message}`);
    }
  }

  console.log(`Done. Fixed: ${fixed}, Failed: ${failed}`);
  process.exit(0);
})();
