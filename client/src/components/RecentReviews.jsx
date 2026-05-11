import { TMDB_IMG } from '../data/mockData';

const REVIEWS = [
  {
    id: 1, username: 'alex_w',
    movie: 'Oppenheimer', year: 2023,
    posterPath: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    rating: 5,
    comment: 'A cinematic tour de force. Nolan outdoes himself at every turn — visually staggering and intellectually profound.',
    liked: true,
  },
  {
    id: 2, username: 'sarah_m',
    movie: 'Past Lives', year: 2023,
    posterPath: '/k3waqVXSnYUZSc8TFAGFpHHXGBk.jpg',
    rating: 4.5,
    comment: 'Heartbreakingly beautiful. One of the finest films in years. Celine Song is a masterful storyteller.',
    liked: true,
  },
  {
    id: 3, username: 'filmcritic99',
    movie: 'Anatomy of a Fall', year: 2023,
    posterPath: '/iWkVrJl7JZN5mLhDy2UlCRFhUPb.jpg',
    rating: 4,
    comment: 'Gripping and morally complex. The courtroom scenes are completely unforgettable — Sandra Hüller is extraordinary.',
    liked: false,
  },
];

function Avatar({ username }) {
  const hue = username.charCodeAt(0) * 17 % 360;
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
      style={{ background: `hsl(${hue},60%,45%)` }}
    >
      {username[0].toUpperCase()}
    </div>
  );
}

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} viewBox="0 0 20 20" fill="currentColor"
          className={`w-3 h-3 ${s <= Math.round(rating) ? 'text-cinema-accent' : 'text-cinema-border'}`}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

export default function RecentReviews() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {REVIEWS.map((r, i) => (
        <div
          key={r.id}
          className="bg-cinema-card border border-cinema-border rounded-2xl overflow-hidden hover:border-cinema-accent/40 transition-all duration-300 hover:shadow-card group"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          {/* Movie poster strip */}
          <div className="relative h-24 overflow-hidden">
            <img
              src={`${TMDB_IMG}${r.posterPath}`}
              alt={r.movie}
              className="w-full h-full object-cover object-top scale-110 group-hover:scale-100 transition-transform duration-500"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(26,29,36,0.95) 100%)' }} />
            <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
              <div>
                <p className="text-white font-display font-bold text-sm leading-tight">{r.movie}</p>
                <p className="text-cinema-muted text-xs">{r.year}</p>
              </div>
              {r.liked && (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-400 flex-shrink-0">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              )}
            </div>
          </div>

          {/* Review body */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Avatar username={r.username} />
              <div>
                <p className="text-cinema-text text-sm font-semibold">@{r.username}</p>
                <StarRow rating={r.rating} />
              </div>
            </div>
            <p className="text-cinema-muted text-sm leading-relaxed line-clamp-3 italic">
              "{r.comment}"
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
