require('dotenv').config();
const express      = require('express');
const mongoose     = require('mongoose');
const helmet       = require('helmet');
const cors         = require('cors');
const rateLimit    = require('express-rate-limit');
const session      = require('express-session');
const MongoStore = require('connect-mongo').default;
const errorHandler = require('./middlewares/error.handler');

const app = express();

// 0. Trust proxy for sessions behind Vite/Nginx
app.set('trust proxy', 1);

// Debug: Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 1. Security headers
app.use(helmet());

// 2. CORS — strict origin allowlist from env
const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin && process.env.NODE_ENV !== 'production') return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// 3. Rate limiting
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));

// 4. Body parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

const path = require('path');
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'a-very-secret-key-letterboxd',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// 6. Routes
app.use('/api/auth',      require('./routers/auth.routes'));
app.use('/api/users',     require('./routers/user.routes'));
app.use('/api/movies',    require('./routers/movie.routes'));
app.use('/api/reviews',   require('./routers/review.routes'));
app.use('/api/watchlist', require('./routers/watchlist.routes'));
app.use('/api/lists',     require('./routers/list.routes'));
app.use('/api/ai',        require('./routers/ai.routes'));
app.use('/api/admin',     require('./routers/admin.routes'));

// 6. Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// 7. Error handler — MUST be last
app.use(errorHandler);

// 8. Process guards
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));
process.on('uncaughtException',  (err) => { console.error('Uncaught Exception:', err); process.exit(1); });

// 9. Graceful shutdown
async function gracefulShutdown(signal) {
  console.log(`${signal} received. Shutting down...`);
  await mongoose.connection.close();
  process.exit(0);
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

// 10. Connect & start
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) throw new Error('MONGODB_URI is not set');

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✓ MongoDB connected');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () =>
      console.log(`✓ Server on port ${PORT}`)
    );
  })
  .catch(err => { console.error('DB connection failed:', err.message); process.exit(1); });

module.exports = app;

// Trigger nodemon restart
