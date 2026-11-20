import { Flame, Plus, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import FoodImage from './FoodImage';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';

export default function MenuCard({ item }) {
  const { addItem, getQty } = useCart();
  const qty = getQty(item._id);

  const handleAdd = () => {
    if (addItem(item)) toast.success(`${item.name} added to cart`, { autoClose: 1500 });
    else toast.error('This item is currently unavailable');
  };

  return (
    <article className={`menu-card ${!item.isAvailable ? 'is-unavailable' : ''}`}>
      <div className="menu-card__media">
        <FoodImage src={item.image} alt={item.name} />
        <div className="menu-card__labels">
          {item.isBestseller && <span className="label label--hot"><Flame size={12} /> Bestseller</span>}
          {!item.isAvailable && <span className="label label--off">Unavailable</span>}
        </div>
        <span className={`veg-dot veg-dot--${item.foodType === 'Veg' ? 'veg' : 'nonveg'}`} title={item.foodType}><i /></span>
      </div>
      <div className="menu-card__body">
        <span className="menu-card__cat">{item.category}</span>
        <h3>{item.name}</h3>
        <p className="menu-card__desc">{item.description}</p>
        <div className="menu-card__footer">
          <strong className="price">{formatPrice(item.price)}</strong>
          <button className="btn btn--primary btn--sm" onClick={handleAdd} disabled={!item.isAvailable} aria-label={`Add ${item.name} to cart`}>
            {!item.isAvailable ? 'Sold out' : qty > 0 ? <><Check size={15} /> {qty} in cart</> : <><Plus size={15} /> Add</>}
          </button>
        </div>
      </div>
    </article>
  );
}
