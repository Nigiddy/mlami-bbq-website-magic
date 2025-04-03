
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export type CartItem = {
  id: number;
  name: string;
  price: string;
  quantity: number;
  image: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: string;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('bbq-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart data from localStorage');
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bbq-cart', JSON.stringify(items));
  }, [items]);
  
  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === newItem.id);
      
      if (existingItem) {
        // Item already exists, increase quantity
        const updatedItems = prevItems.map(item => 
          item.id === newItem.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
        toast({
          title: "Item added to cart",
          description: `${newItem.name} quantity increased to ${existingItem.quantity + 1}`
        });
        return updatedItems;
      } else {
        // New item, add with quantity 1
        toast({
          title: "Item added to cart",
          description: `${newItem.name} added to your cart`
        });
        return [...prevItems, { ...newItem, quantity: 1 }];
      }
    });
  };
  
  const removeItem = (id: number) => {
    setItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === id);
      if (itemToRemove) {
        toast({
          title: "Item removed",
          description: `${itemToRemove.name} removed from your cart`
        });
      }
      return prevItems.filter(item => item.id !== id);
    });
  };
  
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };
  
  const clearCart = () => {
    setItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart"
    });
  };
  
  // Calculate total number of items
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate subtotal (assuming price is in format "$XX.XX")
  const subtotal = items.reduce((total, item) => {
    const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
    return total + (price * item.quantity);
  }, 0).toFixed(2);
  
  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal
  };
  
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
