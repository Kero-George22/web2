const { GoogleGenerativeAI } = require('@google/generative-ai');
const Review   = require('../models/Review.model');
const AppError = require('../utils/AppError');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function safeParseJSON(text, label) {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new AppError(`Gemini returned invalid JSON for ${label}`, 502);
  }
}

async function recommend(userId) {
  const topReviews = await Review.find({ userId })
    .sort({ rating: -1 })
    .limit(10)
    .populate('movieId', 'title')
    .lean();

  if (!topReviews.length)
    throw new AppError('No reviews found — rate some movies first', 400);

  const movieList = topReviews
    .map(r => `"${r.movieId?.title}" (${r.rating}/5)`)
    .join(', ');

  const prompt =
    `Based on these movies the user rated highly: ${movieList}. ` +
    `Recommend 5 movies they haven't seen. ` +
    `Respond ONLY with a JSON array (no markdown, no preamble): ` +
    `[{ "title": "...", "year": 1994, "reason": "..." }]`;

  const model  = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
  const result = await model.generateContent(prompt);
  return safeParseJSON(result.response.text(), 'recommendations');
}

async function identify({ description }) {
  if (!description?.trim())
    throw new AppError('Description is required', 400);

  const prompt =
    `A user describes a movie: "${description.trim()}". ` +
    `Identify what movie this might be. ` +
    `Respond ONLY with JSON (no markdown, no preamble): ` +
    `{ "title": "...", "year": 1994, "director": "...", "confidence": "high|medium|low", "explanation": "..." }`;

  const model  = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
  const result = await model.generateContent(prompt);
  return safeParseJSON(result.response.text(), 'identification');
}

async function chat(prompt) {
  if (!prompt?.trim())
    throw new AppError('Prompt is required', 400);

  const systemMessage = 
    `أنت مساعد سينمائي ذكي وخفيف الدم اسمك "زازا روبرت Zaza Robot". ` +
    `يجب أن تتحدث دائماً باللهجة المصرية العامية. ` +
    `أنت خبير في كل ما يخص الأفلام والمسلسلات وتساعد المستخدم في اقتراحات ومناقشات حول السينما. ` +
    `ردودك يجب أن تكون قصيرة ومفيدة ومرحة قدر الإمكان.\n\n` +
    `سؤال المستخدم: ${prompt}`;

  const model  = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
  const result = await model.generateContent(systemMessage);
  const reply  = result.response.text();
  return { reply };
}

async function summarizeReviews(movieId) {
  if (!movieId) throw new AppError('Movie ID is required', 400);

  const Movie = require('../models/Movie.model');
  const movie = await Movie.findById(movieId).lean();
  if (!movie) throw new AppError('Movie not found', 404);

  const reviews = await Review.find({ movieId })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('userId', 'username')
    .lean();

  if (reviews.length === 0) {
    return { summary: "مفيش مراجعات كفاية للفيلم ده لسه عشان الخصها لك." };
  }

  const reviewsText = reviews
    .map(r => `(${r.rating}/5) ${r.content}`)
    .join(' | ');

  const prompt =
    `لخص المراجعات التالية لفيلم "${movie.title}" في فقرة واحدة ومختصرة باللهجة المصرية. ` +
    `اذكر رأي الأغلبية ونقاط القوة والضعف المذكورة، وخليك مرح وسريع الاستنتاج.\n\n` +
    `المراجعات:\n${reviewsText}`;

  const model  = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
  const result = await model.generateContent(prompt);
  return { summary: result.response.text().trim() };
}

module.exports = { recommend, identify, chat, summarizeReviews };

