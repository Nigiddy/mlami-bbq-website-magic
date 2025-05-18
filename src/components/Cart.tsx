
import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/cart'; 
import CartItem from './CartItem';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';
import { useMpesaTransaction } from '@/hooks/useMpesaTransaction';
import EmptyCart from './cart/EmptyCart';
import CartFooter from './cart/CartFooter';
import { PaymentFormValues } from './cart/PaymentForm';

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
    lastError,
    paymentStatus,
    transactionId,
    checkoutRequestId
  } = useMpesaTransaction();
  const [paymentSent, setPaymentSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  useEffect(() => {
    // Parse URL for table param
    const params = new URLSearchParams(location.search);
    const tableParam = params.get('table');
    if (tableParam && !tableNumber) {
      setTableNumber(tableParam);
      toast({
        title: "Table Detected",
        description: `You are ordering from Table #${tableParam}`,
      });
    }
  }, [location.search, tableNumber, setTableNumber, toast]);
  
  // Reset payment state when cart is closed
  useEffect(() => {
    if (!open && paymentSent) {
      // Small delay to allow drawer to close before resetting
      const timer = setTimeout(() => {
        if (paymentStatus === 'success') {
          clearCart();
        }
        setPaymentSent(false);
        resetTransaction();
        setPhoneNumber('');
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [open, paymentSent, paymentStatus, clearCart, resetTransaction]);

  // Function to handle M-Pesa payment
  const handleMpesaPayment = async (values: PaymentFormValues) => {
    // Validate table number
    if (!values.tableNumber || values.tableNumber.trim() === '') {
      toast({
        title: "Missing Table Number",
        description: "Please enter your table number",
        variant: "destructive",
      });
      return;
    }
    
    // Format cart items for the database
    const cartItems = items.map(item => ({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      quantity: item.quantity || 1
    }));

    // Store phone number for the receipt
    setPhoneNumber(values.phoneNumber);

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
      // Payment was successful
      toast({
        title: "Order Placed Successfully",
        description: "Your order has been placed and will be prepared shortly.",
      });
      
      // We'll let the useEffect close the drawer and clean up
    }
  };

  // Function to cancel payment and reset
  const handleCancelPayment = () => {
    setPaymentSent(false);
    resetTransaction();
    setPhoneNumber('');
    toast({
      title: "Payment Cancelled",
      description: "M-Pesa payment request has been cancelled.",
    });
  };

  // Function to handle receipt close
  const handleCloseReceipt = () => {
    setOpen(false); // Close the drawer after viewing receipt
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
              <EmptyCart onClose={() => setOpen(false)} />
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
              <CartFooter
                subtotal={subtotal}
                tableNumber={tableNumber}
                clearCart={clearCart}
                onMpesaPayment={handleMpesaPayment}
                onCheckStatus={handleCheckStatus}
                onCancelPayment={handleCancelPayment}
                onCloseReceipt={handleCloseReceipt}
                isProcessing={isProcessing}
                paymentSent={paymentSent}
                lastError={lastError}
                paymentStatus={paymentStatus}
                items={items}
                phoneNumber={phoneNumber}
                transactionId={transactionId}
              />
            </DrawerFooter>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default Cart;
