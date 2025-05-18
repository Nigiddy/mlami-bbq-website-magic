
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
    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get Daraja API credentials from environment variables
    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY") ?? "";
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET") ?? "";
    const shortCode = Deno.env.get("MPESA_SHORTCODE") ?? "";
    const passKey = Deno.env.get("MPESA_PASSKEY") ?? "";
    
    if (!consumerKey || !consumerSecret || !shortCode || !passKey) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing M-Pesa API credentials. Please check your environment variables.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
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
    
    // First check if we have the transaction in our database and if it's already completed
    const { data: transaction, error: dbError } = await supabase
      .from("mpesa_transactions")
      .select("*")
      .eq("checkout_request_id", checkoutRequestId)
      .single();
    
    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to find transaction in database",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }
    
    // If transaction is already marked as completed, no need to check with M-Pesa API
    if (transaction.status === "COMPLETED") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Payment was completed successfully",
          transactionId: transaction.id,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Determine API endpoint based on environment (production or sandbox)
    const isProd = Deno.env.get("MPESA_ENV") === "production";
    const baseUrl = isProd 
      ? "https://api.safaricom.co.ke" 
      : "https://sandbox.safaricom.co.ke";

    // Generate access token for M-Pesa API
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    const tokenResponse = await fetch(
      `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
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
    
    // Generate password
    const password = btoa(`${shortCode}${passKey}${timestamp}`);
    
    // Query the status of the STK Push transaction
    const queryResponse = await fetch(
      `${baseUrl}/mpesa/stkpushquery/v1/query`,
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
    
    const queryData = await queryResponse.json();
    console.log("STK Query Response:", queryData);
    
    // Check if the transaction was successful
    let success = false;
    let message = "Payment is still pending";
    
    if (queryData.ResponseCode === "0") {
      if (queryData.ResultCode === "0") {
        // Transaction was successful
        success = true;
        message = "Payment was completed successfully";
        
        // Update the transaction status in the database
        await supabase
          .from("mpesa_transactions")
          .update({
            status: "COMPLETED",
            result_description: queryData.ResultDesc,
            updated_at: new Date().toISOString(),
          })
          .eq("checkout_request_id", checkoutRequestId);
      } else {
        // Transaction failed or is still pending
        message = queryData.ResultDesc || "Payment verification failed";
      }
    } else {
      message = queryData.ResponseDescription || "Failed to check payment status";
    }

    return new Response(
      JSON.stringify({
        success,
        message,
        transactionId: transaction.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("M-Pesa status check error:", error.message);
    
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
