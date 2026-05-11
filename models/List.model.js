const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: null },
  isPublic: { type: Boolean, default: true },
  movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
}, {
  timestamps: true,
});

listSchema.index({ userId: 1 });

module.exports = mongoose.model('List', listSchema);
