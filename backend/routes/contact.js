// backend/routes/contact.js
// بيستقبل فورم صفحة Contact، يعمله PDF، ويبعته على الإيميل.
//
// التركيب في server.js:  app.use('/api/contact', require('./routes/contact'));

const express = require('express');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const crypto = require('crypto');

const router = express.Router();
router.use(express.json({ limit: '20kb' }));

const MAIL_TO = process.env.MAIL_TO || 'hossamrana293@gmail.com';

// ───────────────────────── فحص وتنظيف البيانات ─────────────────────────
const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
// أرقام عربية وإنجليزية + - ( ) ومسافات
const PHONE_RE = /^[0-9\u0660-\u0669+()\s-]{6,25}$/;

function sanitize(body) {
  const name = text(body.name, 120);
  const phone = text(body.phone, 25);
  const notes = text(body.notes, 3000);
  const lang = body.lang === 'ar' ? 'ar' : 'en';

  if (!name) return { error: 'Please enter your name.' };
  if (!PHONE_RE.test(phone)) return { error: 'Please enter a valid phone number.' };
  return { data: { name, phone, notes, lang } };
}

// ───────────────────────── قالب الـ PDF ─────────────────────────
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function buildHtml(d, id, submittedAt) {
  // dir="auto": الكلام العربي بيتعرض يمين والإنجليزي شمال، كل قيمة باتجاهها
  const row = (label, value, dir = 'auto') =>
    `<tr><th>${esc(label)}</th><td dir="${dir}">${value ? esc(value) : '<span class="empty">—</span>'}</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Segoe UI', Tahoma, Arial, 'Noto Sans Arabic', 'Noto Sans', sans-serif; font-size: 12px; color: #202020; line-height: 1.6; }
  header { background: #171717; color: #fff; padding: 18px 20px; border-radius: 10px; border-bottom: 4px solid #C8202F; }
  header h1 { margin: 0 0 4px; font-size: 20px; }
  header p { margin: 0; color: #cfcfcf; font-size: 11px; }
  .meta { display: flex; justify-content: space-between; margin: 12px 2px 10px; font-size: 11px; color: #555; }
  .meta b { color: #171717; }
  table { width: 100%; border-collapse: collapse; }
  tr { page-break-inside: avoid; }
  th, td { text-align: left; vertical-align: top; padding: 9px 10px; border-bottom: 1px solid #f0eeec; }
  th { width: 30%; font-weight: 700; color: #333; background: #faf9f8; }
  td { white-space: pre-wrap; word-break: break-word; unicode-bidi: plaintext; }
  .empty { color: #aaa; }
</style></head>
<body>
  <header>
    <h1>Contact Inquiry</h1>
    <p>Onboarding 4U · Website contact form</p>
  </header>
  <div class="meta"><span>Reference: <b>${esc(id)}</b></span><span>Submitted: <b>${esc(submittedAt)}</b></span></div>
  <table>
    ${row('Full name', d.name)}
    ${row('Phone / WhatsApp', d.phone, 'ltr')}
    ${row('Pharmacy name / notes', d.notes)}
    ${row('Website language', d.lang === 'ar' ? 'Arabic' : 'English', 'ltr')}
  </table>
</body></html>`;
}

// ───────────────────────── PDF (Puppeteer) ─────────────────────────
let browserPromise = null;
function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer
      .launch({
        headless: true,
        executablePath: process.env.CHROME_PATH || undefined,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
      .catch((err) => {
        browserPromise = null; // نحاول تاني في الطلب الجاي
        throw err;
      });
  }
  return browserPromise;
}

async function buildPdf(html) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    // أمان: كل القيم متنضفة، وكمان نقفل الجافاسكريبت والشبكة
    await page.setJavaScriptEnabled(false);
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const url = req.url();
      if (url.startsWith('data:') || url === 'about:blank') req.continue();
      else req.abort();
    });
    await page.setContent(html, { waitUntil: 'load' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '14mm', bottom: '16mm', left: '12mm', right: '12mm' },
    });
    return Buffer.from(pdf);
  } finally {
    await page.close().catch(() => {});
  }
}

// ───────────────────────── الإيميل ─────────────────────────
function createTransporter() {
  const port = Number(process.env.SMTP_PORT || 465);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const oneLine = (s) => String(s).replace(/[\r\n]+/g, ' ').trim();
const makeId = () => `CT-${Date.now().toString().slice(-8)}${crypto.randomBytes(1).toString('hex').toUpperCase()}`;

// ───────────────────────── الراوت ─────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 رسايل كل 15 دقيقة لكل IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please try again later.' },
});

router.post('/', limiter, async (req, res) => {
  const body = req.body || {};

  // فخ البوتات: لو الحقل المخفي اتملى، نرد بنجاح وهمي من غير ما نبعت حاجة
  if (typeof body.website === 'string' && body.website.trim()) {
    return res.json({ ok: true, id: makeId() });
  }

  const { data, error } = sanitize(body);
  if (error) return res.status(400).json({ error });

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('[contact] SMTP_USER / SMTP_PASS are not set in .env');
    return res.status(500).json({ error: 'The contact service is not configured yet.' });
  }

  const id = makeId();
  const submittedAt = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Cairo' }) + ' (Cairo time)';

  try {
    const pdf = await buildPdf(buildHtml(data, id, submittedAt));

    await createTransporter().sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: MAIL_TO,
      subject: `New contact inquiry: ${oneLine(data.name)} [${id}]`,
      text: [
        'A new message was sent through the website contact form.',
        '',
        `Reference: ${id}`,
        `Name: ${oneLine(data.name)}`,
        `Phone / WhatsApp: ${oneLine(data.phone)}`,
        `Submitted: ${submittedAt}`,
        '',
        'Pharmacy name / notes:',
        data.notes || '—',
        '',
        'The same details are attached as a PDF.',
      ].join('\n'),
      attachments: [{ filename: `contact-${id}.pdf`, content: pdf, contentType: 'application/pdf' }],
    });

    return res.json({ ok: true, id });
  } catch (err) {
    console.error('[contact] failed to build or send the message:', err);
    return res.status(500).json({ error: 'We could not send your message right now. Please try again in a few minutes.' });
  }
});

module.exports = router;