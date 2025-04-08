
import React, { createContext, useState, useContext } from 'react';
import { CartContextType, CartItem } from './types';
import { initialMenuItems, initialOrders } from './mockData';

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
  const [menuItems, setMenuItems] = useState<CartItem[]>(initialMenuItems);
  const [orders, setOrders] = useState(initialOrders);

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
