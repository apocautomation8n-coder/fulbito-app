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
    const { data, topic } = await req.json()

    // Handle payment notification
    if (topic === 'payment') {
      const paymentId = data.id

      // TODO: Verify webhook signature from MercadoPago
      // This is crucial for security

      // TODO: Get payment details from MercadoPago API
      // const payment = await getPaymentDetails(paymentId)

      // TODO: Update booking status based on payment status
      // if (payment.status === 'approved') {
      //   await updateBookingStatus(payment.external_reference, 'paid')
      // }

      console.log(`Payment notification received: ${paymentId}`)
      
      return new Response(
        JSON.stringify({ received: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Unknown topic' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function updateBookingStatus(supabase: any, bookingId: string, status: string) {
  const { error } = await supabase
    .from('bookings')
    .update({
      status,
      paid_at: status === 'paid' ? new Date().toISOString() : null,
    })
    .eq('id', bookingId)

  if (error) {
    console.error('Error updating booking:', error)
    throw error
  }
}
