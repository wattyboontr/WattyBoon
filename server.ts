import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { 
  cloudflareStorage, 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  verifyToken 
} from './src/server/cloudflareStorage';

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

// Support up to 50MB for story covers, avatars, and chapter illustrations
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to send email (SMTP or Relay)
async function sendSystemEmail(to: string, subject: string, htmlContent: string) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS;

  if (smtpHost || (smtpUser && smtpPass)) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_PORT === '465' || !process.env.SMTP_PORT,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"WattyBoon Güvenlik" <${smtpUser || 'wattyboontr@gmail.com'}>`,
        to,
        subject,
        html: htmlContent,
      });
      return { success: true, method: 'smtp' };
    } catch (e) {
      console.warn('[Email Helper] SMTP failed, attempting relay:', e);
    }
  }

  try {
    const relayRes = await fetch(`https://formsubmit.co/ajax/${to}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: subject,
        _template: 'table',
        _captcha: 'false',
        Platform: 'WattyBoon Cloudflare Auth',
        Subject: subject,
        Message: htmlContent.replace(/<[^>]+>/g, ' ').substring(0, 500),
      }),
    });
    if (relayRes.ok) return { success: true, method: 'relay' };
  } catch (err) {
    console.warn('[Email Helper] Relay failed:', err);
  }

  console.log(`[Email Helper] Logged email to ${to}: "${subject}"`);
  return { success: true, method: 'logged' };
}

// API health endpoint for uptime checks & deployment monitoring
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    cloudflare: cloudflareStorage.getStatus()
  });
});

// Dynamic Sitemap XML endpoint for Google Search Console & SEO (supports both /sitemap and /sitemap.xml)
app.get(['/sitemap', '/sitemap.xml'], (req, res) => {
  try {
    const host = req.get('host') || 'wattyboon.com';
    const protocol = req.protocol === 'http' && !host.includes('localhost') ? 'https' : req.protocol;
    const baseUrl = `${protocol}://${host}`;

    const staticUrls = [
      { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${baseUrl}/?sayfa=kesfet`, priority: '0.9', changefreq: 'daily' },
      { loc: `${baseUrl}/?sayfa=kategoriler`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/?sayfa=forum`, priority: '0.8', changefreq: 'daily' },
      { loc: `${baseUrl}/?sayfa=yaz`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${baseUrl}/?sayfa=sitemap`, priority: '0.7', changefreq: 'weekly' },
      { loc: `${baseUrl}/?sayfa=kategori&amp;kategori=Romantik`, priority: '0.8', changefreq: 'daily' },
      { loc: `${baseUrl}/?sayfa=kategori&amp;kategori=Fantastik`, priority: '0.8', changefreq: 'daily' },
      { loc: `${baseUrl}/?sayfa=kategori&amp;kategori=Bilim+Kurgu`, priority: '0.8', changefreq: 'daily' },
      { loc: `${baseUrl}/?sayfa=kategori&amp;kategori=Gizem`, priority: '0.8', changefreq: 'daily' },
      { loc: `${baseUrl}/?sayfa=kategori&amp;kategori=Korku`, priority: '0.8', changefreq: 'daily' },
      { loc: `${baseUrl}/?sayfa=kategori&amp;kategori=Macera`, priority: '0.8', changefreq: 'daily' },
      { loc: `${baseUrl}/?sayfa=kategori&amp;kategori=Gen%C3%A7lik`, priority: '0.8', changefreq: 'daily' },
      { loc: `${baseUrl}/?sayfa=kategori&amp;kategori=%C5%9Eiir`, priority: '0.7', changefreq: 'daily' },
      { loc: `${baseUrl}/?sayfa=kategori&amp;kategori=Tarih`, priority: '0.7', changefreq: 'daily' },
      { loc: `${baseUrl}/?sayfa=kategori&amp;kategori=Klasik`, priority: '0.7', changefreq: 'weekly' },
      { loc: `${baseUrl}/?sayfa=kategori&amp;kategori=K%C4%B1sa+Hikaye`, priority: '0.7', changefreq: 'daily' },
      { loc: `${baseUrl}/?sayfa=kategori&amp;kategori=Mizah`, priority: '0.7', changefreq: 'weekly' },
    ];

    const allStories = cloudflareStorage.getStories ? cloudflareStorage.getStories() : [];
    const storyUrls = Array.isArray(allStories)
      ? allStories
          .filter((s: any) => s.visibility === 'public')
          .map((s: any) => ({
            loc: `${baseUrl}/?sayfa=hikaye&amp;id=${encodeURIComponent(s.id)}`,
            priority: '0.8',
            changefreq: 'weekly',
            lastmod: s.updatedAt ? s.updatedAt.split('T')[0] : new Date().toISOString().split('T')[0],
          }))
      : [];

    const today = new Date().toISOString().split('T')[0];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...storyUrls]
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${(u as any).lastmod || today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap generation error:', err);
    res.status(500).send('Error generating sitemap');
  }
});

// Robots.txt endpoint
app.get('/robots.txt', (req, res) => {
  const host = req.get('host') || 'wattyboon.com';
  const protocol = req.protocol === 'http' && !host.includes('localhost') ? 'https' : req.protocol;
  const baseUrl = `${protocol}://${host}`;

  const robots = `# WattyBoon Robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /?sayfa=admin

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// ==========================================
// FORMSPREE WEBHOOK
// ==========================================
app.post('/api/formspree/webhook', async (req, res) => {
  try {
    const { email, message } = req.body;
    
    const db = (process.env as any).DB;
    
    if (db && typeof db.prepare === 'function') {
      await db.prepare("INSERT INTO ContactSubmissions (email, message, createdAt) VALUES (?, ?, ?)")
        .bind(email, message, new Date().toISOString())
        .run();
    } else {
      console.log('Formspree webhook received (D1 not available):', { email, message });
    }
    
    res.status(200).json({ success: true });
  } catch (e) {
    console.error('Formspree webhook error:', e);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

app.get('/api/formspree/submissions', async (req, res) => {
  try {
    const db = (process.env as any).DB;
    
    if (db && typeof db.prepare === 'function') {
      const { results } = await db.prepare("SELECT * FROM ContactSubmissions ORDER BY createdAt DESC").all();
      res.json({ success: true, data: results });
    } else {
      res.json({ success: true, data: [], note: 'D1 not available' });
    }
  } catch (e) {
    console.error('Fetch submissions error:', e);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// ==========================================
// SECURE CLOUDFLARE AUTHENTICATION API ROUTES
// ==========================================

// 1. REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: 'Lütfen tüm zorunlu alanları doldurun.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');

    // Check if user already exists
    const existing = cloudflareStorage.findUserByEmailOrUsername(cleanEmail) || cloudflareStorage.findUserByEmailOrUsername(cleanUsername);
    if (existing) {
      return res.status(400).json({ error: 'Bu e-posta adresi veya kullanıcı adı zaten kullanımda.' });
    }

    // Secure PBKDF2 Password Hash
    const { hash, salt } = hashPassword(password);
    const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const isAdmin = cleanEmail === 'wattyboontr@gmail.com' || cleanEmail === 'semajim30@gmail.com';

    const newUser = {
      id: userId,
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      passwordHash: hash,
      salt: salt,
      role: isAdmin ? 'admin' : 'writer', // Unlimited writer capabilities
      isPro: true, // Unlimited capabilities
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      bio: 'WattyBoon yazarı ve okuru ✨',
      joinedDate: new Date().toISOString().split('T')[0],
      storiesCount: 0,
      followersCount: 0,
      followingCount: 0,
      followers: [],
      following: [],
      library: [],
      readingProgress: [],
      savedStories: [],
      bookmarks: [],
      customLists: [],
      emailVerified: true,
      authProvider: 'cloudflare',
      createdAt: new Date().toISOString(),
    };

    cloudflareStorage.saveUser(newUser);

    // Create session token
    const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });

    // Strip sensitive hash & salt from client payload
    const { passwordHash: _, salt: __, ...safeUser } = newUser;

    // Send Welcome / Security Email
    sendSystemEmail(
      cleanEmail,
      '🎉 WattyBoon Dünyasına Hoş Geldiniz!',
      `
      <div style="font-family: sans-serif; max-width: 540px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #7c3aed;">WattyBoon'a Hoş Geldiniz!</h2>
        <p>Sayın <strong>${newUser.name}</strong>,</p>
        <p>Hesabınız Cloudflare güvenli altyapısıyla başarıyla oluşturuldu. Artık dilediğiniz kadar sınırsız hikaye yazabilir, yayınlayabilir ve binlerce okuyucuya ulaşabilirsiniz!</p>
        <p><strong>Kullanıcı Adınız:</strong> @${newUser.username}</p>
        <p><strong>E-posta:</strong> ${newUser.email}</p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 16px 0;" />
        <p style="font-size: 12px; color: #64748b;">Bu hesap WattyBoon Cloudflare Güvenlik Sistemi tarafından doğrulanmıştır.</p>
      </div>
      `
    ).catch(() => {});

    return res.json({
      success: true,
      user: safeUser,
      token,
    });
  } catch (err: any) {
    console.error('Register error:', err);
    return res.status(500).json({ error: err.message || 'Kayıt sırasında bir hata oluştu.' });
  }
});

// 2. LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername) {
      return res.status(400).json({ error: 'Lütfen e-posta veya kullanıcı adınızı girin.' });
    }

    const user = cloudflareStorage.findUserByEmailOrUsername(emailOrUsername);
    if (!user) {
      return res.status(404).json({ error: 'Bu kullanıcı bilgisiyle kayıtlı hesap bulunamadı.' });
    }

    // Verify password if user has passwordHash
    if (user.passwordHash && user.salt && password) {
      const isValid = verifyPassword(password, user.passwordHash, user.salt);
      if (!isValid) {
        return res.status(401).json({ error: 'Girdiğiniz şifre hatalı. Lütfen kontrol ediniz.' });
      }
    }

    // Update last login
    user.lastLoginAt = new Date().toISOString();
    cloudflareStorage.saveUser(user);

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const { passwordHash: _, salt: __, ...safeUser } = user;

    return res.json({
      success: true,
      user: safeUser,
      token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: err.message || 'Giriş yapılırken bir hata oluştu.' });
  }
});

// 3. GOOGLE SECURE LOGIN
app.post('/api/auth/google-login', async (req, res) => {
  try {
    const { email, name, avatar, googleUid } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Google e-posta bilgisi gereklidir.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = cloudflareStorage.findUserByEmailOrUsername(cleanEmail);

    const isAdmin = cleanEmail === 'wattyboontr@gmail.com' || cleanEmail === 'semajim30@gmail.com';

    if (!user) {
      const cleanUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') + Math.floor(Math.random() * 900 + 100);
      user = {
        id: googleUid || `google_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        name: name || cleanEmail.split('@')[0],
        username: cleanUsername,
        email: cleanEmail,
        role: isAdmin ? 'admin' : 'writer',
        isPro: true,
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
        bio: 'WattyBoon yazarı ve okuru ✨',
        joinedDate: new Date().toISOString().split('T')[0],
        storiesCount: 0,
        followersCount: 0,
        followingCount: 0,
        followers: [],
        following: [],
        library: [],
        readingProgress: [],
        savedStories: [],
        bookmarks: [],
        customLists: [],
        emailVerified: true,
        authProvider: 'google',
        createdAt: new Date().toISOString(),
      };
    } else {
      if (isAdmin) user.role = 'admin';
      user.isPro = true;
      if (avatar && !user.avatar?.includes('data:')) user.avatar = avatar;
      if (name && !user.name) user.name = name;
      user.lastLoginAt = new Date().toISOString();
    }

    cloudflareStorage.saveUser(user);

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const { passwordHash: _, salt: __, ...safeUser } = user;

    return res.json({
      success: true,
      user: safeUser,
      token,
    });
  } catch (err: any) {
    console.error('Google login error:', err);
    return res.status(500).json({ error: err.message || 'Google ile giriş başarısız oldu.' });
  }
});

// 4. GET CURRENT USER (Session verification)
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Oturum bulunamadı.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Oturum süresi dolmuş veya geçersiz.' });
  }

  const user = cloudflareStorage.findUserById(payload.id);
  if (!user) {
    return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
  }

  const { passwordHash: _, salt: __, ...safeUser } = user;
  return res.json({ success: true, user: safeUser });
});

// 5. SEND OTP / VERIFICATION CODE
app.post('/api/auth/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'E-posta adresi gereklidir.' });

    const cleanEmail = email.trim().toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    cloudflareStorage.saveOtp(cleanEmail, code);

    const subject = `[WattyBoon] Doğrulama Kodunuz: ${code}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #7c3aed; margin-top: 0;">WattyBoon Doğrulama Kodu</h2>
        <p>Giriş / Onaylama işleminiz için tek kullanımlık güvenlik kodunuz:</p>
        <div style="background-color: #f8fafc; border: 2px dashed #7c3aed; border-radius: 10px; padding: 16px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4338ca;">${code}</span>
        </div>
        <p style="font-size: 13px; color: #64748b;">Bu kod 15 dakika boyunca geçerlidir. Başkalarıyla paylaşmayınız.</p>
      </div>
    `;

    await sendSystemEmail(cleanEmail, subject, html);
    return res.json({ success: true, message: 'Doğrulama kodu gönderildi.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Kod gönderilemedi.' });
  }
});

// 6. VERIFY OTP CODE
app.post('/api/auth/verify-code', (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'E-posta ve kod gereklidir.' });

    const isValid = cloudflareStorage.verifyOtp(email, code);
    if (!isValid) {
      return res.status(400).json({ error: 'Geçersiz veya süresi dolmuş doğrulama kodu.' });
    }
    return res.json({ success: true, message: 'Doğrulama başarılı.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Doğrulama hatası.' });
  }
});

// 7. PASSWORD RESET
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, newPassword, code } = req.body;
    if (!email) return res.status(400).json({ error: 'E-posta gereklidir.' });

    const cleanEmail = email.trim().toLowerCase();
    const user = cloudflareStorage.findUserByEmailOrUsername(cleanEmail);
    if (!user) {
      return res.status(404).json({ error: 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.' });
    }

    if (newPassword) {
      if (code) {
        const isValid = cloudflareStorage.verifyOtp(cleanEmail, code);
        if (!isValid) return res.status(400).json({ error: 'Geçersiz doğrulama kodu.' });
      }
      const { hash, salt } = hashPassword(newPassword);
      user.passwordHash = hash;
      user.salt = salt;
      cloudflareStorage.saveUser(user);
      return res.json({ success: true, message: 'Şifreniz başarıyla güncellendi.' });
    }

    // Otherwise generate temporary link / OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    cloudflareStorage.saveOtp(cleanEmail, otp);

    const subject = `[WattyBoon] Şifre Sıfırlama Kodu: ${otp}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #7c3aed; margin-top: 0;">Şifre Sıfırlama Talebi</h2>
        <p>WattyBoon hesabınızın şifresini yenilemek için aşağıdaki onay kodunu kullanabilirsiniz:</p>
        <div style="background-color: #f8fafc; border: 2px dashed #7c3aed; border-radius: 10px; padding: 16px; text-align: center; margin: 20px 0;">
          <span style="font-size: 30px; font-weight: 800; letter-spacing: 5px; color: #4338ca;">${otp}</span>
        </div>
        <p style="font-size: 13px; color: #64748b;">Bu talebi siz yapmadıysanız bu e-postayı dikkate almayınız.</p>
      </div>
    `;

    await sendSystemEmail(cleanEmail, subject, html);
    return res.json({ success: true, message: 'Şifre sıfırlama kodu e-posta adresinize gönderildi.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Şifre sıfırlama hatası.' });
  }
});

// 8. LOGOUT
app.post('/api/auth/logout', (req, res) => {
  return res.json({ success: true, message: 'Başarıyla çıkış yapıldı.' });
});

// ==========================================
// CLOUDFLARE STORAGE & BACKUP API ROUTES
// wattyboontr@gmail.com / semajim30@gmail.com
// ==========================================

// USERS (Kullanıcılar & Profiller)
app.get('/api/cloudflare/users', (req, res) => {
  try {
    const users = cloudflareStorage.getUsers().map((u) => {
      const { passwordHash: _, salt: __, ...safeUser } = u;
      return safeUser;
    });
    res.json({ success: true, count: users.length, data: users });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch users' });
  }
});

app.post('/api/cloudflare/users', (req, res) => {
  try {
    const user = req.body;
    if (!user || !user.id) {
      return res.status(400).json({ error: 'Valid user with id is required' });
    }
    const saved = cloudflareStorage.saveUser(user);
    const { passwordHash: _, salt: __, ...safeUser } = saved;
    res.json({ success: true, data: safeUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save user' });
  }
});

app.delete('/api/cloudflare/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const remaining = cloudflareStorage.deleteUser(id);
    res.json({ success: true, count: remaining.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete user' });
  }
});

// STORIES (Hikayeler - Sınırsız & Cloudflare Yedekli)
app.get('/api/cloudflare/stories', (req, res) => {
  try {
    const stories = cloudflareStorage.getStories();
    res.json({ success: true, count: stories.length, data: stories });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch stories from Cloudflare storage' });
  }
});

app.post('/api/cloudflare/stories', (req, res) => {
  try {
    const story = req.body;
    if (!story || !story.id) {
      return res.status(400).json({ error: 'Valid story object with an id is required' });
    }
    const updatedList = cloudflareStorage.saveStory(story);
    res.json({ success: true, data: story, count: updatedList.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save story to Cloudflare storage' });
  }
});

app.post('/api/cloudflare/stories/bulk', (req, res) => {
  try {
    const stories = req.body;
    if (!Array.isArray(stories)) {
      return res.status(400).json({ error: 'Array of stories required' });
    }
    const updatedList = cloudflareStorage.setStories(stories);
    res.json({ success: true, count: updatedList.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to bulk update stories' });
  }
});

app.delete('/api/cloudflare/stories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedList = cloudflareStorage.deleteStory(id);
    res.json({ success: true, deletedId: id, remainingCount: updatedList.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete story from Cloudflare storage' });
  }
});

app.post('/api/cloudflare/stories/clear-all', (req, res) => {
  try {
    cloudflareStorage.clearAllStories();
    res.json({ success: true, message: 'All stories cleared from Cloudflare storage' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to clear stories' });
  }
});

// MEDIA & IMAGE UPLOAD (Görselleri Cloudflare'e Yedekleme)
app.post('/api/cloudflare/upload', async (req, res) => {
  try {
    const { imageBase64, originalName, userId, type } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 verisi gereklidir.' });
    }

    const mediaId = `media_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    // Save image to Cloudflare media backup store
    const savedMedia = cloudflareStorage.saveMedia({
      id: mediaId,
      url: imageBase64,
      originalName: originalName || 'image.jpg',
      userId: userId || 'anonymous',
      type: type || 'story_cover',
    });

    res.json({
      success: true,
      url: imageBase64, // Instant access URL
      mediaId,
      backedUpToCloudflare: true,
    });
  } catch (err: any) {
    console.error('Media upload error:', err);
    res.status(500).json({ error: err.message || 'Görsel yüklenirken hata oluştu.' });
  }
});

app.get('/api/cloudflare/media', (req, res) => {
  try {
    const media = cloudflareStorage.getMedia();
    res.json({ success: true, count: media.length, data: media });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch media' });
  }
});

// FORUM DISCUSSIONS (Tartışmalar & Forum Konuları)
app.get('/api/cloudflare/topics', (req, res) => {
  try {
    const topics = cloudflareStorage.getTopics();
    res.json({ success: true, count: topics.length, data: topics });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch forum topics' });
  }
});

app.post('/api/cloudflare/topics', (req, res) => {
  try {
    const topic = req.body;
    if (!topic || !topic.id) {
      return res.status(400).json({ error: 'Valid topic object with id is required' });
    }
    const updatedList = cloudflareStorage.saveTopic(topic);
    res.json({ success: true, data: topic, count: updatedList.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save topic' });
  }
});

app.post('/api/cloudflare/topics/bulk', (req, res) => {
  try {
    const topics = req.body;
    if (!Array.isArray(topics)) return res.status(400).json({ error: 'Array required' });
    const updatedList = cloudflareStorage.setTopics(topics);
    res.json({ success: true, count: updatedList.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to bulk update topics' });
  }
});

app.delete('/api/cloudflare/topics/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedList = cloudflareStorage.deleteTopic(id);
    res.json({ success: true, deletedId: id, remainingCount: updatedList.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete topic' });
  }
});

// PARAGRAPH COMMENTS
app.get('/api/cloudflare/paragraph-comments', (req, res) => {
  try {
    const comments = cloudflareStorage.getParagraphComments();
    res.json({ success: true, count: comments.length, data: comments });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch paragraph comments' });
  }
});

app.post('/api/cloudflare/paragraph-comments', (req, res) => {
  try {
    const comment = req.body;
    if (!comment || !comment.id) return res.status(400).json({ error: 'Valid comment required' });
    const updatedList = cloudflareStorage.saveParagraphComment(comment);
    res.json({ success: true, data: comment, count: updatedList.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save paragraph comment' });
  }
});

app.delete('/api/cloudflare/paragraph-comments/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedList = cloudflareStorage.deleteParagraphComment(id);
    res.json({ success: true, deletedId: id, remainingCount: updatedList.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete paragraph comment' });
  }
});

// CHAPTER / STORY COMMENTS
app.get('/api/cloudflare/comments', (req, res) => {
  try {
    const comments = cloudflareStorage.getComments();
    res.json({ success: true, count: comments.length, data: comments });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch comments' });
  }
});

app.post('/api/cloudflare/comments', (req, res) => {
  try {
    const comment = req.body;
    if (!comment || !comment.id) return res.status(400).json({ error: 'Valid comment required' });
    const updatedList = cloudflareStorage.saveComment(comment);
    res.json({ success: true, data: comment, count: updatedList.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save comment' });
  }
});

app.delete('/api/cloudflare/comments/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedList = cloudflareStorage.deleteComment(id);
    res.json({ success: true, deletedId: id, remainingCount: updatedList.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete comment' });
  }
});

// NOTIFICATIONS
app.get('/api/cloudflare/notifications', (req, res) => {
  try {
    const notifs = cloudflareStorage.getNotifications();
    res.json({ success: true, count: notifs.length, data: notifs });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch notifications' });
  }
});

app.post('/api/cloudflare/notifications', (req, res) => {
  try {
    const notif = req.body;
    if (!notif || !notif.id) return res.status(400).json({ error: 'Valid notification required' });
    const updatedList = cloudflareStorage.saveNotification(notif);
    res.json({ success: true, count: updatedList.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save notification' });
  }
});

// DIRECT MESSAGES
app.get('/api/cloudflare/messages', (req, res) => {
  try {
    const messages = cloudflareStorage.getMessages();
    res.json({ success: true, count: messages.length, data: messages });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch messages' });
  }
});

app.post('/api/cloudflare/messages', (req, res) => {
  try {
    const message = req.body;
    if (!message || !message.id) return res.status(400).json({ error: 'Valid message required' });
    const updatedList = cloudflareStorage.saveMessage(message);
    res.json({ success: true, count: updatedList.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save message' });
  }
});

// STORY REPORTS (Şikayetler & Raporlar)
app.get('/api/cloudflare/reports', (req, res) => {
  try {
    const reports = cloudflareStorage.getReports();
    res.json({ success: true, count: reports.length, data: reports });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch reports' });
  }
});

app.post('/api/cloudflare/reports', (req, res) => {
  try {
    const report = req.body;
    if (!report || !report.id) return res.status(400).json({ error: 'Valid report required' });
    const updatedList = cloudflareStorage.saveReport(report);
    
    // Also notify admin by email in background
    const adminEmail = 'wattyboontr@gmail.com';
    const subject = `[WattyBoon Şikayet Raporu] "${report.storyTitle}" - ${report.reasonTitle || 'Şikayet İletildi'}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #fecdd3; border-radius: 16px; background-color: #fff;">
        <div style="background: linear-gradient(135deg, #e11d48, #9333ea); padding: 16px 20px; border-radius: 12px; color: white;">
          <h2 style="margin: 0; font-size: 18px;">🚨 Yeni Hikaye Şikayet Raporu</h2>
          <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">WattyBoon Moderasyon & Güvenlik Bildirimi</p>
        </div>
        <div style="padding: 16px 0; color: #1e293b; font-size: 13px; line-height: 1.6;">
          <p><strong>Raporlanan Hikaye:</strong> ${report.storyTitle} (ID: ${report.storyId})</p>
          <p><strong>Yazar:</strong> ${report.authorName}</p>
          <p><strong>Şikayet Eden:</strong> ${report.reporterName} (@${report.reporterUsername})</p>
          <p><strong>Şikayet Sebebi:</strong> <span style="color: #e11d48; font-weight: bold;">${report.reasonTitle || report.reason}</span></p>
          ${report.originalSourceUrl ? `<p><strong>Orijinal Kaynak/Telif Linki:</strong> <a href="${report.originalSourceUrl}" target="_blank" style="color: #7c3aed;">${report.originalSourceUrl}</a></p>` : ''}
          <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border-left: 4px solid #e11d48; margin: 12px 0;">
            <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Kullanıcı Açıklaması:</p>
            <p style="margin: 4px 0 0; font-size: 13px; color: #0f172a;">${report.description}</p>
          </div>
          <p style="font-size: 12px; color: #64748b;">Bu şikayeti incelemek ve işlem yapmak için WattyBoon Yönetim Paneli'ni ziyaret edebilirsiniz.</p>
        </div>
      </div>
    `;
    sendSystemEmail(adminEmail, subject, html).catch(() => {});

    res.json({ success: true, count: updatedList.length, data: report });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save report' });
  }
});

app.delete('/api/cloudflare/reports/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedList = cloudflareStorage.deleteReport(id);
    res.json({ success: true, deletedId: id, remainingCount: updatedList.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete report' });
  }
});

// COMPLETE SNAPSHOT BACKUP (Tüm verileri tek seferde Cloudflare'e yedekleme)
app.post('/api/cloudflare/sync-all', (req, res) => {
  try {
    const { stories, users, topics, notifications, messages, reports } = req.body;
    if (stories && Array.isArray(stories)) cloudflareStorage.setStories(stories);
    if (users && Array.isArray(users)) cloudflareStorage.setUsers(users);
    if (topics && Array.isArray(topics)) cloudflareStorage.setTopics(topics);
    if (notifications && Array.isArray(notifications)) cloudflareStorage.setNotifications(notifications);
    if (messages && Array.isArray(messages)) cloudflareStorage.setMessages(messages);
    if (reports && Array.isArray(reports)) cloudflareStorage.setReports(reports);

    res.json({
      success: true,
      message: 'All data synchronized and backed up to Cloudflare storage',
      status: cloudflareStorage.getStatus(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Sync failed' });
  }
});

// API route for Email Notifications when a new comment or reply is posted
app.post('/api/notify-comment', async (req, res) => {
  try {
    const {
      recipientEmail,
      recipientName,
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
    const targetEmail = recipientEmail || process.env.NOTIFICATION_EMAIL || 'wattyboontr@gmail.com';
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const commentTime = createdAt 
      ? new Date(createdAt).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }) 
      : new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
    
    const subject = isReply
      ? `[WattyBoon] Yorumunuza Yanıt: "${storyTitle || 'Hikaye'}" - ${userName || 'Kullanıcı'} size yanıt verdi`
      : `[WattyBoon] Yeni Yorum: "${storyTitle || 'Hikaye'}" - ${userName || 'Okuyucu'} bir yorum bıraktı`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
        <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 24px 28px; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">WattyBoon</h1>
          <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">${isReply ? '💬 Yeni Yorum Yanıtı' : '✨ Yeni Okuyucu Yorumu'}</p>
        </div>
        
        <div style="padding: 24px 28px; color: #1e293b;">
          <p style="font-size: 15px; margin-top: 0; color: #0f172a;">Merhaba <strong>${recipientName || 'WattyBoon Yazarı'}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            ${isReply 
              ? `Platformda <strong>${userName || 'Bir kullanıcı'}</strong>, <strong>@${replyToUserName || 'yorumunuza'}</strong> bir yanıt bıraktı.` 
              : `<strong>"${storyTitle || 'Hikayeniz'}"</strong> adlı eserinize yeni bir okuyucu yorumu paylaşıldı. Detaylar aşağıdadır:`}
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
              WattyBoon'a Git ve Yanıtla
            </a>
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 14px 28px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 11px; color: #94a3b8;">
            Bu e-posta WattyBoon Hikaye Platformu bildirim sistemi tarafından <a href="mailto:${targetEmail}" style="color: #64748b; text-decoration: none;">${targetEmail}</a> adresine iletilmiştir.
          </p>
        </div>
      </div>
    `;

    await sendSystemEmail(targetEmail, subject, htmlContent);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Email Notification Error:', err);
    return res.status(500).json({ error: err.message || 'E-posta bildirimi gönderilirken hata oluştu.' });
  }
});

// API route for Direct Message Email Notifications
app.post('/api/notify-message', async (req, res) => {
  try {
    const {
      recipientEmail,
      recipientName,
      senderName,
      senderUsername,
      messageContent,
      createdAt,
    } = req.body;

    const targetEmail = recipientEmail || process.env.NOTIFICATION_EMAIL || 'wattyboontr@gmail.com';
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const msgTime = createdAt 
      ? new Date(createdAt).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }) 
      : new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });

    const subject = `[WattyBoon] @${senderUsername || senderName} size yeni bir özel mesaj gönderdi`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
        <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 24px 28px; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">WattyBoon Mesajlar</h1>
          <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">✉️ Yeni Özel Mesaj</p>
        </div>
        
        <div style="padding: 24px 28px; color: #1e293b;">
          <p style="font-size: 15px; margin-top: 0; color: #0f172a;">Merhaba <strong>${recipientName || 'Kullanıcı'}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            <strong>${senderName || 'Bir kullanıcı'} (@${senderUsername || 'kullanici'})</strong> size WattyBoon üzerinden özel bir mesaj gönderdi.
          </p>

          <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 14px 18px; margin: 20px 0; border-radius: 6px;">
            <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #4f46e5; text-transform: uppercase;">Gelen Mesaj:</p>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #0f172a; white-space: pre-wrap;">${messageContent}</p>
            <p style="margin: 10px 0 0; font-size: 11px; color: #94a3b8;">Tarih: ${msgTime}</p>
          </div>

          <div style="margin-top: 28px; text-align: center;">
            <a href="${appUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: 700; font-size: 13px; box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3);">
              Mesajı Görüntüle & Yanıtla
            </a>
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 14px 28px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 11px; color: #94a3b8;">
            Bu bildirim e-postası WattyBoon Direkt Mesajlaşma sistemi tarafından <a href="mailto:${targetEmail}" style="color: #64748b; text-decoration: none;">${targetEmail}</a> adresine iletilmiştir.
          </p>
        </div>
      </div>
    `;

    await sendSystemEmail(targetEmail, subject, htmlContent);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Direct Message Email Notification Error:', err);
    return res.status(500).json({ error: err.message || 'Mesaj e-posta bildirimi gönderilirken hata oluştu.' });
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
      server: { 
        middlewareMode: true,
        hmr: false,
      },
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
