import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { useToast } from '../../components/Toast';

const TMDB_W185 = 'https://image.tmdb.org/t/p/w185';

export default function AdminMovies() {
  const toast = useToast();
  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tmdbId, setTmdbId] = useState('');
  const [adding, setAdding] = useState(false);
  const limit = 20;

  const load = useCallback(() => {
    setLoading(true);
    api.get('/admin/movies', { params: { page, limit } })
      .then(res => { setMovies(res.data.data.items || []); setTotal(res.data.data.total || 0); })
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async e => {
    e.preventDefault();
    const id = parseInt(tmdbId, 10);
    if (!id || id < 1) { toast('Enter a valid TMDB ID', 'error'); return; }
    setAdding(true);
    try {
      const res = await api.post('/movies', { tmdbId: id });
      toast(`"${res.data.data.title}" added ✓`, 'success');
      setTmdbId('');
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this movie and all its reviews?')) return;
    try {
      await api.delete(`/admin/movies/${id}`);
      toast('Movie deleted', 'success');
      load();
    } catch (err) { toast(err.message, 'error'); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen pt-8 pb-20">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="mb-8">
          <h1 className="font-display font-black text-3xl text-cinema-text">Manage Movies</h1>
          <p className="text-cinema-muted text-sm mt-1">{total.toLocaleString()} films in database</p>
        </div>

        {/* Add by TMDB ID */}
        <form onSubmit={handleAdd}
          className="bg-cinema-card border border-cinema-accent/20 rounded-2xl p-6 mb-8 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-52">
            <label className="text-sm text-cinema-muted font-medium block mb-1.5">Add Movie by TMDB ID</label>
            <input
              id="admin-tmdb-id"
              type="number"
              value={tmdbId}
              onChange={e => setTmdbId(e.target.value)}
              placeholder="e.g. 27205 (Inception)"
              className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-4 py-2.5 text-sm text-cinema-text
                         placeholder-cinema-muted/60 outline-none focus:border-cinema-accent transition-all"
            />
          </div>
          <button type="submit" disabled={adding} className="btn-primary text-sm disabled:opacity-60">
            {adding
              ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-cinema-bg/40 border-t-cinema-bg rounded-full animate-spin" />Fetching…</span>
              : '+ Fetch from TMDB'}
          </button>
          <p className="text-cinema-muted text-xs w-full -mt-2">
            Find the TMDB ID at <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="text-cinema-accent hover:brightness-110">themoviedb.org</a>
          </p>
        </form>

        {/* Movie table */}
        <div className="bg-cinema-card border border-cinema-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cinema-border">
                  <th className="text-left px-5 py-3 text-cinema-muted font-medium">Film</th>
                  <th className="text-left px-5 py-3 text-cinema-muted font-medium hidden sm:table-cell">Year</th>
                  <th className="text-left px-5 py-3 text-cinema-muted font-medium hidden md:table-cell">Genres</th>
                  <th className="text-left px-5 py-3 text-cinema-muted font-medium">Rating</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-cinema-border/50">
                      {[1, 2, 3, 4, 5].map(j => <td key={j} className="px-5 py-3"><div className="skeleton h-4 rounded w-full" /></td>)}
                    </tr>
                  ))
                ) : movies.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-cinema-muted">No movies yet — add one above</td></tr>
                ) : (
                  movies.map(m => {
                    const year = m.releaseDate ? new Date(m.releaseDate).getFullYear() : '—';
                    return (
                      <tr key={m._id} className="border-b border-cinema-border/50 hover:bg-cinema-surface/50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-12 rounded overflow-hidden bg-cinema-surface flex-shrink-0">
                              {m.posterPath
                                ? <img src={`${TMDB_W185}${m.posterPath}`} alt={m.title} className="w-full h-full object-cover" />
                                : <div className="w-full h-full bg-cinema-border" />}
                            </div>
                            <span className="text-cinema-text font-medium line-clamp-2">{m.title}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-cinema-muted hidden sm:table-cell">{year}</td>
                        <td className="px-5 py-3 hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {m.genres?.slice(0, 2).map(g => (
                              <span key={g} className="text-xs px-2 py-0.5 rounded-full bg-cinema-surface border border-cinema-border text-cinema-muted">{g}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          {m.averageRating > 0
                            ? <span className="text-cinema-accent font-bold">★ {m.averageRating.toFixed(1)}</span>
                            : <span className="text-cinema-border">—</span>}
                          <span className="text-cinema-muted text-xs ml-1">({m.reviewCount})</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => handleDelete(m._id)}
                            className="text-cinema-muted hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                              <path d="M3 6h18M19 6l-1 14H6L5 6M8 6V4h8v2" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 rounded-xl border border-cinema-border text-cinema-muted text-sm hover:border-cinema-accent hover:text-cinema-accent transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              ← Prev
            </button>
            <span className="text-cinema-muted text-sm px-3">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-xl border border-cinema-border text-cinema-muted text-sm hover:border-cinema-accent hover:text-cinema-accent transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
