import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { bookingId, amount, description } = await req.json()

    if (!bookingId || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // TODO: Integrate with MercadoPago API
    // This is a placeholder for the actual MercadoPago integration
    // You'll need to:
    // 1. Get MercadoPago access token from environment variables
    // 2. Create a preference using MercadoPago SDK
    // 3. Return the preference ID to the client
    
    const preferenceData = {
      items: [
        {
          title: description || 'Reserva de cancha',
          quantity: 1,
          currency_id: 'ARS',
          unit_price: amount,
        },
      ],
      back_urls: {
        success: 'fulbito://payment/success',
        failure: 'fulbito://payment/failure',
        pending: 'fulbito://payment/pending',
      },
      auto_return: 'approved',
      external_reference: bookingId,
      metadata: {
        booking_id: bookingId,
      },
    }

    // Placeholder response - replace with actual MercadoPago API call
    return new Response(
      JSON.stringify({
        preferenceId: 'placeholder_preference_id',
        initPoint: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=placeholder_preference_id',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
