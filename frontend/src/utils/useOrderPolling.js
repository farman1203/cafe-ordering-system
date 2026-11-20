import { useCallback, useEffect, useState } from 'react';
import { trackOrder } from '../services/orderService';
import { getErrorMessage } from '../services/api';

const FINAL = ['Completed', 'Cancelled'];

// Loads an order by (orderId + phone) and refreshes its status every 15s until it is Completed/Cancelled.
export default function useOrderPolling(orderId, phone, initial = null) {
  const [order, setOrder] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (silent) => {
    if (!orderId || !phone) return;
    if (!silent) { setLoading(true); setError(''); }
    try {
      setOrder(await trackOrder(orderId, phone));
    } catch (err) {
      if (!silent) { setOrder(null); setError(getErrorMessage(err)); }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [orderId, phone]);

  // first load (skipped when we already have the order from checkout)
  useEffect(() => {
    if (!initial || initial.orderId !== orderId) load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  useEffect(() => {
    if (!order || FINAL.includes(order.orderStatus)) return undefined;
    const t = setInterval(() => { if (!document.hidden) load(true); }, 15000);
    return () => clearInterval(t);
  }, [order, load]);

  return { order, loading, error, refresh: () => load(false) };
}
