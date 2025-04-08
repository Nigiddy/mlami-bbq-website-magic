
export type CartItem = {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity?: number;
  tableNumber?: string | null;
  inStock?: boolean;
};

export type OrderItem = CartItem & {
  quantity: number;
};

export type Customer = {
  name: string;
  phone: string;
};

export type Order = {
  id: number;
  items: OrderItem[];
  customer: Customer;
  status: string;
  total: string;
  subtotal: string;
  createdAt: string;
  tableNumber?: string | null;
};

export type CartContextType = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  tableNumber: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  setTableNumber: (tableNumber: string | null) => void;
  // Admin functionality
  menuItems: CartItem[];
  orders: Order[];
  updateOrderStatus: (id: number, status: string) => void;
  updateItemAvailability: (id: number, inStock: boolean) => void;
};
