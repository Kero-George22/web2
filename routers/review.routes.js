const { Router }      = require('express');
const { body }        = require('express-validator');
const controller      = require('../controllers/review.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { validate }    = require('../middlewares/validation.middleware');

const router = Router();

router.get('/movie/:movieId', controller.getByMovie);

router.get('/user/:userId', controller.getByUser);

router.post(
  '/',
  requireAuth,
  [
    body('movieId').isMongoId().withMessage('Valid movieId required'),
    body('rating')
      .isFloat({ min: 0.5, max: 5 })
      .withMessage('Rating must be between 0.5 and 5'),
    body('content').optional().isString(),
    body('liked').optional().isBoolean().withMessage('liked must be a boolean'),
    body('watchedDate').optional().isDate().withMessage('watchedDate must be a date (YYYY-MM-DD)'),
  ],
  validate,
  controller.upsert
);

router.post('/:id/like', requireAuth, controller.toggleLike);

router.post(
  '/:id/comments',
  requireAuth,
  [body('content').trim().notEmpty().withMessage('Comment content is required').isLength({ max: 500 }).withMessage('Comment max length is 500')],
  validate,
  controller.addComment
);

router.delete('/:id/comments/:commentId', requireAuth, controller.removeComment);

router.delete('/:id', requireAuth, controller.remove);

module.exports = router;
