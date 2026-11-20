import { Link } from 'react-router-dom';
import { Coffee } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="notfound">
      <Coffee size={56} />
      <h1>404</h1>
      <p>This page went out for a coffee break.</p>
      <Link to="/" className="btn btn--primary">Back to home</Link>
    </div>
  );
}
