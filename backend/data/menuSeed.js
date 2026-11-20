// Sample menu. Images are Unsplash links; the frontend shows a nice fallback if any link ever breaks.
const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

module.exports = [
  // ---- Coffee ----
  { name: 'Classic Espresso', category: 'Coffee', price: 120, foodType: 'Veg', isBestseller: false, description: 'A bold double shot of freshly ground single-origin espresso.', image: img('photo-1510707577719-ae7c14805e3a') },
  { name: 'Cappuccino', category: 'Coffee', price: 160, foodType: 'Veg', isBestseller: true, description: 'Equal parts espresso, steamed milk and silky microfoam.', image: img('photo-1572442388796-11668a67e53d') },
  { name: 'Caramel Latte', category: 'Coffee', price: 190, foodType: 'Veg', isBestseller: true, description: 'Smooth espresso with steamed milk and house-made caramel drizzle.', image: img('photo-1495474472287-4d71bcdd2085') },
  { name: 'Hazelnut Mocha', category: 'Coffee', price: 210, foodType: 'Veg', isBestseller: false, description: 'Rich chocolate and hazelnut folded into velvety espresso.', image: img('photo-1578374173705-969cbe6f2d6b') },
  // ---- Tea ----
  { name: 'Masala Chai', category: 'Tea', price: 80, foodType: 'Veg', isBestseller: true, description: 'Slow-brewed Assam tea with ginger, cardamom and warm spices.', image: img('photo-1561336313-0bd5e0b27ec8') },
  { name: 'Green Tea', category: 'Tea', price: 110, foodType: 'Veg', isBestseller: false, description: 'Light, refreshing Japanese-style green tea.', image: img('photo-1556679343-c7306c1976bc') },
  { name: 'Lemon Honey Ginger Tea', category: 'Tea', price: 130, foodType: 'Veg', isBestseller: false, description: 'A soothing blend of fresh ginger, lemon and local honey.', image: img('photo-1544787219-7f47ccb76574') },
  // ---- Cold Beverages ----
  { name: 'Iced Americano', category: 'Cold Beverages', price: 150, foodType: 'Veg', isBestseller: false, description: 'Double espresso over ice, crisp and clean.', image: img('photo-1517701604599-bb29b565090c') },
  { name: 'Cold Coffee Frappe', category: 'Cold Beverages', price: 200, foodType: 'Veg', isBestseller: true, description: 'Blended cold coffee with ice cream and chocolate sauce.', image: img('photo-1461023058943-07fcbe16d735') },
  { name: 'Fresh Lime Soda', category: 'Cold Beverages', price: 100, foodType: 'Veg', isBestseller: false, description: 'Sweet, salted or mixed - fizzy and refreshing.', image: img('photo-1513558161293-cdaf765ed2fd') },
  { name: 'Mango Smoothie', category: 'Cold Beverages', price: 180, foodType: 'Veg', isBestseller: false, description: 'Alphonso mango blended with chilled yoghurt.', image: img('photo-1553530666-ba11a7da3888') },
  // ---- Burgers ----
  { name: 'Classic Veg Burger', category: 'Burgers', price: 170, foodType: 'Veg', isBestseller: false, description: 'Crispy veggie patty, lettuce, tomato and our signature sauce.', image: img('photo-1550547660-d9450f859349') },
  { name: 'Crispy Chicken Burger', category: 'Burgers', price: 230, foodType: 'Non-Veg', isBestseller: true, description: 'Buttermilk-fried chicken, slaw and chipotle mayo in a toasted bun.', image: img('photo-1568901346375-23c9450c58cd') },
  { name: 'Paneer Tikka Burger', category: 'Burgers', price: 190, foodType: 'Veg', isBestseller: false, description: 'Smoky tandoori paneer with mint chutney.', image: img('photo-1571091718767-18b5b1457add') },
  // ---- Sandwiches ----
  { name: 'Grilled Cheese Sandwich', category: 'Sandwiches', price: 140, foodType: 'Veg', isBestseller: true, description: 'Three-cheese blend grilled golden on sourdough.', image: img('photo-1528735602780-2552fd46c7af') },
  { name: 'Chicken Club Sandwich', category: 'Sandwiches', price: 220, foodType: 'Non-Veg', isBestseller: false, description: 'Grilled chicken, egg, lettuce and tomato in toasted triple layers.', image: img('photo-1521390188846-e2a3a97453a0') },
  { name: 'Veggie Delight Sandwich', category: 'Sandwiches', price: 130, foodType: 'Veg', isBestseller: false, description: 'Fresh garden vegetables with herb cream cheese.', image: img('photo-1553909489-cd47e0907980') },
  // ---- Pizza ----
  { name: 'Margherita Pizza', category: 'Pizza', price: 280, foodType: 'Veg', isBestseller: true, description: 'Hand-stretched base, San Marzano tomato, fresh mozzarella and basil.', image: img('photo-1513104890138-7c749659a591') },
  { name: 'Farmhouse Pizza', category: 'Pizza', price: 340, foodType: 'Veg', isBestseller: false, description: 'Loaded with mushrooms, capsicum, olives and sweet corn.', image: img('photo-1565299624946-b28f40a0ae38') },
  { name: 'Peri Peri Chicken Pizza', category: 'Pizza', price: 380, foodType: 'Non-Veg', isBestseller: false, description: 'Spicy peri-peri chicken, onions and mozzarella.', image: img('photo-1604382354936-07c5d9983bd3') },
  // ---- Desserts ----
  { name: 'Chocolate Lava Cake', category: 'Desserts', price: 180, foodType: 'Veg', isBestseller: true, description: 'Warm chocolate cake with a molten centre, served with ice cream.', image: img('photo-1578985545062-69928b1d9587') },
  { name: 'Classic Tiramisu', category: 'Desserts', price: 210, foodType: 'Veg', isBestseller: false, description: 'Coffee-soaked sponge layered with mascarpone cream and cocoa.', image: img('photo-1571877227200-a0d98ea607e9') },
  { name: 'Glazed Donut', category: 'Desserts', price: 90, foodType: 'Veg', isBestseller: false, description: 'Soft, fluffy donut with a sweet vanilla glaze.', image: img('photo-1551024601-bec78aea704b') },
  // ---- Snacks ----
  { name: 'Peri Peri Fries', category: 'Snacks', price: 130, foodType: 'Veg', isBestseller: true, description: 'Crispy fries tossed in spicy peri-peri seasoning.', image: img('photo-1573080496219-bb080dd4f877') },
  { name: 'Garlic Bread with Cheese', category: 'Snacks', price: 150, foodType: 'Veg', isBestseller: false, description: 'Toasted baguette with garlic butter and melted mozzarella.', image: img('photo-1573140247632-f8fd74997d5c') },
  { name: 'Chicken Wings (6 pcs)', category: 'Snacks', price: 260, foodType: 'Non-Veg', isBestseller: false, description: 'Crispy wings tossed in smoky BBQ sauce.', image: img('photo-1567620832903-9fc6debc209f'), isAvailable: false },
];
