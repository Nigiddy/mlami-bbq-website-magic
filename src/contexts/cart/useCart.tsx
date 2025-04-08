
import { useContext } from 'react';
import { CartContext } from './CartContext';

// Add the useCart hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
