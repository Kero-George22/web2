import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider }    from './contexts/AuthContext';
import { ToastProvider }   from './components/Toast';
import ProtectedRoute      from './components/ProtectedRoute';
import Navbar              from './components/Navbar';
import Chatbot             from './components/Chatbot';
import Footer              from './components/Footer';

// Public pages
import HomePage            from './pages/HomePage';
import MoviesPage          from './pages/MoviesPage';
import MovieDetailPage     from './pages/MovieDetailPage';
import UserProfilePage     from './pages/UserProfilePage';
import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';

// Authenticated pages
import ProfilePage         from './pages/ProfilePage';
import WatchlistPage       from './pages/WatchlistPage';
import ListsPage           from './pages/ListsPage';
import ListDetailPage      from './pages/ListDetailPage';

// Admin pages
import AdminDashboard      from './pages/admin/AdminDashboard';
import AdminUsers          from './pages/admin/AdminUsers';
import AdminMovies         from './pages/admin/AdminMovies';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-cinema-bg">
            <Navbar />
            <main className="flex-1 pt-16">
              <Routes>
                {/* ── Public ── */}
                <Route path="/"           element={<HomePage />} />
                <Route path="/movies"     element={<MoviesPage />} />
                <Route path="/films"      element={<MoviesPage forcedType="movie" />} />
                <Route path="/series"     element={<MoviesPage forcedType="tv" />} />
                <Route path="/movies/:id" element={<MovieDetailPage />} />
                <Route path="/users/:id"  element={<UserProfilePage />} />
                <Route path="/login"      element={<LoginPage />} />
                <Route path="/register"   element={<RegisterPage />} />

                {/* ── Authenticated ── */}
                <Route path="/profile" element={
                  <ProtectedRoute><ProfilePage /></ProtectedRoute>
                } />
                <Route path="/watchlist" element={
                  <ProtectedRoute><WatchlistPage /></ProtectedRoute>
                } />
                <Route path="/lists" element={
                  <ProtectedRoute><ListsPage /></ProtectedRoute>
                } />
                <Route path="/lists/:id" element={
                  <ProtectedRoute><ListDetailPage /></ProtectedRoute>
                } />


                {/* ── Admin ── */}
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>
                } />
                <Route path="/admin/movies" element={
                  <ProtectedRoute requireAdmin><AdminMovies /></ProtectedRoute>
                } />

                {/* ── 404 ── */}
                <Route path="*" element={
                  <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
                    <p className="text-8xl mb-6">🎬</p>
                    <h1 className="font-display font-black text-4xl text-cinema-text mb-3">404 — Scene Not Found</h1>
                    <p className="text-cinema-muted mb-8">This page doesn't exist in our film reel.</p>
                    <a href="/" className="btn-primary">Go Home</a>
                  </div>
                } />
              </Routes>
            </main>
            <Footer />
            <Chatbot />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
