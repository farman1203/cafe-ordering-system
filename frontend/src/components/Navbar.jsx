import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Coffee, Menu as MenuIcon, ShoppingCart, X, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSession } from '../context/SessionContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { itemCount } = useCart();
  const { table } = useSession();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]); // close mobile menu after navigating
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <Link to="/" className="logo" aria-label="Brew & Bites home">
          <span className="logo__icon"><Coffee size={20} /></span>
          <span>Brew <em>&amp;</em> Bites</span>
        </Link>

        <nav className={`navbar__links ${open ? 'is-open' : ''}`}>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/menu">Menu</NavLink>
          <NavLink to="/track">Track Order</NavLink>
        </nav>

        <div className="navbar__actions">
          {table && (
            <span className="table-chip" title="Your table"><MapPin size={14} /> Table {table}</span>
          )}
          <Link to="/cart" className="cart-btn" aria-label={`Cart with ${itemCount} items`}>
            <ShoppingCart size={21} />
            {itemCount > 0 && <span className="cart-btn__count">{itemCount}</span>}
          </Link>
          <button className="navbar__toggle" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
            {open ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}
