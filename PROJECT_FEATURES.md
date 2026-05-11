# Project Features Documentation (Letterboxd Clone)

This document provides a comprehensive overview of the features currently implemented in the application.

## 🛠 Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **External Services:** TMDB API (Movie Data), Gemini AI API (AI features)
- **File Uploads:** Multer (Local storage for Avatars)

---

## 🌟 Core Features

### 1. 🔐 User Authentication & Authorization
- **Sign Up / Log In:** Secure user registration and login system using JWT (JSON Web Tokens).
- **Role-Based Access:** Distinguishes between regular users and Admin users.
- **Protected Routes:** Ensures only authenticated users can access specific pages (e.g., Profile, Watchlist, Settings).

### 2. 👤 User Profiles & Customization
- **Custom Avatars:** Users can upload profile pictures directly from their local device (Handles `multipart/form-data` via Multer).
- **User Bio & Details:** Customizable user profiles displaying their activity.
- **Pinned Favorites:** Users can pin their favorite movies/shows to the top of their profile.
- **My Activity:** Shows a timeline of the user's reviews, ratings, and lists.

### 3. 🎬 Movies & TV Shows Integration
- **TMDB Integration:** Fetches accurate and rich metadata (Posters, Backdrops, Cast, Crew, Overview, Genres) from The Movie Database API.
- **Trending & Top Rated:** Displays dynamic carousels for trending, recent, and highly-rated media.
- **Advanced Search & Filtering:** Users can search for media by title, genre, language, and type (Movie or TV).

### 4. ✍️ Review & Rating System (Highly Interactive)
- **Star Ratings:** Users can rate media on a scale of 0.5 to 5.0 stars.
- **Reviews:** Users can write detailed reviews for movies and TV shows.
- **Social Features (Likes & Comments):** 
  - Users can "like" other people's reviews.
  - Users can reply/comment on specific reviews, fostering a community discussion.
- **Smart Aggregation:** The system automatically calculates and updates a movie's average rating based on all user reviews.

### 5. 📋 Lists & Watchlists
- **Watchlist:** A dedicated space for users to save movies they want to watch later.
- **Custom Lists:** Users can create custom-named lists (e.g., "Best of 2024", "Sci-Fi Masterpieces") and populate them with specific movies.

### 6. 🛡️ Admin Controls & Dashboard
- **Admin Dashboard:** A special interface only accessible by administrators (`isAdmin` middleware).
- **Database Management:** Admins can view and manage all Users, Movies, and Reviews.
- **Content Moderation (Deletions):** Admins can delete user accounts or specific reviews (equipped with safety `window.confirm` dialogs).

### 7. 🤖 AI Chatbot & Mascot (Zaza Robot)
- **Interactive AI Mascot:** Features a virtual assistant (Zaza Robot) built specifically for the app.
- **Powered by Gemini API:** The AI can recommend movies, answer cinema-related questions, and guide users through the platform.

---

### 💡 Recent Technical Enhancements
- Data integrity scripts to cleanly cascade deletions (e.g., automatically deleting associated views and reviews when a movie is removed).
- Safe and realistic fake-data population scripts targeting classic movies to increase realistic community engagement on the site.
- Implemented file upload capability for User Avatars, avoiding reliance solely on external URLs.
