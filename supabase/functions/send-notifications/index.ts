import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getEmailSubject(type: string): string {
  switch (type) {
    case 'bill_generated': return 'Sua nova fatura de Energia Solar está disponível';
    case 'payment_confirmed': return 'Confirmação de Pagamento - SolControle';
    case 'bill_reminder_3d': return 'Lembrete: Sua fatura vence em breve';
    case 'bill_overdue': return 'Aviso: Sua fatura está em atraso';
    default: return 'Notificação SolControle';
  }
}

function getEmailBody(type: string, payload: any): string {

  const amount = payload?.amount
    ? `R$ ${Number(payload.amount).toLocaleString('pt-BR',{minimumFractionDigits:2})}`
    : '';

  const month = payload?.month || '';
  const year = payload?.year || '';

  const dueDate = payload?.due_date
    ? new Date(payload.due_date + 'T12:00:00').toLocaleDateString('pt-BR')
    : '';

  let title = "Nova Fatura ☀️";
  let message = `Referente a <b>${month}/${year}</b>`;

  if (type === 'bill_reminder_3d') {
    title = "Lembrete de Vencimento 📅";
    message = `Sua fatura de <b>${month}/${year}</b> vence em 3 dias.`;
  } else if (type === 'bill_overdue') {
    title = "Fatura em Atraso ⚠️";
    message = `Constamos uma fatura de <b>${month}/${year}</b> em aberto.`;
  } else if (type === 'payment_confirmed') {
    title = "Pagamento Confirmado ✅";
    message = `Obrigado! Seu pagamento referente a <b>${month}/${year}</b> foi processado.`;
  }

  return `
  <div style="font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;max-width:600px;margin:auto;background:#f8fafc;padding:30px;border-radius:12px">

    <div style="text-align:center;margin-bottom:25px">
      <div style="font-size:28px;font-weight:800;color:#d97706">SolControle</div>
    </div>

    <div style="background:white;padding:25px;border-radius:10px">

      <h2>${title}</h2>

      <p>${message}</p>

      <p style="font-size:24px;font-weight:bold;color:#b45309">${amount}</p>

      ${dueDate ? `<p>Vencimento: <b>${dueDate}</b></p>` : ''}

      <br>

      <a href="https://solcontrole.app/dashboard"
      style="background:#f59e0b;color:white;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold">
      Acessar Portal
      </a>

    </div>

    <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:20px">
    SolControle - Sistema de Energia Solar
    </p>

  </div>
  `;
}

serve(async (req) => {

  if (req.method === 'OPTIONS')
    return new Response('ok',{headers:corsHeaders})

  try {

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: notifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*, profiles(email,phone,name)')
      .eq('status','pending')
      .limit(10)

    if (fetchError) throw fetchError

    // Fetch global settings once to use as fallback for PIX/QR
    const { data: globalSettings } = await supabase
      .from('energy_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    const results:any[] = []

    for (const notif of notifications) {

      let sent=false
      let errorMessage=null

      try {

        /* EMAIL */

        if (notif.channel==='email') {

          const email=notif.profiles?.email

          if(!email)
            throw new Error("Email não encontrado")

          const res=await fetch("https://api.resend.com/emails",{
            method:"POST",
            headers:{
              "Content-Type":"application/json",
              Authorization:`Bearer ${Deno.env.get("RESEND_API_KEY")}`
            },
            body:JSON.stringify({
              from:"SolControle <onboarding@resend.dev>",
              to:[email],
              subject:getEmailSubject(notif.type),
              html:getEmailBody(notif.type,notif.payload)
            })
          })

          if(!res.ok){
            const err=await res.json()
            throw new Error(JSON.stringify(err))
          }

          sent=true
        }

        /* WHATSAPP */

        else if (notif.channel==="whatsapp") {

          const phone=notif.profiles?.phone
          if(!phone) throw new Error("Telefone não encontrado")

          const payload=notif.payload||{}
          
          // NEW: Fetch fresh bill data to ensure values are updated (e.g., after bulk generate + edit)
          const { data: billData } = await supabase
            .from('energy_bills')
            .select('*')
            .eq('id', notif.bill_id)
            .maybeSingle();

          console.log(`Enviando WhatsApp para ${phone} via canal whatsapp. Tipo: ${notif.type}`);

          const finalSolarValue = billData?.solar_energy_value ?? payload.solar_energy_value;
          const finalTotalAmount = billData?.total_amount ?? payload.amount;
          const finalDueDate = billData?.due_date ?? payload.due_date;
          // Fallback hierarchy: Bill Record -> Notification Payload -> Global Settings
          const finalPixCode = billData?.pix_copy_paste ?? payload.pix_key ?? globalSettings?.pix_key;
          const finalPixQr = billData?.pix_qrcode_url ?? payload.pix_qrcode ?? globalSettings?.pix_qr_code_url;

          const amount = finalTotalAmount
            ? `R$ ${Number(finalTotalAmount).toLocaleString('pt-BR',{minimumFractionDigits:2})}`
            : '---'
          const month=payload.month || ''
          const year=payload.year || ''
          const dueDate = finalDueDate
            ? new Date(finalDueDate+'T12:00:00').toLocaleDateString('pt-BR')
            : ''
          const pixCode = finalPixCode || "---"
          const pixQrCode = finalPixQr

          let message = "";
          
          if (notif.type === 'bill_reminder_3d') {
            message = `⏰ *SolControle: Lembrete de Vencimento*\n\nSua fatura de energia solar de *${month}/${year}* vence em *3 dias* (${dueDate}).\n\n💰 *Valor:* ${amount}\n\n💳 *PIX Copia e Cola*\n${pixCode}\n\nEvite juros pagando em dia! ☀️`;
          } else if (notif.type === 'bill_overdue') {
            message = `⚠️ *SolControle: Aviso de Atraso*\n\nConstatamos que sua fatura de energia solar de *${month}/${year}* (vencida em ${dueDate}) ainda não foi paga.\n\n💰 *Valor:* ${amount}\n\n💳 *PIX Copia e Cola*\n${pixCode}\n\nRegularize sua situação para evitar encargos. Obrigado!`;
          } else if (notif.type === 'payment_confirmed') {
             message=`✅ *SolControle*\n\nPagamento confirmado!\n\nRecebemos seu pagamento de ${amount} referente a ${month}/${year}.\n\nObrigado!`;
          } else {
            const solarVal = (finalSolarValue !== undefined && finalSolarValue !== null)
              ? `R$ ${Number(finalSolarValue).toLocaleString('pt-BR',{minimumFractionDigits:2})}`
              : 'R$ 0,00';
            const portalUrl = `https://solcontrole-solar.vercel.app/login`;

            message = `🌞 *SolControle — Fatura de Energia Solar*\n\nOlá!\n\nSua nova fatura de energia solar já está disponível.\n\n📅 Referência: *${month}/${year}*\n💰 Valor da Energia Solar: ${solarVal}\n📆 Vencimento: ${dueDate}\n\n💳 *PAGAMENTO VIA PIX*\n\n🔹 Copia e Cola PIX:\n\n${pixCode}\n\n📷 QR Code PIX para pagamento será enviado logo abaixo.\n\n📄 *Acessar sua fatura completa:*\n${portalUrl}\n\nObrigado por utilizar energia solar ☀️\n*SolControle*`;
          }

          const WHATSAPP_ENDPOINT = Deno.env.get("WHATSAPP_ENDPOINT") || "https://unantagonized-marceline-nonincriminating.ngrok-free.dev"
          const SOLCONTROLE_TOKEN = Deno.env.get("SOLCONTROLE_TOKEN") || "solcontrole_secret_token_2026"
          
          // Use sendText but mention QR code if available
          const waRes=await fetch(`${WHATSAPP_ENDPOINT}/send-whatsapp`,{
            method:"POST",
            headers:{
              "Content-Type":"application/json",
              "Authorization":`Bearer ${SOLCONTROLE_TOKEN}`
            },
            body:JSON.stringify({
              phone: phone,
              text: message
            })
          })
          
          if(!waRes.ok){
            const errText = await waRes.text();
            console.error(`Erro na Bridge WAHA (${waRes.status}):`, errText);
            throw new Error(`WhatsApp Bridge Error: ${waRes.status}`);
          }

          console.log(`WhatsApp enviado com sucesso para ${phone}`);

          // Message 2: If QR Code is available, send it as an image separately
          if (pixQrCode && notif.type === 'bill_generated') {
             console.log(`Enviando QR Code PIX como imagem para ${phone}`);
             await fetch(`${WHATSAPP_ENDPOINT}/send-whatsapp`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${SOLCONTROLE_TOKEN}`
                },
                body: JSON.stringify({
                  phone: phone,
                  image: pixQrCode, // The bridge should detect 'image' and use /sendImage
                  caption: "📷 QR Code PIX para pagamento"
                })
             }).catch(e => console.error("Erro ao enviar QR Code:", e.message));
          }

          sent=true
        }

        /* PUSH */

        else if (notif.channel==="push") {

          console.log(`Push enviado para ${notif.user_id}`)
          sent=true

        }

      } catch(e:any){

        console.error("Erro:",e.message)
        errorMessage=e.message
        sent=false

      }

      await supabase
        .from('notifications')
        .update({
          status: sent ? 'sent':'failed',
          sent_at: sent ? new Date().toISOString():null,
          error_message:errorMessage
        })
        .eq('id',notif.id)

      results.push({
        id:notif.id,
        status:sent ? 'sent':'failed'
      })

    }

    return new Response(
      JSON.stringify({processed:results.length,results}),
      {headers:{...corsHeaders,'Content-Type':'application/json'},status:200}
    )

  } catch(error:any){

    console.error("Erro crítico:",error.message)

    return new Response(
      JSON.stringify({error:error.message}),
      {headers:{...corsHeaders,'Content-Type':'application/json'},status:500}
    )

  }

})