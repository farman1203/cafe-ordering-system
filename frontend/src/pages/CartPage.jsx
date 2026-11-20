import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import CartItem from '../components/CartItem';
import Cart from '../components/Cart';
import EmptyState from '../components/EmptyState';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="page container">
        <EmptyState icon={ShoppingBag} title="Your cart is empty" text="Looks like you haven't added anything yet."
          action={<Link to="/menu" className="btn btn--primary">Browse the menu</Link>} />
      </div>
    );
  }

  return (
    <div className="page container">
      <div className="page__head"><h1>Your cart</h1></div>
      <div className="two-col">
        <section className="cart-list">
          {items.map((item) => <CartItem key={item._id} item={item} />)}
          <div className="cart-list__foot">
            <Link to="/menu" className="link-arrow">← Add more items</Link>
            <button className="link-btn link-btn--danger" onClick={clearCart}>Clear cart</button>
          </div>
        </section>
        <Cart showLines={false}>
          <button className="btn btn--primary btn--block btn--lg" onClick={() => navigate('/checkout')}>Proceed to checkout <ArrowRight size={18} /></button>
        </Cart>
      </div>
    </div>
  );
}
