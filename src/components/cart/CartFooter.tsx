
import React from 'react';
import { Button } from '@/components/ui/button';
import PaymentForm, { PaymentFormValues } from './PaymentForm';
import PaymentStatus from './PaymentStatus';

interface CartFooterProps {
  subtotal: number;
  tableNumber: string | null;
  clearCart: () => void;
  onMpesaPayment: (values: PaymentFormValues) => Promise<void>;
  onCheckStatus: () => Promise<void>;
  onCancelPayment: () => void;
  isProcessing: boolean;
  paymentSent: boolean;
}

const CartFooter: React.FC<CartFooterProps> = ({
  subtotal,
  tableNumber,
  clearCart,
  onMpesaPayment,
  onCheckStatus,
  onCancelPayment,
  isProcessing,
  paymentSent
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm">
        <span>Subtotal:</span>
        <span>Ksh {subtotal}</span>
      </div>
      
      {!paymentSent ? (
        <>
          <PaymentForm 
            defaultTableNumber={tableNumber || ''}
            onSubmit={onMpesaPayment}
            isProcessing={isProcessing}
          />
          <Button 
            type="button"
            variant="outline" 
            onClick={clearCart}
            className="w-full backdrop-blur-sm bg-white/40"
            disabled={isProcessing}
          >
            Clear Cart
          </Button>
        </>
      ) : (
        <PaymentStatus 
          onCheckStatus={onCheckStatus}
          onCancelPayment={onCancelPayment}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};

export default CartFooter;
