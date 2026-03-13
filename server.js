import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3000;
const API_KEY = 'solcontrole123';

app.use(cors());
app.use(bodyParser.json());

// Middleware for API Key validation
const validateApiKey = (req, res, next) => {
  const apiKey = req.header('X-Api-Key');
  if (apiKey === API_KEY) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  }
};

/**
 * @api {post} /api/sendText Send a WhatsApp message
 * @apiBody {String} session Session identifier
 * @apiBody {String} chatId Target WhatsApp ID (e.g. 5565981296917@c.us)
 * @apiBody {String} text Message content
 */
app.post('/api/sendText', validateApiKey, (req, res) => {
  const { session, chatId, text } = req.body;

  if (!chatId || !text) {
    return res.status(400).json({ error: 'Missing chatId or text' });
  }

  console.log(`[WhatsApp API] Sending message to ${chatId}: "${text}" (Session: ${session || 'default'})`);

  // Simulated success response as requested by the user's PowerShell script expectations
  res.json({
    status: 'success',
    message: 'Message sent successfully (Simulated)',
    data: {
      session: session || 'default',
      chatId,
      text,
      timestamp: new Date().toISOString()
    }
  });
});

app.listen(PORT, () => {
  console.log(`WhatsApp API Server running at http://localhost:${PORT}`);
});
