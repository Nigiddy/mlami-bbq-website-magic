
import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, ShoppingCart, Phone, TableIcon, Loader2 } from 'lucide-react';
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
import { useLocation } from 'react-router-dom';
import { useMpesaTransaction } from '@/hooks/useMpesaTransaction';

const orderSchema = z.object({
  phoneNumber: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(12, "Phone number must not exceed 12 digits")
    .regex(/^(?:254|\+254|0)?(7[0-9]{8})$/, "Please enter a valid Kenyan phone number"),
  tableNumber: z.string()
    .min(1, "Table number is required")
    .regex(/^[1-9][0-9]*$/, "Please enter a valid table number")
});

const Cart: React.FC = () => {
  const { items, totalItems, subtotal, clearCart, tableNumber, setTableNumber } = useCart();
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const { 
    initiatePayment, 
    checkStatus, 
    resetTransaction,
    isProcessing, 
    checkoutRequestId 
  } = useMpesaTransaction();
  const [paymentSent, setPaymentSent] = useState(false);

  const form = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      phoneNumber: '',
      tableNumber: tableNumber || '',
    },
  });

  // Update form when tableNumber changes in context
  useEffect(() => {
    if (tableNumber) {
      form.setValue('tableNumber', tableNumber);
    }

    // Parse URL for table param
    const params = new URLSearchParams(location.search);
    const tableParam = params.get('table');
    if (tableParam && !tableNumber) {
      setTableNumber(tableParam);
      form.setValue('tableNumber', tableParam);
    }
  }, [tableNumber, form, location.search, setTableNumber]);

  // Function to handle M-Pesa payment
  const handleMpesaPayment = async (values: z.infer<typeof orderSchema>) => {
    // Format cart items for the database
    const cartItems = items.map(item => ({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      quantity: item.quantity || 1
    }));

    const success = await initiatePayment({
      phoneNumber: values.phoneNumber,
      amount: subtotal,
      tableNumber: values.tableNumber,
      cartItems: cartItems
    });

    if (success) {
      setPaymentSent(true);
      
      // Store table number in context
      setTableNumber(values.tableNumber);
    }
  };

  // Function to check payment status
  const handleCheckStatus = async () => {
    const success = await checkStatus();
    if (success) {
      // Payment was successful, clear the cart
      clearCart();
      setOpen(false);
      setPaymentSent(false);
      resetTransaction();
      
      toast({
        title: "Order Placed Successfully",
        description: "Your order has been placed and will be prepared shortly.",
      });
    }
  };

  // Function to cancel payment and reset
  const handleCancelPayment = () => {
    setPaymentSent(false);
    resetTransaction();
    toast({
      title: "Payment Cancelled",
      description: "M-Pesa payment request has been cancelled.",
    });
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
      
      <DrawerContent className="max-h-[85vh] flex flex-col backdrop-blur-md bg-white/90 border-t border-white/20">
        <div className="container max-w-md mx-auto">
          <DrawerHeader className="flex items-center justify-between border-b pb-4">
            <DrawerTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart
              {tableNumber && <span className="text-sm text-gray-500">(Table #{tableNumber})</span>}
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
                
                {!paymentSent ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleMpesaPayment)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="tableNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Table Number</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <TableIcon className="h-4 w-4 text-gray-500" />
                                <Input 
                                  placeholder="e.g. 5" 
                                  {...field} 
                                  className="flex-1 backdrop-blur-sm bg-white/40"
                                />
                              </div>
                            </FormControl>
                            <FormDescription className="text-xs text-gray-500">
                              Enter your table number (can be found on your table)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
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
                                  className="flex-1 backdrop-blur-sm bg-white/40"
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
                          className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2 backdrop-blur-sm"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Pay with M-Pesa
                              <Phone className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                        <Button 
                          type="button"
                          variant="outline" 
                          onClick={clearCart}
                          className="w-full backdrop-blur-sm bg-white/40"
                          disabled={isProcessing}
                        >
                          Clear Cart
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-md">
                      <h4 className="font-medium mb-2">Payment Initiated</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        An M-Pesa STK push has been sent to your phone. Please enter your PIN to complete the payment.
                      </p>
                      <div className="flex justify-between gap-2">
                        <Button 
                          onClick={handleCheckStatus}
                          className="flex-1"
                          variant="outline"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Checking...
                            </>
                          ) : "Check Status"}
                        </Button>
                        <Button 
                          onClick={handleCancelPayment}
                          className="flex-1"
                          variant="ghost"
                          disabled={isProcessing}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DrawerFooter>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default Cart;
