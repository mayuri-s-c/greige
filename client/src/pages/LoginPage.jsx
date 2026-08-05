import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowRightIcon, HomeIcon, LoginIcon, UserIcon } from '../components/Icons';

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const user = await login(form);
      if (user.role === 'supplier') {
        navigate('/supplier');
        return;
      }
      const from = location.state?.from;
      const next =
        from?.pathname && !from.pathname.startsWith('/login')
          ? `${from.pathname}${from.search || ''}`
          : '/';
      navigate(next);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <Link to="/welcome" className="font-display text-4xl tracking-[0.04em] hover:opacity-80">
        GREIGE
      </Link>
      <p className="mt-2 text-ink-soft">From the loom, before the finish.</p>

      <form onSubmit={onSubmit} className="mt-10 space-y-4">
        <h1 className="font-display text-3xl leading-none">Sign in</h1>
        {error ? <p className="text-sm text-rust">{error}</p> : null}

        <label className="block">
          <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input-field w-full"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            Password
          </span>
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="Your password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input-field w-full"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary inline-flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LoginIcon className="h-4 w-4" />
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="mt-5 border border-line bg-white/40 px-3.5 py-3 text-sm text-ink-soft">
        <p className="text-[11px] uppercase tracking-[0.14em]">Demo accounts</p>
        <p className="mt-1.5 leading-relaxed">
          Buyer: <span className="font-medium text-ink">buyer@greige.demo</span>
          <br />
          Mill: <span className="font-medium text-ink">mill@greige.demo</span>
          <br />
          Password: <span className="font-medium text-ink">password123</span>
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">Continue without signing in</p>
        <Link
          to="/"
          className="btn-secondary inline-flex w-full items-center justify-between gap-2 py-3 text-sm"
        >
          <span className="inline-flex items-center gap-2">
            <HomeIcon className="h-4 w-4" />
            Browse Greige Floor
          </span>
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6 space-y-3 border-t border-line pt-6">
        <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">New to GREIGE?</p>
        <Link
          to="/register"
          className="btn-accent inline-flex w-full items-center justify-between gap-2 py-3 text-sm"
        >
          <span className="inline-flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Create an account
          </span>
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
