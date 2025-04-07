import React, { createContext, useState } from 'react';

export type CartItem = {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity?: number;
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
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState<string | null>(null);

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
        setTableNumber
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
