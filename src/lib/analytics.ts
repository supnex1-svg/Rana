// src/lib/analytics.ts
// تتبّع زيارات بسيط وخاص بالموقع: من غير كوكيز ومن غير أي بيانات شخصية.

import { logAnalyticsEvent, isSupabaseConfigured } from './supabase';

const API_URL = `${import.meta.env.VITE_API_URL ?? ''}/api/track`;

const VISITOR_KEY = 'o4u-vid';
const SESSION_KEY = 'o4u-session';
// لو كتبتي في الكونسول: localStorage.setItem('o4u-no-track', '1') زياراتك إنتي ما بتتحسبش
const OPT_OUT_KEY = 'o4u-no-track';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // زيارة جديدة بعد 30 دقيقة من غير نشاط

interface SessionState {
  id: string;
  last: number;
  engaged: boolean;
}

// لو المتصفح مانع التخزين نكمّل بالذاكرة
let memoryVisitor: string | null = null;
let memorySession: SessionState | null = null;
let firstPageviewOfDocument = true;
let lastPath = '';
let lastAt = 0;

const makeId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* التخزين مقفول */
  }
};

function getVisitorId(): string {
  const stored = read(VISITOR_KEY);
  if (stored) return stored;
  const id = memoryVisitor ?? makeId();
  memoryVisitor = id;
  write(VISITOR_KEY, id);
  return id;
}

function loadSession(): SessionState | null {
  const raw = read(SESSION_KEY);
  if (!raw) return memorySession;
  try {
    return JSON.parse(raw) as SessionState;
  } catch {
    return memorySession;
  }
}

function saveSession(session: SessionState) {
  memorySession = session;
  write(SESSION_KEY, JSON.stringify(session));
}

function touchSession(): { session: SessionState; isNew: boolean } {
  const now = Date.now();
  const current = loadSession();
  if (!current || now - current.last > SESSION_TIMEOUT_MS) {
    const session: SessionState = { id: makeId(), last: now, engaged: false };
    saveSession(session);
    return { session, isNew: true };
  }
  const session: SessionState = { ...current, last: now };
  saveSession(session);
  return { session, isNew: false };
}

export function isTrackingEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  if (navigator.webdriver) return false; // بوتات الأتمتة
  return read(OPT_OUT_KEY) !== '1';
}

const deviceClass = (): string =>
  window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';

function send(payload: Record<string, string>) {
  if (isSupabaseConfigured) {
    logAnalyticsEvent(payload);
    return;
  }

  if (!import.meta.env.VITE_API_URL) return;

  try {
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // من غير preflight
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: 'omit',
    }).catch(() => {});
  } catch {
    /* تجاهل أي خطأ: التتبّع مش لازم يعطّل الموقع */
  }
}

const base = (type: string, session: SessionState): Record<string, string> => ({
  type,
  vid: getVisitorId(),
  sid: session.id,
  path: window.location.pathname,
  dev: deviceClass(),
});

// مصدر الزيارة: الموقع اللي جيتي منه (اسم الدومين بس) + روابط الحملات utm_*
function attribution(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    if (document.referrer) {
      const clean = (h: string) => h.replace(/^www\./, '').toLowerCase();
      const host = clean(new URL(document.referrer).hostname);
      if (host && host !== clean(window.location.hostname)) out.ref = host;
    }
  } catch {
    /* تجاهل */
  }
  const query = new URLSearchParams(window.location.search);
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign'] as const) {
    const value = query.get(key);
    if (value) out[key] = value.slice(0, 80);
  }
  return out;
}

export function trackPageview(path: string): void {
  if (!isTrackingEnabled()) return;
  const now = Date.now();
  if (path === lastPath && now - lastAt < 1000) return; // يمنع التكرار (React StrictMode)
  lastPath = path;
  lastAt = now;

  const { session, isNew } = touchSession();
  const payload: Record<string, string> = { ...base('pageview', session), path };
  if (isNew && firstPageviewOfDocument) Object.assign(payload, attribution());
  firstPageviewOfDocument = false;
  send(payload);
}

// الزيارة بتتحسب "متفاعلة" لو قعد 10 ثواني، أو شاف صفحتين، أو عمل تحويل
export function trackEngaged(): void {
  if (!isTrackingEnabled()) return;
  const { session } = touchSession();
  if (session.engaged) return;
  saveSession({ ...session, engaged: true });
  send(base('engaged', session));
}

export function trackEvent(type: 'click' | 'conversion', label: string): void {
  if (!isTrackingEnabled()) return;
  const { session } = touchSession();
  send({ ...base(type, session), label: label.slice(0, 40) });
}

export const trackConversion = (label: string): void => trackEvent('conversion', label);