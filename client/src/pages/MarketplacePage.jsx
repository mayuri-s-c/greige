import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ProductCard, { fabricAccent, colorwayHex, pickPreviewColorway } from '../components/ProductCard';
import { useCartStore } from '../store/cartStore';
import FabricHeroMotion from '../components/FabricHeroMotion';
import CatalogToolbar from '../components/CatalogToolbar';
import { SectionEyebrow } from '../components/ui';
import { useWarpStore } from '../store/warpStore';
import WarpIcon from '../components/WarpIcon';

export default function MarketplacePage() {
  const openWarp = useWarpStore((s) => s.openWarp);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [sort, setSort] = useState('featured');
  const [view, setView] = useState('grid');
  const [filters, setFilters] = useState({
    q: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    maxGsm: '',
    color: '',
  });
  const [loading, setLoading] = useState(true);
  const [nlQuery, setNlQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.color) n += 1;
    if (filters.maxGsm) n += 1;
    if (filters.minPrice) n += 1;
    if (filters.maxPrice) n += 1;
    return n;
  }, [filters]);

  function clearAdvancedFilters() {
    setFilters((f) => ({ ...f, color: '', maxGsm: '', minPrice: '', maxPrice: '' }));
  }

  useEffect(() => {
    Promise.all([
      api.get('/products/meta/categories'),
      api.get('/products/meta/featured'),
    ]).then(([cats, feat]) => {
      setCategories(cats.data.categories || []);
      setFeatured(feat.data.products || []);
    });
  }, []);

  useEffect(() => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v != null)
    );
    setLoading(true);
    api
      .get('/products', { params })
      .then(({ data }) => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, [filters]);

  const sorted = useMemo(() => {
    const list = [...products];
    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'gsm') list.sort((a, b) => (a.specifications?.gsm || 0) - (b.specifications?.gsm || 0));
    if (sort === 'featured') list.sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [products, sort]);

  const categoryChips = useMemo(() => ['All', ...categories], [categories]);

  const cartItems = useCartStore((s) => s.cart?.items);

  function listPreview(product) {
    const accent = fabricAccent(product.name || '');
    const cartColor = (cartItems || []).find(
      (item) => String(item.product?._id || item.product) === String(product._id) && item.color
    )?.color;
    const colorway = pickPreviewColorway(product.colors, cartColor ? [cartColor] : []);
    const preview = colorway ? colorwayHex(colorway, accent) : accent;
    return { accent, preview, colors: product.colors || [], colorway };
  }

  return (
    <div>
      <section className="hero-grain relative min-h-[72vh] overflow-hidden border-b border-line">
        <FabricHeroMotion />
        <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-7xl flex-col justify-end px-4 pb-14 pt-20 md:px-6 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.65 }}
            className="max-w-3xl text-linen"
          >
            <p className="text-[11px] uppercase tracking-[0.28em] text-linen/65">
              Mill-true discovery
            </p>
            <h1 className="mt-4 font-display text-6xl leading-[0.92] md:text-8xl">
              Greige Floor
            </h1>
            <p className="mt-5 max-w-xl text-base text-linen/80 md:text-lg">
              Source by hand-feel, GSM, and colorway — then let Warp translate buyer language into
              cloth matches.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to="/match"
                className="btn-accent inline-flex items-center gap-2 px-4 py-2.5 text-sm"
              >
                Sample Match
                <span className="bg-linen/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-linen">
                  New
                </span>
              </Link>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.75, duration: 0.55 }}
            className="mt-10 max-w-3xl"
            onSubmit={(e) => {
              e.preventDefault();
              if (!nlQuery.trim()) return;
              openWarp(nlQuery.trim());
            }}
          >
            <div className="flex flex-col gap-2 border border-linen/25 bg-ink/35 p-2 backdrop-blur-md sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                <span className="status-dot bg-[#c4c0b6]" />
                <input
                  value={nlQuery}
                  onChange={(e) => setNlQuery(e.target.value)}
                  placeholder='Try “soft cotton under 200 GSM in navy, MOQ friendly”'
                  className="w-full bg-transparent py-3 text-sm text-linen outline-none placeholder:text-linen/45"
                />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 bg-linen px-5 py-3 text-sm font-medium text-ink">
                <WarpIcon className="h-4 w-4" />
                Ask Warp
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-linen/70">
              {['linen resort', 'denim 300 GSM', 'silk lining ivory'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => openWarp(chip)}
                  className="border border-linen/20 px-2.5 py-1 hover:border-linen/50"
                >
                  {chip}
                </button>
              ))}
            </div>
          </motion.form>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12 md:px-6">
        {featured.length > 0 && !filters.q && !filters.category && (
          <section>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <SectionEyebrow emoji="✨">Curated</SectionEyebrow>
                <h2 className="mt-2 font-display text-4xl">Featured cloths</h2>
              </div>
              <p className="hidden text-sm text-ink-soft md:block">
                Highlighted by mills for active sourcing windows
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {featured.slice(0, 4).map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <SectionEyebrow>Live catalog</SectionEyebrow>
              <h2 className="mt-1 font-display text-3xl md:text-4xl">All fabrics</h2>
            </div>
            <p className="text-sm tabular-nums text-ink-soft">
              {loading ? 'Loading…' : `${sorted.length} cloths`}
            </p>
          </div>

          <CatalogToolbar
            filters={filters}
            setFilters={setFilters}
            categoryChips={categoryChips}
            sort={sort}
            setSort={setSort}
            view={view}
            setView={setView}
            filtersOpen={filtersOpen}
            setFiltersOpen={setFiltersOpen}
            activeFilterCount={activeFilterCount}
            onClearFilters={clearAdvancedFilters}
          />

          <div
            className={
              view === 'grid'
                ? 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3'
                : 'grid gap-3 md:grid-cols-2'
            }
          >
            {sorted.map((p, i) => {
              if (view === 'grid') {
                return <ProductCard key={p._id} product={p} index={i} />;
              }

              const { accent, preview, colors } = listPreview(p);
              return (
                <Link
                  key={p._id}
                  to={`/products/${p._id}`}
                  className="panel-surface flex items-center gap-4 p-3 transition hover:border-ink/30"
                >
                  <div
                    className="relative h-20 w-16 shrink-0 overflow-hidden"
                    style={{
                      background: `linear-gradient(145deg, ${preview} 0%, ${preview}cc 48%, #e2e8f0 100%)`,
                    }}
                  >
                    <div className="weave-overlay absolute inset-0 opacity-35" />
                    {colors.length > 1 ? (
                      <div className="absolute inset-x-1 bottom-1 flex gap-0.5">
                        {colors.slice(0, 3).map((c) => (
                          <span
                            key={c}
                            className="h-1.5 flex-1 border border-ink/10"
                            style={{ background: colorwayHex(c, accent) }}
                            title={c}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-ink-soft">{p.category}</p>
                    <p className="truncate font-display text-2xl">{p.name}</p>
                    <p className="text-sm text-ink-soft">
                      GSM {p.specifications?.gsm ?? '—'} · ₹{p.price}/{p.unit}
                      {colors[0] ? ` · ${colors[0]}` : ''}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {!loading && sorted.length === 0 && (
            <div className="panel-surface mt-6 px-6 py-14 text-center">
              <p className="font-display text-3xl">No cloths in this cut</p>
              <p className="mt-2 text-ink-soft">Widen filters or ask Warp to reinterpret the brief.</p>
              <button type="button" onClick={() => openWarp('show available cotton fabrics')} className="btn-accent mt-5 inline-flex items-center gap-2">
                <WarpIcon className="h-4 w-4" />
                Ask Warp
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
