const User = require('../models/User.model');

async function requireAuth(req, res, next) {
  console.log('DEBUG: Session content:', req.session);
  if (!req.session || !req.session.userId) {
    console.error('AUTH MIDDLEWARE: Missing session! Session ID:', req.sessionID);
    return res.status(401).json({ success: false, message: 'Unauthorized: No session found' });
  }

  try {
    const user = await User.findById(req.session.userId).select('-password').lean();
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('AUTH MIDDLEWARE ERROR:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { requireAuth };
