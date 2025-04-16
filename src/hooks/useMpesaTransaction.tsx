
import { useState, useCallback } from 'react';
import { initiateMpesaPayment, checkPaymentStatus, MpesaPaymentRequest, MpesaResponse } from '@/services/mpesaService';
import { useToast } from '@/hooks/use-toast';

export const useMpesaTransaction = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const { toast } = useToast();

  const initiatePayment = useCallback(async (paymentRequest: MpesaPaymentRequest): Promise<boolean> => {
    setIsProcessing(true);
    setLastError(null);
    
    try {
      // Validate amount
      if (paymentRequest.amount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Payment amount must be greater than zero",
          variant: "destructive",
        });
        setIsProcessing(false);
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
        return false;
      }

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
        toast({
          title: "Payment Failed",
          description: response.message || "Failed to initiate M-Pesa payment",
          variant: "destructive",
        });
        setLastError(response.message || "Unknown error");
        return false;
      }
    } catch (error) {
      console.error("M-Pesa payment error:", error);
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
    
    try {
      const response = await checkPaymentStatus(checkoutRequestId);
      
      if (response.success) {
        toast({
          title: "Payment Successful",
          description: "Your M-Pesa payment was completed successfully",
        });
        return true;
      } else {
        toast({
          title: "Payment Pending",
          description: response.message || "Payment has not been completed yet",
          variant: "destructive",
        });
        setLastError(response.message || "Payment not completed");
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
  }, []);

  return {
    initiatePayment,
    checkStatus,
    resetTransaction,
    isProcessing,
    checkoutRequestId,
    transactionId,
    lastError
  };
};
