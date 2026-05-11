const fs = require('fs');
let p = fs.readFileSync('client/src/pages/MovieDetailPage.jsx', 'utf8');
p = p.replace(
  /\{\/\* Reviews Section \*\/\}\s*<div className="mt-14">\s*<div className="flex items-center gap-3 mb-6">\s*<h2 className="font-display font-bold text-xl text-cinema-text">Member Reviews<\/h2>\s*<div className="flex-1 h-px bg-cinema-border" \/>\s*<span className="text-cinema-muted text-sm">\{reviews\.length\} review\{reviews\.length !== 1 \? 's' : ''\}<\/span>\s*<\/div>\s*\{loadingReviews \? \(\s*<div className="space-y-4">\s*\{\[1,2,3\]\.map\(i => <div key=\{i\} className="skeleton h-28 rounded-2xl" \/>\)\}\s*<\/div>\s*\) : reviews\.length === 0 \? \(\s*<div className="text-center py-12 text-cinema-muted">\s*<p>No reviews yet\. Be the first! 🎬<\/p>\s*<\/div>\s*\) : \(\s*<div className="space-y-4">\s*\{reviews\.map\(r => <ReviewCard key=\{r\._id\} review=\{r\} \/>\)\}\s*<\/div>\s*\)\}\s*<\/div>/g,
  \{/* Reviews Section */}
        <div className="mt-14 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-display font-bold text-xl text-cinema-text">Member Reviews</h2>
              <div className="flex-1 h-px bg-cinema-border" />
              <span className="text-cinema-muted text-sm">\ review\</span>
            </div>
            {loadingReviews ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 text-cinema-muted">
                <p>No reviews yet. Be the first! ??</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => <ReviewCard key={r._id} review={r} />)}
              </div>
            )}
          </div>

          <div className="w-full md:w-80 flex-shrink-0">
             <div className="flex items-center gap-3 mb-6">
              <h2 className="font-display font-bold text-xl text-cinema-text">Similar</h2>
              <div className="flex-1 h-px bg-cinema-border" />
            </div>
            {loadingSimilar ? (
              <div className="flex flex-wrap gap-2">
                {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton w-[30%] h-24 rounded-lg" />)}
              </div>
            ) : similarMovies.length === 0 ? (
               <div className="text-sm text-cinema-muted">No similar movies found.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {similarMovies.map(m => (
                  <Link key={m._id} to={\/movies/\\} className="block relative w-[31%] h-28 flex-shrink-0 rounded-lg overflow-hidden group border border-cinema-border hover:border-cinema-accent transition-all">
                     <img 
                        src={m.posterPath || heroFallback} 
                        alt={m.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>\  
);
fs.writeFileSync('client/src/pages/MovieDetailPage.jsx', p);
