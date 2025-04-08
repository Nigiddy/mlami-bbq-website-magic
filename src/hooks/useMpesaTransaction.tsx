
import { useState } from 'react';
import { initiateMpesaPayment, checkPaymentStatus, MpesaPaymentRequest, MpesaResponse } from '@/services/mpesaService';
import { useToast } from '@/hooks/use-toast';

export const useMpesaTransaction = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const { toast } = useToast();

  const initiatePayment = async (paymentRequest: MpesaPaymentRequest): Promise<boolean> => {
    setIsProcessing(true);
    try {
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
        return false;
      }
    } catch (error) {
      console.error("M-Pesa payment error:", error);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred while processing your payment",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const checkStatus = async (): Promise<boolean> => {
    if (!checkoutRequestId) {
      toast({
        title: "Error",
        description: "No active payment to check",
        variant: "destructive",
      });
      return false;
    }
    
    setIsProcessing(true);
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
        return false;
      }
    } catch (error) {
      console.error("Payment status check error:", error);
      toast({
        title: "Status Check Failed",
        description: "Failed to check payment status",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const resetTransaction = () => {
    setCheckoutRequestId(null);
    setTransactionId(null);
  };

  return {
    initiatePayment,
    checkStatus,
    resetTransaction,
    isProcessing,
    checkoutRequestId,
    transactionId
  };
};
