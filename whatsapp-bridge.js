import express from "express"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const SOLCONTROLE_TOKEN = process.env.SOLCONTROLE_TOKEN || "solcontrole_secret_token_2026"

app.use(express.json())

app.post("/send-whatsapp", async (req, res) => {
  const authHeader = req.headers.authorization
  
  if (authHeader !== `Bearer ${SOLCONTROLE_TOKEN}`) {
    console.error("Tentativa de acesso não autorizada!")
    return res.status(401).json({ error: "Unauthorized" })
  }

  const { phone, text, image, caption } = req.body

  try {
    let endpoint = "sendText"
    let body = {
      session: "default",
      chatId: `${phone}@c.us`,
      text: text
    }

    if (image) {
      endpoint = "sendImage"
      body = {
        session: "default",
        chatId: `${phone}@c.us`,
        file: image,
        caption: caption || ""
      }
    }

    const response = await fetch(`http://localhost:3000/api/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "solcontrole123"
      },
      body: JSON.stringify(body)
    })

    console.log(`[WAHA] Enviando ${endpoint} para ${phone}...`)
    if (image) console.log(`[WAHA] URL da Imagem: ${image}`)

    const data = await response.json()
    console.log(`[WAHA] Resposta:`, JSON.stringify(data))
    res.json(data)

  } catch (err) {

    console.error(err)
    res.status(500).json({ error: err.message })

  }

})

app.listen(3333, () => {
  console.log("Bridge WhatsApp rodando na porta 3333")
})