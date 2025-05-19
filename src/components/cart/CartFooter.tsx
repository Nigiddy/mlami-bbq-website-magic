
import React from 'react';
import { Button } from '@/components/ui/button';
import PaymentForm, { PaymentFormValues } from './PaymentForm';
import PaymentStatus from './PaymentStatus';
import { CartItem } from '@/contexts/cart/types';

interface CartFooterProps {
  subtotal: number;
  tableNumber: string | null;
  clearCart: () => void;
  onMpesaPayment: (values: PaymentFormValues) => Promise<void>;
  onCheckStatus: () => Promise<void>;
  onCancelPayment: () => void;
  isProcessing: boolean;
  paymentSent: boolean;
  lastError?: string | null;
  errorDetails?: string | null;
  paymentStatus?: 'idle' | 'pending' | 'success' | 'failed';
  items: CartItem[];
  phoneNumber?: string;
  transactionId?: string | null;
  onCloseReceipt?: () => void;
}

const CartFooter: React.FC<CartFooterProps> = ({
  subtotal,
  tableNumber,
  clearCart,
  onMpesaPayment,
  onCheckStatus,
  onCancelPayment,
  isProcessing,
  paymentSent,
  lastError,
  errorDetails,
  paymentStatus = 'idle',
  items,
  phoneNumber = '',
  transactionId,
  onCloseReceipt
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
          onCloseReceipt={onCloseReceipt}
          isProcessing={isProcessing}
          lastError={lastError}
          errorDetails={errorDetails}
          paymentStatus={paymentStatus}
          transactionDetails={
            paymentStatus === 'success' ? {
              transactionId,
              phoneNumber,
              tableNumber: tableNumber || '',
              items,
              subtotal,
              paymentTime: new Date().toISOString()
            } : undefined
          }
        />
      )}
    </div>
  );
};

export default CartFooter;
