
import React, { useState } from 'react';
import { ShoppingBag, X, ShoppingCart, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import CartItem from './CartItem';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const phoneSchema = z.object({
  phoneNumber: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(12, "Phone number must not exceed 12 digits")
    .regex(/^(?:254|\+254|0)?(7[0-9]{8})$/, "Please enter a valid Kenyan phone number")
});

const Cart: React.FC = () => {
  const { items, totalItems, subtotal, clearCart } = useCart();
  const [open, setOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: '',
    },
  });

  const initiateSTKPush = async (values: z.infer<typeof phoneSchema>) => {
    setIsProcessing(true);
    try {
      // Format phone number to ensure it's in the correct format (254XXXXXXXXX)
      let phoneNumber = values.phoneNumber;
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '254' + phoneNumber.substring(1);
      } else if (phoneNumber.startsWith('+254')) {
        phoneNumber = phoneNumber.substring(1);
      }

      // In a real implementation, this would make an API call to your backend
      // which would then call the Mpesa Daraja API
      console.log('Initiating STK Push to phone:', phoneNumber, 'for amount:', subtotal);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      toast({
        title: "STK Push Sent",
        description: "Please check your phone to complete the payment",
      });
    } catch (error) {
      console.error('STK Push failed:', error);
      toast({
        title: "Payment Failed",
        description: "Failed to initiate M-Pesa payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
                  <span>Ksh {subtotal}</span>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(initiateSTKPush)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>M-Pesa Phone Number</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <Input 
                                placeholder="e.g. 0712345678" 
                                {...field} 
                                className="flex-1"
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500">
                            Enter the phone number registered with M-Pesa
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-col gap-2">
                      <Button 
                        type="submit" 
                        className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                        disabled={isProcessing}
                      >
                        {isProcessing ? "Processing..." : "Pay with M-Pesa"}
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={clearCart}
                        className="w-full"
                        disabled={isProcessing}
                      >
                        Clear Cart
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </DrawerFooter>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default Cart;
