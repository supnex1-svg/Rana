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
  if (!supabase) {
    console.warn('Supabase is not configured. Falling back to local simulated response.');
    return { data: { id: `CT-${Date.now().toString().slice(-8)}` }, error: null };
  }

  const { data, error } = await supabase
    .from('contacts')
    .insert([
      {
        name: payload.name.trim(),
        phone: payload.phone.trim(),
        notes: payload.notes?.trim() || null,
        lang: payload.lang || 'ar',
      },
    ])
    .select('id')
    .single();

  return { data, error };
}

// دالة إرسال طلب توظيف من صفحة /audit
export async function submitJobApplication(payload: Record<string, any>) {
  if (!supabase) {
    console.warn('Supabase is not configured. Falling back to local simulated response.');
    return { data: { id: `AJ-${Date.now().toString().slice(-8)}` }, error: null };
  }

  const { data, error } = await supabase
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
    ])
    .select('id')
    .single();

  return { data, error };
}

// دالة تسجيل إحصائيات الزيارات
export async function logAnalyticsEvent(payload: Record<string, any>) {
  if (!supabase) return;

  try {
    await supabase.from('analytics').insert([
      {
        type: payload.type || 'pv',
        vid: payload.vid || null,
        session_id: payload.sid || null,
        path: payload.path || window.location.pathname,
        referrer: payload.ref || document.referrer || null,
        device: payload.dev || null,
        lang: payload.lang || null,
        extra: payload,
      },
    ]);
  } catch {
    // إحصائيات الزيارات لا يجب أن تعطل تجربة المستخدم
  }
}
