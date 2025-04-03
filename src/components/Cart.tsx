
import React from 'react';
import { ShoppingBag, X, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import CartItem from './CartItem';

const Cart: React.FC = () => {
  const { items, totalItems, subtotal, clearCart } = useCart();
  const [open, setOpen] = React.useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative" 
          aria-label="Open cart"
        >
          <ShoppingBag className="h-6 w-6" />
          {totalItems > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-bbq-orange text-white text-xs"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      
      <DrawerContent className="max-h-[85vh] flex flex-col">
        <div className="container max-w-md mx-auto">
          <DrawerHeader className="flex items-center justify-between border-b pb-4">
            <DrawerTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart
            </DrawerTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500">
                <ShoppingBag className="h-12 w-12 mb-4 opacity-20" />
                <p className="mb-2">Your cart is empty</p>
                <Button 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  className="mt-2"
                >
                  Browse Menu
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {items.map(item => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <DrawerFooter className="border-t pt-4">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${subtotal}</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button className="w-full bg-bbq-orange hover:bg-bbq-orange/90">
                    Checkout (${subtotal})
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={clearCart}
                    className="w-full"
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </DrawerFooter>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default Cart;
