import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowRightIcon, LoginIcon } from '../components/Icons';

export default function RegisterSupplierPage() {
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    businessName: '',
    email: '',
    password: '',
    businessType: '',
  });
  const [error, setError] = useState('');

  function setField(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: 'supplier',
        businessName: form.businessName.trim() || form.name.trim(),
        businessType: form.businessType.trim(),
      });
      navigate('/supplier/onboarding');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12 md:px-6">
      <Link to="/welcome" className="font-display text-4xl tracking-[0.04em]">
        GREIGE
      </Link>
      <p className="mt-2 text-sm text-ink-soft">Supplier / mill registration</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <h1 className="font-display text-4xl leading-none">Create mill account</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            List greige and finished cloths, run your order pipeline, and keep mill details visible
            to buyers.
          </p>
        </div>

        {error ? <p className="text-sm text-rust">{error}</p> : null}

        <label className="block text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          Contact name
          <input
            required
            value={form.name}
            onChange={setField('name')}
            placeholder="e.g. Ravi Kumar"
            className="input-field mt-2 normal-case tracking-normal"
          />
        </label>

        <label className="block text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          Mill / business name
          <input
            required
            value={form.businessName}
            onChange={setField('businessName')}
            placeholder="e.g. Mill House Textiles"
            className="input-field mt-2 normal-case tracking-normal"
          />
        </label>

        <label className="block text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          Work email
          <input
            type="email"
            required
            value={form.email}
            onChange={setField('email')}
            placeholder="sales@mill.com"
            className="input-field mt-2 normal-case tracking-normal"
          />
        </label>

        <label className="block text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={setField('password')}
            placeholder="At least 6 characters"
            className="input-field mt-2 normal-case tracking-normal"
          />
        </label>

        <label className="block text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          Business type <span className="normal-case tracking-normal text-ink-soft/70">(optional)</span>
          <input
            value={form.businessType}
            onChange={setField('businessType')}
            placeholder="e.g. Fabric mill, weaver, trading house"
            className="input-field mt-2 normal-case tracking-normal"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary inline-flex w-full items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create mill account'}
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-8 space-y-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">Other options</p>
        <Link
          to="/login"
          className="btn-secondary inline-flex w-full items-center justify-between gap-2 py-3 text-sm"
        >
          <span className="inline-flex items-center gap-2">
            <LoginIcon className="h-4 w-4" />
            Already have an account? Sign in
          </span>
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/register/buyer"
            className="inline-flex items-center justify-center border border-line bg-white/50 px-3 py-2.5 text-sm font-medium text-ink transition hover:border-ink hover:bg-white"
          >
            Register as buyer
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center border border-line bg-white/50 px-3 py-2.5 text-sm font-medium text-ink transition hover:border-ink hover:bg-white"
          >
            Account types
          </Link>
        </div>
      </div>
    </div>
  );
}
