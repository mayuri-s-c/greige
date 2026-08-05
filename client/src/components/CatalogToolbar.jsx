import { SearchIcon } from './Icons';

/**
 * Compact marketplace filter bar — search, facets, sort, view.
 */
export default function CatalogToolbar({
  filters,
  setFilters,
  categoryChips,
  sort,
  setSort,
  view,
  setView,
  filtersOpen,
  setFiltersOpen,
  activeFilterCount,
  onClearFilters,
}) {
  const field =
    'h-9 w-full border border-line bg-white px-2.5 text-sm outline-none transition focus:border-indigo';

  return (
    <div className="mb-6 space-y-3">
      {/* Primary row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft" />
          <input
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            placeholder="Search by name, composition, weave…"
            className={`${field} pl-9`}
          />
        </label>

        <div className="flex items-center gap-2">
          <select
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            className={`${field} sm:w-36`}
            aria-label="Category"
          >
            <option value="">All categories</option>
            {categoryChips
              .filter((c) => c !== 'All')
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className={`${field} sm:w-32`}
            aria-label="Sort"
          >
            <option value="featured">Featured</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="gsm">GSM</option>
          </select>

          <div className="flex h-9 shrink-0 border border-line bg-white">
            {[
              { id: 'grid', label: 'Grid' },
              { id: 'compact', label: 'List' },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setView(mode.id)}
                className={`px-3 text-xs font-medium transition ${
                  view === mode.id ? 'bg-ink text-linen' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary facets — always on desktop; toggled on mobile */}
      <div className="flex items-center justify-between gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className={`h-8 border px-3 text-xs font-medium ${
            filtersOpen || activeFilterCount > 0
              ? 'border-indigo text-indigo'
              : 'border-line text-ink-soft'
          }`}
        >
          {filtersOpen ? 'Hide filters' : 'More filters'}
          {activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}
        </button>
        {activeFilterCount > 0 ? (
          <button type="button" onClick={onClearFilters} className="text-xs text-indigo">
            Clear
          </button>
        ) : null}
      </div>

      <div
        className={`grid gap-2 sm:grid-cols-2 lg:grid-cols-4 ${
          filtersOpen ? 'grid' : 'hidden lg:grid'
        }`}
      >
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-ink-soft">
            Colorway
          </span>
          <input
            value={filters.color}
            onChange={(e) => setFilters((f) => ({ ...f, color: e.target.value }))}
            placeholder="e.g. Navy"
            className={field}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-ink-soft">
            Max GSM
          </span>
          <input
            value={filters.maxGsm}
            onChange={(e) => setFilters((f) => ({ ...f, maxGsm: e.target.value }))}
            placeholder="e.g. 200"
            inputMode="numeric"
            className={field}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-ink-soft">
            Min price (₹)
          </span>
          <input
            value={filters.minPrice}
            onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
            placeholder="0"
            inputMode="numeric"
            className={field}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-ink-soft">
            Max price (₹)
          </span>
          <input
            value={filters.maxPrice}
            onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
            placeholder="Any"
            inputMode="numeric"
            className={field}
          />
        </label>
      </div>

      {activeFilterCount > 0 ? (
        <div className="hidden lg:flex lg:justify-end">
          <button type="button" onClick={onClearFilters} className="text-xs text-indigo hover:underline">
            Clear filters
          </button>
        </div>
      ) : null}
    </div>
  );
}
