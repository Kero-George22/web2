const mongoose = require('mongoose');
require('dotenv').config();

const Movie = require('./models/Movie.model');
const Review = require('./models/Review.model');

async function fixClassics() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected...");

  const targetTitles = ['Fight Club', 'The Godfather', 'The Godfather Part II', 'The Shawshank Redemption', 'The Dark Knight', '12 Angry Men', "Schindler's List", 'Pulp Fiction'];
  
  for(const title of targetTitles) { 
    const movie = await Movie.findOne({title}); 
    if (movie) { 
      // Delete any rating below 4 for these absolute masterpieces
      const result = await Review.deleteMany({ movieId: movie._id, rating: { $lt: 4 } }); 
      console.log(`Deleted ${result.deletedCount} low reviews for ${title}`);

      const allReviews = await Review.find({ movieId: movie._id }); 
      if(allReviews.length > 0) { 
        const sum = allReviews.reduce((s, r) => s + r.rating, 0); 
        movie.averageRating = parseFloat((sum / allReviews.length).toFixed(1)); 
        movie.reviewCount = allReviews.length; 
        await movie.save(); 
        console.log(`--> ${title} BOOSTED to ${movie.averageRating} from ${movie.reviewCount} reviews\n`); 
      } 
    } 
  }
  process.exit(0);
}
fixClassics();
