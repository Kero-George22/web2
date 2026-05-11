const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const Movie = require('../models/Movie.model');
const Review = require('../models/Review.model');
const User = require('../models/User.model');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
if (!TMDB_API_KEY) {
  console.error("TMDB_API_KEY missing");
  process.exit(1);
}

const positiveReviews = [
  "Masterpiece. No other word can describe it.",
  "One of the best movies I have ever seen!",
  "A true cinematic achievement.",
  "Every frame is perfect, the acting is top notch.",
  "I could watch this every year and never get bored.",
  "Absolutely amazing. Deserves all the highest ratings.",
  "Phenomenal directing and compelling story.",
  "The soundtrack, the cinematography, everything is 10/10.",
  "Mind-blowing! Truly one of the GOATs.",
  "It actually changed my perspective on cinema.",
  "An absolute cultural landmark.",
  "Flawless from start to finish.",
  "Just brilliant!",
  "Simply the greatest.",
  "I have no words to describe how good this is.",
  "Legendary film. Highly recommended."
];

const positiveComments = [
  "I totally agree!",
  "Absolutely! 100%",
  "You nailed it with this review.",
  "Could not have said it better myself.",
  "One of my favorites too.",
  "Spot on review!"
];

async function addMovies() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Fetch all users to use as fake reviewers
  const users = await User.find({});
  if (users.length < 5) {
    console.error("Not enough users to create activity! Please run seed.js or addFakeActivity.js first.");
    process.exit(1);
  }

  console.log(`Found ${users.length} users in DB.`);

  // 1. Fetch Top 20 from TMDB
  const res = await axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}`);
  const topMovies = res.data.results.slice(0, 20); // Get Top 20!

  for (const tmdbData of topMovies) {
    // Check if movie already exists
    let movie = await Movie.findOne({ tmdbId: tmdbData.id });
    
    // If not, fetch full details and create it
    if (!movie) {
      console.log(`Adding ${tmdbData.title}...`);
      const details = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbData.id}?api_key=${TMDB_API_KEY}&append_to_response=credits`);
      const d = details.data;
      
      const director = d.credits?.crew?.find(c => c.job === 'Director');
      const cast = d.credits?.cast?.slice(0, 10).map(c => c.name) || [];

      movie = new Movie({
        tmdbId: d.id,
        title: d.title,
        overview: d.overview,
        posterPath: d.poster_path,
        backdropPath: d.backdrop_path,
        releaseDate: d.release_date,
        genres: d.genres.map(g => g.name),
        director: director ? director.name : null,
        cast: cast,
        runtime: d.runtime,
        language: d.original_language,
        type: 'movie',
      });
      await movie.save();
    } else {
      console.log(`${tmdbData.title} already exists in DB.`);
    }

    console.log(`Adding reviews for ${movie.title}...`);
    
    // Provide 25-40 reviews per top movie to heavily skew its rating to 4.5+!
    const reviewsToCreate = Math.floor(Math.random() * 16) + 25; // 25 to 40 reviews
    
    // Pick unique users for the reviews
    const shuffledUsers = users.sort(() => 0.5 - Math.random());
    const selectedReviewers = shuffledUsers.slice(0, reviewsToCreate);

    let totalRatingSum = 0;
    let actualReviewsCreated = 0;

    for (const reviewer of selectedReviewers) {
      const existingReview = await Review.findOne({ userId: reviewer._id, movieId: movie._id });
      if (existingReview) {
          totalRatingSum += existingReview.rating;
          actualReviewsCreated++;
          continue; // skip if they already reviewed
      }
      
      // Random rating between 4.0 and 5.0
      const rating = (Math.floor(Math.random() * 3) + 8) / 2; // 4.0, 4.5, 5.0
      
      // Randomly select a positive review text 
      const reviewContext = Math.random() < 0.8 ? positiveReviews[Math.floor(Math.random() * positiveReviews.length)] : null;
      
      const review = new Review({
        userId: reviewer._id,
        movieId: movie._id,
        rating: rating,
        content: reviewContext,
        liked: true, // Everyone loves these movies
      });

      // Add a few comments to the review
      if (reviewContext && Math.random() < 0.5) {
        // Find 1-3 random users to comment
        const numComments = Math.floor(Math.random() * 3) + 1;
        const commenters = users.sort(() => 0.5 - Math.random()).slice(0, numComments);
        
        for (const c of commenters) {
          if (c._id.toString() !== reviewer._id.toString()) {
            review.comments.push({
              userId: c._id,
              content: positiveComments[Math.floor(Math.random() * positiveComments.length)],
            });
          }
        }
      }

      await review.save();
      totalRatingSum += rating;
      actualReviewsCreated++;
    }

    if(actualReviewsCreated > 0) {
      // Recalculate Average Rating for the movie
      const allReviews = await Review.find({ movieId: movie._id });
      const currentSum = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
      movie.averageRating = parseFloat((currentSum / allReviews.length).toFixed(1));
      movie.reviewCount = allReviews.length;
      await movie.save();
      console.log(`--> ${movie.title} now has an average rating of ${movie.averageRating} from ${movie.reviewCount} users`);
    }
  }

  console.log("Done adding top movies and reviews!");
  process.exit(0);
}

addMovies().catch(err => {
    console.error(err);
    process.exit(1);
});
