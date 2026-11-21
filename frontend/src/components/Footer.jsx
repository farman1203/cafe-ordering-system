import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Facebook, Instagram, Mail, MapPin, Phone, QrCode, Twitter } from 'lucide-react';
import QRCodeModal from './QRCodeModal';
import { buildTableUrl } from '../utils/helpers';

export default function Footer() {
  const [showQr, setShowQr] = useState(false);
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <div className="logo logo--light"><span className="logo__icon"><Coffee size={20} /></span><span>Brew <em>&amp;</em> Bites</span></div>
          <p>Freshly roasted coffee, handmade food and a warm corner to enjoy them. Scan the QR on your table and order without waiting.</p>
          <div className="socials">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={18} /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><Twitter size={18} /></a>
          </div>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><Link to="/menu">Our Menu</Link></li>
            <li><Link to="/track">Track Your Order</Link></li>
            <li><Link to="/cart">Your Cart</Link></li>
            <li><button className="link-btn" onClick={() => setShowQr(true)}><QrCode size={15} /> Scan to order</button></li>
          </ul>
        </div>
        <div>
          <h4>Visit us</h4>
          <ul className="footer__contact">
            <li><MapPin size={16} /> Anand, Gujarat</li>
            <li><Phone size={16} /> +91 99999 99999</li>
            <li><Mail size={16} /> hello@gmail.com</li>
            <li>Open daily · 8:00 AM – 11:00 PM</li>
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>© {new Date().getFullYear()} Brew &amp; Bites. All rights reserved.</span>
          <Link to="/admin/login" className="footer__admin">Staff login</Link>
        </div>
      </div>
      {showQr && <QRCodeModal url={buildTableUrl('')} label="Brew & Bites Menu" onClose={() => setShowQr(false)} />}
    </footer>
  );
}
