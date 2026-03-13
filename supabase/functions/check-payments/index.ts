import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Buscar faturas pendentes com TxID
    const { data: bills, error: fetchError } = await supabase
      .from('energy_bills')
      .select('*')
      .eq('payment_status', 'pending')
      .not('pix_txid', 'is', null)
      .limit(20)

    if (fetchError) throw fetchError

    const results = []

    for (const bill of bills) {
      console.log(`Verificando pagamento para TxID: ${bill.pix_txid}`)

      // -----------------------------------------------------------------------
      // LOGICA DE INTEGRACAO COM BANCO / PSP (EXEMPLO)
      // Aqui você deve chamar a API do seu banco para consultar o status do TxID
      // Ex: Efí, Inter, Juno, Mercado Pago, etc.
      // -----------------------------------------------------------------------
      
      let isPaid = false
      let paidAt = null

      /** 
       * Exemplo de chamada (Pseudocódigo):
       * const res = await fetch(`https://api.banco.com.br/v2/pix/${bill.pix_txid}`, {
       *   headers: { "Authorization": `Bearer ${ACCESS_TOKEN}` }
       * })
       * const data = await res.json()
       * if (data.status === 'CONCLUIDA') { isPaid = true; paidAt = data.horario }
       */

      // SIMULAÇÃO PARA TESTE: 
      // Se você quiser testar manualmente, pode descomentar a linha abaixo
      // isPaid = true; paidAt = new Date().toISOString();

      if (isPaid) {
        const { error: updateError } = await supabase
          .from('energy_bills')
          .update({
            payment_status: 'paid',
            pix_paid_at: paidAt || new Date().toISOString(),
            pix_status: 'concluded'
          })
          .eq('id', bill.id)

        if (updateError) console.error(`Erro ao atualizar fatura ${bill.id}:`, updateError.message)
        results.push({ id: bill.id, status: 'paid' })
      } else {
        results.push({ id: bill.id, status: 'still_pending' })
      }
    }

    return new Response(
      JSON.stringify({ processed: bills.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error("Erro crítico em check-payments:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
