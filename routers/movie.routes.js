const { Router } = require('express');
const { body, query } = require('express-validator');
const controller = require('../controllers/movie.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const isAdmin = require('../middlewares/isAdmin.middleware');
const { validate } = require('../middlewares/validation.middleware');

const router = Router();

// GET /movies — public, filterable
router.get('/', controller.getAll);

// GET /movies/search?q=... — public
router.get(
  '/search',
  [query('q').notEmpty().withMessage('Search query required')],
  validate,
  controller.search
);

// Trending & top-rated endpoints (must come before '/:id')
router.get('/trending', controller.trending);
router.get('/top-rated', controller.topRated);

// View tracking and watching
router.post('/:id/view', controller.trackView);
router.post('/:id/watching', requireAuth, controller.startWatching);
router.delete('/:id/watching', requireAuth, controller.stopWatching);

router.get('/:id/similar', controller.getSimilar);
// GET /movies/:id — public
router.get('/:id', controller.getById);

// POST /movies — admin: fetch from TMDB
router.post(
  '/',
  requireAuth,
  isAdmin,
  [body('tmdbId').isInt({ min: 1 }).withMessage('tmdbId must be a positive integer')],
  validate,
  controller.create
);

// PATCH /movies/:id — admin
router.patch(
  '/:id',
  requireAuth,
  isAdmin,
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('runtime').optional().isInt({ min: 1 }).withMessage('Runtime must be a positive integer'),
  ],
  validate,
  controller.update
);

// DELETE /movies/:id — admin
router.delete('/:id', requireAuth, isAdmin, controller.remove);

module.exports = router;
