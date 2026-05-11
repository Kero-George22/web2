import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TMDB_IMG } from '../data/mockData';
import heroFallback from '../assets/hero.png';

function StarFill({ rating }) {
  // rating is out of 5
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} viewBox="0 0 20 20" className={`w-3 h-3 ${s <= Math.round(rating) ? 'text-cinema-accent' : 'text-cinema-border'}`} fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

export default function MovieCard({ movie, size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  const wide = size === 'lg';

  const posterUrl = movie.posterPath && !imgError
    ? `${TMDB_IMG}${movie.posterPath}`
    : heroFallback;

  return (
    <Link to={`/movies/${movie._id || movie.id}`} className="movie-card group block">
      {/* Poster */}
      <div className={`relative overflow-hidden bg-cinema-surface ${wide ? 'aspect-[2/3]' : 'aspect-[2/3]'}`}>
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}

        {!posterUrl && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-cinema-card">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-cinema-border" fill="currentColor">
              <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm8 9l-4-4v8l4-4 4 4v-8l-4 4z"/>
            </svg>
            <span className="text-cinema-muted text-xs">{movie.title}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="card-overlay" />

        {/* Play button */}
        <div className="card-play">
          <div className="w-12 h-12 rounded-full bg-cinema-accent/90 flex items-center justify-center shadow-glow backdrop-blur-sm">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-cinema-bg ml-0.5">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        {/* Rating badge */}
        <div className="absolute top-2 right-2 flex flex-col items-end">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-cinema-accent">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span className="text-white text-xs font-semibold">
              {(Number(movie.averageRating ?? movie.rating ?? 0) || 0).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-display font-semibold text-cinema-text text-sm leading-tight line-clamp-1 group-hover:text-cinema-accent transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-cinema-muted text-xs">{movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : movie.year}</span>
          <StarFill rating={movie.averageRating || movie.rating || 0} />
        </div>
        {movie.genres?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {movie.genres.slice(0, 2).map(g => (
              <span key={g} className="text-[10px] px-1.5 py-0.5 rounded-full bg-cinema-surface text-cinema-muted border border-cinema-border">
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}





