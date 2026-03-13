import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log("Starting automated backup...")

    // 1. Export Critical Tables
    const tables = ['clients', 'consumer_units', 'energy_bills', 'payments', 'audit_logs', 'profiles', 'energy_settings']
    const backupData: any = {
      timestamp: new Date().toISOString(),
      tables: {}
    }

    let totalRecords = 0
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*')
      if (error) throw error
      backupData.tables[table] = data
      totalRecords += data.length
    }

    const filename = `auto_backup_${new Date().toISOString().split('T')[0]}.json`
    const jsonStr = JSON.stringify(backupData, null, 2)
    const sizeKb = Math.round(jsonStr.length / 1024)

    // 2. Upload to Backups Bucket
    const { error: uploadError } = await supabase.storage
      .from('backups')
      .upload(`automated/${filename}`, jsonStr, {
        contentType: 'application/json',
        upsert: true
      })

    if (uploadError) throw uploadError

    // 3. Record in Database
    const { error: dbError } = await supabase.from('backups').insert({
      filename: `automated/${filename}`,
      file_type: 'json',
      record_count: totalRecords,
      file_size_kb: sizeKb,
      created_by: null // System backup
    })

    if (dbError) throw dbError

    console.log(`Backup completed: ${filename} (${sizeKb} KB)`)

    return new Response(JSON.stringify({ success: true, filename, sizeKb }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Backup failed:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
