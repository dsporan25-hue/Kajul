import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API route for Gemini conversational fallback
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { message, customApiKey } = req.body;
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({
          reply: "আমি কাজল! আমি আপনার ভয়েস কমান্ড শোনার জন্য প্রস্তুত। Gemini সাধারণ প্রশ্নোত্তর ও অনুবাদের জন্য সেটিংস থেকে একটি API Key যুক্ত করতে পারেন।"
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `You are Kajol (কাজল), a sweet, caring, soft-spoken female Bengali voice AI assistant for Android.
Always respond in sweet, natural, colloquial Bengali (বাংলা).
Keep responses concise, conversational, and direct (1-3 short sentences) because your output is read aloud via Bengali Text-To-Speech.
Never include markdown formatting, bold markers (**), or bullet lists.
Be polite and affectionate (like a warm personal assistant).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: message,
        config: {
          systemInstruction,
        }
      });

      const reply = response.text?.trim() || "আমি কাজল, আপনার কমান্ডটি শুনলাম।";
      return res.json({ reply });
    } catch (error: any) {
      console.error('Gemini error:', error);
      return res.status(200).json({
        reply: "দুঃখিত, সংযোগে কিছুটা সমস্যা হচ্ছে। তবে আমি কাজল আপনার সাথেই আছি!"
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await import('vite').then((m) =>
      m.createServer({
        server: { middlewareMode: true, port: PORT },
      })
    );
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kajol voice assistant server running on http://localhost:${PORT}`);
  });
}

startServer();
