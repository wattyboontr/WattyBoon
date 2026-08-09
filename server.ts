import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route for AI Writing Assistant in rich text editor
app.post('/api/ai/assistant', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: 'GEMINI_API_KEY bulunamadı. Lütfen Ayarlar panelinden ekleyin.' });
    }

    const { prompt, type, context } = req.body;
    const ai = new GoogleGenAI({ apiKey });

    let systemInstruction = 'Sen Wattpad ve blog yazarları için Türkçe çalışan yaratıcı bir yazım asistanısın. Etkileyici, samimi ve kaliteli öneriler sunarsın.';
    if (type === 'continue') {
      systemInstruction += ' Verilen hikaye akışını doğal bir şekilde devam ettiren 2-3 sürükleyici paragraf yaz.';
    } else if (type === 'enhance') {
      systemInstruction += ' Verilen metni edebi dili güçlendirerek, betimlemeleri zenginleştirerek ve imla hatalarını düzelterek yeniden düzenle.';
    } else if (type === 'character') {
      systemInstruction += ' Verilen fikre veya türe uygun, isimleri, kişilik özellikleri, geçmişleri ve sırları olan 2 özgün karakter konsepti oluştur.';
    } else if (type === 'outline') {
      systemInstruction += ' Sürükleyici 3 bölümlük bir hikaye taslağı ve bölüm özetleri hazırla.';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${prompt ? `Kullanıcı İsteği: ${prompt}\n` : ''}${context ? `Hikaye / Metin Bağlamı:\n${context}` : ''}`,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    return res.json({ result: response.text });
  } catch (err: any) {
    console.error('AI Assistant Error:', err);
    return res.status(500).json({ error: err.message || 'Yapay zeka yanıt üretirken hata oluştu.' });
  }
});

async function startServer() {
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
