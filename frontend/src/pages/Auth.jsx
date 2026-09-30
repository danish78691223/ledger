import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth({ mode }) {
  const { user, login, register } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const target = typeof loc.state?.from === 'string' && loc.state.from.startsWith('/')
    ? loc.state.from
    : '/';

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login({ email: form.email.trim(), password: form.password });
      } else {
        await register({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password
        });
      }

      nav(target, { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to complete the request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    nav(mode === 'login' ? '/register' : '/login', {
      replace: true,
      state: loc.state
    });
  };

  return (
    <div className="auth">
      <form className="card authbox" onSubmit={submit}>
        <h1>Ledger</h1>
        <p className="muted">{mode === 'login' ? 'Login to your account' : 'Create your account'}</p>

        {mode === 'register' && (
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            autoComplete="name"
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          autoComplete="email"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          minLength="6"
          required
        />

        {error && <div className="error">{error}</div>}

        <button className="primary" type="submit" disabled={submitting}>
          {submitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
        </button>

        <button className="link-button" type="button" onClick={switchMode}>
          {mode === 'login' ? 'Create account' : 'Already have an account? Login'}
        </button>
      </form>
    </div>
  );
}