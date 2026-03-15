import express from "express"
import dotenv from "dotenv"
import cors from "cors"

dotenv.config()

const app = express()
const SOLCONTROLE_TOKEN = process.env.SOLCONTROLE_TOKEN || "solcontrole_secret_token_2026"

app.use(express.json())

// CORS & PNA (Private Network Access) Middleware
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization", "x-api-key"]
}))

// Support for Private Network Access (Public site to Localhost)
app.use((req, res, next) => {
  if (req.headers["access-control-request-private-network"]) {
    res.setHeader("Access-Control-Allow-Private-Network", "true")
  }

  // Log incoming request info for auditing
  if (req.method !== "OPTIONS") {
    console.log(`[BRIDGE] Request: ${req.method} ${req.url} from ${req.headers.origin || 'unknown origin'}`)
  }
  
  if (req.method === "OPTIONS") {
    return res.status(204).end()
  }
  next()
})

// GET Route for connectivity test
app.get("/", (req, res) => {
  res.json({ status: "online", service: "SolControle WhatsApp Bridge", version: "1.4.1" });
});

app.post("/send-whatsapp", async (req, res) => {
  const authHeader = req.headers.authorization
  
  if (authHeader !== `Bearer ${SOLCONTROLE_TOKEN}`) {
    console.error("Tentativa de acesso não autorizada!")
    return res.status(401).json({ error: "Unauthorized" })
  }

  const { phone, text, image, file, filename, caption } = req.body

  try {
    let endpoint = "sendText"
    let body = {
      session: "default",
      chatId: `${phone}@c.us`,
      text: text
    }

    if (image || file) {
      // WAHA provides sendImage and sendFile (for documents)
      endpoint = image ? "sendImage" : "sendFile"
      body = {
        session: "default",
        chatId: `${phone}@c.us`,
        file: image || file,
        caption: caption || "",
        ...(file ? { filename: filename || "documento" } : {})
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
    if (image || file) console.log(`[WAHA] URL do Arquivo: ${image || file}`)

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