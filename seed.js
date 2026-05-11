/**
 * seed.js — development-only database seeder.
 * Blocked in production via the NODE_ENV guard below.
 */

require('dotenv').config();

if (process.env.NODE_ENV === 'production') {
  console.error('🚫  Seeder is blocked in production.');
  process.exit(1);
}

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User           = require('./models/User.model');
const Movie          = require('./models/Movie.model');
const Review         = require('./models/Review.model');
const List           = require('./models/List.model');
const MovieView      = require('./models/MovieView.model');
const movieService   = require('./services/movie.service');

// ─── Seed data ────────────────────────────────────────────────────────────────
const USERS = [
  { username: 'admin', email: 'admin@cinelog.dev', password: 'Admin1234!', isAdmin: true, bio: 'CineLog administrator.' },
  { username: 'alice', email: 'alice@example.com', password: 'Password1!', bio: 'I watch way too many films.' },
  { username: 'bob',   email: 'bob@example.com',   password: 'Password1!', bio: 'Sci-fi and horror enthusiast.' },
];

const MOVIES = [
  { tmdbId: 278, title: 'The Shawshank Redemption', releaseDate: '1994-09-23', genres: ['Drama'], director: 'Frank Darabont', cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton'], runtime: 142 },
  { tmdbId: 238, title: 'The Godfather', releaseDate: '1972-03-24', genres: ['Drama', 'Crime'], director: 'Francis Ford Coppola', cast: ['Marlon Brando', 'Al Pacino', 'James Caan'], runtime: 175 },
  { tmdbId: 550, title: 'Fight Club', releaseDate: '1999-10-15', genres: ['Drama', 'Thriller'], director: 'David Fincher', cast: ['Brad Pitt', 'Edward Norton', 'Helena Bonham Carter'], runtime: 139 },
  { tmdbId: 155, title: 'The Dark Knight', releaseDate: '2008-07-16', genres: ['Action', 'Crime', 'Drama'], director: 'Christopher Nolan', cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'], runtime: 152 },
  { tmdbId: 680, title: 'Pulp Fiction', releaseDate: '1994-10-14', genres: ['Thriller', 'Crime'], director: 'Quentin Tarantino', cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson'], runtime: 154 },
  { tmdbId: 27205, title: 'Inception', releaseDate: '2010-07-15', genres: ['Action', 'Science Fiction'], director: 'Christopher Nolan', cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'], runtime: 148 },
  { tmdbId: 157336, title: 'Interstellar', releaseDate: '2014-11-05', genres: ['Adventure', 'Drama', 'Science Fiction'], director: 'Christopher Nolan', cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'], runtime: 169 },
  { tmdbId: 497, title: 'The Green Mile', releaseDate: '1999-12-10', genres: ['Crime', 'Drama', 'Fantasy'], director: 'Frank Darabont', cast: ['Tom Hanks', 'Michael Clarke Duncan', 'David Morse'], runtime: 189 },
  { tmdbId: 603, title: 'The Matrix', releaseDate: '1999-03-30', genres: ['Action', 'Science Fiction'], director: 'Lana Wachowski', cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'], runtime: 136 },
  { tmdbId: 122, title: 'The Lord of the Rings: The Return of the King', releaseDate: '2003-12-17', genres: ['Adventure', 'Fantasy', 'Action'], director: 'Peter Jackson', cast: ['Elijah Wood', 'Viggo Mortensen', 'Ian McKellen'], runtime: 201 },
  { tmdbId: 129, title: 'Spirited Away', releaseDate: '2001-07-20', genres: ['Animation', 'Family', 'Fantasy'], director: 'Hayao Miyazaki', cast: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki'], runtime: 125 },
  { tmdbId: 424, title: "Schindler's List", releaseDate: '1993-12-15', genres: ['Drama', 'History', 'War'], director: 'Steven Spielberg', cast: ['Liam Neeson', 'Ralph Fiennes', 'Ben Kingsley'], runtime: 195 },
];

// If you want more movies automatically fetched from TMDB, we will discover
// popular international movies and popular Egyptian (Arabic) movies and
// append them to `MOVIES` so the seeder creates ~50 foreign + ~20 Egyptian.
const FOREIGN_TARGET = 40; // total foreign movies desired
const EGYPTIAN_TARGET = 15; // total Egyptian movies desired
const TV_TARGET = 15; // total TV shows desired

const axios = require('axios');
async function discoverTmdb(params, type = 'movie') {
  const key = process.env.TMDB_API_KEY;
  if (!key) return null;
  const url = `https://api.themoviedb.org/3/discover/${type}`;
  const res = await axios.get(url, { params: { api_key: key, ...params } });
  return res.data;
}

async function expandMovieSeeds() {
  if (!process.env.TMDB_API_KEY) return;

  const existing = new Set(MOVIES.map(m => Number(m.tmdbId)));

  // Collect foreign (non-Arabic) tmdb IDs by popularity
  const foreignIds = [];
  let page = 1;
  while (foreignIds.length < FOREIGN_TARGET && page <= 20) {
    const data = await discoverTmdb({ sort_by: 'popularity.desc', page, 'vote_count.gte': 50 }, 'movie');
    if (!data || !data.results || data.results.length === 0) break;
    for (const r of data.results) {
      if (foreignIds.length >= FOREIGN_TARGET) break;
      if (existing.has(r.id)) continue;
      if (r.original_language === 'ar') continue; // skip Arabic here
      foreignIds.push(r.id);
      existing.add(r.id);
    }
    page += 1;
  }

  // Collect Egyptian / Arabic movies
  const egyptIds = [];
  page = 1;
  while (egyptIds.length < EGYPTIAN_TARGET && page <= 20) {
    const data = await discoverTmdb({ sort_by: 'popularity.desc', page, with_original_language: 'ar', with_origin_country: 'EG' }, 'movie');
    if (!data || !data.results || data.results.length === 0) break;
    for (const r of data.results) {
      if (egyptIds.length >= EGYPTIAN_TARGET) break;
      if (existing.has(r.id)) continue;
      egyptIds.push(r.id);
      existing.add(r.id);
    }
    page += 1;
  }

  // Collect TV shows
  const tvIds = [];
  page = 1;
  while (tvIds.length < TV_TARGET && page <= 20) {
    const data = await discoverTmdb({ sort_by: 'popularity.desc', page, 'vote_count.gte': 50 }, 'tv');
    if (!data || !data.results || data.results.length === 0) break;
    for (const r of data.results) {
      if (tvIds.length >= TV_TARGET) break;
      if (existing.has(r.id)) continue;
      tvIds.push(r.id);
      // Not adding TV ids to existing here since tmdbIds can overlap between movies and tv but our schema requires unique tmdbId.
      existing.add(r.id); 
    }
    page += 1;
  }

  // Append discovered IDs as minimal seeds (we rely on movieService.fetchFromTmdb later)
  for (const id of foreignIds) MOVIES.push({ tmdbId: id, type: 'movie' });
  for (const id of egyptIds) MOVIES.push({ tmdbId: id, type: 'movie' });
  for (const id of tvIds) MOVIES.push({ tmdbId: id, type: 'tv' });
}

const REVIEW_SEEDS = [
  { movieIndex: 0, user: 'alice', rating: 5,   content: 'A perfect film about hope and patience.', liked: true,  watchedDate: '2024-01-08' },
  { movieIndex: 0, user: 'bob',   rating: 4.5, content: 'Amazing emotional payoff.', liked: true,  watchedDate: '2024-01-09' },
  { movieIndex: 1, user: 'admin', rating: 5,   content: 'Still one of the greatest ever made.', liked: true,  watchedDate: '2024-01-11' },
  { movieIndex: 1, user: 'alice', rating: 4.5, content: 'Iconic from start to finish.', liked: true,  watchedDate: '2024-01-12' },
  { movieIndex: 2, user: 'bob',   rating: 4.5, content: 'Brutal, sharp and unforgettable.', liked: true,  watchedDate: '2024-01-14' },
  { movieIndex: 3, user: 'admin', rating: 5,   content: 'One of the best superhero films ever.', liked: true,  watchedDate: '2024-01-16' },
  { movieIndex: 3, user: 'bob',   rating: 4.5, content: 'The Joker performance alone is legendary.', liked: true,  watchedDate: '2024-01-18' },
  { movieIndex: 4, user: 'alice', rating: 4.5, content: 'Tarantino at his most stylish.', liked: true,  watchedDate: '2024-01-20' },
  { movieIndex: 5, user: 'bob',   rating: 4.5, content: 'Dreams inside dreams never get old.', liked: true,  watchedDate: '2024-01-22' },
  { movieIndex: 6, user: 'admin', rating: 4.5, content: 'Big, emotional, and beautifully shot.', liked: true,  watchedDate: '2024-01-24' },
  { movieIndex: 7, user: 'alice', rating: 4,   content: 'Heartbreaking and magical.', liked: true,  watchedDate: '2024-01-26' },
  { movieIndex: 8, user: 'bob',   rating: 5,   content: 'Cyberpunk perfection.', liked: true,  watchedDate: '2024-01-28' },
  { movieIndex: 9, user: 'admin', rating: 5,   content: 'A legendary finale.', liked: true,  watchedDate: '2024-01-30' },
  { movieIndex: 10, user: 'alice', rating: 4.5, content: 'Pure visual poetry.', liked: true,  watchedDate: '2024-02-01' },
  { movieIndex: 11, user: 'bob',   rating: 5,   content: 'One of the most important films ever made.', liked: true,  watchedDate: '2024-02-03' },
];

const VIEW_SEEDS = [
  { movieIndex: 0, type: 'pageview', count: 18 },
  { movieIndex: 0, type: 'watching', count: 4 },
  { movieIndex: 3, type: 'pageview', count: 16 },
  { movieIndex: 3, type: 'play',     count: 6 },
  { movieIndex: 5, type: 'pageview', count: 14 },
  { movieIndex: 6, type: 'pageview', count: 12 },
  { movieIndex: 8, type: 'watching',  count: 5 },
  { movieIndex: 9, type: 'pageview',  count: 11 },
  { movieIndex: 10, type: 'play',     count: 7 },
  { movieIndex: 11, type: 'pageview', count: 10 },
];

// ─── Runner ───────────────────────────────────────────────────────────────────
async function seed() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI is not set');

  await mongoose.connect(mongoUri);
  console.log('✓ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Movie.deleteMany({}),
    Review.deleteMany({}),
    List.deleteMany({}),
    MovieView.deleteMany({}),
  ]);
  console.log('✓ Cleared database');

  // Users
  const createdUsers = await Promise.all(
    USERS.map(async u => {
      const hash = await bcrypt.hash(u.password, 12);
      return User.create({ ...u, password: hash });
    })
  );
  console.log(`✓ Created ${createdUsers.length} users`);

  // Movies
  // Optionally expand MOVIES via TMDB discover to reach foreign/egyptian targets
  if (process.env.TMDB_API_KEY) {
    try {
      await expandMovieSeeds();
    } catch (err) {
      console.warn('Failed to expand movie seeds from TMDB:', err.message);
    }
  }

  const createdMovies = await Promise.all(
    MOVIES.map(async movieSeed => {
      if (process.env.TMDB_API_KEY) {
        try {
          if (movieSeed.type === 'tv') {
            return await movieService.fetchTvFromTmdb(movieSeed.tmdbId);
          } else {
            return await movieService.fetchFromTmdb(movieSeed.tmdbId);
          }
        } catch (err) {
          console.warn(`TMDB fetch failed for ${movieSeed.tmdbId}, using fallback seed: ${err.message}`);
        }
      }

      // Ensure minimal required fields exist when falling back to raw seed
      const seed = { ...movieSeed };
      if (!seed.title) seed.title = `TMDB ${seed.tmdbId}`;
      if (!seed.type) seed.type = 'movie';
      return Movie.create(seed);
    })
  );
  console.log(`✓ Created ${createdMovies.length} movies`);

  // Reviews — spread across multiple users so ratings feel real
  const userMap = Object.fromEntries(createdUsers.map(u => [u.username, u]));

  await Promise.all(
    REVIEW_SEEDS.map(seed =>
      Review.create({
        userId:  userMap[seed.user]._id,
        movieId: createdMovies[seed.movieIndex]._id,
        rating:  seed.rating,
        content: seed.content,
        liked:   seed.liked,
        watchedDate: seed.watchedDate,
      })
    )
  );

  const stats = await Review.aggregate([
    { $group: { _id: '$movieId', avg: { $avg: '$rating' }, cnt: { $sum: 1 } } }
  ]);

  await Promise.all(
    createdMovies.map(async movie => {
      const stat = stats.find(s => String(s._id) === String(movie._id));
      await Movie.findByIdAndUpdate(movie._id, {
        averageRating: stat ? Math.round(stat.avg * 10) / 10 : 0,
        reviewCount: stat ? stat.cnt : 0,
      });
    })
  );
  console.log('✓ Created reviews and updated movie stats');

  // Views and watching activity to make trending meaningful
  const viewDocs = [];
  VIEW_SEEDS.forEach(seed => {
    for (let i = 0; i < seed.count; i += 1) {
      viewDocs.push({
        movieId: createdMovies[seed.movieIndex]._id,
        userId: null,
        type: seed.type,
      });
    }
  });
  await MovieView.insertMany(viewDocs);

  const viewStats = await MovieView.aggregate([
    { $group: { _id: '$movieId', cnt: { $sum: 1 } } }
  ]);
  await Promise.all(
    createdMovies.map(async movie => {
      const stat = viewStats.find(s => String(s._id) === String(movie._id));
      await Movie.findByIdAndUpdate(movie._id, {
        views: stat ? stat.cnt : 0,
      });
    })
  );
  console.log('✓ Seeded movie views and watching activity');

  // List — alice creates a favourite list
  const list = await List.create({
    userId:      userMap['alice']._id,
    title:       'All-Time Favourites',
    description: 'Movies I could watch forever.',
    isPublic:    true,
    movies:      createdMovies.map(m => m._id)
  });
  console.log('✓ Created sample list with all movies');

  console.log('\n🎬  Seed complete!\n');
  console.log('  admin@cinelog.dev  /  Admin1234!');
  console.log('  alice@example.com  /  Password1!');
  console.log('  bob@example.com    /  Password1!\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
