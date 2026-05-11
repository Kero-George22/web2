import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const toast        = useToast();
  const navigate     = useNavigate();

  const [form,    setForm]    = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) { toast('All fields are required', 'error'); return; }
    if (form.password.length < 8) { toast('Password must be at least 8 characters', 'error'); return; }
    if (form.password !== form.confirm) { toast('Passwords do not match', 'error'); return; }

    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      toast('Account created! Welcome to CineLog 🎬', 'success');
      navigate('/', { replace: true });
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: 'reg-username', name: 'username', label: 'Username',         type: 'text',     placeholder: 'cinephile42',     autoComplete: 'username' },
    { id: 'reg-email',    name: 'email',    label: 'Email address',    type: 'email',    placeholder: 'you@example.com', autoComplete: 'email' },
    { id: 'reg-password', name: 'password', label: 'Password',         type: 'password', placeholder: '••••••••',        autoComplete: 'new-password' },
    { id: 'reg-confirm',  name: 'confirm',  label: 'Confirm password', type: 'password', placeholder: '••••••••',        autoComplete: 'new-password' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20"
         style={{ background: 'radial-gradient(ellipse at 70% 20%, rgba(232,160,69,0.06) 0%, transparent 60%)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cinema-accent flex items-center justify-center shadow-glow">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-cinema-bg">
                <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2 2v12h12V6H6zm1 1l5 3.5L17 7v10l-5-3.5L7 17V7z"/>
              </svg>
            </div>
            <span className="font-display font-black text-2xl">
              <span className="text-cinema-accent">Cine</span><span className="text-cinema-text">Log</span>
            </span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-cinema-text">Create your account</h1>
          <p className="text-cinema-muted text-sm mt-1">Start logging films for free</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-cinema-card border border-cinema-border rounded-2xl p-8 space-y-4 shadow-xl"
        >
          {fields.map(f => (
            <div key={f.name} className="space-y-1.5">
              <label htmlFor={f.id} className="text-sm text-cinema-muted font-medium">{f.label}</label>
              <input
                id={f.id}
                type={f.type}
                name={f.name}
                autoComplete={f.autoComplete}
                value={form[f.name]}
                onChange={handleChange}
                placeholder={f.placeholder}
                className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-4 py-3 text-sm text-cinema-text placeholder-cinema-muted/60
                           outline-none focus:border-cinema-accent focus:ring-1 focus:ring-cinema-accent/30 transition-all"
              />
            </div>
          ))}

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="w-full btn-primary justify-center py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-cinema-bg/40 border-t-cinema-bg rounded-full animate-spin"/>Creating account…</span>
              : 'Create Free Account'}
          </button>

          <p className="text-center text-cinema-muted text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-cinema-accent hover:brightness-110 font-medium transition-all">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
