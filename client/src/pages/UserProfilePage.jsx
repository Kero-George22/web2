import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { StarDisplay } from '../components/StarRating';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import MovieCard from '../components/MovieCard';

const TMDB_W500 = 'https://image.tmdb.org/t/p/w500';
const TMDB_W185 = 'https://image.tmdb.org/t/p/w500';

const PROFILE_THEMES = {
  classic: {
    headerBg: 'linear-gradient(to bottom, rgba(232,160,69,0.05) 0%, transparent 100%)',
    avatarBg: 'linear-gradient(135deg, #e8a045 0%, #c47f2a 100%)',
  },
  sunset: {
    headerBg: 'linear-gradient(to bottom, rgba(251,146,60,0.16) 0%, rgba(236,72,153,0.08) 60%, transparent 100%)',
    avatarBg: 'linear-gradient(135deg, #fb923c 0%, #ec4899 100%)',
  },
  neon: {
    headerBg: 'linear-gradient(to bottom, rgba(99,102,241,0.15) 0%, rgba(16,185,129,0.08) 60%, transparent 100%)',
    avatarBg: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
  },
  emerald: {
    headerBg: 'linear-gradient(to bottom, rgba(16,185,129,0.16) 0%, rgba(34,197,94,0.08) 60%, transparent 100%)',
    avatarBg: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
  },
};

function ReviewItem({ review }) {
  const movie = review.movieId;
  const date  = review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
  return (
    <Link to={`/movies/${movie?._id}`} className="flex gap-4 group p-4 bg-cinema-card border border-cinema-border rounded-2xl hover:border-cinema-accent/30 transition-all">
      <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-cinema-surface">
        {movie?.posterPath
          ? <img src={`${TMDB_W185}${movie.posterPath}`} alt={movie.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-cinema-muted text-xl">🎬</div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-cinema-text text-sm group-hover:text-cinema-accent transition-colors truncate">{movie?.title || '—'}</p>
        <StarDisplay rating={review.rating} size="xs" />
        {review.content && <p className="text-cinema-muted text-xs mt-1 line-clamp-2 leading-snug">{review.content}</p>}
        <p className="text-cinema-border text-xs mt-1">{date}</p>
      </div>
      {review.liked && <span className="text-red-400 self-start text-base flex-shrink-0">♥</span>}
    </Link>
  );
}

export default function UserProfilePage() {
  const { id } = useParams();
  const { user: authUser } = useAuth();
  const toast = useToast();
  const [user,    setUser]    = useState(null);
  const [reviews, setReviews] = useState([]);
  const [lists,   setLists]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('reviews');
  const [followBusy, setFollowBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/users/${id}`),
      api.get(`/reviews/user/${id}`, { params: { limit: 50 } }),
      api.get(`/lists/user/${id}`),
    ])
      .then(([uRes, rRes, lRes]) => {
        setUser(uRes.data.data);
        setReviews(rRes.data.data.items || []);
        setLists(lRes.data.data || []);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-cinema-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <div>
        <div className="text-5xl mb-4">👤</div>
        <h1 className="font-display font-bold text-2xl text-cinema-text mb-2">User not found</h1>
        <Link to="/" className="text-cinema-accent hover:brightness-110">← Go home</Link>
      </div>
    </div>
  );

  const joined = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isSelf = authUser?._id === user._id;
  const theme = PROFILE_THEMES[user.profileTheme] || PROFILE_THEMES.classic;

  const handleFollowToggle = async () => {
    if (!authUser) {
      toast('Sign in to follow users', 'info');
      return;
    }
    if (isSelf) return;

    setFollowBusy(true);
    try {
      if (user.isFollowing) {
        const res = await api.delete(`/users/${user._id}/follow`);
        setUser(prev => ({ ...prev, isFollowing: false, followersCount: res.data.data.followersCount }));
      } else {
        const res = await api.post(`/users/${user._id}/follow`);
        setUser(prev => ({ ...prev, isFollowing: true, followersCount: res.data.data.followersCount }));
      }
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setFollowBusy(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Profile header */}
      <div className="relative pt-24 pb-12 px-6"
           style={{ background: theme.headerBg }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full flex-shrink-0 flex items-center justify-center text-4xl font-bold shadow-glow"
                 style={{ background: theme.avatarBg }}>
              {user.avatar
                ? <img src={user.avatar} alt={user.username} className="w-full h-full object-cover rounded-full" />
                : user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-display font-black text-3xl text-cinema-text">{user.username}</h1>
              {user.bio && <p className="text-cinema-muted text-sm mt-1 max-w-lg">{user.bio}</p>}
              <p className="text-cinema-border text-xs mt-2">Member since {joined}</p>
            </div>
            {!isSelf && (
              <button
                onClick={handleFollowToggle}
                disabled={followBusy}
                className={`${user.isFollowing ? 'btn-secondary' : 'btn-primary'} text-sm disabled:opacity-60`}
              >
                {followBusy ? 'Please wait…' : user.isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
            <div className="flex gap-6 text-center">
              <div><p className="font-display font-bold text-xl text-cinema-text">{reviews.length}</p><p className="text-cinema-muted text-xs">Films</p></div>
              <div><p className="font-display font-bold text-xl text-cinema-text">{reviews.filter(r => r.liked).length}</p><p className="text-cinema-muted text-xs">Liked</p></div>
              <div><p className="font-display font-bold text-xl text-cinema-text">{lists.length}</p><p className="text-cinema-muted text-xs">Public Lists</p></div>
              <div><p className="font-display font-bold text-xl text-cinema-text">{user.followersCount || 0}</p><p className="text-cinema-muted text-xs">Followers</p></div>
              <div><p className="font-display font-bold text-xl text-cinema-text">{user.followingCount || 0}</p><p className="text-cinema-muted text-xs">Following</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-6">
        {user.pinnedFavorites?.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display font-bold text-xl text-cinema-text">Pinned Favorites</h2>
              <div className="flex-1 h-px bg-cinema-border" />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {user.pinnedFavorites.map((m) => <MovieCard key={m._id} movie={m} />)}
            </div>
          </div>
        )}

        <div className="flex gap-1 border-b border-cinema-border mb-8">
          {['reviews', 'lists'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                tab === t
                  ? 'border-cinema-accent text-cinema-accent'
                  : 'border-transparent text-cinema-muted hover:text-cinema-text'
              }`}
            >
              {t === 'reviews' ? `Reviews (${reviews.length})` : `Lists (${lists.length})`}
            </button>
          ))}
        </div>

        {/* Reviews tab */}
        {tab === 'reviews' && (
          reviews.length === 0
            ? <div className="text-center py-16 text-cinema-muted"><p>No reviews yet.</p></div>
            : <div className="space-y-3">
                {reviews.map(r => <ReviewItem key={r._id} review={r} />)}
              </div>
        )}

        {/* Lists tab */}
        {tab === 'lists' && (
          lists.length === 0
            ? <div className="text-center py-16 text-cinema-muted"><p>No public lists yet.</p></div>
            : <div className="grid sm:grid-cols-2 gap-4">
                {lists.map(l => (
                  <Link key={l._id} to={`/lists/${l._id}`} className="bg-cinema-card border border-cinema-border rounded-2xl p-5 hover:border-cinema-accent/30 transition-all block group">
                    <h3 className="font-display font-semibold text-cinema-text">{l.title}</h3>
                    {l.description && <p className="text-cinema-muted text-sm mt-1 line-clamp-2">{l.description}</p>}
                    <div className="flex items-center gap-2 mt-3">
                      {/* Mini poster stack */}
                      {l.movies?.slice(0, 4).map(m => (
                        <div key={m._id} className="w-8 h-12 rounded overflow-hidden bg-cinema-surface flex-shrink-0">
                          {m.posterPath
                            ? <img src={`${TMDB_W185}${m.posterPath}`} alt={m.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-cinema-border" />}
                        </div>
                      ))}
                      <span className="text-cinema-muted text-xs ml-1">{l.movies?.length || 0} films</span>
                    </div>
                  </Link>
                ))}
              </div>
        )}
      </div>
    </div>
  );
}
