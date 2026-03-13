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

    // 1. Get Global settings
    const { data: settings } = await supabase.from('energy_settings').select('*').limit(1).single()
    if (!settings || !settings.notifications_enabled) {
      return new Response(JSON.stringify({ message: "Notifications globally disabled" }), { status: 200 })
    }

    const reminderDays = settings.reminder_days_before || 3
    const today = new Date()
    const targetDate = new Date()
    targetDate.setDate(today.getDate() + reminderDays)
    
    const targetDateStr = targetDate.toISOString().split('T')[0]
    const todayStr = today.toISOString().split('T')[0]

    console.log(`Processing reminders for ${targetDateStr} and overdue bills...`)

    // 2. Find bills due in X days
    const { data: dueBills } = await supabase
      .from('energy_bills')
      .select('*, clients!inner(user_id)')
      .eq('due_date', targetDateStr)
      .eq('payment_status', 'pending')

    for (const bill of (dueBills || [])) {
      const user_id = (bill.clients as any).user_id;
      if (!user_id) continue;

      // Queue Email/Push based on defaults
      await supabase.from('notifications').insert([
        { 
          user_id, 
          bill_id: bill.id, 
          type: 'bill_reminder_3d', 
          channel: 'email', 
          payload: { 
            days: reminderDays, 
            amount: bill.total_amount,
            month: bill.month,
            year: bill.year,
            due_date: bill.due_date
          } 
        },
        { 
          user_id, 
          bill_id: bill.id, 
          type: 'bill_reminder_3d', 
          channel: 'whatsapp', 
          payload: { days: reminderDays } 
        }
      ]);
    }

    // 3. Find overdue bills (1 day late)
    if (settings.auto_overdue_alerts) {
      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      const { data: overdueBills } = await supabase
        .from('energy_bills')
        .select('*, clients!inner(user_id)')
        .eq('due_date', yesterdayStr)
        .eq('payment_status', 'pending')

      for (const bill of overdueBills) {
        const user_id = (bill.clients as any).user_id
        if (!user_id) continue

        await supabase.from('notifications').insert([
          { 
            user_id, 
            bill_id: bill.id, 
            type: 'bill_overdue', 
            channel: 'email', 
            payload: { 
              amount: bill.total_amount,
              month: bill.month,
              year: bill.year,
              due_date: bill.due_date
            } 
          },
          { 
            user_id, 
            bill_id: bill.id, 
            type: 'bill_overdue', 
            channel: 'whatsapp', 
            payload: { amount: bill.total_amount } 
          }
        ])
      }
    }

    return new Response(JSON.stringify({ success: true, processed: (dueBills?.length || 0) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
