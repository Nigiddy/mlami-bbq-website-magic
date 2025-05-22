
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CheckCircle, RefreshCw, WifiOff, Info, Key } from 'lucide-react';
import Receipt from './Receipt';
import { CartItem } from '@/contexts/cart/types';

interface PaymentStatusProps {
  onCheckStatus: () => Promise<void>;
  onCancelPayment: () => void;
  onCloseReceipt?: () => void;
  isProcessing: boolean;
  lastError?: string | null;
  errorDetails?: string | null;
  paymentStatus?: 'idle' | 'pending' | 'success' | 'failed';
  transactionDetails?: {
    transactionId?: string | null;
    phoneNumber: string;
    tableNumber: string;
    items: CartItem[];
    subtotal: number;
    paymentTime?: string;
  };
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({
  onCheckStatus,
  onCancelPayment,
  onCloseReceipt,
  isProcessing,
  lastError,
  errorDetails,
  paymentStatus = 'pending',
  transactionDetails
}) => {
  // Determine which icon to show based on status and error
  const getStatusIcon = () => {
    if (lastError?.includes('Network error') || lastError?.includes('connection')) {
      return <WifiOff className="h-5 w-5 text-red-500" />;
    }
    
    if (lastError?.includes('credentials') || lastError?.includes('rejected')) {
      return <Key className="h-5 w-5 text-red-500" />;
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
    
    if (lastError?.includes('credentials') || lastError?.includes('rejected')) {
      return "API Credentials Error";
    }
    
    if (lastError?.includes('Error code:')) {
      return "Payment Error";
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
    
    if (lastError?.includes('credentials') || lastError?.includes('rejected')) {
      return "The M-Pesa API rejected our authentication. This is likely a configuration issue that needs to be fixed by the site administrator.";
    }
    
    if (lastError) {
      return lastError;
    }
    
    return "An M-Pesa STK push has been sent to your phone. Please enter your PIN to complete the payment.";
  };
  
  const bgColor = paymentStatus === 'success' 
    ? 'bg-green-50 border-green-100' 
    : lastError?.includes('Network error') || lastError?.includes('connection') || lastError?.includes('credentials')
      ? 'bg-red-50 border-red-100'
      : 'bg-yellow-50 border-yellow-100';

  // If payment is successful and we have transaction details, show the receipt
  if (paymentStatus === 'success' && transactionDetails) {
    return (
      <Receipt
        transactionId={transactionDetails.transactionId}
        phoneNumber={transactionDetails.phoneNumber}
        tableNumber={transactionDetails.tableNumber}
        items={transactionDetails.items}
        subtotal={transactionDetails.subtotal}
        paymentTime={transactionDetails.paymentTime}
        onClose={onCloseReceipt || onCancelPayment}
      />
    );
  }

  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="space-y-4">
      <div className={`p-4 ${bgColor} border rounded-md`}>
        <div className="flex items-center gap-2 mb-2">
          {getStatusIcon()}
          <h4 className="font-medium">{getStatusTitle()}</h4>
        </div>
        
        <p className="text-gray-600 text-sm mb-3">
          {getStatusMessage()}
        </p>
        
        {lastError && (
          <div className="p-2 mb-3 bg-red-50 border border-red-100 rounded text-sm text-red-700">
            {lastError}
          </div>
        )}
        
        {errorDetails && (
          <div className="mt-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-1"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Info className="h-3 w-3" />
              {showDetails ? "Hide Technical Details" : "Show Technical Details"}
            </Button>
            
            {showDetails && (
              <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs font-mono overflow-x-auto max-h-32 overflow-y-auto">
                {errorDetails}
              </div>
            )}
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
