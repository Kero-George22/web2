import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

const TMDB_W185 = 'https://image.tmdb.org/t/p/w185';

function StatCard({ label, value, icon, color }) {
  return (
    <div className={`bg-cinema-card border ${color} rounded-2xl p-6 flex items-center gap-4`}>
      <div className="text-3xl flex-shrink-0">{icon}</div>
      <div>
        <p className="font-display font-black text-3xl text-cinema-text">{value?.toLocaleString()}</p>
        <p className="text-cinema-muted text-sm">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-cinema-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-8 pb-20">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xl">⚡</div>
          <div>
            <h1 className="font-display font-black text-3xl text-cinema-text">Admin Dashboard</h1>
            <p className="text-cinema-muted text-sm">Platform overview</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard label="Total Users"   value={stats?.totals?.users}   icon="👥" color="border-blue-500/20" />
          <StatCard label="Total Movies"  value={stats?.totals?.movies}  icon="🎬" color="border-cinema-accent/20" />
          <StatCard label="Total Reviews" value={stats?.totals?.reviews} icon="✍️" color="border-green-500/20" />
        </div>

        {/* Quick nav */}
        <div className="flex gap-3 mb-10">
          <Link to="/admin/users"  className="btn-secondary text-sm">👥 Manage Users</Link>
          <Link to="/admin/movies" className="btn-secondary text-sm">🎬 Manage Movies</Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top rated */}
          <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6">
            <h2 className="font-display font-bold text-lg text-cinema-text mb-4">⭐ Top Rated Films</h2>
            <div className="space-y-3">
              {stats?.topRatedMovies?.map((m, i) => (
                <div key={m._id} className="flex items-center gap-3">
                  <span className="text-cinema-muted text-sm w-5 text-right flex-shrink-0">{i + 1}</span>
                  <div className="w-8 h-12 rounded overflow-hidden bg-cinema-surface flex-shrink-0">
                    {m.posterPath
                      ? <img src={`${TMDB_W185}${m.posterPath}`} alt={m.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-cinema-border" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-cinema-text text-sm font-medium truncate">{m.title}</p>
                    <p className="text-cinema-muted text-xs">{m.reviewCount} review{m.reviewCount !== 1 ? 's' : ''}</p>
                  </div>
                  <span className="text-cinema-accent text-sm font-bold flex-shrink-0">★ {m.averageRating?.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent signups */}
          <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6">
            <h2 className="font-display font-bold text-lg text-cinema-text mb-4">🆕 Recent Signups</h2>
            <div className="space-y-3">
              {stats?.recentSignups?.map(u => (
                <div key={u._id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-cinema-accent/20 flex items-center justify-center font-bold text-cinema-accent text-sm flex-shrink-0">
                    {u.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-cinema-text text-sm font-medium truncate">{u.username}</p>
                    <p className="text-cinema-muted text-xs truncate">{u.email}</p>
                  </div>
                  {u.isAdmin && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex-shrink-0">Admin</span>
                  )}
                  <span className="text-cinema-border text-xs flex-shrink-0">
                    {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
