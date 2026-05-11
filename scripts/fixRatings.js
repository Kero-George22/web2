const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Movie = require('../models/Movie.model');
const Review = require('../models/Review.model');

async function fixRatings() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI is not set. Please check your .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    const movies = await Movie.find({});
    console.log(`Found ${movies.length} movies. Calculating ratings...`);

    let updatedCount = 0;

    for (const movie of movies) {
      const stats = await Review.aggregate([
        { $match: { movieId: movie._id } },
        { $group: {
            _id: '$movieId',
            averageRating: { $avg: '$rating' },
            reviewCount: { $sum: 1 }
        }}
      ]);

      if (stats.length > 0) {
        movie.averageRating = Number(stats[0].averageRating.toFixed(1));
        movie.reviewCount = stats[0].reviewCount;
      } else {
        movie.averageRating = 0;
        movie.reviewCount = 0;
      }

      await movie.save();
      updatedCount++;
    }

    console.log(`✓ Updated ratings for ${updatedCount} movies/series`);
    console.log('Done!');
    process.exit(0);

  } catch (error) {
    console.error('Error fixing ratings:', error);
    process.exit(1);
  }
}

fixRatings();