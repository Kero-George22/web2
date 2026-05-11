const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 2, maxlength: 50 },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar:   { type: String, default: null },
  bio:      { type: String, default: '' },
  isAdmin:  { type: Boolean, default: false },
  profileTheme: { type: String, enum: ['classic', 'sunset', 'neon', 'emerald'], default: 'classic' },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pinnedFavorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
}, {
  timestamps: true,
});

userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });

module.exports = mongoose.model('User', userSchema);
