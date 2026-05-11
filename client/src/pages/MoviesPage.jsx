import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { StarDisplay } from '../components/StarRating';
import heroFallback from '../assets/hero.png';

const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Fantasy', 'History', 'Horror',
  'Music', 'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War',
];

function MovieCard({ movie }) {
  const poster = movie.posterPath ? `${TMDB_IMG}${movie.posterPath}` : heroFallback;
  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '—';
  const [imgError, setImgError] = useState(false);

  return (
    <Link to={`/movies/${movie._id}`} className="movie-card group block">
      <div className="aspect-[2/3] bg-cinema-surface relative">
        {poster && !imgError
          ? <img src={poster} alt={movie.title} onError={() => setImgError(true)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center text-cinema-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-12 h-12 opacity-30">
              <rect x="2" y="2" width="20" height="20" rx="2" /><path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5" />
            </svg>
          </div>
        }
      </div>
      <div className="card-overlay" />
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="font-display font-semibold text-white text-sm leading-tight line-clamp-2">{movie.title}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-cinema-muted text-xs">{year}</span>
          {movie.averageRating > 0 && (
            <div className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-cinema-accent">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-cinema-accent text-xs font-medium">{Number(movie.averageRating || 0).toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden relative">
      <div className="skeleton aspect-[2/3]" />
    </div>
  );
}

export default function MoviesPage({ forcedType = '' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const genre = searchParams.get('genre') || '';
  const language = searchParams.get('language') || '';
  const year = searchParams.get('year') || '';
  const type = searchParams.get('type') || '';
  const effectiveType = forcedType || type;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 24;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (debouncedSearch.trim()) {
        res = await api.get('/movies/search', { params: { q: debouncedSearch.trim(), page, limit } });
      } else {
        res = await api.get('/movies', { params: { genre: genre || undefined, year: year || undefined, language: language || undefined, type: effectiveType || undefined, page, limit } });
      }
      setMovies(res.data.data.items || []);
      setTotal(res.data.data.total || 0);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, genre, year, language, effectiveType, page, limit]);

  useEffect(() => { fetchMovies(); }, [fetchMovies]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    // Only reset to page 1 when changing filters/search, not when changing the `page` param itself
    if (key !== 'page') p.set('page', '1');
    setSearchParams(p);
  };

  const totalPages = Math.ceil(total / limit);
  const browsingLabel = effectiveType === 'tv' ? 'TV Series' : effectiveType === 'movie' ? 'Movies' : 'Movies & TV Series';

  return (
    <div className="min-h-screen pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-black text-3xl text-cinema-text">Browse {browsingLabel}</h1>
          <p className="text-cinema-muted text-sm mt-1">{total.toLocaleString()} titles in the database</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1 min-w-52">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinema-muted pointer-events-none">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              id="movies-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title…"
              className="w-full pl-10 pr-4 py-2.5 bg-cinema-card border border-cinema-border rounded-xl text-sm text-cinema-text
                         placeholder-cinema-muted/60 outline-none focus:border-cinema-accent transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cinema-muted hover:text-cinema-text">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Genre */}
          <select
            id="movies-genre-filter"
            value={genre}
            onChange={e => setParam('genre', e.target.value)}
            className="bg-cinema-card border border-cinema-border rounded-xl px-4 py-2.5 text-sm text-cinema-text outline-none focus:border-cinema-accent transition-all"
          >
            <option value="">All Genres</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          {!forcedType && (
            <select
              value={type}
              onChange={e => setParam('type', e.target.value)}
              className="px-4 py-2.5 bg-cinema-card border border-cinema-border rounded-xl text-sm text-cinema-text outline-none focus:border-cinema-accent hover:border-cinema-border/80 transition-colors"
            >
              <option value="">Movies & TV Shows</option>
              <option value="movie">Movies Only</option>
              <option value="tv">TV Shows Only</option>
            </select>
          )}
          {/* Language */}
          <select
            id="movies-language-filter"
            value={language}
            onChange={e => setParam('language', e.target.value)}
            className="bg-cinema-card border border-cinema-border rounded-xl px-4 py-2.5 text-sm text-cinema-text outline-none focus:border-cinema-accent transition-all"
          >
            <option value="">All Languages</option>
            <option value="en">English / Foreign</option>
            <option value="ar">Arabic (Egyptian)</option>
          </select>

          {/* Year */}
          <input
            id="movies-year-filter"
            type="number"
            value={year}
            onChange={e => setParam('year', e.target.value)}
            placeholder="Year"
            min="1900" max="2030"
            className="w-24 bg-cinema-card border border-cinema-border rounded-xl px-4 py-2.5 text-sm text-cinema-text
                       outline-none focus:border-cinema-accent transition-all"
          />

          {(genre || year || language || (!forcedType && type) || search) && (
            <button
              onClick={() => { setSearch(''); setSearchParams({}); }}
              className="px-4 py-2.5 text-sm text-cinema-muted border border-cinema-border rounded-xl hover:border-cinema-accent hover:text-cinema-accent transition-all"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {Array.from({ length: limit }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : movies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🎬</div>
            <h2 className="font-display font-bold text-xl text-cinema-text mb-2">No films found</h2>
            <p className="text-cinema-muted text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {movies.map(m => <MovieCard key={m._id} movie={m} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              disabled={page <= 1}
              onClick={() => setParam('page', String(page - 1))}
              className="px-4 py-2 rounded-xl border border-cinema-border text-cinema-muted text-sm hover:border-cinema-accent hover:text-cinema-accent transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >← Prev</button>
            <span className="text-cinema-muted text-sm px-4">Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setParam('page', String(page + 1))}
              className="px-4 py-2 rounded-xl border border-cinema-border text-cinema-muted text-sm hover:border-cinema-accent hover:text-cinema-accent transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
