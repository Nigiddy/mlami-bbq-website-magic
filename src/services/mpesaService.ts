import { getSupabaseClient } from '@/lib/supabase';

export type MpesaPaymentRequest = {
  phoneNumber: string;
  amount: number;
  tableNumber: string;
  cartItems: any[];
};

export type MpesaResponse = {
  success: boolean;
  message: string;
  transactionId?: string;
  checkoutRequestId?: string;
  receiptNumber?: string;  // Added receiptNumber property
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  // Format phone number to required format (254XXXXXXXXX)
  let formattedPhone = phoneNumber;
  
  // Remove any spaces
  formattedPhone = formattedPhone.replace(/\s/g, '');
  
  // Handle different formats of Kenyan phone numbers
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.substring(1);
  } else if (formattedPhone.startsWith('+254')) {
    formattedPhone = formattedPhone.substring(1);
  } else if (formattedPhone.startsWith('254')) {
    // Already in the right format
  } else if (formattedPhone.startsWith('7')) {
    // Assuming this is a Kenyan number starting with 7
    formattedPhone = '254' + formattedPhone;
  }
  
  return formattedPhone;
};

// Helper function to handle timeouts
const timeoutPromise = (ms: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
  });
};

export const initiateMpesaPayment = async (
  paymentRequest: MpesaPaymentRequest
): Promise<MpesaResponse> => {
  try {
    const supabase = getSupabaseClient();
    
    // Format phone number to required format (254XXXXXXXXX)
    const formattedPhone = formatPhoneNumber(paymentRequest.phoneNumber);

    console.log(`Initiating payment for ${formattedPhone} of amount ${paymentRequest.amount}`);

    // Call the Supabase Edge Function that will handle Daraja API interaction
    // With timeout handling
    const fetchPromise = supabase.functions.invoke('mpesa-stk-push', {
      body: {
        phoneNumber: formattedPhone,
        amount: Math.round(paymentRequest.amount), // Ensure amount is a whole number
        tableNumber: paymentRequest.tableNumber,
        items: paymentRequest.cartItems,
      },
    });

    // Race between fetch and timeout (15 seconds)
    const { data, error } = await Promise.race([
      fetchPromise,
      timeoutPromise(15000).then(() => {
        throw new Error('Connection timeout. Please check your internet connection and try again.');
      })
    ]) as any;

    if (error) {
      console.error('M-Pesa STK Push error:', error);
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.message?.includes('network')) {
        return {
          success: false,
          message: 'Network error. Please check your internet connection and try again.',
        };
      }
      return {
        success: false,
        message: `Failed to initiate payment: ${error.message || 'Unknown error'}`,
      };
    }

    if (!data) {
      console.error('M-Pesa STK Push returned no data');
      return {
        success: false,
        message: 'Failed to get response from payment service. Please try again.',
      };
    }

    console.log('M-Pesa STK Push response:', data);

    return {
      success: data.success,
      message: data.message || 'STK Push sent. Please check your phone to complete payment.',
      transactionId: data.transactionId,
      checkoutRequestId: data.checkoutRequestId,
    };
  } catch (error: any) {
    console.error('M-Pesa service error:', error);
    
    // Better error handling for different types of errors
    let errorMessage = 'An unexpected error occurred. Please try again later.';
    
    if (error.message?.includes('timeout') || error.message?.includes('time out')) {
      errorMessage = 'Connection timeout. The server is taking too long to respond. Please try again.';
    } else if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('connection')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    }
    
    return {
      success: false,
      message: errorMessage,
    };
  }
};

export const checkPaymentStatus = async (checkoutRequestId: string): Promise<MpesaResponse> => {
  try {
    const supabase = getSupabaseClient();
    
    console.log(`Checking payment status for checkoutRequestId: ${checkoutRequestId}`);
    
    // With timeout handling
    const fetchPromise = supabase.functions.invoke('mpesa-query-status', {
      body: {
        checkoutRequestId,
      },
    });

    // Race between fetch and timeout (15 seconds)
    const { data, error } = await Promise.race([
      fetchPromise,
      timeoutPromise(15000).then(() => {
        throw new Error('Connection timeout. Please check your internet connection and try again.');
      })
    ]) as any;

    if (error) {
      console.error('M-Pesa status check error:', error);
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.message?.includes('network')) {
        return {
          success: false,
          message: 'Network error. Please check your internet connection and try again.',
        };
      }
      return {
        success: false,
        message: `Failed to check payment status: ${error.message || 'Unknown error'}`,
      };
    }

    if (!data) {
      console.error('M-Pesa status check returned no data');
      return {
        success: false,
        message: 'Failed to get response from payment service. Please try again.',
      };
    }

    console.log('M-Pesa status check response:', data);

    return {
      success: data.success,
      message: data.message,
      transactionId: data.transactionId,
      receiptNumber: data.receiptNumber, // Added receiptNumber mapping here
    };
  } catch (error: any) {
    console.error('Payment status check error:', error);
    
    // Better error handling for different types of errors
    let errorMessage = 'Failed to check payment status due to a connection issue. Please try again.';
    
    if (error.message?.includes('timeout') || error.message?.includes('time out')) {
      errorMessage = 'Connection timeout while checking status. Please try again in a few moments.';
    } else if (error.message?.includes('fetch') || error.message?.includes('network')) {
      errorMessage = 'Network error while checking status. Please check your internet connection.';
    }
    
    return {
      success: false,
      message: errorMessage,
    };
  }
};
