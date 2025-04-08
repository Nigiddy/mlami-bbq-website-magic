// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("M-Pesa Query Status Edge Function started");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client with the auth context of the logged-in user
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get Daraja API credentials from environment variables
    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY") ?? "";
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET") ?? "";
    const shortCode = Deno.env.get("MPESA_SHORTCODE") ?? "";
    const passKey = Deno.env.get("MPESA_PASSKEY") ?? "";
    
    // Parse request body
    const { checkoutRequestId } = await req.json();
    
    if (!checkoutRequestId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing required parameter: checkoutRequestId",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    // First, check if we already have a completed transaction in our database
    const { data: transaction, error: dbError } = await supabase
      .from("mpesa_transactions")
      .select("*")
      .eq("checkout_request_id", checkoutRequestId)
      .single();
      
    if (dbError && dbError.code !== "PGRST116") {
      console.error("Database error:", dbError);
    }
    
    // If transaction exists and is already completed, return its status
    if (transaction && transaction.status === "COMPLETED") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Payment completed successfully",
          transactionId: transaction.mpesa_receipt_number || null,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Otherwise, query M-Pesa API for status
    
    // Generate access token for M-Pesa API
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    const tokenResponse = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Failed to get access token from M-Pesa API");
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // Format timestamp (YYYYMMDDHHmmss)
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14);
    
    // Generate password (Base64(Shortcode+Passkey+Timestamp))
    const password = btoa(`${shortCode}${passKey}${timestamp}`);
    
    // Get the merchant request ID from our database
    let merchantRequestId;
    if (transaction) {
      merchantRequestId = transaction.merchant_request_id;
    } else {
      // If we don't have the transaction (unlikely), we can't query the status
      return new Response(
        JSON.stringify({
          success: false,
          message: "Transaction not found",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }
    
    // Query M-Pesa for transaction status
    const statusResponse = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: shortCode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId,
        }),
      }
    );

    const statusData = await statusResponse.json();
    
    // Process response and update database
    if (statusData.ResponseCode === "0") {
      // Transaction found in M-Pesa
      const resultCode = statusData.ResultCode;
      
      if (resultCode === "0") {
        // Payment was successful
        await supabase
          .from("mpesa_transactions")
          .update({
            status: "COMPLETED",
            mpesa_receipt_number: statusData.mpesa_receipt || null,
            result_description: statusData.ResultDesc,
          })
          .eq("checkout_request_id", checkoutRequestId);
          
        return new Response(
          JSON.stringify({
            success: true,
            message: statusData.ResultDesc || "Payment completed successfully",
            transactionId: statusData.mpesa_receipt || null,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else {
        // Payment failed or is still processing
        await supabase
          .from("mpesa_transactions")
          .update({
            result_description: statusData.ResultDesc,
          })
          .eq("checkout_request_id", checkoutRequestId);
          
        return new Response(
          JSON.stringify({
            success: false,
            message: statusData.ResultDesc || "Payment not completed",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } else {
      // Error querying M-Pesa
      return new Response(
        JSON.stringify({
          success: false,
          message: statusData.errorMessage || "Failed to query payment status",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error("M-Pesa query status error:", error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Failed to check payment status",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
