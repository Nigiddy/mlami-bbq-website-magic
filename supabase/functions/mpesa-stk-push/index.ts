
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("M-Pesa STK Push Edge Function started");

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
    const callbackUrl = Deno.env.get("MPESA_CALLBACK_URL") ?? "";
    
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
    const { phoneNumber, amount, tableNumber, items } = await req.json();
    
    if (!phoneNumber || !amount || !tableNumber) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing required parameters: phoneNumber, amount, or tableNumber",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
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
      console.error("Failed to get access token:", await tokenResponse.text());
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
    
    // Determine the correct transaction type - for Till use "CustomerBuyGoodsOnline"
    const transactionType = isProd ? "CustomerBuyGoodsOnline" : "CustomerPayBillOnline";
    
    // Prepare STK Push Request
    const stkPushResponse = await fetch(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
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
          TransactionType: transactionType,
          Amount: amount,
          PartyA: phoneNumber,
          PartyB: shortCode,
          PhoneNumber: phoneNumber,
          CallBackURL: callbackUrl,
          AccountReference: `Table-${tableNumber}`,
          TransactionDesc: "BBQ Restaurant Payment",
        }),
      }
    );

    if (!stkPushResponse.ok) {
      console.error("STK Push failed:", await stkPushResponse.text());
      throw new Error("Failed to initiate STK Push");
    }

    const stkPushData = await stkPushResponse.json();
    console.log("STK Push Response:", stkPushData);
    
    if (stkPushData.ResponseCode !== "0") {
      throw new Error(`STK Push failed: ${stkPushData.ResponseDescription}`);
    }
    
    // Create transaction record in database
    const { data: transaction, error: transactionError } = await supabase
      .from("mpesa_transactions")
      .insert({
        phone_number: phoneNumber,
        amount: amount,
        table_number: tableNumber,
        checkout_request_id: stkPushData.CheckoutRequestID,
        merchant_request_id: stkPushData.MerchantRequestID,
        items: items,
        status: "PENDING",
      })
      .select()
      .single();
    
    if (transactionError) {
      console.error("Error creating transaction record:", transactionError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "STK Push sent successfully",
        checkoutRequestId: stkPushData.CheckoutRequestID,
        merchantRequestId: stkPushData.MerchantRequestID,
        transactionId: transaction?.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("M-Pesa STK Push error:", error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Failed to process M-Pesa payment request",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
