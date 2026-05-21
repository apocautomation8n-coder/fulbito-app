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
    const { matchId, playerId, amount } = await req.json()

    if (!matchId || !playerId || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // TODO: Integrate with MercadoPago API for split payment
    // This will use MercadoPago Marketplace to handle split payments
    // between the platform and the club
    
    const preferenceData = {
      items: [
        {
          title: 'Participación en partido',
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
      external_reference: `${matchId}:${playerId}`,
      metadata: {
        match_id: matchId,
        player_id: playerId,
        payment_type: 'split',
      },
    }

    // Placeholder response - replace with actual MercadoPago API call
    return new Response(
      JSON.stringify({
        preferenceId: 'placeholder_split_preference_id',
        initPoint: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=placeholder_split_preference_id',
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
