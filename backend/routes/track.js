// backend/routes/track.js
// بيستقبل أحداث الزيارات من الموقع ويحفظها في backend/data/events.jsonl
// مفيش IP ولا بيانات شخصية بتتحفظ: بس معرّف مجهول للمتصفح، الصفحة، ومصدر الزيارة.
//
// التركيب في server.js:  app.use('/api/track', require('./routes/track'));

const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const EVENTS_FILE = process.env.EVENTS_FILE || path.join(__dirname, '..', 'data', 'events.jsonl');
fs.mkdirSync(path.dirname(EVENTS_FILE), { recursive: true });

// الموقع بيبعت text/plain عشان يتفادى preflight، فنقبل الاتنين
router.use(express.json({ type: ['application/json', 'text/plain'], limit: '4kb' }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120, // 120 حدث في الدقيقة لكل IP
  standardHeaders: true,
  legacyHeaders: false,
});

const TYPES = new Set(['pageview', 'engaged', 'conversion', 'click']);
const DEVICES = new Set(['mobile', 'tablet', 'desktop']);
const ID_RE = /^[A-Za-z0-9-]{8,64}$/;
const HOST_RE = /^[a-z0-9.-]{1,100}$/;
const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|pingdom|uptime|monitor|preview|facebookexternalhit|curl|wget|python|java\//i;

const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

router.post('/', limiter, (req, res) => {
  const b = req.body && typeof req.body === 'object' ? req.body : {};

  // بوتات: نرد بنجاح من غير ما نسجّل
  if (BOT_RE.test(req.get('user-agent') || '')) return res.status(204).end();

  const type = text(b.type, 20);
  const vid = text(b.vid, 64);
  const sid = text(b.sid, 64);
  if (!TYPES.has(type) || !ID_RE.test(vid) || !ID_RE.test(sid)) return res.status(400).end();

  let pagePath = text(b.path, 200);
  if (!pagePath.startsWith('/')) pagePath = `/${pagePath}`;

  const record = { t: new Date().toISOString(), type, vid, sid, path: pagePath };

  const dev = text(b.dev, 10);
  if (DEVICES.has(dev)) record.dev = dev;

  if (type === 'pageview') {
    const ref = text(b.ref, 100).toLowerCase();
    if (HOST_RE.test(ref)) record.ref = ref;
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign']) {
      const value = text(b[key], 80);
      if (value) record[key] = value;
    }
  }
  if (type === 'click' || type === 'conversion') {
    const label = text(b.label, 40);
    if (label) record.label = label;
  }

  fs.appendFile(EVENTS_FILE, `${JSON.stringify(record)}\n`, (err) => {
    if (err) console.error('[track] could not write event:', err.message);
  });
  return res.status(204).end();
});

// أي خطأ في قراءة الطلب (JSON بايظ مثلًا) بنرد عليه بهدوء
router.use((err, req, res, next) => res.status(400).end());

module.exports = router;