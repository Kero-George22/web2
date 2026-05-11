import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { useToast } from '../../components/Toast';

export default function AdminUsers() {
  const toast = useToast();
  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [q,       setQ]       = useState('');
  const [dQ,      setDQ]      = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 20;

  useEffect(() => {
    const t = setTimeout(() => setDQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/admin/users', { params: { page, limit, q: dQ || undefined } })
      .then(res => { setUsers(res.data.data.items || []); setTotal(res.data.data.total || 0); })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [page, dQ]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async id => {
    if (!confirm('Permanently delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast('User deleted', 'success');
      load();
    } catch (err) { toast(err.message, 'error'); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen pt-8 pb-20">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-black text-3xl text-cinema-text">Manage Users</h1>
            <p className="text-cinema-muted text-sm mt-1">{total.toLocaleString()} total users</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinema-muted pointer-events-none">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            id="admin-user-search"
            value={q}
            onChange={e => { setQ(e.target.value); setPage(1); }}
            placeholder="Search by username or email…"
            className="w-full pl-10 pr-4 py-2.5 bg-cinema-card border border-cinema-border rounded-xl text-sm text-cinema-text
                       placeholder-cinema-muted/60 outline-none focus:border-cinema-accent transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-cinema-card border border-cinema-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cinema-border">
                  <th className="text-left px-5 py-3 text-cinema-muted font-medium">User</th>
                  <th className="text-left px-5 py-3 text-cinema-muted font-medium hidden md:table-cell">Email</th>
                  <th className="text-left px-5 py-3 text-cinema-muted font-medium hidden sm:table-cell">Joined</th>
                  <th className="text-left px-5 py-3 text-cinema-muted font-medium">Role</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-cinema-border/50">
                      {[1,2,3,4,5].map(j => <td key={j} className="px-5 py-3"><div className="skeleton h-4 rounded w-full" /></td>)}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-cinema-muted">No users found</td></tr>
                ) : (
                  users.map(u => (
                    <tr key={u._id} className="border-b border-cinema-border/50 hover:bg-cinema-surface/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-cinema-accent/20 flex items-center justify-center font-bold text-cinema-accent text-xs flex-shrink-0">
                            {u.username[0].toUpperCase()}
                          </div>
                          <span className="text-cinema-text font-medium">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-cinema-muted hidden md:table-cell">{u.email}</td>
                      <td className="px-5 py-3 text-cinema-muted hidden sm:table-cell">
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3">
                        {u.isAdmin
                          ? <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">Admin</span>
                          : <span className="text-xs px-2 py-0.5 rounded-full bg-cinema-surface border border-cinema-border text-cinema-muted">User</span>}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {!u.isAdmin && (
                          <button
                            onClick={() => handleDelete(u._id)}
                            className="text-cinema-muted hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                              <path d="M3 6h18M19 6l-1 14H6L5 6M8 6V4h8v2"/>
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
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
