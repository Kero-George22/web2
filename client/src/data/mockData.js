// Mock data using real TMDB poster/backdrop paths
// Images served via https://image.tmdb.org/t/p/

export const TMDB_IMG  = 'https://image.tmdb.org/t/p/w500';
export const TMDB_ORIG = 'https://image.tmdb.org/t/p/original';

export const FEATURED_MOVIE = {
  id:           27205,
  title:        'Inception',
  tagline:      'Your mind is the scene of the crime.',
  overview:     'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person\'s idea into a target\'s subconscious.',
  backdropPath: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
  posterPath:   '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
  releaseDate:  '2010-07-16',
  rating:       8.8,
  runtime:      148,
  genres:       ['Science Fiction', 'Action', 'Adventure'],
  director:     'Christopher Nolan',
};

export const TRENDING = [
  { id: 238,   title: 'The Godfather',         posterPath: '/3bhkrj58Vtu7enYsLeFJQMk5M37.jpg', rating: 4.9, year: 1972, genres: ['Drama', 'Crime'] },
  { id: 680,   title: 'Pulp Fiction',           posterPath: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', rating: 4.7, year: 1994, genres: ['Thriller', 'Crime'] },
  { id: 13,    title: 'Forrest Gump',           posterPath: '/saHP97rTPS5eLmrLQEcANmKrsFl.jpg', rating: 4.5, year: 1994, genres: ['Comedy', 'Drama'] },
  { id: 155,   title: 'The Dark Knight',        posterPath: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', rating: 4.8, year: 2008, genres: ['Action', 'Crime'] },
  { id: 11216, title: 'Cinema Paradiso',        posterPath: '/gCI2AeMV6IHjspXuHqjCsiqZMqe.jpg', rating: 4.6, year: 1988, genres: ['Drama', 'Romance'] },
  { id: 497,   title: 'The Green Mile',         posterPath: '/velWPhVMQeQKcxggNEU8YmU1K8W.jpg', rating: 4.5, year: 1999, genres: ['Fantasy', 'Drama'] },
];

export const HIGHEST_RATED = [
  { id: 278,  title: 'The Shawshank Redemption', posterPath: '/lyQBXzOQSuE59IsHyhrp0qIiPAz.jpg', rating: 4.9, year: 1994, genres: ['Drama'] },
  { id: 424,  title: "Schindler's List",          posterPath: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg', rating: 4.8, year: 1993, genres: ['Drama', 'History'] },
  { id: 389,  title: '12 Angry Men',              posterPath: '/ppd84D2i9W8jXmsyInGyihiSyqz.jpg', rating: 4.7, year: 1957, genres: ['Drama'] },
  { id: 19404,title: 'Dilwale Dulhania Le Jayenge',posterPath: '/2CAL2433ZeIihfX1Hb2139CX0pW.jpg', rating: 4.6, year: 1995, genres: ['Comedy', 'Drama'] },
  { id: 637,  title: 'Life Is Beautiful',         posterPath: '/f7DImXDebOs148U4uPjI61iDvaK.jpg', rating: 4.6, year: 1997, genres: ['Comedy', 'Drama'] },
  { id: 129,  title: "Spirited Away",             posterPath: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', rating: 4.7, year: 2001, genres: ['Animation', 'Family'] },
];

export const RECENT_REVIEWS = [
  { id: 1, user: 'alex_w',    avatar: null, movie: 'Oppenheimer',   rating: 5,   comment: 'A cinematic tour de force. Nolan outdoes himself at every turn.',      moviePoster: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg' },
  { id: 2, user: 'sarah_m',   avatar: null, movie: 'Past Lives',    rating: 4.5, comment: 'Heartbreakingly beautiful. One of the finest films in years.',           moviePoster: '/k3waqVXSnYUZSc8TFAGFpHHXGBk.jpg' },
  { id: 3, user: 'film_buff', avatar: null, movie: 'Anatomy of a Fall', rating: 4, comment: 'Gripping and morally complex. The courtroom scenes are unforgettable.', moviePoster: '/iWkVrJl7JZN5mLhDy2UlCRFhUPb.jpg' },
];
