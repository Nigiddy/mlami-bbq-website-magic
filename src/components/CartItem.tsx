
import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, CartItem as CartItemType } from '@/contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex items-center gap-4 py-4 border-b">
      <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
        <img 
          src={item.image} 
          alt={item.name} 
          className="h-full w-full object-cover"
        />
      </div>
      
      <div className="flex-grow">
        <h4 className="font-medium">{item.name}</h4>
        <p className="text-bbq-orange font-medium">Ksh {item.price.replace(/\$/g, '')}</p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 rounded-full"
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <span className="w-8 text-center">{item.quantity}</span>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 rounded-full"
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-red-500 ml-2"
          onClick={() => removeItem(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CartItem;
