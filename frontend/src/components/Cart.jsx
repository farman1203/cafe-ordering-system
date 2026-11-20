import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';

// Read-only order summary (lines + totals). Used on the cart page and checkout page.
export default function Cart({ children, showLines = true }) {
  const { items, itemCount, subtotal, total } = useCart();
  return (
    <aside className="summary">
      <h3>Order summary</h3>
      {showLines && (
        <ul className="summary__lines">
          {items.map((i) => (
            <li key={i._id}>
              <span>{i.quantity} × {i.name}</span>
              <span>{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="summary__row"><span>Items ({itemCount})</span><span>{formatPrice(subtotal)}</span></div>
      <div className="summary__row summary__total"><span>Total</span><span>{formatPrice(total)}</span></div>
      <p className="muted summary__note">Pay at the counter after your order is served. Final amount is confirmed by the cafe.</p>
      {children}
    </aside>
  );
}
