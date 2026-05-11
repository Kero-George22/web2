const { Router }      = require('express');
const controller      = require('../controllers/admin.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const isAdmin         = require('../middlewares/isAdmin.middleware');

const router = Router();

// All admin routes: auth + isAdmin
router.use(requireAuth, isAdmin);

router.get('/stats',           controller.getStats);
router.get('/users',           controller.getUsers);
router.get('/movies',          controller.getMovies);
router.delete('/users/:id',   controller.deleteUser);
router.delete('/movies/:id',  controller.deleteMovie);
router.delete('/reviews/:id', controller.deleteReview);

module.exports = router;
