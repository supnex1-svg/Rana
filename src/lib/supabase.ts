import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// دالة إرسال رسالة من صفحة Contact
export async function submitContactMessage(payload: {
  name: string;
  phone: string;
  notes?: string;
  lang?: string;
}) {
  const refId = `CT-${Date.now().toString().slice(-8)}`;

  // إرسال إشعار الإيميل في الخلفية
  try {
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, id: refId }),
    }).catch(() => {});
  } catch {
    /* لا يعطل الحفظ الأساسي */
  }

  if (!supabase) {
    console.warn('Supabase is not configured. Falling back to local simulated response.');
    return { data: { id: refId }, error: null };
  }

  const { error } = await supabase
    .from('contacts')
    .insert([
      {
        name: payload.name.trim(),
        phone: payload.phone.trim(),
        notes: payload.notes?.trim() || null,
        lang: payload.lang || 'ar',
      },
    ]);

  return { data: { id: refId }, error };
}

// دالة إرسال طلب توظيف من صفحة /audit
export async function submitJobApplication(payload: Record<string, any>) {
  const refId = `AJ-${Date.now().toString().slice(-8)}`;

  // إرسال إشعار الإيميل في الخلفية
  try {
    fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, id: refId }),
    }).catch(() => {});
  } catch {
    /* لا يعطل الحفظ الأساسي */
  }

  if (!supabase) {
    console.warn('Supabase is not configured. Falling back to local simulated response.');
    return { data: { id: refId }, error: null };
  }

  const { error } = await supabase
    .from('applications')
    .insert([
      {
        full_name: payload.fullName || payload.name || '',
        phone: payload.phone || '',
        whatsapp: payload.whatsapp || null,
        email: payload.email || null,
        job: payload.job || null,
        governorate: payload.governorate || null,
        details: payload,
      },
    ]);

  return { data: { id: refId }, error };
}

// دالة تسجيل إحصائيات الزيارات
export async function logAnalyticsEvent(payload: Record<string, any>) {
  if (!supabase) return;

  try {
    const { error } = await supabase.from('analytics').insert([
      {
        type: payload.type || 'pv',
        vid: payload.vid || null,
        session_id: payload.sid || null,
        path: payload.path || (typeof window !== 'undefined' ? window.location.pathname : '/'),
        referrer: payload.ref || (typeof document !== 'undefined' ? document.referrer : null) || null,
        device: payload.dev || null,
        lang: payload.lang || null,
        extra: payload,
      },
    ]);
    if (error) {
      console.warn('Analytics logging notice:', error.message);
    }
  } catch (err) {
    console.warn('Analytics logging exception:', err);
  }
}
