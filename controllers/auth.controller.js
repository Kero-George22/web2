const asyncWrapper = require('../utils/asyncWrapper');
const { success }  = require('../utils/apiResponse');
const authService  = require('../services/auth.service');

exports.register = asyncWrapper(async (req, res) => {
  const user = await authService.register(req.body);
  req.session.userId = user._id; // Set session
  req.session.save((err) => {
    if (err) console.error('SESSION SAVE ERROR:', err);
    return success(res, { user }, 'Registered successfully', 201);
  });
});

exports.login = asyncWrapper(async (req, res) => {
  const user = await authService.login(req.body);
  req.session.userId = user._id; // Set session
  req.session.save((err) => {
    if (err) console.error('SESSION SAVE ERROR:', err);
    return success(res, { user }, 'Login successful');
  });
});

exports.logout = asyncWrapper(async (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ success: false, message: 'Could not log out' });
    res.clearCookie('connect.sid'); // Clear cookie
    return success(res, null, 'Logged out');
  });
});

exports.me = asyncWrapper(async (req, res) => {
  const user = await authService.me(req.user._id);
  return success(res, { user }, 'Authenticated user');
});
