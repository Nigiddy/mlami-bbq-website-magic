
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export type CartItem = {
  id: number;
  name: string;
  price: string;
  quantity: number;
  image: string;
};

export type Order = {
  id: number;
  customer: {
    name: string;
    phone: string;
  };
  items: CartItem[];
  status: string;
  subtotal: string;
  total: string;
  createdAt: Date;
};

export type MenuItem = {
  id: number;
  name: string;
  price: string;
  image: string;
  inStock: boolean;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: string;
  placeOrder: (customerName: string, phoneNumber: string) => Promise<boolean>;
  orders: Order[];
  updateOrderStatus: (id: number, status: string) => void;
  menuItems: MenuItem[];
  updateItemAvailability: (id: number, inStock: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

// Mock menu items data - in a real app, this would come from your API/backend
const initialMenuItems: MenuItem[] = [
  { id: 1, name: 'BBQ Ribs', price: '1200', image: '/placeholder.svg', inStock: true },
  { id: 2, name: 'Grilled Chicken', price: '950', image: '/placeholder.svg', inStock: true },
  { id: 3, name: 'Beef Brisket', price: '1400', image: '/placeholder.svg', inStock: true },
  { id: 4, name: 'Pork Chops', price: '1100', image: '/placeholder.svg', inStock: true },
  { id: 5, name: 'Vegetable Skewers', price: '750', image: '/placeholder.svg', inStock: true },
  { id: 6, name: 'Corn on the Cob', price: '250', image: '/placeholder.svg', inStock: true },
  { id: 7, name: 'Coleslaw', price: '200', image: '/placeholder.svg', inStock: true },
  { id: 8, name: 'Potato Salad', price: '350', image: '/placeholder.svg', inStock: true },
];

// Mock orders data - in a real app, this would come from your API/backend
const initialOrders: Order[] = [
  {
    id: 1001,
    customer: { name: 'John Doe', phone: '0712345678' },
    items: [
      { id: 1, name: 'BBQ Ribs', price: '1200', quantity: 2, image: '/placeholder.svg' },
      { id: 6, name: 'Corn on the Cob', price: '250', quantity: 3, image: '/placeholder.svg' },
    ],
    status: 'Completed',
    subtotal: '3150',
    total: '3150',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  },
  {
    id: 1002,
    customer: { name: 'Jane Smith', phone: '0723456789' },
    items: [
      { id: 2, name: 'Grilled Chicken', price: '950', quantity: 1, image: '/placeholder.svg' },
      { id: 8, name: 'Potato Salad', price: '350', quantity: 1, image: '/placeholder.svg' },
    ],
    status: 'Preparing',
    subtotal: '1300',
    total: '1300',
    createdAt: new Date(Date.now() - 40 * 60 * 1000), // 40 minutes ago
  },
  {
    id: 1003,
    customer: { name: 'Michael Johnson', phone: '0734567890' },
    items: [
      { id: 4, name: 'Pork Chops', price: '1100', quantity: 2, image: '/placeholder.svg' },
    ],
    status: 'Pending',
    subtotal: '2200',
    total: '2200',
    createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
  }
];

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  
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
    
    // Load orders from localStorage
    const savedOrders = localStorage.getItem('bbq-orders');
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error('Failed to parse orders data from localStorage');
      }
    } else {
      // Save initial orders to localStorage
      localStorage.setItem('bbq-orders', JSON.stringify(initialOrders));
    }
    
    // Load menu items from localStorage
    const savedMenuItems = localStorage.getItem('bbq-menu-items');
    if (savedMenuItems) {
      try {
        setMenuItems(JSON.parse(savedMenuItems));
      } catch (e) {
        console.error('Failed to parse menu items from localStorage');
      }
    } else {
      // Save initial menu items to localStorage
      localStorage.setItem('bbq-menu-items', JSON.stringify(initialMenuItems));
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bbq-cart', JSON.stringify(items));
  }, [items]);
  
  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bbq-orders', JSON.stringify(orders));
  }, [orders]);
  
  // Save menu items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bbq-menu-items', JSON.stringify(menuItems));
  }, [menuItems]);
  
  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    // Check if item is in stock
    const menuItem = menuItems.find(item => item.id === newItem.id);
    if (menuItem && !menuItem.inStock) {
      toast({
        title: "Item unavailable",
        description: `${newItem.name} is currently out of stock.`,
        variant: "destructive"
      });
      return;
    }
    
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
  
  // Calculate subtotal (in Kenyan Shillings)
  const subtotal = items.reduce((total, item) => {
    const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
    return total + (price * item.quantity);
  }, 0).toFixed(0); // No decimal places for Kenyan Shillings
  
  // Place an order
  const placeOrder = async (customerName: string, phoneNumber: string): Promise<boolean> => {
    if (items.length === 0) {
      toast({
        title: "Cannot place order",
        description: "Your cart is empty",
        variant: "destructive"
      });
      return false;
    }
    
    // In a real app, you would send the order to your API/backend here
    // For this example, we're just simulating it with a timeout
    try {
      const newOrder: Order = {
        id: Date.now(),
        customer: {
          name: customerName,
          phone: phoneNumber,
        },
        items: [...items],
        status: 'Pending',
        subtotal,
        total: subtotal, // In a real app, you might add tax, delivery fee, etc.
        createdAt: new Date(),
      };
      
      // Add the new order to the orders array
      setOrders(prevOrders => [newOrder, ...prevOrders]);
      
      toast({
        title: "Order placed successfully",
        description: `Your order #${newOrder.id} has been placed and is being processed.`,
      });
      
      // Clear the cart
      clearCart();
      
      return true;
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Failed to place order",
        description: "An error occurred while placing your order. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Update order status
  const updateOrderStatus = (id: number, status: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === id ? { ...order, status } : order
      )
    );
    
    toast({
      title: "Order updated",
      description: `Order #${id} status changed to ${status}`,
    });
  };
  
  // Update item availability
  const updateItemAvailability = (id: number, inStock: boolean) => {
    setMenuItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, inStock } : item
      )
    );
    
    const itemName = menuItems.find(item => item.id === id)?.name || 'Item';
    toast({
      title: "Inventory updated",
      description: `${itemName} is now ${inStock ? 'in stock' : 'out of stock'}`,
    });
  };
  
  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    placeOrder,
    orders,
    updateOrderStatus,
    menuItems,
    updateItemAvailability
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
