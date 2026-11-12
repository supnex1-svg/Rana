const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const origins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174')
  .split(',')
  .map((o) => o.trim());

app.use(cors({ origin: origins }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/applications', require('./routes/applications'));
app.use('/api/contact', require('./routes/contact')); // فورم صفحة Contact
app.use('/api/track', require('./routes/track')); // تسجيل الزيارات

// أي error غير متوقع يرجع JSON بدل ما الطلب يقع
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error. Please try again.' });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  require('./reports/schedule').start(); // إرسال التقرير أوتوماتيك كل يومين
});