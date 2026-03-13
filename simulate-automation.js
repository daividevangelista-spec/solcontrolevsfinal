
const localApiUrl = 'http://localhost:3000/api/sendText';
const apiKey = 'solcontrole123';

async function simulateEdgeFunction() {
  console.log("🚀 Simulating New WhatsApp Template...");
  
  const mockNotifications = [
    {
      id: 'test-uuid-template',
      type: 'bill_generated',
      channel: 'whatsapp',
      profiles: { phone: '5565981296917' },
      payload: {
        month: 'Março',
        year: '2026',
        amount: 350.50,
        pix_key: 'daivid.evangelista@edu.mt.gov.br'
      }
    }
  ];

  for (const notif of mockNotifications) {
    const payload = notif.payload || {};
    const amount = `R$ ${Number(payload.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    const month = payload.month;
    const pixKey = payload.pix_key;

    const waMessage = `🌞 *SolControle*\n\nSua fatura de *${month}* está disponível.\n\n💰 *Valor:* ${amount}\n\n💳 *Pagar via PIX:*\n${pixKey}\n\nOu acesse o portal:\nsolcontrole.app`;

    console.log("📡 Sending payload to server.js...");
    try {
      const response = await fetch(localApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Api-Key": apiKey },
        body: JSON.stringify({
          session: "default",
          chatId: `5565981296917@c.us`,
          text: waMessage,
        }),
      });

      const result = await response.json();
      console.log("✅ Result:", JSON.stringify(result, null, 2));
      console.log("\n💬 MESSAGE CONTENT:\n", waMessage);
    } catch (err) {
      console.error("❌ Error:", err.message);
    }
  }
}

simulateEdgeFunction();
