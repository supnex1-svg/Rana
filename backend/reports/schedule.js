// backend/reports/schedule.js
// بيبعت تقرير PDF على الإيميل أوتوماتيك كل يومين (افتراضيًا) بالتحديثات الجديدة بس.
//
// إزاي بيشتغل:
//  - بيشتغل جوه السيرفر (server.js بينادي start()) وبيفحص كل ساعة.
//  - كل تقرير بيغطي الأيام الكاملة اللي فاتت من آخر تقرير لحد امبارح: من غير تكرار ومن غير أيام ضايعة،
//    حتى لو السيرفر كان مقفول كام يوم (التقرير الجاي بيعوّضهم).
//  - بيبعت الصبح (الساعة 9 بتوقيت القاهرة افتراضيًا).
//  - لو مفيش زيارات في الفترة، مش بيبعت إيميل فاضي.
//
// إعدادات اختيارية في backend/.env:
//   REPORT_EVERY_DAYS=2      كل كام يوم
//   REPORT_HOUR=9            الساعة (0-23) بتوقيت القاهرة
//   REPORT_SCHEDULE=off      لإيقاف الإرسال الأوتوماتيك

const fs = require('fs');
const path = require('path');
const { run, loadEvents, cairoDay } = require('./report');

const STATE_FILE = process.env.REPORT_STATE_FILE || path.join(__dirname, '..', 'data', 'report-state.json');
const EVERY_DAYS = Math.max(1, Number(process.env.REPORT_EVERY_DAYS) || 2);
const envHour = process.env.REPORT_HOUR;
const SEND_HOUR = envHour !== undefined && envHour !== '' && !Number.isNaN(Number(envHour)) ? Number(envHour) : 9;
const CHECK_EVERY_MS = 60 * 60 * 1000;

const hourFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo', hour: '2-digit', hourCycle: 'h23' });
const cairoHour = () => Number(hourFmt.format(new Date()));

const addDays = (day, n) => new Date(Date.parse(day) + n * 86400000).toISOString().slice(0, 10);
const diffDays = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeState(state) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

let running = false;

async function check() {
  if (running) return;
  running = true;
  try {
    if (cairoHour() < SEND_HOUR) return; // لسه بدري

    const events = loadEvents();
    if (!events.length) return;

    const state = readState();
    const yesterday = addDays(cairoDay(Date.now()), -1);
    // أول مرة: نبدأ من أول يوم اتسجّلت فيه زيارات
    const lastCovered = state.lastCoveredDay || addDays(cairoDay(events[0].t), -1);

    if (diffDays(lastCovered, yesterday) < EVERY_DAYS) return; // لسه ما عدّاش كفاية أيام كاملة

    const from = addDays(lastCovered, 1);
    const to = yesterday;
    console.log(`[report] sending update for ${from} → ${to}`);

    try {
      await run({ from, to, email: true, kind: 'update' });
    } catch (err) {
      if (err.code !== 'NO_DATA') throw err;
      console.log(`[report] no visits in ${from} → ${to}, nothing to send`);
    }
    writeState({ lastCoveredDay: to, lastSentAt: new Date().toISOString() });
  } catch (err) {
    // أي فشل (إيميل مثلًا): ما بنحدّث الحالة، فبيحاول تاني في الساعة الجاية
    console.error('[report] failed, will retry in an hour:', err.message);
  } finally {
    running = false;
  }
}

function start() {
  if (process.env.REPORT_SCHEDULE === 'off') {
    console.log('[report] automatic reports are turned off (REPORT_SCHEDULE=off)');
    return;
  }
  console.log(`[report] automatic update every ${EVERY_DAYS} days, around ${SEND_HOUR}:00 Cairo time`);
  setTimeout(check, 30 * 1000).unref(); // أول فحص بعد نص دقيقة من تشغيل السيرفر
  setInterval(check, CHECK_EVERY_MS).unref();
}

module.exports = { start, check };