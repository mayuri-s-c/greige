import { useEffect, useState } from 'react';
import api from '../../api/client';
import ConfirmDialog from '../../components/ConfirmDialog';
import { fabricAccent, colorwayHex, pickPreviewColorway } from '../../components/ProductCard';
import { EmptyState, SectionEyebrow, StatusBadge } from '../../components/ui';
import { EditIcon, PlusIcon, TrashIcon } from '../../components/Icons';

const empty = {
  name: '',
  category: 'Cotton',
  description: '',
  colors: '',
  composition: '',
  gsm: '',
  width: '',
  weave: '',
  finish: '',
  handFeel: '',
  stock: 100,
  price: 200,
  status: 'available',
  featured: false,
};

const FIELD_ROWS = [
  ['name', 'Name'],
  ['category', 'Category'],
  ['description', 'Description'],
  ['colors', 'Colors (comma-separated)'],
  ['composition', 'Composition'],
  ['gsm', 'GSM'],
  ['width', 'Width'],
  ['weave', 'Weave'],
  ['finish', 'Finish'],
  ['handFeel', 'Hand-feel'],
  ['stock', 'Stock'],
  ['price', 'Price'],
];

function ProductFormFields({ form, setForm, idPrefix = '' }) {
  return (
    <>
      {FIELD_ROWS.map(([key, label]) => (
        <label key={key} className="block text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          {label}
          <input
            id={`${idPrefix}${key}`}
            required={['name', 'category', 'price'].includes(key)}
            placeholder={label}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="input-field mt-1.5 normal-case tracking-normal"
          />
        </label>
      ))}
      <label className="block text-[11px] uppercase tracking-[0.14em] text-ink-soft">
        Status
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="input-field mt-1.5 normal-case tracking-normal"
        >
          <option value="available">Available</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
      </label>
      <label className="flex items-center gap-2 self-end pb-2 text-sm normal-case tracking-normal text-ink">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => setForm({ ...form, featured: e.target.checked })}
        />
        Featured on Greige Floor
      </label>
    </>
  );
}

function toPayload(form) {
  return {
    name: form.name,
    category: form.category,
    description: form.description,
    colors: form.colors
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    specifications: {
      composition: form.composition,
      gsm: form.gsm ? Number(form.gsm) : null,
      width: form.width,
      weave: form.weave,
      finish: form.finish,
      handFeel: form.handFeel,
    },
    stock: Number(form.stock),
    price: Number(form.price),
    status: form.status,
    featured: Boolean(form.featured),
  };
}

function productToForm(product) {
  return {
    name: product.name,
    category: product.category,
    description: product.description || '',
    colors: (product.colors || []).join(', '),
    composition: product.specifications?.composition || '',
    gsm: product.specifications?.gsm || '',
    width: product.specifications?.width || '',
    weave: product.specifications?.weave || '',
    finish: product.specifications?.finish || '',
    handFeel: product.specifications?.handFeel || '',
    stock: product.stock,
    price: product.price,
    status: product.status,
    featured: product.featured,
  };
}

function previewFor(product) {
  const accent = fabricAccent(product.name || '');
  const colorway = pickPreviewColorway(product.colors);
  return colorway ? colorwayHex(colorway, accent) : accent;
}

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [dialogMode, setDialogMode] = useState(null); // 'create' | 'edit' | null
  const [detailProduct, setDetailProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await api.get('/products/mine');
    setProducts(data.products || []);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setDetailProduct(null);
    setEditingId(null);
    setForm(empty);
    setDialogMode('create');
  }

  function openEdit(product) {
    setDetailProduct(null);
    setEditingId(product._id);
    setForm(productToForm(product));
    setDialogMode('edit');
  }

  function openDetail(product) {
    setDetailProduct(product);
  }

  function closeDetail() {
    setDetailProduct(null);
  }

  function closeDialog() {
    if (saving) return;
    setDialogMode(null);
    setEditingId(null);
    setForm(empty);
  }

  function resetDialog() {
    setDialogMode(null);
    setEditingId(null);
    setForm(empty);
  }

  async function saveProduct(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = toPayload(form);
      if (dialogMode === 'edit' && editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      resetDialog();
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    await api.delete(`/products/${id}`);
    if (editingId === id) resetDialog();
    if (detailProduct?._id === id) closeDetail();
    load();
  }

  const isCreate = dialogMode === 'create';
  const isEdit = dialogMode === 'edit';
  const detailSpecs = detailProduct?.specifications || {};

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionEyebrow emoji="🧵">Catalog ops</SectionEyebrow>
          <h1 className="mt-2 font-display text-5xl leading-none">Inventory</h1>
          <p className="mt-3 text-ink-soft">
            Browse your catalog — open any cloth for full details.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="btn-primary inline-flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add new product
        </button>
      </div>

      <div>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="font-display text-3xl">Your catalog</h2>
          {products.length > 0 ? (
            <p className="text-sm text-ink-soft">
              {products.length} cloth{products.length === 1 ? '' : 's'}
            </p>
          ) : null}
        </div>

        {products.length === 0 ? (
          <EmptyState
            title="No products yet"
            body="Add your first cloth to the Greige Floor catalog."
            action={
              <button type="button" onClick={openCreate} className="text-sm text-indigo">
                Add new product →
              </button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((p) => {
              const preview = previewFor(p);
              return (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => openDetail(p)}
                  className="panel-surface group overflow-hidden text-left transition hover:border-ink/40"
                >
                  <div
                    className="h-36 w-full"
                    style={{
                      background: `linear-gradient(145deg, ${preview}, #e2dfd8)`,
                    }}
                  />
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                          {p.category || 'Fabric'}
                        </p>
                        <p className="mt-1 truncate font-display text-2xl leading-tight group-hover:text-indigo">
                          {p.name}
                        </p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="flex flex-wrap items-end justify-between gap-2 border-t border-line/80 pt-3 text-sm">
                      <div>
                        <p className="font-semibold tabular-nums">
                          ₹{(p.price || 0).toLocaleString('en-IN')}
                          <span className="ml-1 font-normal text-ink-soft">
                            / {p.unit || 'meters'}
                          </span>
                        </p>
                        <p className="mt-0.5 text-ink-soft">
                          {p.stock} {p.unit || 'meters'} in stock
                        </p>
                      </div>
                      {p.specifications?.gsm ? (
                        <p className="text-ink-soft">GSM {p.specifications.gsm}</p>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(detailProduct)}
        title={detailProduct?.name || 'Product details'}
        body={detailProduct?.category || ''}
        showActions={false}
        size="lg"
        onClose={closeDetail}
      >
        {detailProduct ? (
          <div className="space-y-5">
            <div
              className="h-40 w-full"
              style={{
                background: `linear-gradient(145deg, ${previewFor(detailProduct)}, #e2dfd8)`,
              }}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusBadge status={detailProduct.status} />
              <p className="font-display text-3xl leading-none">
                ₹{(detailProduct.price || 0).toLocaleString('en-IN')}
                <span className="ml-2 text-base text-ink-soft">
                  / {detailProduct.unit || 'meters'}
                </span>
              </p>
            </div>

            {detailProduct.description ? (
              <p className="text-sm leading-relaxed text-ink-soft">{detailProduct.description}</p>
            ) : null}

            <div className="grid grid-cols-2 gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
              {[
                ['Stock', `${detailProduct.stock} ${detailProduct.unit || 'meters'}`],
                ['GSM', detailSpecs.gsm || '—'],
                ['Weave', detailSpecs.weave || '—'],
                ['Width', detailSpecs.width || '—'],
                ['Finish', detailSpecs.finish || '—'],
                ['Hand-feel', detailSpecs.handFeel || '—'],
                ['Composition', detailSpecs.composition || '—'],
                ['Featured', detailProduct.featured ? 'Yes' : 'No'],
              ].map(([label, value]) => (
                <div key={label} className="bg-linen p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">{label}</p>
                  <p className="mt-1 text-sm font-medium capitalize">{value}</p>
                </div>
              ))}
            </div>

            {(detailProduct.colors || []).length > 0 ? (
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                  Colorways
                </p>
                <div className="flex flex-wrap gap-2">
                  {detailProduct.colors.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-2 border border-line bg-white/50 px-2.5 py-1 text-sm"
                    >
                      <span
                        className="h-3 w-3 border border-ink/15"
                        style={{
                          background: colorwayHex(c, fabricAccent(detailProduct.name)),
                        }}
                      />
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => openEdit(detailProduct)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <EditIcon className="h-4 w-4" />
                Edit product
              </button>
              <button
                type="button"
                onClick={() => remove(detailProduct._id)}
                className="inline-flex items-center gap-2 border border-line px-4 py-2.5 text-rust hover:border-rust"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        ) : null}
      </ConfirmDialog>

      <ConfirmDialog
        open={Boolean(dialogMode)}
        title={isEdit ? 'Edit product' : 'Add new product'}
        body={
          isEdit
            ? 'Update this cloth’s specs, stock, and listing status.'
            : 'List a new cloth on the Greige Floor with specs and stock.'
        }
        showActions={false}
        size="lg"
        onClose={closeDialog}
      >
        <form onSubmit={saveProduct} className="grid gap-3 md:grid-cols-2">
          <ProductFormFields
            form={form}
            setForm={setForm}
            idPrefix={isEdit ? 'edit-' : 'create-'}
          />
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
            >
              {isCreate ? <PlusIcon className="h-4 w-4" /> : <EditIcon className="h-4 w-4" />}
              {saving
                ? isEdit
                  ? 'Updating…'
                  : 'Creating…'
                : isEdit
                  ? 'Update product'
                  : 'Create product'}
            </button>
            <button type="button" onClick={closeDialog} disabled={saving} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </ConfirmDialog>
    </div>
  );
}
