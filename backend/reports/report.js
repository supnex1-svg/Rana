// backend/reports/report.js
// بيقرأ الزيارات اللي اتسجّلت، يحسب الأرقام، يعمل PDF، ويبعته على الإيميل.
//
// بيتستخدم بطريقتين: يدويًا من الأمر ده، وأوتوماتيك كل يومين من schedule.js.
//
// التشغيل (من فولدر المشروع الرئيسي Onboarding4):
//   node backend/reports/report.js                  من أول زيارة اتسجّلت لحد النهارده (الـ baseline)
//   node backend/reports/report.js --days 30        آخر 30 يوم
//   node backend/reports/report.js --from 2026-11-01 --to 2026-11-30
//   node backend/reports/report.js --no-email       يحفظ الـ PDF بس من غير ما يبعته

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');

const REPORT_TO = process.env.REPORT_TO || process.env.MAIL_TO || 'hossamrana293@gmail.com';
const EVENTS_FILE = process.env.EVENTS_FILE || path.join(__dirname, '..', 'data', 'events.jsonl');
const TZ = 'Africa/Cairo';

// ───────────────────────── قراءة الأحداث والفترة ─────────────────────────
function parseArgs(argv) {
  const out = { email: true };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--no-email') out.email = false;
    else if (argv[i] === '--from') out.from = argv[++i];
    else if (argv[i] === '--to') out.to = argv[++i];
    else if (argv[i] === '--days') out.days = Number(argv[++i]);
  }
  return out;
}

const dayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const cairoDay = (t) => dayFmt.format(new Date(t)); // YYYY-MM-DD بتوقيت القاهرة

function loadEvents() {
  if (!fs.existsSync(EVENTS_FILE)) return [];
  return fs
    .readFileSync(EVENTS_FILE, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => (a.t < b.t ? -1 : 1));
}

const daysBetween = (start, end) => Math.round((Date.parse(end) - Date.parse(start)) / 86400000) + 1;

function resolveRange(args, events) {
  const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '');
  const today = cairoDay(Date.now());
  const firstDay = cairoDay(events[0].t);
  let start = firstDay;
  let end = today;

  if (args.from || args.to) {
    start = args.from || firstDay;
    end = args.to || today;
    if (!isDate(start) || !isDate(end)) throw new Error('Use dates like 2026-11-01 for --from and --to');
  } else if (args.days > 0) {
    start = cairoDay(Date.now() - (args.days - 1) * 86400000);
  }
  if (start > end) throw new Error('--from must be before --to');
  return { start, end, firstDay };
}

// ───────────────────────── تصنيف مصدر الزيارة ─────────────────────────
const SEARCH_RE = /(^|\.)(google|bing|yahoo|duckduckgo|yandex|ecosia|baidu)\./;
const SOCIAL_RE = /(facebook|instagram|twitter|linkedin|youtube|tiktok|pinterest|snapchat|telegram|whatsapp|reddit)/;
const SOCIAL_EXACT = new Set(['t.co', 'x.com', 'lnkd.in', 'fb.me', 'wa.me', 't.me', 'youtu.be']);

function classify(e) {
  const medium = (e.utm_medium || '').toLowerCase();
  const source = (e.utm_source || '').toLowerCase();

  // لينك متعلّم بـ utm (زي حملة واتساب أو إعلان)
  if (medium || source) {
    let channel = 'Other';
    if (/^(email|e-mail|newsletter)$/.test(medium)) channel = 'Email';
    else if (/^(cpc|ppc|paid|paidsearch|paid_social|paidsocial|display)$/.test(medium)) channel = 'Paid';
    else if (/^(social|social-media|sm|smm)$/.test(medium) || (!medium && SOCIAL_RE.test(source))) channel = 'Social media';
    else if (medium === 'organic' || (!medium && SEARCH_RE.test(`${source}.`))) channel = 'Search';
    else if (medium === 'referral') channel = 'Referral';
    return { channel, label: `${e.utm_source || '(not set)'} / ${e.utm_medium || '(not set)'}` };
  }

  // جاي من موقع تاني
  if (e.ref) {
    if (SEARCH_RE.test(e.ref)) return { channel: 'Search', label: `${e.ref} / organic` };
    if (SOCIAL_EXACT.has(e.ref) || SOCIAL_RE.test(e.ref)) return { channel: 'Social media', label: `${e.ref} / referral` };
    return { channel: 'Referral', label: `${e.ref} / referral` };
  }

  return { channel: 'Direct', label: '(direct) / (none)' };
}

// ───────────────────────── الحسابات ─────────────────────────
const bump = (map, key, init) => {
  if (!map.has(key)) map.set(key, init());
  return map.get(key);
};

function analyze(all, range) {
  const monthly = daysBetween(range.start, range.end) > 45;
  const bucketOf = (day) => (monthly ? day.slice(0, 7) : day);
  const events = all.map((e) => ({ ...e, day: cairoDay(e.t) }));

  // أول يوم شفنا فيه كل زائر (على مدار كل التسجيل) عشان نعرف مين "جديد"
  const firstSeen = new Map();
  for (const e of events) if (e.type === 'pageview' && !firstSeen.has(e.vid)) firstSeen.set(e.vid, e.day);

  const period = events.filter((e) => e.day >= range.start && e.day <= range.end);
  const views = period.filter((e) => e.type === 'pageview');

  const users = new Set(views.map((e) => e.vid));
  const newUsers = [...users].filter((v) => {
    const d = firstSeen.get(v);
    return d >= range.start && d <= range.end;
  });

  // الزيارات (sessions)
  const sessionMap = new Map();
  for (const e of period) {
    const s = bump(sessionMap, e.sid, () => ({ vid: e.vid, pv: 0, engaged: false, first: null }));
    if (e.type === 'pageview') {
      s.pv += 1;
      if (!s.first) s.first = e;
    } else if (e.type === 'engaged' || e.type === 'conversion') {
      s.engaged = true;
    }
  }
  const sessions = [...sessionMap.values()].filter((s) => s.pv > 0);
  for (const s of sessions) s.isEngaged = s.engaged || s.pv >= 2;
  const engagedSessions = sessions.filter((s) => s.isEngaged).length;

  // المصادر
  const channels = new Map();
  const sources = new Map();
  const campaigns = new Map();
  const tally = (map, key, s) => {
    const r = bump(map, key, () => ({ sessions: 0, engaged: 0, users: new Set() }));
    r.sessions += 1;
    if (s.isEngaged) r.engaged += 1;
    r.users.add(s.vid);
  };
  for (const s of sessions) {
    const { channel, label } = classify(s.first);
    tally(channels, channel, s);
    tally(sources, label, s);
    if (s.first.utm_campaign) tally(campaigns, s.first.utm_campaign, s);
  }

  // الصفحات
  const pages = new Map();
  for (const e of views) {
    const p = bump(pages, e.path, () => ({ views: 0, users: new Set() }));
    p.views += 1;
    p.users.add(e.vid);
  }

  // الإجراءات: ضغطات التواصل والتحويلات
  const actions = new Map();
  for (const e of period) {
    if (e.type !== 'click' && e.type !== 'conversion') continue;
    const a = bump(actions, `${e.type}:${e.label || ''}`, () => ({ count: 0, users: new Set() }));
    a.count += 1;
    a.users.add(e.vid);
  }

  // التوزيع على الفترات (يومي أو شهري)
  const buckets = new Map();
  const bucket = (key) => bump(buckets, key, () => ({ users: new Set(), newUsers: 0, sessions: 0, engaged: 0, views: 0 }));
  for (const e of views) {
    const b = bucket(bucketOf(e.day));
    b.views += 1;
    b.users.add(e.vid);
  }
  for (const s of sessions) {
    const b = bucket(bucketOf(s.first.day));
    b.sessions += 1;
    if (s.isEngaged) b.engaged += 1;
  }
  for (const v of newUsers) bucket(bucketOf(firstSeen.get(v))).newUsers += 1;

  return {
    monthly,
    totals: {
      users: users.size,
      newUsers: newUsers.length,
      sessions: sessions.length,
      engagedSessions,
      engagementRate: sessions.length ? engagedSessions / sessions.length : 0,
      pageViews: views.length,
      pagesPerSession: sessions.length ? views.length / sessions.length : 0,
    },
    channels,
    sources,
    campaigns,
    pages,
    actions,
    buckets: [...buckets.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)),
  };
}

// ───────────────────────── قالب الـ PDF ─────────────────────────
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n) => Math.round(n || 0).toLocaleString('en-US');
const pct = (x) => `${((x || 0) * 100).toFixed(1)}%`;
const dayLabel = (s) =>
  new Date(`${s}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const bucketLabel = (key, monthly) =>
  monthly
    ? new Date(`${key}-01T00:00:00Z`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })
    : new Date(`${key}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

const sortedBySessions = (map) => [...map.entries()].sort((a, b) => b[1].sessions - a[1].sessions);

const CORE_CHANNELS = ['Search', 'Direct', 'Social media', 'Referral'];
const ACTION_ROWS = [
  ['conversion:application', 'Job applications submitted'],
  ['conversion:contact', 'Contact form messages'],
  ['click:whatsapp', 'WhatsApp clicks'],
  ['click:phone', 'Phone number clicks'],
  ['click:email', 'Email clicks'],
];

function buildHtml(d, range, title) {
  const t = d.totals;
  const share = (n) => (t.sessions ? n / t.sessions : 0);
  const empty = (cols) => `<tr><td colspan="${cols}" class="empty">No data yet</td></tr>`;
  const card = (label, value, sub = '') =>
    `<div class="card"><div class="label">${esc(label)}</div><div class="value">${esc(value)}</div><div class="sub">${esc(sub)}</div></div>`;

  // الأربع مصادر الأساسية بتظهر دايمًا، والباقي لو فيه زيارات
  const channelNames = [...CORE_CHANNELS, ...[...d.channels.keys()].filter((k) => !CORE_CHANNELS.includes(k))];
  const channelRows = channelNames
    .map((name) => {
      const r = d.channels.get(name) || { sessions: 0, engaged: 0, users: new Set() };
      return (
        `<tr><td>${esc(name === 'Search' ? 'Search engines (Google & others)' : name)}</td>` +
        `<td class="num">${fmt(r.sessions)}</td><td class="num">${pct(share(r.sessions))}</td>` +
        `<td class="num">${fmt(r.users.size)}</td><td class="num">${pct(r.sessions ? r.engaged / r.sessions : 0)}</td>` +
        `<td class="barcell"><div class="bar"><span style="width:${(share(r.sessions) * 100).toFixed(1)}%"></span></div></td></tr>`
      );
    })
    .join('');

  const sourceRows = sortedBySessions(d.sources)
    .slice(0, 10)
    .map(
      ([label, r]) =>
        `<tr><td>${esc(label)}</td><td class="num">${fmt(r.sessions)}</td><td class="num">${fmt(r.users.size)}</td>` +
        `<td class="num">${pct(r.engaged / r.sessions)}</td></tr>`
    )
    .join('');

  const campaignRows = sortedBySessions(d.campaigns)
    .slice(0, 10)
    .map(
      ([label, r]) =>
        `<tr><td>${esc(label)}</td><td class="num">${fmt(r.sessions)}</td><td class="num">${fmt(r.users.size)}</td>` +
        `<td class="num">${pct(r.engaged / r.sessions)}</td></tr>`
    )
    .join('');

  const pageRows = [...d.pages.entries()]
    .sort((a, b) => b[1].views - a[1].views)
    .slice(0, 10)
    .map(
      ([p, r], i) =>
        `<tr><td class="num">${i + 1}</td><td class="path">${esc(p)}</td><td class="num">${fmt(r.views)}</td><td class="num">${fmt(r.users.size)}</td></tr>`
    )
    .join('');

  const actionRows = ACTION_ROWS.map(([key, label]) => {
    const a = d.actions.get(key) || { count: 0, users: new Set() };
    return `<tr><td>${esc(label)}</td><td class="num">${fmt(a.count)}</td><td class="num">${fmt(a.users.size)}</td></tr>`;
  }).join('');

  const timeRows = d.buckets
    .map(
      ([key, b]) =>
        `<tr><td>${esc(bucketLabel(key, d.monthly))}</td><td class="num">${fmt(b.users.size)}</td><td class="num">${fmt(b.newUsers)}</td>` +
        `<td class="num">${fmt(b.sessions)}</td><td class="num">${pct(b.sessions ? b.engaged / b.sessions : 0)}</td><td class="num">${fmt(b.views)}</td></tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Segoe UI', Tahoma, Arial, 'Noto Sans', sans-serif; font-size: 11px; color: #202020; line-height: 1.5; }
  header { background: #171717; color: #fff; padding: 18px 20px; border-radius: 10px; border-bottom: 4px solid #C8202F; }
  header h1 { margin: 0 0 4px; font-size: 20px; }
  header p { margin: 0; color: #cfcfcf; font-size: 11px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; }
  .card { border: 1px solid #e5e2df; border-radius: 10px; padding: 12px 14px; background: #faf9f8; }
  .card .label { font-size: 10px; text-transform: uppercase; letter-spacing: .04em; color: #666; font-weight: 700; }
  .card .value { font-size: 24px; font-weight: 800; color: #171717; margin-top: 2px; }
  .card .sub { font-size: 10px; color: #888; min-height: 13px; }
  h2 { font-size: 13px; color: #C8202F; margin: 20px 0 6px; padding-bottom: 4px; border-bottom: 1px solid #e5e2df; }
  h3 { font-size: 11px; color: #333; margin: 12px 0 4px; }
  table { width: 100%; border-collapse: collapse; }
  tr { page-break-inside: avoid; }
  th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .03em; color: #555; background: #faf9f8; padding: 6px 8px; border-bottom: 1px solid #e5e2df; }
  td { padding: 6px 8px; border-bottom: 1px solid #f0eeec; vertical-align: middle; }
  th.num, td.num { text-align: right; white-space: nowrap; }
  td.path { word-break: break-all; font-family: Consolas, 'Courier New', monospace; font-size: 10px; }
  td.empty { text-align: center; color: #aaa; }
  td.barcell { width: 24%; }
  .bar { height: 8px; background: #eee; border-radius: 4px; overflow: hidden; }
  .bar span { display: block; height: 100%; background: #C8202F; border-radius: 4px; }
  .note { margin-top: 18px; font-size: 9.5px; color: #888; line-height: 1.6; }
</style></head>
<body>
  <header>
    <h1>${esc(title)}</h1>
    <p>Onboarding 4U · ${esc(dayLabel(range.start))} – ${esc(dayLabel(range.end))} · Tracking started ${esc(dayLabel(range.firstDay))}</p>
  </header>

  <div class="grid">
    ${card('Total users', fmt(t.users), 'Unique visitors (browsers)')}
    ${card('New users', fmt(t.newUsers), t.users ? `${pct(t.newUsers / t.users)} of all users` : '')}
    ${card('Sessions', fmt(t.sessions), 'Total visits')}
    ${card('Engagement rate', pct(t.engagementRate), `${fmt(t.engagedSessions)} engaged sessions`)}
    ${card('Page views', fmt(t.pageViews), 'All pages combined')}
    ${card('Pages per session', t.pagesPerSession.toFixed(2), '')}
  </div>

  <h2>Traffic sources</h2>
  <table>
    <tr><th>Source</th><th class="num">Sessions</th><th class="num">Share</th><th class="num">Users</th><th class="num">Engagement</th><th></th></tr>
    ${channelRows}
  </table>

  <h3>Top sources (source / medium)</h3>
  <table>
    <tr><th>Source / medium</th><th class="num">Sessions</th><th class="num">Users</th><th class="num">Engagement</th></tr>
    ${sourceRows || empty(4)}
  </table>

  ${
    campaignRows
      ? `<h3>Tagged links / campaigns (utm_campaign)</h3>
  <table>
    <tr><th>Campaign</th><th class="num">Sessions</th><th class="num">Users</th><th class="num">Engagement</th></tr>
    ${campaignRows}
  </table>`
      : ''
  }

  <h2>Most visited pages</h2>
  <table>
    <tr><th class="num">#</th><th>Page</th><th class="num">Views</th><th class="num">Users</th></tr>
    ${pageRows || empty(4)}
  </table>

  <h2>Visitor actions</h2>
  <table>
    <tr><th>Action</th><th class="num">Total</th><th class="num">Unique users</th></tr>
    ${actionRows}
  </table>

  <h2>${d.monthly ? 'Month by month' : 'Day by day'}</h2>
  <table>
    <tr><th>${d.monthly ? 'Month' : 'Day'}</th><th class="num">Users</th><th class="num">New users</th><th class="num">Sessions</th><th class="num">Engagement</th><th class="num">Page views</th></tr>
    ${timeRows || empty(6)}
  </table>

  <p class="note">
    Data comes from the website's own anonymous tracking (no cookies, no IP addresses, no personal data) and only covers visits recorded since tracking started.
    A "user" is one browser: the same person on two devices counts twice. A session ends after 30 minutes of inactivity.
    A session is "engaged" if it lasted 10+ seconds on screen, included 2+ page views, or ended in an application; engagement rate = engaged sessions ÷ sessions.
    Visits from WhatsApp, Instagram and similar apps often arrive with no referrer and show up as "Direct" unless the link carries utm_ tags.
    Bots and the site owner's own visits (when opted out) are excluded.
  </p>
</body></html>`;
}

// ───────────────────────── PDF والإيميل ─────────────────────────
async function buildPdf(html) {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
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
    await browser.close().catch(() => {});
  }
}

async function sendEmail(pdf, filename, data, range, kind) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP_USER / SMTP_PASS are not set in backend/.env (the PDF was still saved on your computer)');
  }
  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const t = data.totals;
  const topChannel = sortedBySessions(data.channels)[0];
  const label = kind === 'update' ? 'Website update' : 'Website baseline report';
  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: REPORT_TO,
    subject: `${label}: ${range.start} to ${range.end}`,
    text: [
      `${label} (${dayLabel(range.start)} - ${dayLabel(range.end)})`,
      '',
      `Total users: ${fmt(t.users)}`,
      `New users: ${fmt(t.newUsers)}`,
      `Sessions: ${fmt(t.sessions)}`,
      `Engagement rate: ${pct(t.engagementRate)}`,
      `Page views: ${fmt(t.pageViews)}`,
      topChannel ? `Top traffic source: ${topChannel[0]} (${fmt(topChannel[1].sessions)} sessions)` : '',
      '',
      'The full report is attached as a PDF.',
    ].join('\n'),
    attachments: [{ filename, content: pdf, contentType: 'application/pdf' }],
  });
}

// ───────────────────────── التشغيل ─────────────────────────
// args: { from, to, days, email, kind }  (kind: 'baseline' | 'update')
async function run(args) {
  const events = loadEvents();
  if (!events.length) {
    throw new Error(
      'No tracking data yet. Open the website (with the backend running), browse a few pages, then run this again.'
    );
  }

  const range = resolveRange(args, events);
  const data = analyze(events, range);
  if (!data.totals.sessions) {
    const err = new Error(`No visits were recorded between ${range.start} and ${range.end}.`);
    err.code = 'NO_DATA';
    throw err;
  }

  const isUpdate = args.kind === 'update';
  const title = isUpdate ? 'Website Update Report' : 'Website Baseline Report';
  const pdf = await buildPdf(buildHtml(data, range, title));
  const filename = `${isUpdate ? 'update' : 'baseline'}-${range.start}_to_${range.end}.pdf`;

  const outDir = path.join(__dirname, 'out');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, filename);
  fs.writeFileSync(outPath, pdf);
  console.log(`PDF saved: ${outPath}`);

  if (args.email) {
    await sendEmail(pdf, filename, data, range, args.kind);
    console.log(`Email sent to ${REPORT_TO}`);
  } else {
    console.log('Skipped email (--no-email).');
  }
  return { outPath, range, data };
}

module.exports = { run, loadEvents, cairoDay };

// لو اتشغّل مباشرة من الترمينال
if (require.main === module) {
  run({ ...parseArgs(process.argv.slice(2)), kind: 'baseline' }).catch((err) => {
    console.error('Report failed:', err.message);
    process.exitCode = 1;
  });
}