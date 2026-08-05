import { useEffect, useMemo, useState } from 'react';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { SaveIcon } from '../../components/Icons';

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
    </label>
  );
}

function listToText(value) {
  if (Array.isArray(value)) return value.join(', ');
  return value || '';
}

function textToList(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function SupplierProfilePage() {
  const user = useAuthStore((s) => s.user);
  const pushToast = useToastStore((s) => s.pushToast);
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/profiles/supplier')
      .then(({ data }) => setProfile(data.profile))
      .finally(() => setLoading(false));
  }, []);

  const locationLine = useMemo(() => {
    if (!profile?.address) return '';
    return [profile.address.city, profile.address.state, profile.address.country]
      .filter(Boolean)
      .join(', ');
  }, [profile]);

  function setField(key, value) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function setAddress(key, value) {
    setProfile((prev) => ({
      ...prev,
      address: { ...(prev.address || {}), [key]: value },
    }));
  }

  async function save(e) {
    e.preventDefault();
    if (!profile || saving) return;
    setSaving(true);
    try {
      const payload = {
        ...profile,
        productCategories: Array.isArray(profile.productCategories)
          ? profile.productCategories
          : textToList(profile.productCategories),
        fabricTypesOffered: Array.isArray(profile.fabricTypesOffered)
          ? profile.fabricTypesOffered
          : textToList(profile.fabricTypesOffered),
      };
      const { data } = await api.put('/profiles/supplier', payload);
      setProfile(data.profile);
      pushToast({
        title: 'Profile saved',
        body: 'Mill details are updated on GREIGE.',
        tone: 'success',
      });
    } catch (err) {
      pushToast({
        title: 'Could not save profile',
        body: err.response?.data?.message || err.message || 'Please try again.',
        tone: 'error',
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !profile) {
    return <p className="text-ink-soft">Loading mill profile…</p>;
  }

  const categories = Array.isArray(profile.productCategories)
    ? profile.productCategories
    : textToList(profile.productCategories);
  const fabrics = Array.isArray(profile.fabricTypesOffered)
    ? profile.fabricTypesOffered
    : textToList(profile.fabricTypesOffered);

  return (
    <div className="space-y-8">
      <div className="overflow-hidden border border-line">
        <div className="bg-ink px-5 py-8 text-linen md:px-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-linen/55">
            Mill identity
          </p>
          <h1 className="mt-2 font-display text-5xl leading-none tracking-[0.02em]">
            {profile.businessName || 'Your mill'}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-linen/70">
            {profile.businessType || 'Supplier'}
            {locationLine ? ` · ${locationLine}` : ''}
            {profile.moq ? ` · MOQ ${profile.moq}` : ''}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.slice(0, 6).map((c) => (
              <span
                key={c}
                className="border border-linen/25 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-linen/80"
              >
                {c}
              </span>
            ))}
            {categories.length === 0 ? (
              <span className="text-sm text-linen/50">Add product categories below</span>
            ) : null}
          </div>
        </div>
        <div className="grid gap-px bg-line sm:grid-cols-3">
          <div className="bg-panel px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">Signed in as</p>
            <p className="mt-1 text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-ink-soft">{user?.email}</p>
          </div>
          <div className="bg-panel px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">Hours</p>
            <p className="mt-1 text-sm font-medium">{profile.operatingHours || 'Not set'}</p>
          </div>
          <div className="bg-panel px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">Contact</p>
            <p className="mt-1 text-sm font-medium">{profile.contactPhone || 'Not set'}</p>
            <p className="text-xs text-ink-soft">{profile.contactEmail || user?.email}</p>
          </div>
        </div>
      </div>

      <form onSubmit={save} className="space-y-6">
        <section className="panel-surface p-5 md:p-6">
          <h2 className="font-display text-3xl leading-none">Business</h2>
          <p className="mt-2 text-sm text-ink-soft">How your mill appears to buyers on GREIGE.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Business / mill name">
              <input
                value={profile.businessName || ''}
                onChange={(e) => setField('businessName', e.target.value)}
                className="input-field"
                required
              />
            </Field>
            <Field label="Business type">
              <input
                value={profile.businessType || ''}
                onChange={(e) => setField('businessType', e.target.value)}
                placeholder="e.g. Fabric mill, Weaver, Trading house"
                className="input-field"
              />
            </Field>
            <Field label="Minimum order quantity (MOQ)">
              <input
                value={profile.moq || ''}
                onChange={(e) => setField('moq', e.target.value)}
                placeholder="e.g. 200 meters"
                className="input-field"
              />
            </Field>
            <Field label="Operating hours">
              <input
                value={profile.operatingHours || ''}
                onChange={(e) => setField('operatingHours', e.target.value)}
                placeholder="e.g. Mon–Sat 9:00–18:00 IST"
                className="input-field"
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Additional info">
                <textarea
                  value={profile.additionalInfo || ''}
                  onChange={(e) => setField('additionalInfo', e.target.value)}
                  rows={3}
                  placeholder="Lead times, dyeing capability, certifications…"
                  className="input-field resize-y"
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="panel-surface p-5 md:p-6">
          <h2 className="font-display text-3xl leading-none">Contact</h2>
          <p className="mt-2 text-sm text-ink-soft">Buyer-facing phone and email for sourcing calls.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Contact phone">
              <input
                value={profile.contactPhone || ''}
                onChange={(e) => setField('contactPhone', e.target.value)}
                className="input-field"
              />
            </Field>
            <Field label="Contact email">
              <input
                type="email"
                value={profile.contactEmail || ''}
                onChange={(e) => setField('contactEmail', e.target.value)}
                className="input-field"
              />
            </Field>
          </div>
        </section>

        <section className="panel-surface p-5 md:p-6">
          <h2 className="font-display text-3xl leading-none">Mill address</h2>
          <p className="mt-2 text-sm text-ink-soft">Where your loom and dispatch sit.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Field label="Street / line 1">
                <input
                  value={profile.address?.line1 || ''}
                  onChange={(e) => setAddress('line1', e.target.value)}
                  className="input-field"
                />
              </Field>
            </div>
            <Field label="City">
              <input
                value={profile.address?.city || ''}
                onChange={(e) => setAddress('city', e.target.value)}
                className="input-field"
              />
            </Field>
            <Field label="State">
              <input
                value={profile.address?.state || ''}
                onChange={(e) => setAddress('state', e.target.value)}
                className="input-field"
              />
            </Field>
            <Field label="Country">
              <input
                value={profile.address?.country || ''}
                onChange={(e) => setAddress('country', e.target.value)}
                className="input-field"
              />
            </Field>
            <Field label="Postal code">
              <input
                value={profile.address?.postalCode || ''}
                onChange={(e) => setAddress('postalCode', e.target.value)}
                className="input-field"
              />
            </Field>
          </div>
        </section>

        <section className="panel-surface p-5 md:p-6">
          <h2 className="font-display text-3xl leading-none">Catalog focus</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Categories and constructions buyers should expect from your floor.
          </p>
          <div className="mt-5 grid gap-4">
            <Field label="Product categories" hint="Comma-separated — e.g. Cotton, Linen, Denim">
              <input
                value={listToText(profile.productCategories)}
                onChange={(e) => setField('productCategories', textToList(e.target.value))}
                className="input-field"
              />
            </Field>
            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <span key={c} className="border border-line bg-white/40 px-2.5 py-1 text-sm">
                    {c}
                  </span>
                ))}
              </div>
            ) : null}
            <Field
              label="Fabric types offered"
              hint="Comma-separated — e.g. Poplin, Twill, Jersey"
            >
              <input
                value={listToText(profile.fabricTypesOffered)}
                onChange={(e) => setField('fabricTypesOffered', textToList(e.target.value))}
                className="input-field"
              />
            </Field>
            {fabrics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {fabrics.map((f) => (
                  <span key={f} className="border border-line bg-white/40 px-2.5 py-1 text-sm">
                    {f}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-panel px-5 py-4">
          <p className="text-sm text-ink-soft">
            Changes publish to your mill console and buyer-facing mill details.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
          >
            <SaveIcon className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
