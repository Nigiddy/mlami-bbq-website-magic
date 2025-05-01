
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CheckCircle, RefreshCw, WifiOff } from 'lucide-react';

interface PaymentStatusProps {
  onCheckStatus: () => Promise<void>;
  onCancelPayment: () => void;
  isProcessing: boolean;
  lastError?: string | null;
  paymentStatus?: 'idle' | 'pending' | 'success' | 'failed';
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({
  onCheckStatus,
  onCancelPayment,
  isProcessing,
  lastError,
  paymentStatus = 'pending'
}) => {
  // Determine which icon to show based on status and error
  const getStatusIcon = () => {
    if (lastError?.includes('Network error') || lastError?.includes('connection')) {
      return <WifiOff className="h-5 w-5 text-red-500" />;
    }
    
    if (lastError) {
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    }
    
    if (paymentStatus === 'success') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    return <RefreshCw className="h-5 w-5 text-amber-500" />;
  };
  
  // Get status title
  const getStatusTitle = () => {
    if (paymentStatus === 'success') {
      return "Payment Successful";
    }
    
    if (lastError?.includes('Network error') || lastError?.includes('connection')) {
      return "Connection Issue";
    }
    
    return "Payment Initiated";
  };
  
  // Get status message
  const getStatusMessage = () => {
    if (paymentStatus === 'success') {
      return "Your M-Pesa payment was processed successfully.";
    }
    
    if (lastError?.includes('Network error') || lastError?.includes('connection')) {
      return "There seems to be a network issue. Please check your internet connection and try again.";
    }
    
    return "An M-Pesa STK push has been sent to your phone. Please enter your PIN to complete the payment.";
  };
  
  const bgColor = paymentStatus === 'success' 
    ? 'bg-green-50 border-green-100' 
    : lastError?.includes('Network error') || lastError?.includes('connection')
      ? 'bg-red-50 border-red-100'
      : 'bg-yellow-50 border-yellow-100';

  return (
    <div className="space-y-4">
      <div className={`p-4 ${bgColor} border rounded-md`}>
        <div className="flex items-center gap-2 mb-2">
          {getStatusIcon()}
          <h4 className="font-medium">{getStatusTitle()}</h4>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">
          {getStatusMessage()}
        </p>
        
        {lastError && (
          <div className="p-2 mb-3 bg-red-50 border border-red-100 rounded text-sm text-red-700">
            {lastError}
          </div>
        )}
        
        {paymentStatus !== 'success' && (
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
        )}
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
