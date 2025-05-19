
import { useState, useCallback } from 'react';
import { initiateMpesaPayment, checkPaymentStatus, MpesaPaymentRequest, MpesaResponse } from '@/services/mpesaService';
import { useToast } from '@/hooks/use-toast';

export const useMpesaTransaction = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const { toast } = useToast();

  const initiatePayment = useCallback(async (paymentRequest: MpesaPaymentRequest): Promise<boolean> => {
    setIsProcessing(true);
    setLastError(null);
    setErrorDetails(null);
    setPaymentStatus('pending');
    
    try {
      // Validate amount
      if (paymentRequest.amount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Payment amount must be greater than zero",
          variant: "destructive",
        });
        setIsProcessing(false);
        setPaymentStatus('idle');
        return false;
      }

      // Validate phone number
      if (!paymentRequest.phoneNumber || paymentRequest.phoneNumber.length < 10) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid M-Pesa phone number",
          variant: "destructive",
        });
        setIsProcessing(false);
        setPaymentStatus('idle');
        return false;
      }

      console.log("Initiating payment for", paymentRequest.phoneNumber, "of amount", paymentRequest.amount);
      const response = await initiateMpesaPayment(paymentRequest);
      
      if (response.success) {
        toast({
          title: "STK Push Sent",
          description: `Please check your phone to complete payment for Table #${paymentRequest.tableNumber}`,
        });
        
        if (response.checkoutRequestId) {
          setCheckoutRequestId(response.checkoutRequestId);
        }
        
        if (response.transactionId) {
          setTransactionId(response.transactionId);
        }
        
        return true;
      } else {
        setPaymentStatus('failed');
        
        // Store detailed error information
        if (response.errorDetails) {
          setErrorDetails(response.errorDetails);
          console.error("Detailed error information:", response.errorDetails);
        }
        
        const errorMsg = response.errorCode 
          ? `Error code: ${response.errorCode}. ${response.message || "Unknown error"}` 
          : response.message || "Unknown error";
          
        toast({
          title: "Payment Failed",
          description: errorMsg,
          variant: "destructive",
        });
        
        setLastError(errorMsg);
        return false;
      }
    } catch (error) {
      console.error("M-Pesa payment error:", error);
      setPaymentStatus('failed');
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setLastError(errorMessage);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred while processing your payment",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const checkStatus = useCallback(async (): Promise<boolean> => {
    if (!checkoutRequestId) {
      toast({
        title: "Error",
        description: "No active payment to check",
        variant: "destructive",
      });
      return false;
    }
    
    setIsProcessing(true);
    setLastError(null);
    setErrorDetails(null);
    
    try {
      const response = await checkPaymentStatus(checkoutRequestId);
      
      if (response.success) {
        setPaymentStatus('success');
        
        // If we have a receipt number from the response, update the transaction ID
        if (response.receiptNumber) {
          setTransactionId(response.receiptNumber);
        }
        
        toast({
          title: "Payment Successful",
          description: "Your M-Pesa payment was completed successfully",
        });
        return true;
      } else {
        // Store detailed error information
        if (response.errorDetails) {
          setErrorDetails(response.errorDetails);
          console.error("Detailed error information:", response.errorDetails);
        }
        
        const errorMsg = response.errorCode 
          ? `Error code: ${response.errorCode}. ${response.message || "Unknown error"}` 
          : response.message || "Payment has not been completed yet";
        
        toast({
          title: "Payment Pending",
          description: errorMsg,
          variant: "destructive",
        });
        
        setLastError(errorMsg);
        return false;
      }
    } catch (error) {
      console.error("Payment status check error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setLastError(errorMessage);
      toast({
        title: "Status Check Failed",
        description: "Failed to check payment status",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [checkoutRequestId, toast]);

  const resetTransaction = useCallback(() => {
    setCheckoutRequestId(null);
    setTransactionId(null);
    setLastError(null);
    setErrorDetails(null);
    setPaymentStatus('idle');
  }, []);

  return {
    initiatePayment,
    checkStatus,
    resetTransaction,
    isProcessing,
    checkoutRequestId,
    transactionId,
    lastError,
    errorDetails,
    paymentStatus
  };
};
