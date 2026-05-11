import { useState, useEffect, useRef } from 'react';
import { TMDB_ORIG, TMDB_IMG } from '../data/mockData';
import api from '../lib/api';

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} viewBox="0 0 20 20" className={`w-4 h-4 ${s <= Math.round(value / 2) ? 'text-cinema-accent' : 'text-cinema-border'}`} fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-cinema-muted text-sm ml-1">{value?.toFixed(1) || 0}/10</span>
    </div>
  );
}

export default function HeroBanner() {
  const [slides, setSlides] = useState([]);
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    async function loadMovies() {
      try {
        const res = await api.get('/movies', { params: { limit: 6, sortBy: 'rating' } });
        setSlides(res.data.data.items);
      } catch (err) {
        console.error('Failed to load hero movies', err);
      }
    }
    loadMovies();
  }, []);

  const goTo = (idx) => {
    if (idx === active) return;
    setFading(true);
    setTimeout(() => {
      setActive(idx);
      setFading(false);
    }, 350);
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActive(prev => (prev + 1) % slides.length);
        setFading(false);
      }, 350);
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, [slides.length]);

  if (slides.length === 0) {
    return <section className="w-full bg-cinema-surface skeleton" style={{ height: 'min(85vh, 680px)' }} />;
  }

  const slide = slides[active];
  return (
    <section className="relative w-full overflow-hidden" style={{ height: 'min(85vh, 680px)' }}>
      {/* Backdrop */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}>
        <img
          key={slide._id}
          src={slide.backdropUrl || `${TMDB_ORIG}${slide.backdropPath}`}
          alt={slide.title}
          className="w-full h-full object-cover object-top"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-card-gradient" />
      </div>

      {/* Content */}
      <div className={`relative z-10 h-full flex items-center transition-all duration-500 ${fading ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 w-full flex flex-col lg:flex-row items-end lg:items-center justify-between gap-10">
          
          {/* Main Info */}
          <div className="flex-1 max-w-xl space-y-5 text-left w-full z-20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-[#1b263b] rounded-full pl-2 pr-4 py-1 border border-blue-500/30">
                 <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                 <span className="text-blue-500 text-xs font-semibold uppercase tracking-wider">Featured</span>
              </div>
              <span className="text-white/60 text-sm font-medium">{slide.releaseDate ? new Date(slide.releaseDate).getFullYear() : slide.year || ''}</span>
            </div>

            <div className="flex gap-2">
              {slide.genres?.slice(0, 3).map(g => (
                <span key={g} className="px-3 py-1 rounded-full border border-white/20 text-white/80 text-xs font-medium bg-white/5">
                  {g}
                </span>
              ))}
            </div>

            <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-white leading-tight tracking-tight drop-shadow-lg">
              {slide.title}
            </h1>

            {slide.tagline && <p className="text-blue-400 font-medium text-base italic">"{slide.tagline}"</p>}

            <div className="flex items-center gap-4 text-cinema-muted text-sm font-medium drop-shadow-md">
              <StarRating value={slide.rating} />
              <span className="text-white/80">{slide.rating?.toFixed(1)} <span className="text-white/40 text-xs">/10</span></span>
              <span className="w-px h-4 bg-cinema-border" />
              <span>{slide.runtime} min</span>
              <span className="w-px h-4 bg-cinema-border" />
              <span>Dir. {slide.director || "Unknown"}</span>
            </div>

            <p className="text-gray-300 leading-relaxed text-sm md:text-base line-clamp-3 drop-shadow-md max-w-lg">
              {slide.overview}
            </p>

            <div className="flex gap-3 pt-4">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/30">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Watch Trailer
              </button>
              <button className="border-2 border-white/30 text-white hover:bg-white/10 px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Add to List
              </button>
            </div>
          </div>

          {/* Cover Flow Carousel */}
          <div className="w-full lg:w-[500px] h-[400px] relative flex justify-center items-center perspective-1000 hidden md:flex z-10">
            {slides.map((s, i) => {
              const diff = i - active;
              let adjustedDiff = diff;
              const half = Math.floor(slides.length / 2);
              
              if (adjustedDiff > half) adjustedDiff -= slides.length;
              if (adjustedDiff < -half) adjustedDiff += slides.length;

              // Only show items within -2 and +2 range
              if (Math.abs(adjustedDiff) > 2) return null;

              const isCenter = adjustedDiff === 0;
              const translateX = adjustedDiff * 140; // 140px spacing
              const scale = isCenter ? 1 : 1 - Math.abs(adjustedDiff) * 0.15;
              const zIndex = 30 - Math.abs(adjustedDiff);
              const opacity = isCenter ? 1 : 1 - Math.abs(adjustedDiff) * 0.4;
              
              return (
                <div 
                  key={s._id}
                  onClick={() => goTo(i)}
                  className={`absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[220px] aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-out shadow-2xl
                    ${isCenter ? 'ring-2 ring-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)]' : 'hover:scale-[0.9]'}
                  `}
                  style={{
                    transform: `translate(calc(-50% + ${translateX}px), -50%) scale(${scale})`,
                    zIndex,
                    opacity
                  }}
                >
                  <img src={s.posterUrl || `${TMDB_IMG}${s.posterPath}`} alt={s.title} className="w-full h-full object-cover" />
                  
                  <div className="absolute inset-0 bg-black/30" />

                  {isCenter && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 pb-3">
                      <p className="text-white font-bold text-sm tracking-wide shadow-black drop-shadow-md">{s.title}</p>
                      <p className="text-blue-400 text-xs font-semibold uppercase">{s.releaseDate ? new Date(s.releaseDate).getFullYear() : s.year || ''}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {slides.map((s, i) => (
          <button
            key={s._id || i}
            onClick={() => goTo(i)}
            className={`transition-all duration-300 rounded-full h-1.5 ${i === active ? 'w-8 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'w-2 bg-white/30 hover:bg-white/60'}`}
          />
        ))}
      </div>
    </section>
  );
}
