import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Clock, Coffee, Heart, QrCode, Quote, Star } from 'lucide-react';
import MenuCard from '../components/MenuCard';
import FoodImage from '../components/FoodImage';
import { SkeletonGrid } from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { fetchCategories, fetchMenu } from '../services/menuService';
import { getErrorMessage } from '../services/api';
import { CATEGORY_IMAGES } from '../utils/constants';
import { formatPrice } from '../utils/helpers';

const TESTIMONIALS = [
  { name: 'Aarav Mehta', role: 'Regular guest', text: 'The caramel latte is the best in the city, and ordering from the table QR means no waiting at all.' },
  { name: 'Priya Desai', role: 'Freelance designer', text: 'Quiet corners, great Wi-Fi and a lava cake that I think about all week. My go-to work spot.' },
  { name: 'Rohan Patel', role: 'Food blogger', text: 'Fresh ingredients and quick service. Tracking my order from my phone was a lovely touch.' },
];

export default function Home() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true); setError('');
    Promise.all([fetchMenu({ bestseller: true, available: true }), fetchCategories()])
      .then(([menu, cats]) => { setItems(menu); setCategories(cats); })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const popular = items.slice(0, 4);
  const loved = items.slice(4, 8);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__text">
            <span className="eyebrow"><Coffee size={15} /> Specialty coffee &amp; kitchen</span>
            <h1>Freshly Brewed. <span>Perfectly Served.</span></h1>
            <p>Small-batch coffee, handmade food and a table that feels like home. Scan the QR on your table, order in seconds and we bring it to you.</p>
            <div className="hero__cta">
              <Link to="/menu" className="btn btn--primary btn--lg">Explore Menu <ArrowRight size={18} /></Link>
              <Link to="/track" className="btn btn--outline btn--lg">Track Order</Link>
            </div>
            <ul className="hero__stats">
              <li><strong>4.8<Star size={14} fill="currentColor" /></strong><span>Guest rating</span></li>
              <li><strong>25+</strong><span>Handcrafted items</span></li>
              <li><strong>10 min</strong><span>Avg. serving time</span></li>
            </ul>
          </div>
          <div className="hero__media">
            <FoodImage src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80" alt="Latte with latte art" />
            <div className="hero__badge"><QrCode size={22} /><div><strong>Scan. Order. Enjoy.</strong><span>No app, no login</span></div></div>
          </div>
        </div>
      </section>

      {/* POPULAR */}
      <section className="section">
        <div className="container">
          <div className="section__head">
            <div><span className="eyebrow">Guest favourites</span><h2>Popular Items</h2></div>
            <Link to="/menu" className="link-arrow">View full menu <ArrowRight size={16} /></Link>
          </div>
          {loading ? <SkeletonGrid count={4} /> : error ? <ErrorMessage message={error} onRetry={load} /> : (
            <div className="menu-grid">{popular.map((i) => <MenuCard key={i._id} item={i} />)}</div>
          )}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section section--alt">
        <div className="container">
          <div className="section__head section__head--center"><div><span className="eyebrow">Browse by craving</span><h2>Menu Categories</h2></div></div>
          <div className="category-grid">
            {(categories.length ? categories : Object.keys(CATEGORY_IMAGES).map((name) => ({ name }))).map((c) => (
              <Link key={c.name} to={`/menu?category=${encodeURIComponent(c.name)}`} className="category-tile">
                <FoodImage src={CATEGORY_IMAGES[c.name]} alt={c.name} />
                <div className="category-tile__label"><strong>{c.name}</strong>{c.count !== undefined && <span>{c.count} items</span>}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BESTSELLERS */}
      {loved.length > 0 && (
        <section className="section section--dark">
          <div className="container">
            <div className="section__head"><div><span className="eyebrow eyebrow--light">Most ordered</span><h2>Bestsellers</h2></div></div>
            <div className="bestsellers">
              {loved.map((i, idx) => (
                <Link to="/menu" key={i._id} className="bestseller">
                  <span className="bestseller__rank">0{idx + 1}</span>
                  <FoodImage src={i.image} alt={i.name} />
                  <div><h3>{i.name}</h3><p>{i.category}</p></div>
                  <strong>{formatPrice(i.price)}</strong>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ABOUT */}
      <section className="section">
        <div className="container about">
          <div className="about__media">
            <FoodImage src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=80" alt="Inside Brew & Bites cafe" />
          </div>
          <div>
            <span className="eyebrow">Our story</span>
            <h2>A cafe built around good coffee and good company</h2>
            <p>Brew &amp; Bites started with one espresso machine and a simple idea: great coffee should feel unhurried. We roast in small batches, bake every morning and cook to order.</p>
            <ul className="about__points">
              <li><Award size={20} /><div><strong>Specialty beans</strong><span>Ethically sourced and roasted weekly.</span></div></li>
              <li><Heart size={20} /><div><strong>Made with care</strong><span>Fresh ingredients, no shortcuts.</span></div></li>
              <li><Clock size={20} /><div><strong>Order from your table</strong><span>Scan the QR and skip the queue.</span></div></li>
            </ul>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section section--alt">
        <div className="container">
          <div className="section__head section__head--center"><div><span className="eyebrow">Kind words</span><h2>What Our Guests Say</h2></div></div>
          <div className="testimonials">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="testimonial">
                <Quote size={26} />
                <blockquote>{t.text}</blockquote>
                <div className="testimonial__stars">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} fill="currentColor" />)}</div>
                <figcaption><strong>{t.name}</strong><span>{t.role}</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-band__inner">
          <h2>Hungry already?</h2>
          <Link to="/menu" className="btn btn--light btn--lg">Order now <ArrowRight size={18} /></Link>
        </div>
      </section>
    </>
  );
}
