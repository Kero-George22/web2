import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { useTheme } from '../contexts/ThemeContext';
import api from '../lib/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  
  // AI Search states
  const [aiSearchOpen, setAiSearchOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!dropOpen) return;

    const onPointerDown = (event) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target)) {
        setDropOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [dropOpen]);

  const handleSearch = e => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/movies?q=${encodeURIComponent(query.trim())}`);
    setQuery('');
    setSearchOpen(false);
  };

  const handleAiSearch = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    
    setAiLoading(true);
    try {
      const res = await api.post('/ai/identify', { description: aiQuery.trim() });
      const { movie, ai, localMovie } = res.data.data;
      
      setAiSearchOpen(false);
      setAiQuery('');
      
      if (localMovie && localMovie._id) {
        toast(`✨ Zaza found: ${localMovie.title || ai.title}`, 'success');
        navigate(`/movies/${localMovie._id}`);
      } else if (movie && movie.id) {
        toast(`✨ Zaza found: ${ai.title} (TMDB)`, 'success');
        navigate(`/movies/${movie.id}-${ai.title.toLowerCase().replace(/\s+/g, '-')}`);
      } else {
        toast(`✨ Zaza thinks it's: ${ai.title}, but couldn't find an exact match in our DB.`, 'info');
      }
    } catch (err) {
      toast('Failed to identify movie. Zaza is confused.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast('Signed out', 'info');
    navigate('/');
    setDropOpen(false);
  };

  const navCls = ({ isActive }) =>
    `nav-link${isActive ? ' active' : ''}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div
        className="border-b border-cinema-border/50"
        style={{ background: 'rgba(11,12,15,0.88)', backdropFilter: 'blur(16px)' }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center h-16 gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-cinema-accent flex items-center justify-center shadow-glow">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-cinema-bg">
                <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2 2v12h12V6H6zm1 1l5 3.5L17 7v10l-5-3.5L7 17V7z" />
              </svg>
            </div>
            <span className="font-display font-black text-xl tracking-tight">
              <span className="text-cinema-accent">Cine</span>
              <span className="text-cinema-text">Log</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 flex-1">
            <NavLink to="/" className={navCls} end>Home</NavLink>
            <NavLink to="/films" className={navCls}>Films</NavLink>
            <NavLink to="/series" className={navCls}>TV Shows</NavLink>
            {user && (
              <>
                <NavLink to="/watchlist" className={navCls}>Watchlist</NavLink>
                <NavLink to="/lists" className={navCls}>Lists</NavLink>

              </>
            )}
            {user?.isAdmin && (
              <NavLink to="/admin" className={navCls}>Admin ⚡</NavLink>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* AI Search */}
            <form onSubmit={handleAiSearch} className="relative flex items-center hidden sm:flex">
              {aiSearchOpen && (
                <input
                  autoFocus
                  dir="rtl"
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  onBlur={() => { if (!aiQuery) setAiSearchOpen(false); }}
                  placeholder="ابحث بالوصف... زي: الفضاء والبطاطس"
                  disabled={aiLoading}
                  className="w-64 bg-cinema-surface border border-purple-500/50 rounded-xl px-4 py-1.5 text-sm text-cinema-text placeholder-cinema-muted/60 outline-none focus:border-purple-500 transition-colors mr-2"
                />
              )}
              <button
                type={aiSearchOpen ? 'submit' : 'button'}
                onClick={() => !aiSearchOpen && setAiSearchOpen(true)}
                disabled={aiLoading}
                style={{ marginLeft: '0.25rem' }}
                title="AI Semantic Search / ابحث بالوصف"
                className="p-2 rounded-xl text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-all flex items-center justify-center relative"
              >
                {aiLoading ? (
                  <div className="w-4 h-4 border-2 border-purple-500/50 border-t-purple-400 rounded-full animate-spin" />
                ) : (
                  <span className="text-xl leading-none">🪄</span>
                )}
              </button>
            </form>

            {/* Normal Search */}
            <form onSubmit={handleSearch} className="relative flex items-center">
              {searchOpen && (
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onBlur={() => { if (!query) setSearchOpen(false); }}
                  placeholder="Search films…"
                  className="w-48 bg-cinema-surface border border-cinema-border rounded-xl px-4 py-1.5 text-sm text-cinema-text placeholder-cinema-muted/60 outline-none focus:border-cinema-accent transition-colors"
                />
              )}
              <button
                type={searchOpen ? 'submit' : 'button'}
                onClick={() => !searchOpen && setSearchOpen(true)}
                className="ml-1 p-2 rounded-xl text-cinema-muted hover:text-cinema-accent hover:bg-cinema-surface transition-all"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </form>

            {/* Theme Switcher */}
            <div className="relative">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-cinema-surface border border-cinema-border rounded-lg text-cinema-text px-2 py-1 text-sm outline-none cursor-pointer hover:border-cinema-accent transition-colors shadow-sm"
              >
                <option value="dark">🌙 Dark Theme</option>
                <option value="light">☀️ Light Theme</option>
                <option value="ocean">🌊 Ocean Theme</option>
                <option value="pink">🌸 Pink Theme</option>
                <option value="burgundy">🍷 Burgundy Theme</option>
                <option value="netflix">🍿 Netflix Theme</option>
              </select>
            </div>

            {/* Auth buttons / user menu */}
            {!user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login"
                  className="px-4 py-1.5 rounded-xl border border-cinema-border text-cinema-muted text-sm font-medium hover:border-cinema-accent hover:text-cinema-accent transition-all">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-1.5">Get Started</Link>
              </div>
            ) : (
              <div ref={dropdownRef} className="relative hidden md:block">
                <button
                  onClick={() => setDropOpen(d => !d)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-cinema-surface transition-all"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#e8a045,#c47f2a)' }}>
                    {user.avatar
                      ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      : user.username[0].toUpperCase()}
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`w-3.5 h-3.5 text-cinema-muted transition-transform ${dropOpen ? 'rotate-180' : ''}`}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {dropOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-cinema-card border border-cinema-border rounded-2xl shadow-xl overflow-hidden z-50 animate-fade-up">
                    <div className="px-4 py-3 border-b border-cinema-border">
                      <p className="text-cinema-text text-sm font-semibold">{user.username}</p>
                      <p className="text-cinema-muted text-xs truncate">{user.email}</p>
                    </div>
                    {[
                      { to: '/profile', label: '👤 My Profile' },
                      { to: '/watchlist', label: '🎞️ Watchlist' },
                      { to: '/lists', label: '📋 My Lists' },
                      ...(user.isAdmin ? [{ to: '/admin', label: '⚡ Admin Panel' }] : []),
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setDropOpen(false)}
                        className="block px-4 py-2.5 text-sm text-cinema-muted hover:bg-cinema-surface hover:text-cinema-text transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-cinema-border">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-xl text-cinema-muted hover:text-cinema-text hover:bg-cinema-surface transition-all"
              onClick={() => setMenuOpen(m => !m)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                {menuOpen
                  ? <path d="M6 18L18 6M6 6l12 12" />
                  : <path d="M3 12h18M3 6h18M3 18h18" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-cinema-border/50 px-6 py-4 space-y-1">
            {[
              { to: '/', label: 'Home' },
              { to: '/films', label: 'Films' },
              { to: '/series', label: 'TV Shows' },
              ...(user ? [
                { to: '/watchlist', label: 'Watchlist' },
                { to: '/lists', label: 'My Lists' },

                { to: '/profile', label: 'My Profile' },
                ...(user.isAdmin ? [{ to: '/admin', label: 'Admin ⚡' }] : []),
              ] : []),
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-cinema-muted hover:text-cinema-text text-sm font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-3 border-t border-cinema-border mt-3">
              {!user ? (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 rounded-xl border border-cinema-border text-sm text-cinema-muted hover:border-cinema-accent hover:text-cinema-accent transition-all">Sign In</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 rounded-xl bg-cinema-accent text-cinema-bg text-sm font-semibold hover:brightness-110 transition-all">Get Started</Link>
                </>
              ) : (
                <button onClick={handleLogout} className="flex-1 text-center py-2 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-400/10 transition-all">Sign Out</button>
              )}
            </div>
          </div>
        )}
      </div>

    </header>
  );
}

