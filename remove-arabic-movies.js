const mongoose = require('mongoose');
require('dotenv').config();

const Movie = require('./models/Movie.model');
const Review = require('./models/Review.model');
const MovieView = require('./models/MovieView.model');
const List = require('./models/List.model');
const User = require('./models/User.model');

async function removeArabicMovies() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI is not set.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // Find Arabic movies (either by language 'ar' or containing Arabic letters)
    const arabicMovies = await Movie.find({
      $or: [
        { language: 'ar' },
        { overview: /[\u0600-\u06FF]/ },
        { title: /[\u0600-\u06FF]/ }
      ]
    });

    if (arabicMovies.length === 0) {
      console.log('No Arabic movies found.');
      process.exit(0);
    }

    console.log(`Found ${arabicMovies.length} Arabic movies to delete.`);
    const movieIds = arabicMovies.map(m => m._id);

    // 1. Delete associated reviews
    const deletedReviews = await Review.deleteMany({ movieId: { $in: movieIds } });
    console.log(`✓ Deleted ${deletedReviews.deletedCount} associated reviews.`);

    // 2. Delete associated views
    const deletedViews = await MovieView.deleteMany({ movieId: { $in: movieIds } });
    console.log(`✓ Deleted ${deletedViews.deletedCount} associated views.`);

    // 3. Remove movies from user's pinned favorites
    await User.updateMany(
      { pinnedFavorites: { $in: movieIds } },
      { $pull: { pinnedFavorites: { $in: movieIds } } }
    );
    console.log('✓ Removed movies from users pinned favorites.');

    // 4. Remove movies from user lists
    await List.updateMany(
      { movies: { $in: movieIds } },
      { $pull: { movies: { $in: movieIds } } }
    );
    console.log('✓ Removed movies from user lists.');

    // 5. Delete the movies themselves
    const deletedMovies = await Movie.deleteMany({ _id: { $in: movieIds } });
    console.log(`✓ Deleted ${deletedMovies.deletedCount} Arabic movies successfully.`);

    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

removeArabicMovies();
