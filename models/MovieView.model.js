const mongoose = require('mongoose');

const movieViewSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  type:    { type: String, enum: ['pageview', 'play', 'watching'], default: 'pageview' },
}, {
  timestamps: true,
});

movieViewSchema.index({ createdAt: 1 });

module.exports = mongoose.model('MovieView', movieViewSchema);
