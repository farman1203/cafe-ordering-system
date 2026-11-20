import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { ClipboardList, Coffee, ExternalLink, LayoutDashboard, LogOut, Menu as MenuIcon, QrCode, UtensilsCrossed, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/admin/qr', label: 'QR Codes', icon: QrCode },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { admin, logout } = useAuth();

  return (
    <div className="admin">
      <aside className={`admin__sidebar ${open ? 'is-open' : ''}`}>
        <div className="logo logo--light"><span className="logo__icon"><Coffee size={20} /></span><span>Brew <em>&amp;</em> Bites</span></div>
        <span className="admin__tag">Admin Panel</span>
        <nav>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}><Icon size={19} /> {label}</NavLink>
          ))}
        </nav>
        <div className="admin__sidebar-foot">
          <Link to="/" target="_blank"><ExternalLink size={16} /> View website</Link>
          <button onClick={logout}><LogOut size={16} /> Log out</button>
        </div>
      </aside>
      {open && <div className="admin__backdrop" onClick={() => setOpen(false)} />}

      <div className="admin__main">
        <header className="admin__topbar">
          <button className="icon-btn admin__burger" onClick={() => setOpen((o) => !o)} aria-label="Toggle sidebar">{open ? <X size={22} /> : <MenuIcon size={22} />}</button>
          <span className="muted">Signed in as</span> <strong>{admin?.name}</strong>
        </header>
        <main className="admin__content"><Outlet /></main>
      </div>
    </div>
  );
}
