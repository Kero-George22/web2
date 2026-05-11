const { Router }   = require('express');
const { body }     = require('express-validator');
const rateLimit    = require('express-rate-limit');
const controller   = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts, try again later' },
});

router.post(
  '/register',
  authLimiter,
  [
    body('username').trim().isLength({ min: 2, max: 50 }).withMessage('Username must be 2–50 chars'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  controller.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  controller.login
);

router.post('/logout', requireAuth, controller.logout);
router.get('/me',      requireAuth, controller.me);

module.exports = router;
