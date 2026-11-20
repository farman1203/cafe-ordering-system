import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { MAX_QTY } from '../utils/constants';

const CART_KEY = 'bb_cart';
const CartContext = createContext(null);

// Load saved cart and drop anything that looks broken
const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY));
    if (!Array.isArray(saved)) return [];
    return saved.filter((i) => i && i._id && Number(i.price) > 0 && Number.isInteger(i.quantity) && i.quantity >= 1);
  } catch {
    return [];
  }
};

const clampQty = (q) => Math.min(Math.max(q, 1), MAX_QTY);

function reducer(items, action) {
  switch (action.type) {
    case 'ADD': {
      const { item } = action;
      const existing = items.find((i) => i._id === item._id);
      if (existing) return items.map((i) => (i._id === item._id ? { ...i, price: item.price, quantity: clampQty(i.quantity + 1) } : i));
      return [...items, { _id: item._id, name: item.name, price: item.price, image: item.image, foodType: item.foodType, category: item.category, quantity: 1 }];
    }
    case 'INC': return items.map((i) => (i._id === action.id ? { ...i, quantity: clampQty(i.quantity + 1) } : i));
    case 'DEC': return items.map((i) => (i._id === action.id ? { ...i, quantity: clampQty(i.quantity - 1) } : i));
    case 'REMOVE': return items.filter((i) => i._id !== action.id);
    case 'CLEAR': return [];
    default: return items;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [], load);

  // Save to localStorage every time the cart changes
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => {
    const itemCount = items.reduce((n, i) => n + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return {
      items, itemCount, subtotal, total: subtotal,
      // returns false if item can't be ordered
      addItem: (item) => {
        if (!item.isAvailable) return false;
        dispatch({ type: 'ADD', item });
        return true;
      },
      increment: (id) => dispatch({ type: 'INC', id }),
      decrement: (id) => dispatch({ type: 'DEC', id }),
      removeItem: (id) => dispatch({ type: 'REMOVE', id }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
      getQty: (id) => items.find((i) => i._id === id)?.quantity || 0,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
