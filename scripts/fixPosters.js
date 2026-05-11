#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const connectDB = require('../config/database');
const Movie = require('../models/Movie.model');
const movieService = require('../services/movie.service');

async function headUrl(url) {
  try {
    const res = await axios.head(url, { timeout: 7000 });
    return res.status >= 200 && res.status < 300;
  } catch (err) {
    return false;
  }
}

(async function main() {
  await connectDB();
  console.log('Connected to MongoDB');

  const movies = await Movie.find({}).lean();
  console.log(`Found ${movies.length} movies`);

  let fixed = 0;
  for (const m of movies) {
    const poster = m.posterPath;
    const imgUrl = poster ? `https://image.tmdb.org/t/p/w500${poster}` : null;

    let ok = false;
    if (imgUrl) ok = await headUrl(imgUrl);

    if (!ok) {
      console.log(`Broken or missing poster for tmdbId=${m.tmdbId} title="${m.title}"`);
      try {
        const updated = await movieService.fetchFromTmdb(m.tmdbId);
        if (updated?.posterPath) {
          const newUrl = `https://image.tmdb.org/t/p/w500${updated.posterPath}`;
          const ok2 = await headUrl(newUrl);
          if (ok2) {
            console.log(` -> Updated poster to ${updated.posterPath}`);
            fixed++;
            continue;
          } else {
            console.log(' -> TMDB returned poster_path but image still 404');
          }
        } else {
          console.log(' -> TMDB did not return a poster_path for this movie');
        }
      } catch (err) {
        console.log(' -> Failed to fetch from TMDB:', err.message);
      }
    }
  }

  console.log(`Completed. Fixed ${fixed} posters.`);
  process.exit(0);
})();
