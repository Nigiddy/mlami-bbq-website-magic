
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface PaymentStatusProps {
  onCheckStatus: () => Promise<void>;
  onCancelPayment: () => void;
  isProcessing: boolean;
  lastError?: string | null;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({
  onCheckStatus,
  onCancelPayment,
  isProcessing,
  lastError
}) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-md">
        <div className="flex items-center gap-2 mb-2">
          {lastError ? (
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          ) : (
            <RefreshCw className="h-5 w-5 text-amber-500" />
          )}
          <h4 className="font-medium">Payment Initiated</h4>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">
          An M-Pesa STK push has been sent to your phone. Please enter your PIN to complete the payment.
        </p>
        
        {lastError && (
          <div className="p-2 mb-3 bg-red-50 border border-red-100 rounded text-sm text-red-700">
            {lastError}
          </div>
        )}
        
        <div className="flex justify-between gap-2">
          <Button 
            onClick={onCheckStatus}
            className="flex-1 gap-1 items-center justify-center"
            variant="outline"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Check Status
              </>
            )}
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
      
      <div className="text-xs text-gray-500 italic text-center">
        Note: It might take a moment for the payment to be processed.
        If you've completed the payment but status hasn't updated,
        try checking again in a few seconds.
      </div>
    </div>
  );
};

export default PaymentStatus;
