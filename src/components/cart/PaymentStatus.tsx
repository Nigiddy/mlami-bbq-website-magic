
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PaymentStatusProps {
  onCheckStatus: () => Promise<void>;
  onCancelPayment: () => void;
  isProcessing: boolean;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({
  onCheckStatus,
  onCancelPayment,
  isProcessing
}) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-md">
        <h4 className="font-medium mb-2">Payment Initiated</h4>
        <p className="text-sm text-gray-600 mb-3">
          An M-Pesa STK push has been sent to your phone. Please enter your PIN to complete the payment.
        </p>
        <div className="flex justify-between gap-2">
          <Button 
            onClick={onCheckStatus}
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
            onClick={onCancelPayment}
            className="flex-1"
            variant="ghost"
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
