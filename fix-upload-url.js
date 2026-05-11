const fs = require('fs');

// Patch server.js
let s = fs.readFileSync('server.js', 'utf8');
s = s.replace("app.use('/uploads', express.static(path.join(__dirname, 'uploads')));", "app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));");
fs.writeFileSync('server.js', s);

// Patch user.routes.js
let r = fs.readFileSync('routers/user.routes.js', 'utf8');
r = r.replace("const url = `/uploads/${req.file.filename}`;", "const url = `/api/uploads/${req.file.filename}`;");
fs.writeFileSync('routers/user.routes.js', r);
