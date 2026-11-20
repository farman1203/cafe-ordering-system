import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ShoppingBag } from 'lucide-react';
import { toast } from 'react-toastify';
import Cart from '../components/Cart';
import EmptyState from '../components/EmptyState';
import { useCart } from '../context/CartContext';
import { useSession } from '../context/SessionContext';
import { createOrder } from '../services/orderService';
import { getErrorMessage } from '../services/api';
import { isValidPhone, normalizePhone } from '../utils/helpers';

export default function Checkout() {
  const { items, clearCart } = useCart();
  const session = useSession();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: session.name || '', phone: session.phone || '', table: session.table || '', notes: '' });
  const [editTable, setEditTable] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const lock = useRef(false);   // blocks double-clicks instantly (state updates are async)
  const placed = useRef(false);

  const tableFromQr = !!session.table && !editTable;
  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); setSubmitError(''); };

  if (items.length === 0 && !placed.current) {
    return (
      <div className="page container">
        <EmptyState icon={ShoppingBag} title="Nothing to check out" text="Add something delicious to your cart first."
          action={<Link to="/menu" className="btn btn--primary">Go to menu</Link>} />
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Please enter your name (at least 2 characters)';
    if (!isValidPhone(form.phone)) e.phone = 'Enter a valid 10-digit mobile number';
    if (!/^[A-Za-z0-9-]{1,10}$/.test(form.table.trim())) e.table = 'Enter your table number (e.g. T05)';
    if (form.notes.length > 300) e.notes = 'Maximum 300 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (lock.current) return;            // duplicate-submission guard
    if (!validate()) { toast.error('Please fix the highlighted fields'); return; }

    lock.current = true; setSubmitting(true); setSubmitError('');
    try {
      const phone = normalizePhone(form.phone);
      const order = await createOrder({
        customerName: form.name.trim(),
        phone,
        tableNumber: form.table.trim().toUpperCase(),
        specialInstructions: form.notes.trim(),
        paymentMethod: 'Pay at Counter',
        // Only ids + quantities are sent. The SERVER looks up prices and calculates the total.
        items: items.map((i) => ({ menuItem: i._id, quantity: i.quantity })),
      });
      placed.current = true;
      session.setPhone(phone); session.setName(form.name.trim()); session.setTable(form.table.trim());
      session.setLastOrder({ orderId: order.orderId, phone });
      navigate(`/order-success/${order.orderId}`, { replace: true, state: { order } });
      clearCart(); // cleared only AFTER the order was created successfully
      toast.success('Order placed! 🎉');
    } catch (err) {
      const msg = getErrorMessage(err);
      setSubmitError(msg); toast.error(msg);
      lock.current = false; setSubmitting(false);
    }
  };

  return (
    <div className="page container">
      <div className="page__head"><h1>Checkout</h1><p className="muted">No account needed - just tell us who and where you are.</p></div>
      <div className="two-col">
        <form className="card form-card" onSubmit={submit} noValidate>
          <label className="field"><span>Your name *</span>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" maxLength={60} aria-invalid={!!errors.name} />
            {errors.name && <small className="field__error">{errors.name}</small>}
          </label>
          <label className="field"><span>Mobile number *</span>
            <input type="tel" inputMode="numeric" value={form.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" placeholder="98765 43210" maxLength={14} aria-invalid={!!errors.phone} />
            {errors.phone && <small className="field__error">{errors.phone}</small>}
          </label>
          <label className="field"><span>Table number *</span>
            <div className="input-with-btn">
              <input value={form.table} onChange={(e) => set('table', e.target.value.toUpperCase())} disabled={tableFromQr} placeholder="e.g. T05" maxLength={10} aria-invalid={!!errors.table} />
              {tableFromQr && <button type="button" className="link-btn" onClick={() => setEditTable(true)}>Change</button>}
            </div>
            {tableFromQr && <small className="muted"><Lock size={12} /> Detected from your table's QR code</small>}
            {errors.table && <small className="field__error">{errors.table}</small>}
          </label>
          <label className="field"><span>Special instructions <em>(optional)</em></span>
            <textarea rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} maxLength={300} placeholder="Less sugar, extra hot, allergies..." />
            <small className="muted align-right">{form.notes.length}/300</small>
            {errors.notes && <small className="field__error">{errors.notes}</small>}
          </label>
          <div className="pay-note"><strong>Payment:</strong> Pay at the counter after your order is served.</div>
          {submitError && <div className="alert alert--error" role="alert">{submitError}</div>}
          <button className="btn btn--primary btn--lg btn--block" type="submit" disabled={submitting}>
            {submitting ? <><span className="btn-spinner" /> Placing order...</> : 'Place order'}
          </button>
        </form>
        <Cart />
      </div>
    </div>
  );
}
