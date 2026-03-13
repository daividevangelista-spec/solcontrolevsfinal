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

  const { phone, text } = req.body

  try {

    const response = await fetch("http://localhost:3000/api/sendText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "solcontrole123"
      },
      body: JSON.stringify({
        session: "default",
        chatId: `${phone}@c.us`,
        text: text
      })
    })

    const data = await response.json()

    res.json(data)

  } catch (err) {

    console.error(err)
    res.status(500).json({ error: err.message })

  }

})

app.listen(3333, () => {
  console.log("Bridge WhatsApp rodando na porta 3333")
})