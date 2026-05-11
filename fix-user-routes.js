const fs = require('fs');

let r = fs.readFileSync('routers/user.routes.js', 'utf8');

// Replace isURL to isString
r = r.replace(/body\('avatar'\)\.optional\(\)\.isURL\(\)\.withMessage\([^)]+\)/, "body('avatar').optional().isString().withMessage('Avatar must be a valid URL or path')");

// Add multer route
const multerImport = `const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });
`;

if (!r.includes('multer')) {
  r = r.replace("const router = Router();", "const router = Router();\n" + multerImport);
  r = r.replace("module.exports = router;", `
router.post('/:id/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
  const url = \`/uploads/\${req.file.filename}\`;
  // We can update the user directly here to be easy
  const User = require('../models/User.model');
  const user = await User.findById(req.params.id);
  if (!user || user._id.toString() !== req.user._id.toString()) return res.status(403).json({ status: 'fail', message: 'Forbidden' });
  user.avatar = url;
  await user.save();
  return res.status(200).json({ status: 'success', data: { url } });
});\n\nmodule.exports = router;`);
}

fs.writeFileSync('routers/user.routes.js', r);
