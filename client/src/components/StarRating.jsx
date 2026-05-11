import { useState } from 'react';

/** Display-only fractional star fill */
export function StarDisplay({ rating, max = 5, size = 'sm' }) {
  const sizes = { xs: 'w-3 h-3', sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  const cls   = sizes[size] || sizes.sm;
  const pct   = Math.min(100, (rating / max) * 100);

  return (
    <div className="flex items-center gap-1" title={`${rating} / ${max}`}>
      <div className="relative flex gap-0.5">
        <div className="flex gap-0.5 text-cinema-border">
          {Array.from({ length: max }).map((_, i) => (
            <svg key={i} viewBox="0 0 24 24" fill="currentColor" className={cls}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ))}
        </div>
        <div className="absolute inset-0 flex gap-0.5 text-cinema-accent overflow-hidden"
             style={{ width: `${pct}%` }}>
          {Array.from({ length: max }).map((_, i) => (
            <svg key={i} viewBox="0 0 24 24" fill="currentColor" className={`${cls} flex-shrink-0`}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ))}
        </div>
      </div>
      <span className="text-cinema-muted text-xs ml-0.5">{rating.toFixed(1)}</span>
    </div>
  );
}

/** Interactive half-star picker */
export function StarPicker({ value = 0, onChange, size = 'lg' }) {
  const [hovered, setHovered] = useState(0);
  const sizes = { sm: 'w-5 h-5', md: 'w-6 h-6', lg: 'w-8 h-8' };
  const cls   = sizes[size] || sizes.lg;
  const display = hovered || value;

  return (
    <div className="flex gap-0.5" onMouseLeave={() => setHovered(0)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const full = i + 1;
        const half = i + 0.5;
        return (
          <div key={i} className="relative cursor-pointer">
            <div className="absolute left-0 top-0 w-1/2 h-full z-10"
                 onMouseEnter={() => setHovered(half)}
                 onClick={() => onChange(half)} />
            <div className="absolute right-0 top-0 w-1/2 h-full z-10"
                 onMouseEnter={() => setHovered(full)}
                 onClick={() => onChange(full)} />
            <svg viewBox="0 0 24 24" fill="currentColor"
                 className={`${cls} transition-colors duration-100 ${
                   display >= full
                     ? 'text-cinema-accent'
                     : display >= half
                     ? 'text-cinema-accent/50'
                     : 'text-cinema-border'
                 }`}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        );
      })}
      {value > 0 && (
        <span className="text-cinema-muted text-sm ml-2 self-center">{value}/5</span>
      )}
    </div>
  );
}
