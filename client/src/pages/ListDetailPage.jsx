import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import MovieCard from '../components/MovieCard';

export default function ListDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', isPublic: false });

  const loadList = () => {
    api.get(`/lists/${id}`)
      .then(res => setList(res.data.data))
      .catch(err => {
        toast(err.message || 'Failed to load list', 'error');
        navigate('/lists');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadList();
  }, [id, navigate, toast]);

  const handleEditClick = () => {
    setEditForm({
      title: list.title,
      description: list.description || '',
      isPublic: list.isPublic
    });
    setIsEditing(true);
  };

  const handleUpdateList = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/lists/${id}`, editForm);
      toast('List updated', 'success');
      setIsEditing(false);
      loadList();
    } catch (err) {
      toast(err.message || 'Failed to update list', 'error');
    }
  };

  const handleDeleteList = async () => {
    if (!window.confirm('Are you sure you want to delete this list?')) return;
    try {
      await api.delete(`/lists/${id}`);
      toast('List deleted', 'success');
      navigate('/lists');
    } catch (err) {
      toast(err.message || 'Failed to delete list', 'error');
    }
  };

  const handleRemoveMovie = async (movieId) => {
    if (!window.confirm('Remove this movie from the list?')) return;
    try {
      await api.delete(`/lists/${id}/movies/${movieId}`);
      toast('Movie removed', 'success');
      setList(prev => ({
        ...prev,
        movies: prev.movies.filter(m => m._id !== movieId)
      }));
    } catch (err) {
      toast(err.message || 'Failed to remove movie', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-cinema-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!list) return null;

  const isOwner = user && list.userId && (list.userId._id === user._id || list.userId === user._id);

  return (
    <div className="min-h-screen pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="mb-8">
          <Link to="/lists" className="text-cinema-accent hover:brightness-110 text-sm mb-4 inline-block">← Back to Lists</Link>
          {isEditing ? (
            <form onSubmit={handleUpdateList} className="space-y-4 bg-cinema-card p-6 rounded-2xl border border-cinema-border">
              <div>
                <label className="text-cinema-muted text-sm block mb-1">Title</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={editForm.title} 
                  onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-4 py-2 text-cinema-text outline-none focus:border-cinema-accent"
                />
              </div>
              <div>
                <label className="text-cinema-muted text-sm block mb-1">Description (optional)</label>
                <textarea 
                  value={editForm.description} 
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-4 py-2 text-cinema-text outline-none focus:border-cinema-accent resize-none"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-cinema-text cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={editForm.isPublic} 
                  onChange={e => setEditForm(f => ({ ...f, isPublic: e.target.checked }))}
                  className="accent-cinema-accent"
                />
                Public list (visible to everyone)
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary">Save Changes</button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display font-black text-3xl text-cinema-text">{list.title}</h1>
                {list.description && <p className="text-cinema-muted mt-2">{list.description}</p>}
                <p className="text-cinema-muted text-sm mt-1">
                  Created by{' '}
                  {list.userId?._id ? (
                    <Link to={`/users/${list.userId._id}`} className="text-cinema-accent hover:brightness-110">
                      {list.userId?.username || 'Unknown'}
                    </Link>
                  ) : (
                    <span>{list.userId?.username || 'Unknown'}</span>
                  )}{' '}
                  · {list.movies?.length || 0} films
                </p>
              </div>
              {isOwner && (
                <div className="flex flex-col items-end gap-2">
                  <span className="bg-cinema-surface border border-cinema-border text-cinema-muted px-3 py-1 rounded-full text-xs">
                    {list.isPublic ? 'Public' : 'Private'}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={handleEditClick} className="text-xs text-cinema-muted hover:text-cinema-accent">Edit List</button>
                    <button onClick={handleDeleteList} className="text-xs text-red-500 hover:text-red-400">Delete List</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {list.movies && list.movies.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {list.movies.map(m => (
              <div key={m._id} className="relative group">
                <MovieCard movie={m} />
                {isOwner && (
                  <button 
                    onClick={() => handleRemoveMovie(m._id)}
                    className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/70 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 z-10"
                    title="Remove from list"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-cinema-muted">
            <div className="text-5xl mb-4">🎬</div>
            <p>No films in this list yet.</p>
            {isOwner && <Link to="/movies" className="btn-primary mt-6 inline-block">Browse Films</Link>}
          </div>
        )}
      </div>
    </div>
  );
}
