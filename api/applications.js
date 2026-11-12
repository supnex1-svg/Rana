const nodemailer = require('nodemailer');

const MAIL_TO = process.env.MAIL_TO || 'hossamrana293@gmail.com';

function esc(s) {
  if (s === undefined || s === null) return '—';
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

const SECTIONS = [
  {
    title: 'البيانات الشخصية وبيانات الاتصال',
    fields: [
      ['fullName', 'الاسم الكامل'],
      ['phone', 'رقم الهاتف الأساسي'],
      ['whatsapp', 'رقم الواتساب'],
      ['email', 'البريد الإلكتروني'],
      ['birthDate', 'تاريخ الميلاد'],
      ['gender', 'النوع'],
      ['address', 'العنوان بالتفصيل'],
      ['governorate', 'المحافظة'],
      ['landmark', 'أقرب علامة مميزة'],
      ['job', 'الوظيفة المتقدم إليها'],
      ['source', 'كيف سمعت عنا'],
    ],
  },
  {
    title: 'المؤهل الدراسي والخبرة السابقة',
    fields: [
      ['qualification', 'أعلى مؤهل دراسي'],
      ['university', 'الجامعة / المعهد'],
      ['major', 'التخصص'],
      ['graduationYear', 'سنة التخرج'],
      ['experienceYears', 'إجمالي سنوات الخبرة'],
      ['lastEmployer', 'آخر جهة عمل'],
      ['lastTitle', 'المسمى الوظيفي الأخير'],
      ['lastSalary', 'آخر راتب (جنيه)'],
      ['expectedSalary', 'الراتب المتوقع (جنيه)'],
      ['availability', 'تاريخ إمكانية استلام العمل'],
      ['currentlyWorking', 'هل تعمل حالياً؟'],
      ['pharmacyYears', 'سنوات الخبرة في مجال الصيدليات'],
      ['leavingReason', 'سبب ترك العمل السابق'],
      ['referencePermission', 'هل يمكن الرجوع لجهة عملك السابقة للسؤال عنك؟'],
    ],
  },
  {
    title: 'المهارات والأنظمة',
    fields: [
      ['english', 'مستوى اللغة الإنجليزية'],
      ['computer', 'إجادة استخدام الحاسب الآلي'],
      ['systems', 'برامج إدارة الصيدليات التي تجيدها'],
      ['certificates', 'الدورات والشهادات'],
      ['otherLanguages', 'لغات أخرى'],
    ],
  },
  {
    title: 'شروط وظروف العمل والورديات',
    fields: [
      ['shiftAbility', 'القدرة على العمل بنظام الورديات المتغيرة'],
      ['shiftWork', 'تفضيل الوردية (صباحي / مسائي / ليلي)'],
      ['commute', 'القدرة على الانتقال لمقر العمل المطلوب'],
      ['fieldWork', 'القدرة على العمل الميداني إن تطلب الأمر'],
      ['essentialDuties', 'القدرة على أداء المهام الوظيفية الأساسية'],
      ['accommodation', 'هل تحتاج إلى سكن تابع للشركة؟'],
      ['accommodationDetails', 'تفاصيل السكن'],
    ],
  },
  {
    title: 'أسئلة إضافية وملاحظات المتقدم',
    fields: [
      ['whyUs', 'لماذا ترغب في الانضمام إلى شركتنا؟'],
      ['strengths', 'أهم نقاط قوتك التي تميزك'],
      ['development', 'نقاط ترغب في تطويرها في نفسك'],
      ['problemExample', 'موقف وتحدي صعب واجهته في العمل وكيف تصرفت'],
      ['contactTime', 'الوقت المفضل للتواصل معك'],
    ],
  },
];

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const d = req.body || {};

  if (d.website && String(d.website).trim()) {
    return res.status(200).json({ ok: true });
  }

  const id = d.id || `AJ-${Date.now().toString().slice(-8)}`;
  const submittedAt = new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' }) + ' (توقيت القاهرة)';
  const candidateName = d.fullName || d.name || 'متقدم جديد';
  const candidateJob = d.job || 'طلب توظيف عام';

  if (!process.env.SMTP_PASS) {
    console.warn('[application email] SMTP_PASS not set. Skipping email send.');
    return res.status(200).json({ ok: true, notice: 'SMTP_PASS not set' });
  }

  let tablesHtml = '';
  for (const section of SECTIONS) {
    let rowsHtml = '';
    for (const [key, label] of section.fields) {
      const val = d[key];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        rowsHtml += `
          <tr>
            <th style="width: 38%; padding: 9px 12px; background: #fafafa; border-bottom: 1px solid #eeeeee; text-align: right; color: #555; font-size: 13px;">${esc(label)}</th>
            <td style="padding: 9px 12px; border-bottom: 1px solid #eeeeee; color: #111; font-size: 13px; word-break: break-word;">${esc(val)}</td>
          </tr>
        `;
      }
    }
    if (rowsHtml) {
      tablesHtml += `
        <div style="margin-top: 24px;">
          <h3 style="margin: 0 0 10px; font-size: 15px; color: #171717; border-bottom: 2px solid #C8202F; padding-bottom: 6px; display: inline-block;">
            ${esc(section.title)}
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid #eeeeee;">
            ${rowsHtml}
          </table>
        </div>
      `;
    }
  }

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Arabic', Arial, sans-serif; background-color: #f4f5f8; margin: 0; padding: 20px; color: #222; }
    .card { max-width: 720px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.06); border: 1px solid #e7e9ed; }
    .header { background: #171717; padding: 24px; color: #ffffff; border-bottom: 4px solid #C8202F; }
    .header h1 { margin: 0 0 6px; font-size: 21px; color: #ffffff; }
    .header p { margin: 0; font-size: 13px; color: #b3b3b3; }
    .content { padding: 24px; }
    .badge-bar { background: #fafafa; border: 1px solid #ebebeb; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 20px; }
    .footer { text-align: center; padding: 18px; font-size: 12px; color: #777777; background: #fbfbfb; border-top: 1px solid #ebebeb; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>استمارة تقديم توظيف جديدة</h1>
      <p>الوظيفة: <strong>${esc(candidateJob)}</strong> | الاسم: <strong>${esc(candidateName)}</strong></p>
    </div>
    <div class="content">
      <div class="badge-bar">
        <div>رقم الطلب المرجعي: <strong style="color: #C8202F;">${esc(id)}</strong></div>
        <div style="color: #777;">${esc(submittedAt)}</div>
      </div>
      ${tablesHtml}
    </div>
    <div class="footer">
      تم تسجيل هذا الطلب أوتوماتيكياً عبر منصة Onboarding 4U ومحفوظ في قاعدة البيانات.
    </div>
  </div>
</body>
</html>`;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Onboarding 4U Recruitment" <${process.env.SMTP_USER || 'hossamrana293@gmail.com'}>`,
      to: MAIL_TO,
      subject: `[طلب توظيف جديد] ${candidateName} - ${candidateJob} [${id}]`,
      text: `استمارة تقديم جديدة من: ${candidateName}\nالوظيفة: ${candidateJob}\nالهاتف: ${d.phone || '—'}\nرقم المرجع: ${id}`,
      html,
    });

    return res.status(200).json({ ok: true, id });
  } catch (err) {
    console.error('[application email] sendMail error:', err);
    return res.status(500).json({ error: 'Failed to send application email.' });
  }
};
