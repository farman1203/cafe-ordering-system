import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, RefreshCw, Search } from 'lucide-react';
import OrderDetails from '../components/OrderDetails';
import OrderStatusTracker from '../components/OrderStatusTracker';
import ErrorMessage from '../components/ErrorMessage';
import { Spinner } from '../components/Loading';
import { useSession } from '../context/SessionContext';
import useOrderPolling from '../utils/useOrderPolling';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const location = useLocation();
  const { lastOrder, phone } = useSession();

  const fromCheckout = location.state?.order?.orderId === orderId ? location.state.order : null;
  const knownPhone = fromCheckout?.phone || (lastOrder?.orderId === orderId ? lastOrder.phone : phone);
  const { order, loading, error, refresh } = useOrderPolling(orderId, knownPhone, fromCheckout);

  if (loading) return <div className="page container"><Spinner label="Loading your order..." /></div>;

  if (!order) {
    return (
      <div className="page container narrow">
        <ErrorMessage message={error || 'We could not load this order automatically. Enter your phone number to view it.'} />
        <div className="center-box"><Link to={`/track/${orderId}`} className="btn btn--primary"><Search size={16} /> Track this order</Link></div>
      </div>
    );
  }

  return (
    <div className="page container narrow">
      <div className="success">
        <CheckCircle2 size={56} />
        <h1>Order placed!</h1>
        <p className="muted">Thank you, {order.customerName}. We've received your order for Table {order.tableNumber}. Keep your order ID safe - you'll need it to track your order.</p>
      </div>
      <div className="card"><OrderStatusTracker status={order.orderStatus} /></div>
      <div className="card"><OrderDetails order={order} /></div>
      <div className="success__actions">
        <button className="btn btn--outline" onClick={refresh}><RefreshCw size={16} /> Refresh status</button>
        <Link to="/menu" className="btn btn--primary">Order more</Link>
      </div>
      <p className="muted center-text">Status updates automatically every few seconds.</p>
    </div>
  );
}
