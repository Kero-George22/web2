import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import api from '../lib/api';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [form,    setForm]    = useState({ username: '', bio: '', avatar: '', profileTheme: 'classic', password: '', confirm: '' });
  const [saving,  setSaving]  = useState(false);
  const [reviews, setReviews] = useState([]);
  const [stats,   setStats]   = useState({ total: 0, liked: 0, avgRating: 0 });
  const [pinned, setPinned] = useState([]);

  useEffect(() => {
    if (!user) return;
    setForm({
      username: user.username,
      bio: user.bio || '',
      avatar: user.avatar || '',
      profileTheme: user.profileTheme || 'classic',
      password: '',
      confirm: '',
    });
    setPinned((user.pinnedFavorites || []).map(String));
    api.get(`/reviews/user/${user._id}`, { params: { limit: 100 } })
      .then(res => {
        const items = res.data.data.items || [];
        setReviews(items);
        const liked   = items.filter(r => r.liked).length;
        const avgRating = items.length ? (items.reduce((s, r) => s + r.rating, 0) / items.length) : 0;
        setStats({ total: res.data.data.total || items.length, liked, avgRating });
      })
      .catch(() => {});
  }, [user]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const publicProfilePath = user ? `/users/${user._id}` : '';
  const publicProfileUrl = user ? `${window.location.origin}${publicProfilePath}` : '';

  const handleCopyPublicProfile = async () => {
    try {
      await navigator.clipboard.writeText(publicProfileUrl);
      toast('Public profile link copied ✓', 'success');
    } catch {
      toast('Could not copy link', 'error');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      setSaving(true);
      const res = await api.post('/users/' + user._id + '/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(f => ({ ...f, avatar: res.data.data.url }));
      toast('Avatar uploaded successfully!', 'success');
      refreshUser();
    } catch (err) {
      toast(err?.response?.data?.message || err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async e => {
    e.preventDefault();
    if (form.password && form.password !== form.confirm) { toast('Passwords do not match', 'error'); return; }
    if (form.password && form.password.length < 8) { toast('Password must be at least 8 characters', 'error'); return; }
    setSaving(true);
    try {
      const payload = {
        username: form.username || undefined,
        bio:      form.bio      || undefined,
        avatar:   form.avatar   || undefined,
        profileTheme: form.profileTheme || 'classic',
        pinnedFavorites: pinned,
      };
      if (form.password) payload.password = form.password;
      await api.patch(`/users/${user._id}`, payload);
      await refreshUser();
      toast('Profile updated ✓', 'success');
      setForm(f => ({ ...f, password: '', confirm: '' }));
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const candidateMoviesMap = new Map();
  reviews.forEach((r) => {
    const m = r.movieId;
    if (m?._id && !candidateMoviesMap.has(m._id)) candidateMoviesMap.set(m._id, m);
  });
  const candidateMovies = Array.from(candidateMoviesMap.values()).slice(0, 24);

  const togglePinned = (movieId) => {
    setPinned((prev) => {
      const id = String(movieId);
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 6) {
        toast('You can pin up to 6 favorites', 'info');
        return prev;
      }
      return [...prev, id];
    });
  };

  const statCards = [
    { label: 'Films logged',  value: stats.total,                    icon: '🎬' },
    { label: 'Films liked',   value: stats.liked,                    icon: '❤️' },
    { label: 'Avg rating',    value: stats.avgRating.toFixed(1)+'/5', icon: '⭐' },
  ];

  return (
    <div className="min-h-screen pt-8 pb-32 relative overflow-hidden">
      {/* Cinematic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-600/10 via-blue-900/5 to-transparent pointer-events-none -z-10" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      
      <div className="max-w-5xl mx-auto px-6 md:px-10 relative z-10">
        
        {/* Profile Header Card */}
        <div className="bg-cinema-card/80 backdrop-blur-xl border border-cinema-border rounded-[2.5rem] p-8 md:p-12 mb-12 shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-10 relative overflow-hidden group">
           {/* Abstract shape */}
           <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-purple-500" />
           <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none transition-transform duration-1000 group-hover:scale-150" />

           <div className="relative">
             <div className="w-36 h-36 md:w-48 md:h-48 rounded-full flex-shrink-0 flex items-center justify-center text-5xl font-black overflow-hidden relative border-[6px] border-cinema-surface shadow-2xl z-10 bg-gradient-to-tr from-blue-500 to-purple-600">
               {form.avatar || user?.avatar ? (
                 <img src={form.avatar || user?.avatar} alt="Avatar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={e => e.currentTarget.style.display='none'} />
               ) : (
                 <span className="text-white text-6xl shadow-sm">{user?.username?.[0]?.toUpperCase() || '?'}</span>
               )}
               <label className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 cursor-pointer flex flex-col items-center justify-center text-sm font-medium transition-all text-white backdrop-blur-sm">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 mb-2">
                    <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                 </svg>
                 Change Avatar
                 <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={saving} />
               </label>
             </div>
             {saving && <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full z-20 shadow-lg">Uploading...</div>}
           </div>

           <div className="flex-1 text-center md:text-left z-10 pt-2">
             <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
               <div>
                  <h1 className="font-display font-black text-5xl text-cinema-text tracking-tight mb-2 drop-shadow-md">{user?.username}</h1>
                  <p className="text-blue-400 font-medium flex items-center justify-center md:justify-start gap-1.5 text-sm uppercase tracking-wider">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    Cinema Member Since {new Date(user?.createdAt || Date.now()).getFullYear()}
                  </p>
               </div>
               <div className="flex flex-col gap-3 justify-center md:justify-end min-w-[150px]">
                 <button type="button" onClick={handleCopyPublicProfile} className="w-full px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 hover:-translate-y-0.5">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                   Share Profile
                 </button>
                 <Link to={publicProfilePath} className="w-full px-5 py-2.5 rounded-xl text-sm font-bold bg-cinema-surface border border-cinema-border hover:border-cinema-muted transition-all text-cinema-text text-center hover:-translate-y-0.5">View Public Page</Link>
               </div>
             </div>
             
             <div className="bg-cinema-surface/50 border border-cinema-border/50 rounded-2xl p-5 backdrop-blur-sm">
               <p className="text-cinema-muted leading-relaxed text-sm md:text-base italic">
                  "{user?.bio || "No bio set. E.g. 'Avid sci-fi fan, Nolan enthusiast, constantly looking for hidden gems.'"}"
               </p>
             </div>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
           {[
             { label: 'Films Logged', value: stats.total, icon: '🍿', color: 'text-blue-400', bg: 'bg-blue-500/5' },
             { label: 'Favorites', value: stats.liked, icon: '❤️', color: 'text-red-400', bg: 'bg-red-500/5' },
             { label: 'Avg Rating', value: stats.avgRating.toFixed(1), icon: '⭐', color: 'text-yellow-400', bg: 'bg-yellow-500/5' },
             { label: 'Pinned Movies', value: pinned.length, icon: '📌', color: 'text-green-400', bg: 'bg-green-500/5' }
           ].map(s => (
             <div key={s.label} className={"border border-cinema-border rounded-3xl p-6 text-center hover:-translate-y-1 transition-all duration-300 group " + s.bg}>
               <div className={"text-4xl mb-3 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-300 drop-shadow-xl " + s.color}>{s.icon}</div>
               <p className="font-display font-black text-4xl text-cinema-text mb-1 tracking-tight">{s.value}</p>
               <p className={"text-xs font-bold uppercase tracking-widest " + s.color}>{s.label}</p>
             </div>
           ))}
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSave} className="bg-cinema-card/80 backdrop-blur-xl border border-cinema-border rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
          
          <div className="flex items-center gap-3 mb-10">
             <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
             </div>
             <h2 className="font-display font-black text-3xl text-cinema-text">Profile Settings</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-10">
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-cinema-muted uppercase tracking-widest block mb-2.5 pl-1">Username</label>
                <input name="username" value={form.username} onChange={handleChange} className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-5 py-4 text-cinema-text focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-semibold shadow-inner" />
              </div>
              <div>
                <label className="text-xs font-bold text-cinema-muted uppercase tracking-widest block mb-2.5 pl-1">Bio (About You)</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-5 py-4 text-cinema-text focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none font-semibold shadow-inner" />
              </div>
            </div>

            <div className="space-y-6 bg-cinema-surface/30 p-6 md:p-8 rounded-3xl border border-cinema-border/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></div>
                  <div>
                    <h3 className="text-lg font-bold text-cinema-text">Security</h3>
                    <p className="text-xs text-cinema-muted font-medium mt-0.5">Update your password here</p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold text-cinema-muted uppercase tracking-widest block mb-2 pl-1">New Password (Optional)</label>
                    <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" className="w-full bg-cinema-card border border-cinema-border rounded-xl px-5 py-4 text-sm text-cinema-text focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all shadow-inner font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-cinema-muted uppercase tracking-widest block mb-2 pl-1">Confirm Password</label>
                    <input name="confirm" type="password" value={form.confirm} onChange={handleChange} placeholder="••••••••" className="w-full bg-cinema-card border border-cinema-border rounded-xl px-5 py-4 text-sm text-cinema-text focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all shadow-inner font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans" />
                  </div>
                </div>
            </div>
          </div>

          <div className="pt-10 border-t border-cinema-border">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <h3 className="font-display font-black text-2xl text-cinema-text flex items-center gap-2 mb-1">
                   📌 Pinned Posters
                </h3>
                <p className="text-cinema-muted text-sm font-medium">Select up to 6 of your favorite films to showcase on your public page.</p>
              </div>
              <div className="bg-cinema-surface px-5 py-2 rounded-xl border border-cinema-border outline outline-4 outline-cinema-surface/50 text-sm font-black shadow-sm">
                 <span className={pinned.length === 6 ? 'text-green-500' : 'text-blue-500'}>{pinned.length}</span> <span className="text-cinema-muted">/ 6 Selected</span>
              </div>
            </div>
            
            {candidateMovies.length === 0 ? (
              <div className="text-center py-16 bg-cinema-surface/50 rounded-3xl border-2 border-cinema-border border-dashed">
                <span className="text-6xl mb-4 block scale-110 opacity-60">🎞️</span>
                <p className="text-cinema-text font-bold text-xl mb-1">No movies logged yet!</p>
                <p className="text-cinema-muted text-sm max-w-sm mx-auto">Review some movies first, and they will appear here so you can pin them to your profile.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {candidateMovies.map((m) => {
                  const selected = pinned.includes(String(m._id));
                  return (
                    <button
                      key={m._id}
                      type="button"
                      onClick={(e) => { e.preventDefault(); togglePinned(m._id); }}
                      className={`relative aspect-[2/3] rounded-2xl overflow-hidden group transition-all duration-300 ${
                        selected ? 'ring-[5px] ring-blue-500 shadow-2xl shadow-blue-500/40 scale-[1.03] z-10' : 'hover:ring-[3px] hover:ring-cinema-border opacity-60 hover:opacity-100 hover:scale-105 filter grayscale-[30%] hover:grayscale-0'
                      }`}
                    >
                      {m.posterPath ? (
                         <img src={`https://image.tmdb.org/t/p/w185${m.posterPath}`} alt={m.title} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full bg-cinema-surface border border-cinema-border flex items-center justify-center p-3 text-center text-xs font-bold leading-relaxed">{m.title}</div>
                      )}
                      
                      {/* Overlay gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity ${selected ? 'opacity-100' : 'opacity-0'}`}></div>
                      
                      {selected && (
                        <div className="absolute top-3 right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-500/50 animate-fade-up">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M5 13l4 4L19 7"/></svg>
                        </div>
                      )}
                      {selected && (
                        <div className="absolute bottom-3 left-3 text-xs font-bold text-white max-w-[90%] truncate">{m.title}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-12 flex justify-end pt-6 border-t border-cinema-border/50">
            <button
              id="profile-save"
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-lg hover:-translate-y-1"
            >
              {saving ? <span className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin" /> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>}
              {saving ? 'Saving Masterpiece...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}