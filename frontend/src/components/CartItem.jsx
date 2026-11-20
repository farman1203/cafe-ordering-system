import { Minus, Plus, Trash2 } from 'lucide-react';
import FoodImage from './FoodImage';
import { useCart } from '../context/CartContext';
import { MAX_QTY } from '../utils/constants';
import { formatPrice } from '../utils/helpers';

export default function CartItem({ item }) {
  const { increment, decrement, removeItem } = useCart();
  return (
    <div className="cart-item">
      <FoodImage src={item.image} alt={item.name} className="cart-item__img" />
      <div className="cart-item__info">
        <h4>{item.name}</h4>
        <span className="muted">{formatPrice(item.price)} each</span>
        <div className="qty">
          <button onClick={() => decrement(item._id)} disabled={item.quantity <= 1} aria-label="Decrease quantity"><Minus size={14} /></button>
          <span aria-live="polite">{item.quantity}</span>
          <button onClick={() => increment(item._id)} disabled={item.quantity >= MAX_QTY} aria-label="Increase quantity"><Plus size={14} /></button>
        </div>
      </div>
      <div className="cart-item__side">
        <strong>{formatPrice(item.price * item.quantity)}</strong>
        <button className="icon-btn icon-btn--danger" onClick={() => removeItem(item._id)} aria-label={`Remove ${item.name}`}><Trash2 size={17} /></button>
      </div>
    </div>
  );
}
