const { Router }      = require('express');
const { body }        = require('express-validator');
const rateLimit       = require('express-rate-limit');
const controller      = require('../controllers/ai.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { validate }    = require('../middlewares/validation.middleware');

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'AI rate limit exceeded, please wait 15 minutes' },
});

// All AI routes: auth + rate limit
router.post('/recommend', requireAuth, aiLimiter, controller.recommend);

router.post(
  '/identify',
  requireAuth,
  aiLimiter,
  [body('description').trim().notEmpty().withMessage('description is required')],
  validate,
  controller.identify
);

router.get(
  '/movies/:id/summarize-reviews',
  requireAuth,
  aiLimiter,
  controller.summarizeReviews
);

router.post(
  '/chat',
  requireAuth,
  aiLimiter,
  [body('prompt').trim().notEmpty().withMessage('prompt is required')],
  validate,
  controller.chat
);

module.exports = router;
