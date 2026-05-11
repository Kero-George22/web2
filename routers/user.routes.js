const { Router }      = require('express');
const { body }        = require('express-validator');
const controller      = require('../controllers/user.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const isAdmin         = require('../middlewares/isAdmin.middleware');
const { validate }    = require('../middlewares/validation.middleware');

const router = Router();
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });


// GET /users — admin only, paginated
router.get('/', requireAuth, isAdmin, controller.getAll);

// GET /users/:id — public profile
router.get('/:id', controller.getById);

// POST/DELETE /users/:id/follow — follow system
router.post('/:id/follow', requireAuth, controller.follow);
router.delete('/:id/follow', requireAuth, controller.unfollow);

// PATCH /users/:id — own account or admin
router.patch(
  '/:id',
  requireAuth,
  [
    body('username').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Username must be 2–50 chars'),
    body('bio').optional().isString().withMessage('Bio must be a string'),
    body('avatar').optional().isString().withMessage('Avatar must be a valid URL or path'),
    body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 chars'),
    body('profileTheme').optional().isIn(['classic', 'sunset', 'neon', 'emerald']).withMessage('Invalid profile theme'),
    body('pinnedFavorites').optional().isArray({ max: 6 }).withMessage('pinnedFavorites must be an array (max 6)'),
    body('pinnedFavorites.*').optional().isMongoId().withMessage('Each pinned favorite must be a valid movie ID'),
  ],
  validate,
  controller.update
);

// DELETE /users/:id — admin only
router.delete('/:id', requireAuth, isAdmin, controller.remove);


router.post('/:id/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
  const url = `/api/uploads/${req.file.filename}`;
  // We can update the user directly here to be easy
  const User = require('../models/User.model');
  const user = await User.findById(req.params.id);
  if (!user || user._id.toString() !== req.user._id.toString()) return res.status(403).json({ status: 'fail', message: 'Forbidden' });
  user.avatar = url;
  await user.save();
  return res.status(200).json({ status: 'success', data: { url } });
});

module.exports = router;
