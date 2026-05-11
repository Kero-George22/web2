import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useToast } from '../components/Toast';

const TMDB_W500 = 'https://image.tmdb.org/t/p/w500';

function WatchlistCard({ movie, onRemove }) {
  const poster = movie.posterPath ? `${TMDB_W500}${movie.posterPath}` : null;
  const year   = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '—';

  return (
    <div className="movie-card group relative">
      <Link to={`/movies/${movie._id}`} className="block">
        <div className="aspect-[2/3] bg-cinema-surface">
          {poster
            ? <img src={poster} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            : <div className="w-full h-full flex items-center justify-center text-cinema-muted text-4xl">🎬</div>}
        </div>
        <div className="card-overlay" />
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="font-display font-semibold text-white text-xs leading-tight line-clamp-2">{movie.title}</p>
          <p className="text-cinema-muted text-xs mt-0.5">{year}</p>
        </div>
      </Link>
      {/* Remove button */}
      <button
        onClick={e => { e.preventDefault(); onRemove(movie._id); }}
        title="Remove from watchlist"
        className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-cinema-bg/80 border border-cinema-border flex items-center justify-center
                   opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 hover:border-red-400 text-cinema-muted hover:text-red-400"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  );
}

export default function WatchlistPage() {
  const toast = useToast();
  const [movies,  setMovies]  = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/watchlist')
      .then(res => setMovies(res.data.data.movies || []))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRemove = async movieId => {
    try {
      await api.delete(`/watchlist/${movieId}`);
      setMovies(prev => prev.filter(m => m._id !== movieId));
      toast('Removed from watchlist', 'info');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="mb-8 flex items-end gap-4">
          <div>
            <h1 className="font-display font-black text-3xl text-cinema-text">My Watchlist</h1>
            <p className="text-cinema-muted text-sm mt-1">
              {loading ? 'Loading…' : `${movies.length} film${movies.length !== 1 ? 's' : ''} saved`}
            </p>
          </div>
          <Link to="/movies" className="ml-auto btn-secondary text-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Browse Films
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton aspect-[2/3] rounded-xl" />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="text-6xl mb-4">🎞️</div>
            <h2 className="font-display font-bold text-2xl text-cinema-text mb-2">Your watchlist is empty</h2>
            <p className="text-cinema-muted text-sm mb-6">Find films you want to watch and add them here</p>
            <Link to="/movies" className="btn-primary">Browse Films</Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {movies.map(m => (
              <WatchlistCard key={m._id} movie={m} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
