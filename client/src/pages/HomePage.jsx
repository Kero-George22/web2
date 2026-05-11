import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import MovieCard from '../components/MovieCard';
import RecentReviews from '../components/RecentReviews';
import api from '../lib/api';

function SectionHeader({ label, emoji, action, href }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <h2 className="font-display font-bold text-xl text-cinema-text tracking-wide">{label}</h2>
        <div className="h-px w-16 bg-gradient-to-r from-cinema-accent/50 to-transparent" />
      </div>
      {action && (
        <Link to={href || "#"} className="text-cinema-muted text-sm hover:text-cinema-accent transition-colors flex items-center gap-1">
          {action}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      )}
    </div>
  );
}

function StatCard({ value, label, icon }) {
  return (
    <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6 flex items-center gap-4 hover:border-cinema-accent/30 transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-cinema-accent/10 border border-cinema-accent/20 flex items-center justify-center text-2xl flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-display font-bold text-2xl text-cinema-text">{value}</p>
        <p className="text-cinema-muted text-sm">{label}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [moviePicks, setMoviePicks] = useState([]);
  const [seriesPicks, setSeriesPicks] = useState([]);

  useEffect(() => {
    async function fetchSections() {
      try {
        const [movieRes, tvRes] = await Promise.all([
          api.get('/movies', { params: { type: 'movie', limit: 6 } }),
          api.get('/movies', { params: { type: 'tv', limit: 6 } }),
        ]);
        setMoviePicks(movieRes.data.data.items || []);
        setSeriesPicks(tvRes.data.data.items || []);
      } catch (err) {
        console.error('Failed to fetch home sections:', err);
      }
    }
    fetchSections();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <HeroBanner />

      {/* Stats strip */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value="12,480+" label="Films logged" icon="🎬" />
          <StatCard value="4,210+" label="Reviews written" icon="✍️" />
          <StatCard value="890+" label="Active members" icon="👥" />
          <StatCard value="320+" label="Curated lists" icon="📋" />
        </div>
      </section>

      {/* Movies */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-6">
        <SectionHeader label="Movies" emoji="🎬" action="See all" href="/films" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {moviePicks.map(m => <MovieCard key={m._id || m.id} movie={m} />)}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 my-4">
        <div className="h-px bg-gradient-to-r from-transparent via-cinema-border to-transparent" />
      </div>

      {/* Series */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-6">
        <SectionHeader label="TV Series" emoji="📺" action="See all" href="/series" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {seriesPicks.map(m => <MovieCard key={m._id || m.id} movie={m} />)}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 my-4">
        <div className="h-px bg-gradient-to-r from-transparent via-cinema-border to-transparent" />
      </div>

      {/* Recent Reviews */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-6">
        <SectionHeader label="Recent Member Reviews" emoji="💬" action="Browse reviews" />
        <RecentReviews />
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        <div
          className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center"
          style={{ background: 'linear-gradient(135deg, #1a1209 0%, #1a0f00 40%, #0f1520 100%)' }}
        >
          {/* Glow orbs */}
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #e8a045, transparent)' }} />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <p className="text-cinema-accent font-medium text-sm tracking-widest uppercase">Start your journey</p>
            <h2 className="font-display font-black text-3xl md:text-5xl text-white leading-tight">
              Your film diary, <br className="hidden md:block" />
              <span className="text-cinema-accent">beautifully kept.</span>
            </h2>
            <p className="text-cinema-muted text-base leading-relaxed">
              Track every film you watch, discover new favourites, and connect with a community of passionate cinephiles.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <a href="/register" className="btn-primary text-base px-8 py-3">
                Create Free Account
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </a>
              <a href="/movies" className="btn-secondary text-base px-8 py-3">Browse Films</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
