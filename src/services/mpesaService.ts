
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
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  // Format phone number to required format (254XXXXXXXXX)
  let formattedPhone = phoneNumber;
  
  // Remove any spaces
  formattedPhone = formattedPhone.replace(/\s/g, '');
  
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.substring(1);
  } else if (formattedPhone.startsWith('+254')) {
    formattedPhone = formattedPhone.substring(1);
  }
  
  return formattedPhone;
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
    const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
      body: {
        phoneNumber: formattedPhone,
        amount: Math.round(paymentRequest.amount), // Ensure amount is a whole number
        tableNumber: paymentRequest.tableNumber,
        items: paymentRequest.cartItems,
      },
    });

    if (error) {
      console.error('M-Pesa STK Push error:', error);
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
      success: true,
      message: 'STK Push sent. Please check your phone to complete payment.',
      transactionId: data.transactionId,
      checkoutRequestId: data.checkoutRequestId,
    };
  } catch (error) {
    console.error('M-Pesa service error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
    };
  }
};

export const checkPaymentStatus = async (checkoutRequestId: string): Promise<MpesaResponse> => {
  try {
    const supabase = getSupabaseClient();
    
    console.log(`Checking payment status for checkoutRequestId: ${checkoutRequestId}`);
    
    const { data, error } = await supabase.functions.invoke('mpesa-query-status', {
      body: {
        checkoutRequestId,
      },
    });

    if (error) {
      console.error('M-Pesa status check error:', error);
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
    };
  } catch (error) {
    console.error('Payment status check error:', error);
    return {
      success: false,
      message: 'Failed to check payment status due to a connection issue. Please try again.',
    };
  }
};
