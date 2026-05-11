import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

const TMDB_W185 = 'https://image.tmdb.org/t/p/w185';

function ListCard({ list, onDelete, isOwner }) {
  return (
    <Link to={`/lists/${list._id}`} className="group relative block bg-cinema-card border border-cinema-border rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
      
      {/* Top Banner (Movies Preview) */}
      <div className="flex bg-cinema-surface h-28 w-full border-b border-cinema-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-card to-transparent z-10" />
        
        {list.movies?.slice(0, 4).map((m, i) => (
          <div key={m._id} className="flex-1 h-full overflow-hidden border-r border-cinema-border/50 last:border-0 relative">
            {m.posterPath ? (
              <img src={`${TMDB_W185}${m.posterPath}`} alt={m.title} className="w-full h-[150%] object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full bg-cinema-surface opacity-30" />
            )}
          </div>
        ))}
        {(!list.movies || list.movies.length === 0) && (
          <div className="flex-1 h-full flex flex-col items-center justify-center text-blue-500/20 z-0">
             <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
               <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
             </svg>
          </div>
        )}

        <div className="absolute bottom-2 right-2 z-20 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow-lg flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
             <path d="M7 4v16l5-5 5 5V4H7z"/>
          </svg>
          {list.movies?.length || 0}
        </div>
      </div>

      <div className="p-5 z-20 relative bg-cinema-card">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-display font-semibold text-lg text-cinema-text group-hover:text-blue-400 transition-colors line-clamp-1">{list.title}</h3>
          {isOwner && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(list._id); }}
              className="text-cinema-muted hover:text-red-500 transition-colors bg-cinema-surface border border-cinema-border p-1.5 rounded-lg opacity-0 group-hover:opacity-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path d="M3 6h18M19 6l-1 14H6L5 6M8 6V4h8v2"/>
              </svg>
            </button>
          )}
        </div>
        
        {list.description ? (
          <p className="text-cinema-muted text-sm line-clamp-2 min-h-[40px]">{list.description}</p>
        ) : (
          <p className="text-cinema-muted/50 italic text-sm line-clamp-2 min-h-[40px]">No description provided...</p>
        )}

        <div className="mt-4 flex items-center gap-2">
           <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${list.isPublic ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-400'}`}>
              {list.isPublic ? 'Globe' : 'Private'}
           </span>
        </div>
      </div>
    </Link>
  );
}

export default function ListsPage() {
  const { user } = useAuth();
  const toast    = useToast();
  const [lists,   setLists]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form,    setForm]    = useState({ title: '', description: '', isPublic: true });
  const [saving,  setSaving]  = useState(false);

  const load = () => {
    if (!user) return;
    setLoading(true);
    api.get(`/lists/user/${user._id}`)
      .then(res => setLists(res.data.data || []))
      .catch(() => setLists([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user]);

  const handleCreate = async e => {
    e.preventDefault();
    if (!form.title.trim()) { toast('Title is required', 'error'); return; }
    setSaving(true);
    try {
      await api.post('/lists', form);
      toast('List created ✓', 'success');
      setShowNew(false);
      setForm({ title: '', description: '', isPublic: true });
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this list?')) return;
    try {
      await api.delete(`/lists/${id}`);
      toast('List deleted', 'info');
      setLists(prev => prev.filter(l => l._id !== id));
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-20 relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-6 md:px-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-cinema-border">
          <div>
            <h1 className="font-display font-black text-4xl text-cinema-text tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                </svg>
              </div>
              Curated Lists
            </h1>
            <p className="text-cinema-muted text-sm mt-3 font-medium">You have created <span className="text-blue-400 font-bold">{lists.length}</span> list{lists.length !== 1 ? 's' : ''} to organize movies.</p>
          </div>
          <button
            id="create-list-btn"
            onClick={() => setShowNew(s => !s)}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Create New List
          </button>
        </div>

        {/* Create form */}
        {showNew && (
          <form onSubmit={handleCreate}
                className="bg-cinema-surface/50 border border-blue-500/30 rounded-3xl p-6 md:p-8 mb-10 space-y-5 animate-fade-up shadow-2xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 left-0 w-1 bg-blue-500 h-full"></div>
            <h2 className="font-display font-bold text-xl text-cinema-text flex items-center gap-2">
               <span className="text-blue-500">❖</span> Create a New Masterpiece
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                id="list-title"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Name your list (e.g. Best Sci-Fi of 2024)"
                className="w-full bg-cinema-card border border-cinema-border rounded-xl px-4 py-3.5 text-sm text-cinema-text
                           placeholder-cinema-muted/50 outline-none focus:border-blue-500 transition-all font-medium field-shadow"
              />
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Short description to give context..."
                rows={1}
                className="w-full bg-cinema-card border border-cinema-border rounded-xl px-4 py-3.5 text-sm text-cinema-text
                           placeholder-cinema-muted/50 outline-none focus:border-blue-500 transition-all resize-none field-shadow"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <label className="flex items-center gap-2 text-cinema-text text-sm cursor-pointer select-none group">
                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${form.isPublic ? 'bg-blue-500 border-blue-500' : 'bg-cinema-card border-cinema-border group-hover:border-blue-500/50'}`}>
                  {form.isPublic && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3">
                       <path d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </div>
                <input type="checkbox" checked={form.isPublic} onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))} className="hidden" />
                <span className="font-medium">Make it Public</span>
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowNew(false)} className="px-6 py-2.5 rounded-xl font-medium text-sm text-cinema-muted hover:text-white bg-cinema-card border border-cinema-border hover:border-cinema-muted transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-60 flex items-center gap-2">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : null}
                  {saving ? 'Creating…' : 'Publish List'}
                </button>
              </div>
            </div>
          </form>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}
          </div>
        ) : lists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="font-display font-bold text-2xl text-cinema-text mb-2">No lists yet</h2>
            <p className="text-cinema-muted text-sm mb-6">Create your first curated film list</p>
            <button onClick={() => setShowNew(true)} className="btn-primary">Create a List</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lists.map(l => (
              <ListCard key={l._id} list={l} onDelete={handleDelete} isOwner={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
