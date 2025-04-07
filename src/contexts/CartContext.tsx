
import React, { createContext, useState, useContext } from 'react';

export type CartItem = {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity?: number;
  tableNumber?: string | null;
  inStock?: boolean; // Added inStock property
};

type OrderItem = CartItem & {
  quantity: number;
};

type Customer = {
  name: string;
  phone: string;
};

type Order = {
  id: number;
  items: OrderItem[];
  customer: Customer;
  status: string;
  total: string;
  subtotal: string;
  createdAt: string;
  tableNumber?: string | null;
};

type CartContextType = {
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

export const CartContext = createContext<CartContextType>({
  items: [],
  totalItems: 0,
  subtotal: 0,
  tableNumber: null,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  setTableNumber: () => {},
  // Admin functionality defaults
  menuItems: [],
  orders: [],
  updateOrderStatus: () => {},
  updateItemAvailability: () => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  
  // Mock data for admin functionality
  const [menuItems, setMenuItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Smoked Brisket",
      price: "1899",
      image: "/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png",
      quantity: 0,
      inStock: true,
    },
    {
      id: 2,
      name: "Pulled Pork Sandwich",
      price: "1499",
      image: "/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png",
      quantity: 0,
      inStock: true,
    },
    {
      id: 3,
      name: "BBQ Ribs",
      price: "2299",
      image: "/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png",
      quantity: 0,
      inStock: false,
    },
  ]);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      items: [
        { 
          id: 1, 
          name: "Smoked Brisket", 
          price: "1899", 
          image: "/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png",
          quantity: 2
        },
      ],
      customer: { name: "John Doe", phone: "0712345678" },
      status: "Pending",
      total: "3798",
      subtotal: "3798",
      createdAt: new Date().toISOString(),
      tableNumber: "5",
    },
    {
      id: 2,
      items: [
        { 
          id: 2, 
          name: "Pulled Pork Sandwich", 
          price: "1499", 
          image: "/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png",
          quantity: 1
        },
      ],
      customer: { name: "Jane Smith", phone: "0723456789" },
      status: "Completed",
      total: "1499",
      subtotal: "1499",
      createdAt: new Date().toISOString(),
      tableNumber: "3",
    },
  ]);

  const addItem = (item: CartItem) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      
      // Set the tableNumber from the incoming item if it exists and we don't already have one
      if (item.tableNumber && !tableNumber) {
        setTableNumber(item.tableNumber);
      }
      
      if (existingItem) {
        return prevItems.map(i => 
          i.id === item.id 
            ? { ...i, quantity: (i.quantity || 1) + 1 } 
            : i
        );
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  const removeItem = (id: number) => {
    setItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === id);
      if (!itemToRemove || !itemToRemove.quantity || itemToRemove.quantity <= 1) {
        return prevItems.filter(item => item.id !== id);
      } else {
        return prevItems.map(item =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    setItems(prevItems => {
      if (quantity <= 0) {
        return prevItems.filter(item => item.id !== id);
      }
      return prevItems.map(item =>
        item.id === id ? { ...item, quantity: quantity } : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
    setTableNumber(null);
  };

  const totalItems = items.reduce((total, item) => total + (item.quantity || 1), 0);
  
  const subtotal = items.reduce((total, item) => {
    const price = parseFloat(item.price);
    return total + price * (item.quantity || 1);
  }, 0);

  // Admin functionality
  const updateOrderStatus = (id: number, status: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === id ? { ...order, status } : order
      )
    );
  };

  const updateItemAvailability = (id: number, inStock: boolean) => {
    setMenuItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, inStock } : item
      )
    );
  };

  return (
    <CartContext.Provider 
      value={{ 
        items, 
        totalItems, 
        subtotal, 
        tableNumber,
        addItem, 
        removeItem, 
        updateQuantity, 
        clearCart,
        setTableNumber,
        // Admin functionality
        menuItems,
        orders,
        updateOrderStatus,
        updateItemAvailability
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Add the useCart hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
