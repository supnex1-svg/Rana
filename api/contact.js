const nodemailer = require('nodemailer');

const MAIL_TO = process.env.MAIL_TO || 'hossamrana293@gmail.com';

function esc(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

function createTransporter() {
  const port = Number(process.env.SMTP_PORT || 465);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER || 'hossamrana293@gmail.com',
      pass: process.env.SMTP_PASS,
    },
  });
}

module.exports = async (req, res) => {
  // السماح بطلبات POST فقط
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = req.body || {};

  // فخ البوتات: إذا كان الحقل المخفي مملوءاً نرد بنجاح وهمي
  if (body.website && String(body.website).trim()) {
    return res.status(200).json({ ok: true });
  }

  const name = String(body.name || '').trim();
  const phone = String(body.phone || '').trim();
  const notes = String(body.notes || '').trim();
  const lang = body.lang === 'ar' ? 'العربية' : 'English';
  const id = body.id || `CT-${Date.now().toString().slice(-8)}`;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required.' });
  }

  if (!process.env.SMTP_PASS) {
    console.warn('[contact email] SMTP_PASS is not configured in Vercel. Skipping email send.');
    return res.status(200).json({ ok: true, notice: 'SMTP_PASS not set' });
  }

  const submittedAt = new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' }) + ' (توقيت القاهرة)';

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Arabic', Arial, sans-serif; background-color: #f6f7fb; margin: 0; padding: 24px; color: #171717; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #eef0f4; }
    .header { background: #171717; padding: 24px; color: #ffffff; border-bottom: 4px solid #C8202F; }
    .header h1 { margin: 0 0 6px; font-size: 20px; color: #ffffff; }
    .header p { margin: 0; font-size: 13px; color: #a3a3a3; }
    .content { padding: 24px; }
    .meta-box { background: #fafafa; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; display: flex; justify-content: space-between; border: 1px solid #ebebeb; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 10px; }
    th { text-align: right; padding: 12px 14px; background: #fbfbfb; color: #555555; width: 35%; border-bottom: 1px solid #f0f0f0; font-weight: 600; }
    td { padding: 12px 14px; border-bottom: 1px solid #f0f0f0; color: #111111; word-break: break-word; }
    .notes-box { background: #fffcf0; border: 1px solid #fae69e; border-radius: 8px; padding: 14px; margin-top: 20px; font-size: 14px; line-height: 1.6; color: #443705; }
    .footer { text-align: center; padding: 18px; font-size: 12px; color: #888888; background: #fafafa; border-top: 1px solid #f0f0f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>رسالة تواصل جديدة | Onboarding 4U</h1>
      <p>تم استلام استفسار جديد عبر نموذج التواصل بالموقع الإلكتروني</p>
    </div>
    <div class="content">
      <div class="meta-box">
        <div>رقم المرجع: <strong style="color: #C8202F;">${esc(id)}</strong></div>
        <div style="font-size: 12px; color: #777;">${esc(submittedAt)}</div>
      </div>
      <table>
        <tr>
          <th>اسم العميل / الصيدلي:</th>
          <td><strong>${esc(name)}</strong></td>
        </tr>
        <tr>
          <th>رقم الهاتف / واتساب:</th>
          <td dir="ltr" style="text-align: right;"><a href="tel:${esc(phone)}" style="color: #C8202F; text-decoration: none; font-weight: bold;">${esc(phone)}</a></td>
        </tr>
        <tr>
          <th>لغة التصفح:</th>
          <td>${esc(lang)}</td>
        </tr>
      </table>

      ${notes ? `
      <div class="notes-box">
        <strong>اسم الصيدلية / تفاصيل الرسالة:</strong>
        <p style="margin: 8px 0 0; white-space: pre-wrap;">${esc(notes)}</p>
      </div>` : ''}
    </div>
    <div class="footer">
      هذا الإشعار تم إرساله تلقائياً من موقع Onboarding 4U ومحفوظ في قاعدة بيانات Supabase.
    </div>
  </div>
</body>
</html>`;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Onboarding 4U" <${process.env.SMTP_USER || 'hossamrana293@gmail.com'}>`,
      to: MAIL_TO,
      subject: `[رسالة تواصل جديدة] ${name} [${id}]`,
      text: `رسالة تواصل جديدة من ${name}\nالهاتف: ${phone}\nرقم المرجع: ${id}\nالتفاصيل: ${notes || 'لا توجد ملاحظات'}`,
      html,
    });

    return res.status(200).json({ ok: true, id });
  } catch (err) {
    console.error('[contact email] sendMail error:', err);
    return res.status(500).json({ error: 'Failed to send notification email.' });
  }
};
