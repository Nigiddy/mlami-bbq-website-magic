
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("M-Pesa Callback Edge Function started");

serve(async (req) => {
  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the callback payload
    const callbackData = await req.json();
    console.log("Received M-Pesa callback:", JSON.stringify(callbackData));
    
    // Extract the Body part which contains the actual transaction data
    const body = callbackData.Body;
    if (!body || !body.stkCallback) {
      throw new Error("Invalid callback format");
    }
    
    const stkCallback = body.stkCallback;
    const merchantRequestID = stkCallback.MerchantRequestID;
    const checkoutRequestID = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;
    
    // Find the corresponding transaction in our database
    const { data: transaction, error: queryError } = await supabase
      .from("mpesa_transactions")
      .select("*")
      .eq("checkout_request_id", checkoutRequestID)
      .single();
      
    if (queryError) {
      console.error("Error finding transaction:", queryError);
      throw new Error("Transaction not found in database");
    }

    // Update transaction status based on the callback result
    if (resultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata?.Item;
      
      let mpesaReceiptNumber = null;
      let transactionDate = null;
      let phoneNumber = null;
      
      if (callbackMetadata) {
        for (const item of callbackMetadata) {
          if (item.Name === "MpesaReceiptNumber") {
            mpesaReceiptNumber = item.Value;
          } else if (item.Name === "TransactionDate") {
            transactionDate = item.Value;
          } else if (item.Name === "PhoneNumber") {
            phoneNumber = item.Value;
          }
        }
      }
      
      // Update transaction record
      const { error: updateError } = await supabase
        .from("mpesa_transactions")
        .update({
          status: "COMPLETED",
          mpesa_receipt_number: mpesaReceiptNumber,
          transaction_date: transactionDate,
          result_description: resultDesc,
        })
        .eq("id", transaction.id);
        
      if (updateError) {
        console.error("Error updating transaction:", updateError);
        throw new Error("Failed to update transaction status");
      }
      
      // Create an order once payment is confirmed
      const { error: orderError } = await supabase.rpc(
        "create_order", 
        {
          p_customer_name: "M-Pesa Customer",
          p_customer_phone: phoneNumber || transaction.phone_number,
          p_table_number: transaction.table_number,
          p_items: transaction.items
        }
      );
      
      if (orderError) {
        console.error("Error creating order:", orderError);
        // Continue anyway since the payment was successful
      }
    } else {
      // Payment failed
      const { error: updateError } = await supabase
        .from("mpesa_transactions")
        .update({
          status: "FAILED",
          result_description: resultDesc,
        })
        .eq("id", transaction.id);
        
      if (updateError) {
        console.error("Error updating transaction:", updateError);
        throw new Error("Failed to update transaction status");
      }
    }
    
    // Send a success response as required by M-Pesa
    return new Response(
      JSON.stringify({
        ResultCode: 0,
        ResultDesc: "Callback received successfully",
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("M-Pesa callback error:", error.message);
    
    // Even if we have errors, respond with success to avoid M-Pesa retries
    // But log the error for our debugging
    return new Response(
      JSON.stringify({
        ResultCode: 0,
        ResultDesc: "Callback acknowledged with errors",
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
