import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/client';
import { fabricAccent, colorwayHex, pickPreviewColorway } from '../components/ProductCard';
import { SectionEyebrow } from '../components/ui';
import { ArrowRightIcon, SampleIcon } from '../components/Icons';

const QUICK_SWATCHES = [
  { label: 'Navy', hex: '#1e3a5f' },
  { label: 'Ivory', hex: '#f8fafc' },
  { label: 'Olive', hex: '#5c6b4a' },
  { label: 'Sand', hex: '#d2b48c' },
  { label: 'Charcoal', hex: '#334155' },
  { label: 'Burgundy', hex: '#6e2430' },
  { label: 'Sky', hex: '#7dd3fc' },
  { label: 'Black', hex: '#0f172a' },
];

const HAND_FEELS = ['', 'Soft', 'Crisp', 'Dry', 'Fluid', 'Structured', 'Warm'];

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** Average sampled pixels from an uploaded swatch photo. */
function dominantColorFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const size = 72;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let i = 0; i < data.length; i += 16) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          n += 1;
        }
        URL.revokeObjectURL(url);
        resolve({
          r: Math.round(r / n),
          g: Math.round(g / n),
          b: Math.round(b / n),
        });
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });
}

export default function SampleMatchPage() {
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [sampleRgb, setSampleRgb] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [targetGsm, setTargetGsm] = useState('');
  const [category, setCategory] = useState('');
  const [weave, setWeave] = useState('');
  const [handFeel, setHandFeel] = useState('');
  const [matches, setMatches] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ran, setRan] = useState(false);

  useEffect(() => {
    api.get('/products/meta/categories').then(({ data }) => {
      setCategories(data.categories || []);
    });
  }, []);

  useEffect(() => {
    const seed = location.state;
    if (!seed?.hex) return;
    const n = String(seed.hex).replace('#', '');
    if (n.length === 6) {
      setSampleRgb({
        r: parseInt(n.slice(0, 2), 16),
        g: parseInt(n.slice(2, 4), 16),
        b: parseInt(n.slice(4, 6), 16),
      });
    }
    if (seed.targetGsm) setTargetGsm(String(seed.targetGsm));
    if (seed.category) setCategory(seed.category);
  }, [location.state]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const sampleHex = useMemo(
    () => (sampleRgb ? rgbToHex(sampleRgb) : ''),
    [sampleRgb],
  );

  async function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      const rgb = await dominantColorFromFile(file);
      setSampleRgb(rgb);
    } catch {
      setError('Could not read that image. Try another photo or pick a swatch.');
    }
  }

  function pickSwatch(hex) {
    const n = hex.replace('#', '');
    setSampleRgb({
      r: parseInt(n.slice(0, 2), 16),
      g: parseInt(n.slice(2, 4), 16),
      b: parseInt(n.slice(4, 6), 16),
    });
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    setError('');
  }

  async function runMatch(e) {
    e?.preventDefault?.();
    if (!sampleRgb) {
      setError('Upload a swatch photo or pick a color first.');
      return;
    }
    setBusy(true);
    setError('');
    setRan(true);
    try {
      const { data } = await api.post('/ai/match-sample', {
        r: sampleRgb.r,
        g: sampleRgb.g,
        b: sampleRgb.b,
        targetGsm: targetGsm ? Number(targetGsm) : undefined,
        category: category || undefined,
        weave: weave || undefined,
        handFeel: handFeel || undefined,
      });
      setMatches(data.matches || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Match failed');
      setMatches([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <SectionEyebrow>Signature tool</SectionEyebrow>
          <h1 className="mt-1 font-display text-3xl leading-none md:text-5xl">Sample Match</h1>
          <p className="mt-3 max-w-xl text-sm text-ink-soft md:text-base">
            Bring a physical swatch — photo or tone — and GREIGE ranks mill cloths by color,
            GSM, weave, and hand-feel. Not another chatbot search.
          </p>
        </div>
        <Link to="/" className="text-sm text-indigo hover:underline">
          Back to Floor →
        </Link>
      </div>

      <form
        onSubmit={runMatch}
        className="mt-8 grid gap-6 border border-line bg-white/50 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:p-6"
      >
        <div className="space-y-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">1 · Sample tone</p>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-line bg-stone/60 px-4 py-8 text-center transition hover:border-indigo/40">
            <SampleIcon className="h-6 w-6 text-indigo" />
            <span className="text-sm font-medium text-ink">Upload swatch photo</span>
            <span className="text-xs text-ink-soft">We read the dominant cloth color</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={onFileChange}
            />
          </label>

          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              Or pick a tone
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SWATCHES.map((s) => (
                <button
                  key={s.hex}
                  type="button"
                  title={s.label}
                  onClick={() => pickSwatch(s.hex)}
                  className={`h-9 w-9 border transition ${
                    sampleHex.toLowerCase() === s.hex.toLowerCase()
                      ? 'border-ink ring-2 ring-indigo/30'
                      : 'border-line hover:border-ink/40'
                  }`}
                  style={{ background: s.hex }}
                  aria-label={s.label}
                />
              ))}
            </div>
          </div>

          {(sampleRgb || previewUrl) && (
            <div className="flex items-center gap-3 border border-line bg-linen/80 p-3">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Uploaded sample"
                  className="h-14 w-14 object-cover"
                />
              ) : (
                <span
                  className="h-14 w-14 border border-line"
                  style={{ background: sampleHex }}
                />
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">Detected</p>
                <p className="mt-0.5 font-medium tabular-nums">{sampleHex || '—'}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            2 · Spec hints (optional)
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              Target GSM
              <input
                type="number"
                min={50}
                max={600}
                value={targetGsm}
                onChange={(e) => setTargetGsm(e.target.value)}
                placeholder="e.g. 180"
                className="input-field mt-1.5 normal-case tracking-normal"
              />
            </label>
            <label className="block text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field mt-1.5 normal-case tracking-normal"
              >
                <option value="">Any</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              Weave
              <input
                value={weave}
                onChange={(e) => setWeave(e.target.value)}
                placeholder="e.g. Twill, Plain"
                className="input-field mt-1.5 normal-case tracking-normal"
              />
            </label>
            <label className="block text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              Hand-feel
              <select
                value={handFeel}
                onChange={(e) => setHandFeel(e.target.value)}
                className="input-field mt-1.5 normal-case tracking-normal"
              >
                {HAND_FEELS.map((h) => (
                  <option key={h || 'any'} value={h}>
                    {h || 'Any'}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? <p className="text-sm text-rust">{error}</p> : null}

          <button
            type="submit"
            disabled={busy || !sampleRgb}
            className="btn-accent inline-flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SampleIcon className="h-4 w-4" />
            {busy ? 'Matching mills…' : 'Find matching cloths'}
          </button>
        </div>
      </form>

      {ran && !busy ? (
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <SectionEyebrow>Results</SectionEyebrow>
              <h2 className="mt-1 font-display text-3xl leading-none">
                {matches.length ? `${matches.length} mill matches` : 'No close matches'}
              </h2>
            </div>
          </div>

          {matches.length === 0 ? (
            <p className="border border-dashed border-line px-4 py-10 text-center text-sm text-ink-soft">
              Try a different tone or widen GSM / category hints.
            </p>
          ) : (
            <ul className="space-y-3">
              {matches.map((product, i) => {
                const accent = fabricAccent(product.name || '');
                const colorway = product.matchedColor || pickPreviewColorway(product.colors);
                const preview = colorway ? colorwayHex(colorway, accent) : accent;
                return (
                  <motion.li
                    key={product._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.28) }}
                    className="flex flex-col gap-3 border border-line bg-white/40 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
                  >
                    <div
                      className="h-20 w-full shrink-0 sm:h-16 sm:w-16"
                      style={{
                        background: `linear-gradient(145deg, ${preview}, #e2e8f0)`,
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-indigo px-2 py-0.5 text-[11px] font-semibold tabular-nums text-linen">
                          {product.matchScore}% match
                        </span>
                        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                          {product.category}
                        </span>
                      </div>
                      <p className="mt-1 font-display text-2xl leading-tight">{product.name}</p>
                      <p className="mt-1 text-xs text-ink-soft md:text-sm">
                        {(product.reasons || []).slice(0, 2).join(' · ')}
                      </p>
                      <p className="mt-1 text-sm text-ink-soft">
                        GSM {product.specifications?.gsm ?? '—'}
                        {product.matchedColor ? ` · ${product.matchedColor}` : ''}
                        {' · '}₹{(product.price || 0).toLocaleString('en-IN')}/
                        {product.unit || 'm'}
                      </p>
                    </div>
                    <Link
                      to={`/products/${product._id}`}
                      className="btn-secondary inline-flex shrink-0 items-center justify-center gap-1.5 self-start px-3 py-2 text-sm sm:self-center"
                    >
                      Open passport
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
