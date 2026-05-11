const { Router }      = require('express');
const controller      = require('../controllers/watchlist.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = Router();

// All watchlist routes require authentication
router.get('/',             requireAuth, controller.get);
router.post('/:movieId',   requireAuth, controller.add);
router.delete('/:movieId', requireAuth, controller.remove);

module.exports = router;
