
import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyCartProps {
  onClose: () => void;
}

const EmptyCart: React.FC<EmptyCartProps> = ({ onClose }) => {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500">
      <ShoppingBag className="h-12 w-12 mb-4 opacity-20" />
      <p className="mb-2">Your cart is empty</p>
      <Button 
        variant="outline" 
        onClick={onClose}
        className="mt-2"
      >
        Browse Menu
      </Button>
    </div>
  );
};

export default EmptyCart;
