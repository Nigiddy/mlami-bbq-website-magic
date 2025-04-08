
// This file is kept for backward compatibility
// Importing and re-exporting from the new files
import { CartProvider, useCart } from './cart';
import type { CartItem, CartContextType } from './cart/types';
import { CartContext } from './cart/CartContext';

export { CartProvider, useCart, CartContext };
export type { CartItem, CartContextType };
