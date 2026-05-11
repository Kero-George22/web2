const fs = require('fs');
let p = fs.readFileSync('client/src/pages/MovieDetailPage.jsx', 'utf8');

const target1 = \{/* Reviews Section */}
        <div className="mt-14">\;
const repl1 = \{/* Reviews Section */}
        <div className="mt-14 flex flex-col md:flex-row gap-8">
          <div className="flex-1">\;

const target2 = \{reviews.map(r => <ReviewCard key={r._id} review={r} />)}
            </div>
          )}
        </div>\;
const repl2 = \{reviews.map(r => <ReviewCard key={r._id} review={r} />)}
            </div>
          )}
        </div>

          {/* Similar Movies Section */}
          <div className="w-full md:w-80 flex-shrink-0">
             <div className="flex items-center gap-3 mb-6">
              <h2 className="font-display font-bold text-xl text-cinema-text">Similar</h2>
              <div className="flex-1 h-px bg-cinema-border" />
            </div>
            {loadingSimilar ? (
              <div className="flex flex-wrap gap-2">
                {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton w-[31%] h-28 rounded-lg" />)}
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
          </div>\;

p = p.replace(target1, repl1);
p = p.replace(target2, repl2);

fs.writeFileSync('client/src/pages/MovieDetailPage.jsx', p);
