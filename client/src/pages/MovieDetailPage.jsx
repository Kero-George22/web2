import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { StarDisplay, StarPicker } from '../components/StarRating';
import heroFallback from '../assets/hero.png';

const TMDB_W500 = 'https://image.tmdb.org/t/p/w500';
const TMDB_ORIG = 'https://image.tmdb.org/t/p/original';

function ReviewCard({ review, onToggleLike, onAddComment, onDeleteComment, onDeleteReview }) {
  const { user: authUser } = useAuth();
  const toast = useToast();
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const user = review.userId;
  const displayDate = review.watchedDate 
    ? new Date(review.watchedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
    : (review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '');
  const dateStr = review.watchedDate ? `Watched ${displayDate}` : displayDate;
  const comments = review.comments || [];

  const handleLike = async () => {
    if (!authUser) {
      toast('Sign in to like reviews', 'info');
      return;
    }
    try {
      await onToggleLike(review._id);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!authUser) {
      toast('Sign in to comment', 'info');
      return;
    }
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await onAddComment(review._id, commentText.trim());
      setCommentText('');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await onDeleteComment(review._id, commentId);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await onDeleteReview(review._id);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <div className="bg-cinema-card border border-cinema-border rounded-2xl p-5 hover:border-cinema-accent/20 transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-cinema-accent/20 flex items-center justify-center flex-shrink-0 text-cinema-accent font-bold text-sm">
          {user?.username?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link to={`/users/${user?._id}`} className="font-semibold text-cinema-text text-sm hover:text-cinema-accent transition-colors">
              {user?.username || 'Anonymous'}
            </Link>
            {review.liked && <span className="text-red-400 text-xs">♥ Liked</span>}
            <span className="text-cinema-muted text-xs ml-auto">{dateStr}</span>
            {authUser && (authUser.isAdmin || authUser._id === user?._id) && (
              <button onClick={handleDeleteReview} className="text-xs text-red-500 hover:text-red-400 ml-2">Delete Review</button>
            )}
          </div>
          <StarDisplay rating={review.rating} size="xs" />
        </div>
      </div>
      {review.content && <p className="text-cinema-muted text-sm leading-relaxed">{review.content}</p>}

      <div className="mt-3 flex gap-2 w-full justify-between items-center text-xs">
        <div className="flex gap-4">
          <button onClick={handleLike} className={`transition-colors ${review.isLikedByMe ? 'text-cinema-accent' : 'text-cinema-muted hover:text-cinema-accent'}`}>
            ♥ {review.likeCount || 0}
          </button>
          <span className="text-cinema-muted">💬 {review.commentCount || 0}</span>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {comments.map(c => {
          const canDelete = authUser && (authUser.isAdmin || String(authUser._id) === String(c.userId?._id));
          return (
            <div key={c._id} className="bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <Link to={`/users/${c.userId?._id}`} className="text-xs font-semibold text-cinema-text hover:text-cinema-accent">
                  {c.userId?.username || 'User'}
                </Link>
                <span className="text-cinema-border text-[10px] ml-auto">
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                </span>
                {canDelete && (
                  <button onClick={() => handleDeleteComment(c._id)} className="text-[10px] text-red-400 hover:text-red-300 ml-2">Delete</button>
                )}
              </div>
              <p className="text-xs text-cinema-muted mt-1 leading-relaxed">{c.content}</p>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleAddComment} className="mt-3 flex gap-2">
        <input
          type="text"
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-cinema-surface border border-cinema-border rounded-xl px-3 py-1.5 text-xs text-cinema-text outline-none focus:border-cinema-accent"
        />
        <button type="submit" disabled={submittingComment || !commentText.trim()} className="text-cinema-accent hover:text-cinema-accent/80 text-xs font-semibold px-2 disabled:opacity-50">
          Post
        </button>
      </form>
    </div>
  );
}

export default function MovieDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingMovie, setLoadingMovie] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);

  // Review form
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [liked, setLiked] = useState(false);
  const [watchedDate, setWatchedDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // List modal
  const [showListModal, setShowListModal] = useState(false);
  const [userLists, setUserLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Recommendations and AI
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [aiPitch, setAiPitch] = useState('');
  const [loadingPitch, setLoadingPitch] = useState(false);

  const updateReviewInState = (reviewId, updater) => {
    setReviews(prev => prev.map(r => (r._id === reviewId ? updater(r) : r)));
  };

  useEffect(() => {
    let cancelled = false;

    async function loadMovie() {
      setLoadingMovie(true);
      try {
        const res = await api.get(`/movies/${id}`);
        if (!cancelled) setMovie(res.data.data);

        // record a pageview (non-blocking)
        api.post(`/movies/${id}/view`, { type: 'pageview' }).catch(() => { });
      } catch (err) {
        if (!cancelled) setMovie(null);
      } finally {
        if (!cancelled) setLoadingMovie(false);
      }
    }

    loadMovie();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    setLoadingReviews(true);
    api.get(`/reviews/movie/${id}`, { params: { limit: 100, sortBy } })
      .then(res => setReviews(res.data.data.items || []))
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false));
  }, [id, sortBy]);

  useEffect(() => {
    let cancelled = false;
    async function loadSimilar() {
      setLoadingSimilar(true);
      try {
        const res = await api.get(`/movies/${id}/similar`, { params: { limit: 6 } });
        if (!cancelled) setSimilarMovies(res.data.data || []);
      } catch {
        if (!cancelled) setSimilarMovies([]);
      } finally {
        if (!cancelled) setLoadingSimilar(false);
      }
    }
    loadSimilar();
    return () => { cancelled = true; };
  }, [id]);

  // Pre-fill form if user has existing review
  useEffect(() => {
    if (!user || !reviews.length) return;
    const mine = reviews.find(r => r.userId?._id === user._id || r.userId === user._id);
    if (mine) {
      setRating(mine.rating);
      setContent(mine.content || '');
      setLiked(mine.liked || false);
      setWatchedDate(mine.watchedDate || '');
    }
  }, [user, reviews]);

  const handleAddToWatchlist = async () => {
    if (!user) { toast('Sign in to use your watchlist', 'info'); return; }
    try {
      await api.post(`/watchlist/${id}`);
      setInWatchlist(true);
      toast('Added to watchlist ✓', 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleOpenListModal = async () => {
    if (!user) { toast('Sign in to add to lists', 'info'); return; }
    setShowListModal(true);
    setLoadingLists(true);
    try {
      const res = await api.get(`/lists/user/${user._id}`);
      setUserLists(res.data.data || []);
    } catch (err) {
      toast('Failed to load your lists', 'error');
    } finally {
      setLoadingLists(false);
    }
  };

  const handleAddToList = async (listId) => {
    try {
      await api.post(`/lists/${listId}/movies`, { movieId: id });
      toast('Added to list ✓', 'success');
      setShowListModal(false);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleSubmitReview = async e => {
    e.preventDefault();
    if (!user) { toast('Sign in to leave a review', 'info'); return; }
    if (rating === 0) { toast('Please choose a rating', 'error'); return; }
    setSubmitting(true);
    try {
      await api.post('/reviews', { movieId: id, rating, content, liked, watchedDate: watchedDate || undefined });
      toast('Review saved ✓', 'success');
      setShowForm(false);
      // Refresh reviews
      const res = await api.get(`/reviews/movie/${id}`, { params: { limit: 100, sortBy } });
      setReviews(res.data.data.items || []);
      // Refresh movie avg
      const mRes = await api.get(`/movies/${id}`);
      setMovie(mRes.data.data);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleReviewLike = async (reviewId) => {
    const res = await api.post(`/reviews/${reviewId}/like`);
    const data = res.data.data;
    updateReviewInState(reviewId, (r) => ({ ...r, isLikedByMe: data.isLikedByMe, likeCount: data.likeCount }));
  };

  const handleAddReviewComment = async (reviewId, content) => {
    const res = await api.post(`/reviews/${reviewId}/comments`, { content });
    const comment = res.data.data.comment;
    updateReviewInState(reviewId, (r) => {
      const comments = [...(r.comments || []), comment];
      return { ...r, comments, commentCount: comments.length };
    });
  };

  const handleDeleteReviewComment = async (reviewId, commentId) => {
    await api.delete(`/reviews/${reviewId}/comments/${commentId}`);
    updateReviewInState(reviewId, (r) => {
      const comments = (r.comments || []).filter(c => c._id !== commentId);
      return { ...r, comments, commentCount: comments.length };
    });
  };
  const handleDeleteReview = async (reviewId) => {
    await api.delete(`/reviews/${reviewId}`);
    setReviews(prev => prev.filter(r => r._id !== reviewId));
    toast('Review deleted successfully', 'success');
  };

  const handleSummarizeReviews = async () => {
    try {
      setIsSummarizing(true);
      const res = await api.get(`/ai/movies/${id}/summarize-reviews`);
      setAiSummary(res.data.data.summary);
    } catch (err) {
      toast('Failed to summarize reviews', 'error');
    } finally {
      setIsSummarizing(false);
    }
  };

  if (loadingMovie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-cinema-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <div className="text-5xl mb-4">🎬</div>
          <h1 className="font-display font-bold text-2xl text-cinema-text mb-2">Movie not found</h1>
          <Link to="/movies" className="text-cinema-accent hover:brightness-110 transition-all">← Browse films</Link>
        </div>
      </div>
    );
  }

  const backdropUrl = movie.backdropPath ? `${TMDB_ORIG}${movie.backdropPath}` : null;
  const posterUrl = movie.posterPath ? `${TMDB_W500}${movie.posterPath}` : null;
  const posterImage = posterUrl || heroFallback;
  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '—';
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null;

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[55vh] overflow-hidden">
        {backdropUrl
          ? <img src={backdropUrl} alt="" className="w-full h-full object-cover object-center" />
          : <div className="w-full h-full bg-cinema-surface" />}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0b0c0f 10%, rgba(11,12,15,0.5) 60%, rgba(11,12,15,0.2) 100%)' }} />
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 -mt-40 relative z-10 pb-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="w-44 md:w-56 rounded-2xl overflow-hidden shadow-2xl border border-cinema-border">
              <img
                src={posterImage}
                alt={movie.title}
                onError={e => { e.currentTarget.src = heroFallback; }}
                className="w-full aspect-[2/3] object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-2">
            <h1 className="font-display font-black text-3xl md:text-4xl text-white leading-tight">
              {movie.title}
              {movie.type === 'tv' && (
                <span className="ml-3 align-middle text-xs font-bold uppercase tracking-widest bg-cinema-accent text-black px-2 py-1 rounded inline-block">
                  TV Series
                </span>
              )}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-cinema-muted text-sm">
              <span>{year}</span>
              {runtime && <><span>·</span><span>{runtime}</span></>}
              {movie.type === 'tv' && movie.seasonsCount ? (
                <><span>·</span><span><span className="text-cinema-text">{movie.seasonsCount}</span> Seasons</span></>
              ) : null}
              {movie.type === 'tv' && movie.episodesCount ? (
                <><span>·</span><span><span className="text-cinema-text">{movie.episodesCount}</span> Episodes</span></>
              ) : null}
              {movie.director && <><span>·</span><span>{movie.type === 'tv' ? 'Created' : 'Directed'} by <span className="text-cinema-text">{movie.director}</span></span></>}
            </div>

            {/* Genres */}
            {movie.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {movie.genres.map(g => (
                  <Link key={g} to={`/movies?genre=${g}`} className="badge-genre">{g}</Link>
                ))}
              </div>
            )}

            {/* Rating */}
            {movie.reviewCount > 0 && (
              <div className="flex items-center gap-3 mt-4">
                <StarDisplay rating={movie.averageRating} size="md" />
                <span className="text-cinema-muted text-sm">{movie.reviewCount} review{movie.reviewCount !== 1 ? 's' : ''}</span>
              </div>
            )}

            {/* Overview */}
            <p className="text-cinema-muted text-sm leading-relaxed mt-4 max-w-2xl">
              {movie.overview || 'Overview is not available yet for this title.'}
            </p>

            {/* Cast */}
            {movie.cast?.length > 0 && (
              <div className="mt-4">
                <p className="text-cinema-muted text-xs font-medium uppercase tracking-widest mb-1">Cast</p>
                <p className="text-cinema-text text-sm">{movie.cast.join(', ')}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                id="log-review-btn"
                onClick={() => { if (!user) toast('Sign in to log a film', 'info'); else setShowForm(f => !f); }}
                className="btn-primary"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Log / Review
              </button>
              <button
                id="watchlist-btn"
                onClick={handleAddToWatchlist}
                className={`btn-secondary ${inWatchlist ? 'border-cinema-accent text-cinema-accent' : ''}`}
              >
                <svg viewBox="0 0 24 24" fill={inWatchlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
                {inWatchlist ? 'In Watchlist' : 'Watchlist'}
              </button>
              <button
                id="add-to-list-btn"
                onClick={handleOpenListModal}
                className="btn-secondary"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Add to List
              </button>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' trailer')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M21 12l-18 10V2z" />
                </svg>
                Trailer
              </a>
            </div>

            {/* Review Form */}
            {showForm && (
              <form onSubmit={handleSubmitReview}
                className="mt-6 bg-cinema-card border border-cinema-border rounded-2xl p-6 space-y-4 animate-fade-up">
                <h3 className="font-display font-bold text-cinema-text">Your Review</h3>
                <div>
                  <p className="text-cinema-muted text-xs mb-2">Rating</p>
                  <StarPicker value={rating} onChange={setRating} />
                </div>
                <div>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Write your thoughts… (optional)"
                    rows={4}
                    className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-4 py-3 text-sm text-cinema-text
                               placeholder-cinema-muted/60 outline-none focus:border-cinema-accent transition-all resize-none"
                  />
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <label className="flex items-center gap-2 text-cinema-muted text-sm cursor-pointer">
                    <input type="checkbox" checked={liked} onChange={e => setLiked(e.target.checked)}
                      className="accent-cinema-accent" />
                    <span>❤️ Liked it</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="text-cinema-muted text-sm">Watched on</label>
                    <input type="date" value={watchedDate} onChange={e => setWatchedDate(e.target.value)}
                      className="bg-cinema-surface border border-cinema-border rounded-lg px-3 py-1.5 text-sm text-cinema-text outline-none focus:border-cinema-accent transition-all" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
                    {submitting ? 'Saving…' : 'Save Review'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-14 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-display font-bold text-xl text-cinema-text">Member Reviews</h2>
              <div className="flex-1 h-px bg-cinema-border" />
              {reviews.length > 2 && (
                <button
                  onClick={handleSummarizeReviews}
                  disabled={isSummarizing}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50 flex items-center gap-2 transition-all shadow-md"
                >
                  {isSummarizing ? (
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  ) : (
                    "✨ لخصلي المراجعات"
                  )}
                </button>
              )}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-cinema-surface border border-cinema-border rounded-lg px-3 py-1.5 text-xs text-cinema-text outline-none focus:border-cinema-accent transition-all"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                </select>
                <span className="text-cinema-muted text-sm whitespace-nowrap">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {aiSummary && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2 text-purple-400">
                  <span className="font-bold">✨ Zaza AI Summary</span>
                </div>
                <p className="text-sm text-cinema-text leading-relaxed dir-rtl" dir="rtl">{aiSummary}</p>
              </div>
            )}

            {loadingReviews ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 text-cinema-muted">
                <p>No reviews yet. Be the first! 🎬</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <ReviewCard
                    key={r._id}
                    review={r}
                    onToggleLike={handleToggleReviewLike}
                    onAddComment={handleAddReviewComment}
                    onDeleteComment={handleDeleteReviewComment}
                    onDeleteReview={handleDeleteReview}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar: Similar & AI */}
          <div className="w-full md:w-80 flex-shrink-0 mt-14">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-display font-bold text-xl text-cinema-text">
                {movie.type === 'tv' ? 'Similar Series' : 'Similar Movies'}
              </h2>
              <div className="flex-1 h-px bg-cinema-border" />
            </div>
            {loadingSimilar ? (
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton w-[31%] h-28 rounded-lg" />)}
              </div>
            ) : similarMovies.length === 0 ? (
              <p className="text-sm text-cinema-muted">No similar movies found.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {similarMovies.map(m => (
                  <Link key={m._id} to={`/movies/${m._id}`} className="block relative w-[31%] h-28 flex-shrink-0 rounded-lg overflow-hidden group border border-cinema-border hover:border-cinema-accent transition-all">
                    <img
                      src={m.posterPath ? `${TMDB_W500}${m.posterPath}` : heroFallback}
                      alt={m.title}
                      onError={e => { e.currentTarget.src = heroFallback; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                ))}
              </div>
            )}

            {/* AI Pitch Widget */}
            <div className="mt-8 bg-cinema-accent/10 border border-cinema-accent/30 rounded-2xl p-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 text-cinema-accent/20 group-hover:text-cinema-accent/40 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              </div>
              <h3 className="font-bold text-sm text-cinema-accent mb-2 flex items-center gap-2">
                <span>🤖</span> AI Cine-Pitch
              </h3>
              <p className="text-xs text-cinema-text leading-relaxed">
                Use our Chatbot in the bottom right to ask about <span className="font-semibold text-cinema-accent">{movie.title}</span> or discover personalized metrics inside your lists.
              </p>
            </div>
          </div>

        </div>

        {/* List Modal */}
        {showListModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up">
            <div className="bg-cinema-card border border-cinema-border rounded-3xl w-full max-w-md p-6 relative">
              <button onClick={() => setShowListModal(false)} className="absolute top-4 right-4 text-cinema-muted hover:text-cinema-text">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
              <h2 className="font-display font-bold text-xl text-cinema-text mb-4">Add to List</h2>
              {loadingLists ? (
                <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-cinema-accent border-t-transparent rounded-full animate-spin" /></div>
              ) : userLists.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-cinema-muted text-sm mb-4">You haven't created any lists yet.</p>
                  <Link to="/lists" className="btn-primary text-sm inline-flex">Create a List</Link>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {userLists.map(list => (
                    <button
                      key={list._id}
                      onClick={() => handleAddToList(list._id)}
                      className="w-full text-left bg-cinema-surface hover:bg-cinema-accent/10 border border-cinema-border hover:border-cinema-accent/30 rounded-xl px-4 py-3 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <h4 className="font-semibold text-sm text-cinema-text">{list.title}</h4>
                        <span className="text-cinema-muted text-xs">{list.movies?.length || 0} films</span>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-cinema-muted group-hover:text-cinema-accent"><path d="M12 5v14M5 12h14" /></svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

