const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  tmdbId:        { type: Number, required: true, unique: true },
  title:         { type: String, required: true, trim: true },
  overview:      { type: String, default: null },
  posterPath:    { type: String, default: null },
  backdropPath:  { type: String, default: null },
  releaseDate:   { type: String, default: null },
  genres:        [{ type: String }],
  director:      { type: String, default: null },
  cast:          [{ type: String }],
  runtime:       { type: Number, default: null },
  language:      { type: String, default: 'en' },
  averageRating: { type: Number, default: 0 },
  reviewCount:   { type: Number, default: 0 },
  views:         { type: Number, default: 0 },
  type:          { type: String, enum: ['movie', 'tv'], default: 'movie' },
  seasonsCount:  { type: Number, default: null },
  episodesCount: { type: Number, default: null },
}, {
  timestamps: true,
});

movieSchema.index({ title: 1 });
movieSchema.index({ averageRating: -1, createdAt: -1 });

module.exports = mongoose.model('Movie', movieSchema);
