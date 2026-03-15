import express from "express"
import dotenv from "dotenv"
import cors from "cors"

dotenv.config()

const app = express()
const SOLCONTROLE_TOKEN = process.env.SOLCONTROLE_TOKEN || "solcontrole_secret_token_2026"

app.use(express.json())

// 1. Private Network Access (PNA) Middleware - MUST BE FIRST
app.use((req, res, next) => {
  if (req.headers["access-control-request-private-network"]) {
    res.setHeader("Access-Control-Allow-Private-Network", "true")
  }
  
  // Allow these early for preflights
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key")
  }

  next()
})

// 2. Standard CORS Middleware
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization", "x-api-key"]
}))

// 3. Logger Middleware
app.use((req, res, next) => {
  if (req.method !== "OPTIONS") {
    console.log(`[BRIDGE] ${new Date().toLocaleTimeString()} - Request: ${req.method} ${req.url} from ${req.headers.origin || 'unknown'}`)
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