import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useCartStore } from '../store/cartStore';
import { ArrowRightIcon, CheckIcon } from '../components/Icons';

const emptyShipping = {
  fullName: '',
  phone: '',
  addressLine1: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  notes: '',
};

export default function CheckoutPage() {
  const { cart, fetchCart } = useCartStore();
  const [shipping, setShipping] = useState(emptyShipping);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const subtotal = useMemo(() => {
    return (cart?.items || []).reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    );
  }, [cart]);

  const items = useMemo(() => [...(cart?.items || [])].reverse(), [cart]);

  async function placeOrder() {
    setPlacing(true);
    setError('');
    try {
      const { data } = await api.post('/orders', { shipping });
      navigate(`/orders/${data.order._id}/confirmation`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  }

  if (!cart?.items?.length) {
    return <p className="mx-auto max-w-3xl px-4 py-16">Your cart is empty.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl">🧾 Checkout</h1>
      <p className="mt-2 text-sm text-ink-soft">Prototype checkout — no payment gateway.</p>

      <div className="mt-6 flex gap-4 text-sm">
        {['Shipping', 'Review', 'Place order'].map((label, i) => (
          <span key={label} className={step === i + 1 ? 'text-indigo' : 'text-ink-soft'}>
            {i + 1}. {label}
          </span>
        ))}
      </div>

      {step === 1 && (
        <form
          className="mt-8 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setStep(2);
          }}
        >
          {Object.entries({
            fullName: 'Full name',
            phone: 'Phone',
            addressLine1: 'Address',
            city: 'City',
            state: 'State',
            postalCode: 'Postal code',
            country: 'Country',
            notes: 'Notes',
          }).map(([key, label]) => (
            <input
              key={key}
              required={key !== 'notes'}
              placeholder={label}
              value={shipping[key]}
              onChange={(e) => setShipping({ ...shipping, [key]: e.target.value })}
              className="border border-line bg-white/40 px-3 py-2"
            />
          ))}
          <button type="submit" className="mt-2 bg-ink py-3 text-linen">
            ➡️ Continue to review
          </button>
        </form>
      )}

      {step >= 2 && (
        <div className="mt-8 space-y-4 border border-line bg-white/30 p-5">
          <h2 className="font-display text-2xl">Order review</h2>
          <p className="text-sm text-ink-soft">
            {shipping.fullName} · {shipping.addressLine1}, {shipping.city}
          </p>
          <ul className="space-y-2 text-sm">
            {items.map((item) => (
              <li
                key={`${item.product._id}-${item.color || 'default'}`}
                className="flex justify-between gap-3"
              >
                <span>
                  {item.product.name} × {item.quantity}
                  {item.color ? ` · ${item.color}` : ''}
                </span>
                <span>₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
              </li>
            ))}
          </ul>
          <p className="text-xl font-medium">Total ₹{subtotal.toLocaleString('en-IN')}</p>
          {error && <p className="text-sm text-rust">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="border border-line px-4 py-2">
              Back
            </button>
            <button
              type="button"
              disabled={placing}
              onClick={placeOrder}
              className="inline-flex items-center gap-2 bg-indigo px-4 py-2 text-linen disabled:opacity-60"
            >
              <CheckIcon className="h-4 w-4" />
              {placing ? 'Placing…' : 'Place order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
