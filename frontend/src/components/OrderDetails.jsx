import { formatDateTime, formatPrice } from '../utils/helpers';
import StatusBadge from './StatusBadge';

// Full order information card (customer view & admin modal)
export default function OrderDetails({ order, showCustomer = true }) {
  return (
    <div className="order-details">
      <div className="order-details__head">
        <div>
          <span className="muted">Order ID</span>
          <strong className="order-id">{order.orderId}</strong>
        </div>
        <StatusBadge status={order.orderStatus} />
      </div>
      <dl className="order-details__meta">
        {showCustomer && <><dt>Customer</dt><dd>{order.customerName}</dd><dt>Phone</dt><dd>{order.phone}</dd></>}
        <dt>Table</dt><dd>{order.tableNumber}</dd>
        <dt>Placed</dt><dd>{formatDateTime(order.createdAt)}</dd>
        <dt>Payment</dt><dd>{order.paymentMethod} · {order.paymentStatus}</dd>
        {order.specialInstructions && <><dt>Notes</dt><dd>{order.specialInstructions}</dd></>}
      </dl>
      <ul className="summary__lines">
        {order.items.map((i) => (
          <li key={i.menuItem}>
            <span>{i.quantity} × {i.name} <small className="muted">({formatPrice(i.price)})</small></span>
            <span>{formatPrice(i.subtotal)}</span>
          </li>
        ))}
      </ul>
      <div className="summary__row summary__total"><span>Total</span><span>{formatPrice(order.totalAmount)}</span></div>
    </div>
  );
}
