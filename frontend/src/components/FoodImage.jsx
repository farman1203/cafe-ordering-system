import { useState } from 'react';
import { Coffee } from 'lucide-react';

// Shows the image; if the link is empty/broken shows a warm gradient + icon instead (never a broken image)
export default function FoodImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`food-img food-img--fallback ${className}`} role="img" aria-label={alt}>
        <Coffee size={34} />
      </div>
    );
  }
  return <img className={`food-img ${className}`} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}
