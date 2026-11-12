// backend/routes/applications.js
// بيستقبل طلب التوظيف من صفحة /audit، يعمله PDF، ويبعته على الإيميل.

const express = require('express');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const crypto = require('crypto');

const router = express.Router();
router.use(express.json({ limit: '100kb' }));

// ───────────────────────── الإعدادات ─────────────────────────
const MAIL_TO = process.env.MAIL_TO || 'hossamrana293@gmail.com';

// ───────────────────────── الحقول المسموحة (أي حاجة غيرها بتتتجاهل) ─────────────────────────
const SECTIONS = [
  {
    title: 'Personal Details & Contact',
    fields: [
      ['fullName', 'Full name'],
      ['phone', 'Primary phone number'],
      ['whatsapp', 'WhatsApp number'],
      ['email', 'Email address'],
      ['birthDate', 'Date of birth'],
      ['gender', 'Gender'],
      ['address', 'Detailed address'],
      ['governorate', 'Governorate'],
      ['landmark', 'Nearest landmark'],
      ['job', 'Position applied for'],
      ['source', 'How they heard about the job'],
    ],
  },
  {
    title: 'Education & Work Experience',
    fields: [
      ['qualification', 'Highest qualification'],
      ['university', 'University / institute'],
      ['major', 'Major'],
      ['graduationYear', 'Graduation year'],
      ['experienceYears', 'Total years of experience'],
      ['lastEmployer', 'Last employer'],
      ['lastTitle', 'Last job title'],
      ['lastSalary', 'Last salary (EGP)'],
      ['expectedSalary', 'Expected salary (EGP)'],
      ['availability', 'Notice period / availability'],
      ['currentlyWorking', 'Currently employed'],
      ['pharmacyYears', 'Years of pharmacy experience'],
      ['experienceDetails', 'Experience, responsibilities and achievements'],
      ['leavingReason', 'Reason for leaving / seeking a new opportunity'],
      ['referencePermission', 'May we contact the previous manager'],
    ],
  },
  {
    title: 'Skills & Certificates',
    fields: [
      ['skills', 'Professional skills'],
      ['english', 'English proficiency'],
      ['computer', 'Computer proficiency'],
      ['systems', 'Software / systems'],
      ['certificates', 'Courses and certificates'],
      ['otherLanguages', 'Other languages'],
      ['portfolio', 'LinkedIn / portfolio'],
      ['files', 'Selected file names'],
    ],
  },
  {
    title: 'Job Fit & Occupational Health',
    fields: [
      ['shiftAbility', 'Can commit to the working hours'],
      ['shiftWork', 'Comfortable with shift work'],
      ['commute', 'Can travel to the workplace regularly'],
      ['fieldWork', 'Field visits / travel'],
      ['essentialDuties', 'Can perform the essential duties'],
      ['accommodation', 'Needs workplace accommodations'],
      ['accommodationDetails', 'Accommodation details'],
      ['safetyDiscussion', 'Wants to discuss safety confidentially with HR'],
      ['workConditions', 'Additional notes on working conditions'],
    ],
  },
  {
    title: 'Personal Questions & Consent',
    fields: [
      ['whyUs', 'Why join Aljumeiy Pharma'],
      ['strengths', 'Top three strengths'],
      ['development', 'Skill being developed'],
      ['problemExample', 'Problem faced at work and how it was handled'],
      ['contactTime', 'Preferred contact time'],
      ['assessment', 'Willing to take a test / practical interview'],
      ['accuracyConsent', 'Declared the data is accurate'],
      ['privacyConsent', 'Agreed to the privacy terms'],
    ],
  },
];

const ARRAY_FIELDS = new Set(['skills', 'files']);
const FLAG_FIELDS = new Set(['accuracyConsent', 'privacyConsent']);
const REQUIRED = [
  'fullName', 'phone', 'address', 'job',
  'qualification', 'experienceYears', 'expectedSalary', 'experienceDetails',
  'shiftAbility', 'essentialDuties', 'whyUs',
];

// ───────────────────────── تنظيف وفحص البيانات ─────────────────────────
function sanitize(body) {
  const data = {};

  for (const section of SECTIONS) {
    for (const [key] of section.fields) {
      const value = body[key];
      if (ARRAY_FIELDS.has(key)) {
        data[key] = Array.isArray(value)
          ? value.filter((v) => typeof v === 'string').slice(0, 40).map((v) => v.trim().slice(0, 200)).filter(Boolean)
          : [];
      } else if (FLAG_FIELDS.has(key)) {
        data[key] = value === true;
      } else {
        data[key] = typeof value === 'string' ? value.trim().slice(0, 4000) : '';
      }
    }
  }

  const missing = REQUIRED.filter((k) => !data[k]);
  if (missing.length) return { error: 'Please complete all required fields.' };
  if (!data.accuracyConsent || !data.privacyConsent) return { error: 'Please accept the declaration and privacy terms.' };
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { error: 'Please enter a valid email address.' };

  return { data };
}

// ───────────────────────── قالب الـ PDF (HTML) ─────────────────────────
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function displayValue(key, value) {
  if (FLAG_FIELDS.has(key)) return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '';
  return value;
}

function buildHtml(data, id, submittedAt) {
  const sections = SECTIONS.map((section) => {
    const rows = section.fields
      .map(([key, label]) => {
        const v = displayValue(key, data[key]);
        // dir="auto": كل قيمة بتتعرض باتجاهها الصح (عربي يمين / إنجليزي شمال)
        return `<tr><th>${esc(label)}</th><td dir="auto">${v ? esc(v) : '<span class="empty">—</span>'}</td></tr>`;
      })
      .join('');
    return `<section><h2>${esc(section.title)}</h2><table>${rows}</table></section>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Segoe UI', Tahoma, Arial, 'Noto Sans Arabic', 'Noto Sans', sans-serif; font-size: 11px; color: #202020; line-height: 1.55; }
  header { background: #171717; color: #fff; padding: 18px 20px; border-radius: 10px; border-bottom: 4px solid #C8202F; }
  header h1 { margin: 0 0 4px; font-size: 20px; }
  header p { margin: 0; color: #cfcfcf; font-size: 11px; }
  .meta { display: flex; justify-content: space-between; margin: 12px 2px 4px; font-size: 11px; color: #555; }
  .meta b { color: #171717; }
  section { margin-top: 14px; }
  h2 { font-size: 13px; color: #C8202F; margin: 0 0 6px; padding-bottom: 4px; border-bottom: 1px solid #e5e2df; }
  table { width: 100%; border-collapse: collapse; }
  tr { page-break-inside: avoid; }
  th, td { text-align: left; vertical-align: top; padding: 6px 8px; border-bottom: 1px solid #f0eeec; }
  th { width: 34%; font-weight: 700; color: #333; background: #faf9f8; }
  td { white-space: pre-wrap; word-break: break-word; unicode-bidi: plaintext; }
  .empty { color: #aaa; }
</style></head>
<body>
  <header>
    <h1>Job Application</h1>
    <p>Aljumeiy Pharma · Career Portal</p>
  </header>
  <div class="meta"><span>Application ID: <b>${esc(id)}</b></span><span>Submitted: <b>${esc(submittedAt)}</b></span></div>
  ${sections}
</body></html>`;
}

// ───────────────────────── PDF (Puppeteer) ─────────────────────────
let browserPromise = null;
function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer
      .launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
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
    // أمان: القالب متنضف من أي كود، وكمان نقفل الجافاسكريبت والشبكة
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
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate:
        '<div style="width:100%;font-size:8px;color:#888;text-align:center;font-family:Arial,sans-serif;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
    });
    return Buffer.from(pdf);
  } finally {
    await page.close().catch(() => {});
  }
}

// ───────────────────────── الإيميل (Nodemailer) ─────────────────────────
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

// ───────────────────────── الراوت ─────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 طلبات كل 15 دقيقة لكل IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please try again later.' },
});

const makeId = () => `AJ-${Date.now().toString().slice(-8)}${crypto.randomBytes(1).toString('hex').toUpperCase()}`;

router.post('/', limiter, async (req, res) => {
  const body = req.body || {};

  // فخ البوتات: لو الحقل المخفي اتملى، نرد بنجاح وهمي من غير ما نبعت حاجة
  if (typeof body.website === 'string' && body.website.trim()) {
    return res.json({ ok: true, id: makeId() });
  }

  const { data, error } = sanitize(body);
  if (error) return res.status(400).json({ error });

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('[applications] SMTP_USER / SMTP_PASS are not set in .env');
    return res.status(500).json({ error: 'The application service is not configured yet. Please try again later.' });
  }

  const id = makeId();
  const submittedAt = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Cairo' }) + ' (Cairo time)';

  try {
    const pdf = await buildPdf(buildHtml(data, id, submittedAt));

    await createTransporter().sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: MAIL_TO,
      replyTo: data.email || undefined,
      subject: `New job application: ${oneLine(data.fullName)} (${oneLine(data.job)}) [${id}]`,
      text: [
        'A new job application was submitted through the career portal.',
        '',
        `Application ID: ${id}`,
        `Name: ${oneLine(data.fullName)}`,
        `Position: ${oneLine(data.job)}`,
        `Phone: ${oneLine(data.phone)}`,
        `Email: ${oneLine(data.email) || '—'}`,
        `Submitted: ${submittedAt}`,
        '',
        'The full application is attached as a PDF.',
      ].join('\n'),
      attachments: [{ filename: `application-${id}.pdf`, content: pdf, contentType: 'application/pdf' }],
    });

    return res.json({ ok: true, id });
  } catch (err) {
    console.error('[applications] failed to build or send the application:', err);
    return res.status(500).json({ error: 'We could not send your application right now. Please try again in a few minutes.' });
  }
});

module.exports = router;