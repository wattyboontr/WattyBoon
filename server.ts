import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable trust proxy for cloud deployment & global CDN/load balancers
app.set('trust proxy', true);

// Enable Global CORS & Standard Open Web Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// API health endpoint for uptime checks & deployment monitoring
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API route for Email Notifications when a new comment or reply is posted
app.post('/api/notify-comment', async (req, res) => {
  try {
    const {
      storyId,
      storyTitle,
      chapterIndex,
      chapterTitle,
      paragraphIndex,
      selectedText,
      parentId,
      replyToUserName,
      content,
      userName,
      userUsername,
      createdAt,
    } = req.body;

    const isReply = Boolean(parentId || replyToUserName);
    const targetEmail = process.env.NOTIFICATION_EMAIL || 'wattyboontr@gmail.com';
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const commentTime = createdAt 
      ? new Date(createdAt).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }) 
      : new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
    
    const subject = isReply
      ? `[WattyBoon] Yorum Yanıtı: "${storyTitle || 'Hikaye'}" - ${userName || 'Kullanıcı'} yanıt verdi`
      : `[WattyBoon] Yeni Yorum: "${storyTitle || 'Hikaye'}" - ${userName || 'Okuyucu'}`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
        <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 24px 28px; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">WattyBoon</h1>
          <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">${isReply ? '💬 Yeni Yorum Yanıtı' : '✨ Yeni Okuyucu Yorumu'}</p>
        </div>
        
        <div style="padding: 24px 28px; color: #1e293b;">
          <p style="font-size: 15px; margin-top: 0; color: #0f172a;">Merhaba <strong>WattyBoon Ekibi</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            ${isReply 
              ? `Platformunuzda <strong>${userName || 'Bir kullanıcı'}</strong>, <strong>@${replyToUserName || 'yorum sahibine'}</strong> bir yanıt bıraktı.` 
              : 'Platformunuzda yeni bir okuyucu yorumu paylaşıldı. Detaylar aşağıdadır:'}
          </p>

          <div style="background-color: #f8fafc; border-left: 4px solid #7c3aed; padding: 14px 18px; margin: 20px 0; border-radius: 6px;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #334155;">
              <strong>Hikaye:</strong> ${storyTitle || 'Bilinmeyen Hikaye'}
            </p>
            <p style="margin: 0 0 8px; font-size: 13px; color: #334155;">
              <strong>Bölüm:</strong> ${chapterTitle || `${(chapterIndex ?? 0) + 1}. Bölüm`}
            </p>
            <p style="margin: 0 0 8px; font-size: 13px; color: #334155;">
              <strong>${isReply ? 'Yanıtlayan:' : 'Yorum Yapan:'}</strong> ${userName || 'Kullanıcı'} (@${userUsername || 'kullanici'})
            </p>
            ${isReply && replyToUserName ? `
            <p style="margin: 0 0 8px; font-size: 13px; color: #7c3aed; font-weight: 600;">
              <strong>Yanıt Verilen:</strong> @${replyToUserName}
            </p>
            ` : ''}
            <p style="margin: 0; font-size: 13px; color: #334155;">
              <strong>Tarih / Saat:</strong> ${commentTime}
            </p>
          </div>

          ${selectedText ? `
          <div style="margin: 16px 0; padding: 12px 16px; background-color: #faf5ff; border-radius: 8px; border: 1px dashed #d8b4fe;">
            <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #7e22ce; text-transform: uppercase;">Alıntı Yapılan Cümle:</p>
            <p style="margin: 0; font-size: 13px; font-style: italic; color: #4c1d95;">"${selectedText}"</p>
          </div>
          ` : ''}

          <div style="margin: 20px 0; padding: 16px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px;">
            <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">${isReply ? 'Yanıt Metni:' : 'Yorum Metni:'}</p>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #0f172a; white-space: pre-wrap;">${content}</p>
          </div>

          <div style="margin-top: 28px; text-align: center;">
            <a href="${appUrl}" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: 700; font-size: 13px; box-shadow: 0 2px 6px rgba(124, 58, 237, 0.3);">
              WattyBoon'a Git
            </a>
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 14px 28px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 11px; color: #94a3b8;">
            Bu e-posta WattyBoon Hikaye Platformu yorum bildirim sistemi tarafından <a href="mailto:${targetEmail}" style="color: #64748b; text-decoration: none;">${targetEmail}</a> adresine iletilmiştir.
          </p>
        </div>
      </div>
    `;

    // 1. If SMTP credentials exist, send via SMTP
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS;

    if (smtpHost || (smtpUser && smtpPass)) {
      const transporter = nodemailer.createTransport({
        host: smtpHost || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: (process.env.SMTP_PORT === '465' || !process.env.SMTP_PORT),
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"WattyBoon Bildirim" <${smtpUser || 'wattyboontr@gmail.com'}>`,
        to: targetEmail,
        subject,
        html: htmlContent,
      });

      console.log(`[Email Notification] SMTP email successfully sent to ${targetEmail}`);
      return res.json({ success: true, method: 'smtp' });
    }

    // 2. Automated delivery via FormSubmit relay for instant zero-config dispatch
    try {
      const relayRes = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          _subject: subject,
          _template: 'table',
          _captcha: 'false',
          'Platform': 'WattyBoon',
          'Tür': isReply ? 'Yorum Yanıtı' : 'Yeni Yorum',
          'Hikaye': storyTitle || 'Hikaye',
          'Bölüm': chapterTitle || `${(chapterIndex ?? 0) + 1}. Bölüm`,
          'Gönderen': `${userName || 'Kullanıcı'} (@${userUsername || 'kullanici'})`,
          'Yanıt Verilen': isReply ? `@${replyToUserName || 'kullanıcı'}` : '-',
          'Alıntı': selectedText || 'Genel Bölüm Yorumu',
          'Mesaj': content,
          'Tarih': commentTime,
        }),
      });

      if (relayRes.ok) {
        console.log(`[Email Notification] Direct delivery email sent to ${targetEmail}`);
        return res.json({ success: true, method: 'relay' });
      }
    } catch (relayErr) {
      console.warn('[Email Notification] Relay dispatch notice:', relayErr);
    }

    console.log(`[Email Notification] Logged for ${targetEmail}: "${storyTitle}" by ${userName}`);
    return res.json({ success: true, method: 'logged' });
  } catch (err: any) {
    console.error('Email Notification Error:', err);
    return res.status(500).json({ error: err.message || 'E-posta bildirimi gönderilirken hata oluştu.' });
  }
});

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
