const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movieId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  rating:      { type: Number, required: true, min: 0.5, max: 5 },
  content:     { type: String, default: null },
  liked:       { type: Boolean, default: false },
  watchedDate: { type: String, default: null }, // YYYY-MM-DD
  likedBy:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content:   { type: String, required: true, trim: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
});

// A user can only review a specific movie once
reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });
reviewSchema.index({ movieId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ likedBy: 1 });

module.exports = mongoose.model('Review', reviewSchema);
