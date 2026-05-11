const { Router }      = require('express');
const { body }        = require('express-validator');
const controller      = require('../controllers/list.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { validate }    = require('../middlewares/validation.middleware');

const router = Router();

router.get('/user/:userId', controller.getByUser);
router.get('/:id', controller.getById);

router.post(
  '/',
  requireAuth,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('isPublic').optional().isBoolean().withMessage('isPublic must be boolean'),
  ],
  validate,
  controller.create
);

router.patch(
  '/:id',
  requireAuth,
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('isPublic').optional().isBoolean().withMessage('isPublic must be boolean'),
  ],
  validate,
  controller.update
);

router.delete('/:id', requireAuth, controller.remove);

router.post(
  '/:id/movies',
  requireAuth,
  [body('movieId').isMongoId().withMessage('Valid movieId required')],
  validate,
  controller.addMovie
);

router.delete('/:id/movies/:movieId', requireAuth, controller.removeMovie);

module.exports = router;
