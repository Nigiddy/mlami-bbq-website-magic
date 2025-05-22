
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
    
    // Log environment variable status (without revealing values)
    console.log("Environment variables check:", {
      supabaseUrl: !!supabaseUrl,
      supabaseAnonKey: !!supabaseAnonKey,
      consumerKey: !!consumerKey,
      consumerSecret: !!consumerSecret,
      shortCode: !!shortCode,
      passKey: !!passKey,
      callbackUrl: !!callbackUrl,
      mpesaEnv: Deno.env.get("MPESA_ENV"),
      // Add first few chars of credentials to help with debugging
      consumerKeyPrefix: consumerKey ? consumerKey.substring(0, 5) + "..." : "undefined",
      secretPrefix: consumerSecret ? consumerSecret.substring(0, 5) + "..." : "undefined",
    });
    
    if (!consumerKey || !consumerSecret || !shortCode || !passKey) {
      console.error("Missing M-Pesa API credentials");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing M-Pesa API credentials. Please check your environment variables.",
          code: "MISSING_CREDENTIALS"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid request body format",
          code: "INVALID_REQUEST"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    const { phoneNumber, amount, tableNumber, items } = requestBody;
    
    console.log("Request parameters:", { 
      phoneNumber: phoneNumber ? `${phoneNumber.substring(0, 3)}...` : undefined, // Log partial number for privacy
      amount, 
      tableNumber,
      itemsCount: items?.length 
    });
    
    if (!phoneNumber || !amount || !tableNumber) {
      console.error("Missing required parameters");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing required parameters: phoneNumber, amount, or tableNumber",
          code: "MISSING_PARAMETERS"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Format phone number to ensure it starts with 254
    let formattedPhone = phoneNumber;
    if (phoneNumber.startsWith("+")) {
      formattedPhone = phoneNumber.substring(1);
    } else if (phoneNumber.startsWith("0")) {
      formattedPhone = "254" + phoneNumber.substring(1);
    }

    // Determine API endpoint based on environment (production or sandbox)
    const isProd = Deno.env.get("MPESA_ENV") === "production";
    const baseUrl = isProd 
      ? "https://api.safaricom.co.ke" 
      : "https://sandbox.safaricom.co.ke";

    console.log(`Using M-Pesa API in ${isProd ? 'production' : 'sandbox'} mode`);

    // Generate access token for M-Pesa API
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    
    console.log("Requesting access token...");
    
    let tokenResponse;
    try {
      tokenResponse = await fetch(
        `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );
    } catch (error) {
      console.error("Network error when getting access token:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Network error when connecting to M-Pesa API",
          code: "NETWORK_ERROR",
          details: error.message
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Failed to get access token:", errorText);
      
      let userFriendlyMessage = "Failed to authenticate with M-Pesa API";
      
      // Check for common auth errors to provide better guidance
      if (errorText.includes("Invalid Credentials")) {
        userFriendlyMessage = "M-Pesa API rejected your credentials. Please verify your Consumer Key and Secret are correct and active.";
      } else if (errorText.includes("Unauthorized")) {
        userFriendlyMessage = "M-Pesa API authentication failed. Check whether you're using correct production/sandbox credentials.";
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          message: userFriendlyMessage,
          code: "AUTH_ERROR",
          details: `Status: ${tokenResponse.status}, Response: ${errorText}`
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    let tokenData;
    try {
      tokenData = await tokenResponse.json();
    } catch (error) {
      console.error("Failed to parse token response:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to parse authentication response",
          code: "PARSE_ERROR",
          details: error.message
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    const accessToken = tokenData.access_token;
    
    console.log("Access token received");
    
    // Format timestamp (YYYYMMDDHHmmss)
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14);
    
    // Generate password (Base64(Shortcode+Passkey+Timestamp))
    const password = btoa(`${shortCode}${passKey}${timestamp}`);
    
    // Determine the correct transaction type - for Till use "CustomerBuyGoodsOnline"
    const transactionType = isProd ? "CustomerBuyGoodsOnline" : "CustomerPayBillOnline";
    
    const stkPushBody = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: transactionType,
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: `Table-${tableNumber}`,
      TransactionDesc: "BBQ Restaurant Payment",
    };
    
    console.log("Preparing STK Push request with body:", {
      ...stkPushBody,
      Password: "REDACTED"
    });
    
    // Prepare STK Push Request
    let stkPushResponse;
    try {
      stkPushResponse = await fetch(
        `${baseUrl}/mpesa/stkpush/v1/processrequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stkPushBody),
        }
      );
    } catch (error) {
      console.error("Network error when sending STK Push:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Network error when connecting to M-Pesa STK Push API",
          code: "NETWORK_ERROR",
          details: error.message
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    if (!stkPushResponse.ok) {
      const errorText = await stkPushResponse.text();
      console.error("STK Push failed:", errorText);
      
      let userFriendlyMessage = "Failed to initiate STK Push with M-Pesa API";
      let errorDetails = `Status: ${stkPushResponse.status}, Response: ${errorText}`;
      
      // Try to parse the error as JSON to extract more details
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.errorCode === "500.001.1001" || errorJson.errorMessage?.includes("Wrong credentials")) {
          userFriendlyMessage = "M-Pesa rejected the STK push due to invalid credentials. Please check your Shortcode and Passkey.";
        } else if (errorJson.errorMessage) {
          userFriendlyMessage = `M-Pesa API error: ${errorJson.errorMessage}`;
        }
        errorDetails = JSON.stringify(errorJson);
      } catch (parseError) {
        // If parsing fails, use the raw error text
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          message: userFriendlyMessage,
          code: "STK_PUSH_ERROR",
          details: errorDetails
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    let stkPushData;
    try {
      stkPushData = await stkPushResponse.json();
    } catch (error) {
      console.error("Failed to parse STK Push response:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to parse STK Push response",
          code: "PARSE_ERROR",
          details: error.message
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    console.log("STK Push Response:", stkPushData);
    
    if (stkPushData.ResponseCode !== "0") {
      console.error("STK Push failed with response code:", stkPushData.ResponseCode);
      return new Response(
        JSON.stringify({
          success: false,
          message: stkPushData.ResponseDescription || "STK Push failed",
          code: "STK_PUSH_REJECTED",
          details: JSON.stringify(stkPushData)
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    // Create transaction record in database
    try {
      const { data: transaction, error: transactionError } = await supabase
        .from("mpesa_transactions")
        .insert({
          phone_number: formattedPhone,
          amount: Math.round(amount), // Ensure integer for amount
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
        // Continue even if database insert fails - we have the checkout request ID
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
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Still return success since STK Push was sent
      return new Response(
        JSON.stringify({
          success: true,
          message: "STK Push sent but failed to save transaction record",
          checkoutRequestId: stkPushData.CheckoutRequestID,
          merchantRequestId: stkPushData.MerchantRequestID,
          warning: "Transaction record not saved in database"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("M-Pesa STK Push error:", error.message, error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Failed to process M-Pesa payment request",
        code: "UNEXPECTED_ERROR",
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
