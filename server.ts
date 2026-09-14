import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Enable generous payload limits for audio recordings and files
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // 1. Audio Transcription using gemini-3.5-transcribe
  app.post('/api/transcribe', async (req, res) => {
    try {
      const { audioData, mimeType } = req.body;
      if (!audioData) {
        return res.status(400).json({ error: 'audioData is required' });
      }

      // Strip data URL prefix if present
      const cleanBase64 = audioData.replace(/^data:[^;]+;base64,/, '');
      const ai = getGenAI();

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'audio/webm',
                  data: cleanBase64,
                },
              },
              {
                text: 'Transcribe this audio recording verbatim with exact wording, clean capitalization, and punctuation.',
              },
            ],
          },
        ],
      });

      const transcription = response.text || '';
      return res.json({ transcription });
    } catch (err: any) {
      console.error('Transcription error:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to transcribe audio',
      });
    }
  });

  // 2. Multi-turn Gemini Chatbot with customizable roles and system instructions
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, systemInstruction, model } = req.body;
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'messages array is required' });
      }

      // Allowed models based on requirements:
      // gemini-3.5-flash (general tasks)
      // gemini-3.1-flash-lite (fast tasks)
      // gemini-3.1-pro-preview (complex tasks)
      let selectedModel = 'gemini-3.5-flash';
      if (model === 'gemini-3.1-flash-lite' || model === 'gemini-3.1-pro-preview' || model === 'gemini-3.8-flash') {
        selectedModel = model;
      }

      const ai = getGenAI();

      // Convert messages to Gemini API contents structure
      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const defaultSystemInstruction =
        systemInstruction ||
        'You are Ebolt Assistant, an intelligent, helpful, and concise AI helper inside the Ebolt workspace. You assist with data organization, research, writing, problem-solving, and general questions.';

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction: defaultSystemInstruction,
        },
      });

      const reply = response.text || '';
      return res.json({
        reply,
        modelUsed: selectedModel,
      });
    } catch (err: any) {
      console.error('Chat error:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to generate chat response',
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
