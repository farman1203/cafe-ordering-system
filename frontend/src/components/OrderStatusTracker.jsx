import { Check, XCircle } from 'lucide-react';
import { STATUS_FLOW } from '../utils/constants';

// Horizontal progress steps: Pending -> Confirmed -> Preparing -> Ready -> Completed
export default function OrderStatusTracker({ status }) {
  if (status === 'Cancelled') {
    return (
      <div className="tracker-cancelled"><XCircle size={22} /> This order was cancelled.</div>
    );
  }
  const current = STATUS_FLOW.indexOf(status);
  return (
    <ol className="tracker" aria-label={`Order status: ${status}`}>
      {STATUS_FLOW.map((step, i) => (
        <li key={step} className={i < current ? 'is-done' : i === current ? 'is-current' : ''}>
          <span className="tracker__dot">{i < current ? <Check size={14} /> : i + 1}</span>
          <span className="tracker__label">{step}</span>
        </li>
      ))}
    </ol>
  );
}
