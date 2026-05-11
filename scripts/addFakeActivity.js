/**
 * seedFakeActivity.js
 * Adds fake users, reviews, and comments on top of existing movies.
 * Safe to re-run: deletes previously seeded fake users/reviews first.
 *
 * Depends on seed.js having run first (movies must exist).
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User   = require('../models/User.model');
const Movie  = require('../models/Movie.model');
const Review = require('../models/Review.model');

// ─── Config ───────────────────────────────────────────────────────────────────

const FAKE_USER_COUNT = 30;
const REVIEWS_PER_MOVIE_MIN = 5;
const REVIEWS_PER_MOVIE_MAX = 15;
// Fraction of reviews that get comments (0–1)
const COMMENT_PROBABILITY = 0.5;
const COMMENTS_PER_REVIEW_MAX = 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Gaussian-ish noise so ratings cluster around baseQuality.
 * baseQuality 1–5 → snapped to 0.5 steps.
 * Films with baseQuality 2 mostly get 1–3, films with 4.5 mostly get 4–5.
 */
function generateRating(baseQuality) {
  // Sum of two uniforms ≈ triangle distribution (light gaussian-like)
  const noise = (Math.random() + Math.random() - 1) * 1.4;
  const raw   = clamp(baseQuality + noise, 1, 5);
  return Math.round(raw * 2) / 2; // snap to 0.5 steps
}

function randomDate(start = new Date('2023-06-01'), end = new Date()) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// ─── Name pools ───────────────────────────────────────────────────────────────

const AR_FIRST = [
  'أحمد', 'محمد', 'محمود', 'مصطفى', 'عمر', 'علي', 'كريم', 'ياسين',
  'فاطمة', 'نور', 'مريم', 'سارة', 'سلمى', 'هند', 'ياسمين', 'شهد',
];
const AR_LAST  = ['حسن', 'إبراهيم', 'عادل', 'سامي', 'رفعت', 'السيد', 'عبد الرحمن', 'فهمي'];
const EN_NAMES = ['John_D', 'MikeSmith', 'Alex_199', 'SaraFox', 'Emily_R', 'DavidG', 'Chris_C', 'EmmaW'];

// ─── Review content ───────────────────────────────────────────────────────────
// Tone matches rating band — a 2-star review doesn't say "masterpiece".

const CONTENT = {
  en: {
    veryLow: [   // 1–1.5
      'Genuinely awful. Couldn\'t sit through it.',
      'One of the worst I\'ve seen. Avoid.',
      'Bad acting, bad story, bad everything.',
      'I want my two hours back.',
      'Not even worth watching for free.',
    ],
    low: [       // 2–2.5
      'Disappointed. Hyped for nothing.',
      'Not what I expected at all.',
      'Had potential but wasted it completely.',
      'Hard to finish. Pacing was a mess.',
      'Everyone loves this and I genuinely don\'t understand why.',
    ],
    mid: [       // 3–3.5
      'Decent. Nothing groundbreaking.',
      'Worth one watch but I wouldn\'t rewatch.',
      'Some strong scenes but it drags.',
      'Fine for a lazy Sunday.',
      'Solid but forgettable.',
    ],
    high: [      // 4–4.5
      'Really strong film. Stayed with me.',
      'Great performances across the board.',
      'Gripping from start to finish.',
      'One of the better films I\'ve seen this year.',
      'Sharp writing and a satisfying payoff.',
    ],
    perfect: [   // 5
      'An absolute masterpiece.',
      'One of the greatest films ever made.',
      'Flawless. I have nothing bad to say.',
      'Rewatched three times and it keeps getting better.',
      'Cinema at its finest. Everyone should see this.',
    ],
  },
  ar: {
    veryLow: [
      'سيء جدا ما قدرتش أكمل.',
      'ضياع وقت من أوله لآخره.',
      'أسوأ فيلم شفته من زمان.',
      'التمثيل والقصة والإخراج كلهم فاشلين.',
      'مش يستاهل ثانية من وقتك.',
    ],
    low: [
      'خيبة أمل كبيرة توقعت أحسن.',
      'الفيلم مبالغ فيه مع الترويج الكبير.',
      'فكرة كويسة لكن التنفيذ خايب.',
      'صعبت على نفسي وكملته ماكنش يستاهل.',
      'الكل بيقول إنه تحفة وأنا ما فهمتش ليه.',
    ],
    mid: [
      'فيلم معقول للمشاهدة مرة وبس.',
      'مش سيء بس مش استثنائي.',
      'فيه لحظات حلوة وفيه لحظات تعب.',
      'يمشي الوقت بيه.',
      'محترم بس هتنساه بعد يومين.',
    ],
    high: [
      'فيلم قوي جدا ظل في بالي.',
      'أداء تمثيلي استثنائي من الكل.',
      'قصة محكمة ونهاية مرضية.',
      'من أفضل اللي شفته في النوع ده.',
      'فاجأني بشكل إيجابي جدا.',
    ],
    perfect: [
      'تحفة فنية بكل المقاييس.',
      'من أعظم ما قدم في السينما.',
      'لا يوجد كلمة سلبية واحدة أقولها.',
      'شاهدته أكتر من مرة وكل مرة يكشف جديد.',
      'فيلم خالد لن يشيخ مع الزمن.',
    ],
  },
};

// Comments are short reactions, any language is fine either way
const COMMENTS = {
  ar: [
    'متفق معاك جدا!',
    'فعلا فيلم تحفة.',
    'أنا كمان حسيت بكده.',
    'بالظبط!',
    'رأيك يحترم بس أنا شايف العكس.',
    'ناوي أشوفه قريبا إن شاء الله.',
    'ما تفوتكوش!',
    'نفس إحساسي بالظبط.',
  ],
  en: [
    'Totally agree!',
    'Couldn\'t have said it better.',
    'Felt the same way.',
    'Spot on!',
    'Interesting take — I see it differently though.',
    'Adding it to my watchlist.',
    'Don\'t sleep on this one.',
    'Same experience here.',
  ],
};

function pickContent(rating, isArabic) {
  const pool = isArabic ? CONTENT.ar : CONTENT.en;
  if (rating <= 1.5) return pick(pool.veryLow);
  if (rating <= 2.5) return pick(pool.low);
  if (rating <= 3.5) return pick(pool.mid);
  if (rating <= 4.5) return pick(pool.high);
  return pick(pool.perfect);
}

function pickComment(isArabic) {
  return pick(isArabic ? COMMENTS.ar : COMMENTS.en);
}

// ─── Detect if Review model has a comments array ──────────────────────────────

function schemaHasComments() {
  return !!(Review.schema && Review.schema.paths && Review.schema.paths['comments']);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seedFakeActivity() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI is not set. Check your .env file.');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('✓ Connected to MongoDB');

  // ── Clean up previous fake run ────────────────────────────────────────────
  // We tag fake users with isFake:true so we can safely remove only them.
  const prevFake = await User.find({ isFake: true }).select('_id').lean();
  if (prevFake.length) {
    const fakeIds = prevFake.map(u => u._id);
    await Review.deleteMany({ userId: { $in: fakeIds } });
    await User.deleteMany({ _id: { $in: fakeIds } });
    console.log(`✓ Removed ${prevFake.length} previous fake users and their reviews`);
  }

  // ── Create fake users ─────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('123456', 10);
  const fakeUserDocs = [];

  for (let i = 0; i < FAKE_USER_COUNT; i++) {
    const isArabic = Math.random() > 0.4;
    let username, bio;

    if (isArabic) {
      const fn = pick(AR_FIRST), ln = pick(AR_LAST);
      username = `${fn}_${ln}_${Math.floor(Math.random() * 9000) + 1000}`.replace(/\s/g, '');
      bio      = pick(['محب للسينما والأفلام', 'عاشق للأفلام القديمة', 'أفلام وبس', 'مشاهد متعطش للسينما']);
    } else {
      username = `${pick(EN_NAMES)}_${Math.floor(Math.random() * 9000) + 1000}`;
      bio      = pick(['Movie buff & popcorn lover.', 'Cinephile since childhood.', 'Weekend watcher.']);
    }

    fakeUserDocs.push({
      username,
      email:    `fake_${Date.now()}_${i}_${Math.random().toString(36).slice(2)}@fake.local`,
      password: passwordHash,
      bio,
      isFake:   true,   // ← tag so we can clean up next run
    });
  }

  // insertMany with ordered:false so duplicate username/email errors don\'t abort the batch
  const insertResult = await User.insertMany(fakeUserDocs, { ordered: false }).catch(err => {
    // Return what was inserted despite partial errors
    return err.insertedDocs || [];
  });
  const createdUsers = Array.isArray(insertResult) ? insertResult : fakeUserDocs;
  console.log(`✓ Created ${createdUsers.length} fake users`);

  // ── Load movies ───────────────────────────────────────────────────────────
  const movies = await Movie.find({}).lean();
  if (!movies.length) {
    console.error('No movies found. Run seed.js first.');
    process.exit(1);
  }
  console.log(`Found ${movies.length} movies — generating reviews...`);

  const hasComments = schemaHasComments();
  if (!hasComments) {
    console.log('  ℹ Review schema has no comments array — skipping comment seeding.');
  }

  // ── Generate reviews ──────────────────────────────────────────────────────
  let totalReviews  = 0;
  let totalComments = 0;

  for (const movie of movies) {
    // baseQuality stored in seed; fall back to neutral 3.5 for movies seeded without it
    const baseQuality = movie.baseQuality ?? 3.5;

    const reviewCount   = REVIEWS_PER_MOVIE_MIN +
      Math.floor(Math.random() * (REVIEWS_PER_MOVIE_MAX - REVIEWS_PER_MOVIE_MIN + 1));
    const reviewerPool  = [...createdUsers].sort(() => Math.random() - 0.5).slice(0, reviewCount);

    for (const user of reviewerPool) {
      const isArabic = /[^\x00-\x7F]/.test(user.username); // contains non-ASCII → Arabic
      const rating   = generateRating(baseQuality);
      const content  = Math.random() > 0.2 ? pickContent(rating, isArabic) : '';
      const date     = randomDate();

      try {
        const reviewData = {
          userId:      user._id,
          movieId:     movie._id,
          rating,
          content:     content || null,
          liked:       rating >= 3.5,
          watchedDate: date.toISOString().split('T')[0],
          createdAt:   date,
        };

        // Only add comments array if the schema supports it
        if (hasComments && content && Math.random() < COMMENT_PROBABILITY) {
          const numComments  = Math.ceil(Math.random() * COMMENTS_PER_REVIEW_MAX);
          const commentUsers = [...createdUsers]
            .filter(u => String(u._id) !== String(user._id))
            .sort(() => Math.random() - 0.5)
            .slice(0, numComments);

          reviewData.comments = commentUsers.map(cu => ({
            userId:    cu._id,
            content:   pickComment(/[^\x00-\x7F]/.test(cu.username)),
            createdAt: randomDate(date),
          }));
          totalComments += reviewData.comments.length;
        }
        await Review.create(reviewData);
        totalReviews++;
      } catch (err) {
        // 11000 = duplicate key (user already reviewed this movie) — skip silently
        if (err.code !== 11000) console.error(`Review error: ${err.message}`);
      }
    }
  }

  // ── Recompute averageRating on each movie ─────────────────────────────────
  const stats = await Review.aggregate([
    { $group: { _id: '$movieId', avg: { $avg: '$rating' }, cnt: { $sum: 1 } } },
  ]);

  await Promise.all(
    movies.map(async movie => {
      const stat = stats.find(s => String(s._id) === String(movie._id));
      if (stat) {
        await Movie.findByIdAndUpdate(movie._id, {
          averageRating: Math.round(stat.avg * 10) / 10,
          reviewCount:   stat.cnt,
        });
      }
    })
  );
  console.log('✓ Recomputed averageRating and reviewCount for all movies');

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n✓ Reviews added: ${totalReviews}`);
  if (hasComments) console.log(`✓ Comments added: ${totalComments}`);
  console.log('✓ Fake activity seeding complete!\n');

  await mongoose.disconnect();
}

seedFakeActivity().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
