import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import FormField from './FormField';
import { useToast } from './ToastProvider';
import { useConfirm } from './ConfirmDialog';

type Field = 'name' | 'phone' | 'notes';
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;
type Status = 'idle' | 'submitting' | 'success' | 'error';

const EMPTY: Values = { name: '', phone: '', notes: '' };
const NOTES_MAX = 500;

// ضعي رابط الـ API هنا من ملف .env: VITE_FORM_ENDPOINT=https://...
// لو مش موجود الفورم بيحاكي إرسال ناجح (زي الـ alert القديم).
const ENDPOINT: string | undefined = (import.meta as any).env?.VITE_FORM_ENDPOINT;

const PHONE_EG = /^(?:\+?20|0)?1[0125]\d{8}$/;
const PHONE_INTL = /^\+\d{8,15}$/;

function validate(v: Values): Errors {
  const e: Errors = {};

  const name = v.name.trim();
  if (!name) e.name = 'Please enter your full name.';
  else if (name.length < 3) e.name = 'That name looks too short. Please enter at least 3 characters.';

  const phone = v.phone.replace(/[\s()-]/g, '');
  if (!phone) e.phone = 'Please enter your phone or WhatsApp number.';
  else if (!PHONE_EG.test(phone) && !PHONE_INTL.test(phone))
    e.phone = 'Enter a valid number, for example 0100 393 9499 or +20 100 393 9499.';

  if (v.notes.length > NOTES_MAX) e.notes = `Notes are limited to ${NOTES_MAX} characters.`;

  return e;
}

// منع الإدخال غير المنطقي أثناء الكتابة
function sanitize(field: Field, value: string): string {
  if (field === 'name') return value.replace(/[0-9<>{}[\]\\|^~]/g, '');
  if (field === 'phone') return value.replace(/[^\d+\s()-]/g, '');
  return value;
}

async function sendRequest(payload: Values): Promise<void> {
  if (!ENDPOINT) {
    await new Promise((r) => setTimeout(r, 900));
    return;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } finally {
    clearTimeout(timer);
  }
}

export const ContactForm: React.FC = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [values, setValues] = useState<Values>(EMPTY);
  const [touched, setTouched] = useState<Record<Field, boolean>>({ name: false, phone: false, notes: false });
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>('idle');

  const formRef = useRef<HTMLFormElement>(null);
  const submittingRef = useRef(false); // يمنع الإرسال المكرر حتى لو اتضغط بسرعة
  const successRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const refs = { name: nameRef, phone: phoneRef, notes: notesRef };

  const errors = useMemo(() => validate(values), [values]);
  const visibleError = (f: Field) => (touched[f] || attempted ? errors[f] : undefined);
  const dirty = values.name !== '' || values.phone !== '' || values.notes !== '';
  const submitting = status === 'submitting';

  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  const setField = (f: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = sanitize(f, e.target.value);
    setValues((v) => ({ ...v, [f]: next }));
  };
  const blurField = (f: Field) => () => setTouched((t) => ({ ...t, [f]: true }));

  const reset = () => {
    setValues(EMPTY);
    setTouched({ name: false, phone: false, notes: false });
    setAttempted(false);
    setStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;

    setAttempted(true);
    const current = validate(values);
    const invalid = Object.keys(current) as Field[];
    if (invalid.length > 0) {
      toast.error(
        'Please check the form',
        invalid.length === 1 ? 'One field needs your attention.' : `${invalid.length} fields need your attention.`
      );
      refs[invalid[0]].current?.focus();
      return;
    }

    submittingRef.current = true;
    setStatus('submitting');
    try {
      await sendRequest({
        name: values.name.trim(),
        phone: values.phone.replace(/[\s()-]/g, ''),
        notes: values.notes.trim(),
      });
      setStatus('success');
      toast.success('Request sent', 'Our team will contact you shortly.');
    } catch {
      setStatus('error');
      toast.error(
        "We couldn't send your request",
        'Please check your connection and try again. Your details are still in the form.',
        { label: 'Try again', onClick: () => formRef.current?.requestSubmit() }
      );
    } finally {
      submittingRef.current = false;
    }
  };

  const handleClear = async () => {
    const ok = await confirm({
      title: 'Clear the form?',
      message: 'All the details you entered will be removed.',
      confirmLabel: 'Clear form',
      cancelLabel: 'Keep editing',
      variant: 'danger',
    });
    if (!ok) return;
    reset();
    toast.info('Form cleared');
    setTimeout(() => nameRef.current?.focus(), 0);
  };

  if (status === 'success') {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="mx-auto w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
          <CheckCircle2 size={30} aria-hidden="true" />
        </div>
        <h3 ref={successRef} tabIndex={-1} className="text-xl font-bold outline-none">
          Your request has been sent
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Thank you. Our team will contact you on the number you provided.
        </p>
        <button
          type="button"
          onClick={() => {
            reset();
            setTimeout(() => nameRef.current?.focus(), 0);
          }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-300 text-sm font-semibold hover:bg-gray-50 transition-colors min-h-[44px]"
        >
          <RotateCcw size={16} aria-hidden="true" />
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} className="space-y-4" onSubmit={handleSubmit} noValidate aria-busy={submitting}>
      <p className="text-xs text-gray-600">
        Fields marked with <span className="text-[#C8202F] font-bold">*</span> are required.
      </p>

      <FormField label="Full Name" required error={visibleError('name')} hint='Letters only, e.g. "Dr. Ahmed Mohamed".'>
        {(a) => (
          <input
            {...a}
            ref={nameRef}
            type="text"
            name="name"
            autoComplete="name"
            maxLength={80}
            placeholder="e.g. Dr. Ahmed Mohamed"
            value={values.name}
            onChange={setField('name')}
            onBlur={blurField('name')}
          />
        )}
      </FormField>

      <FormField
        label="Phone / WhatsApp Number"
        required
        error={visibleError('phone')}
        hint="We will contact you on this number."
      >
        {(a) => (
          <input
            {...a}
            ref={phoneRef}
            type="tel"
            name="phone"
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            placeholder="+20 100 000 0000"
            value={values.phone}
            onChange={setField('phone')}
            onBlur={blurField('phone')}
          />
        )}
      </FormField>

      <FormField
        label="Pharmacy Name / Notes"
        error={visibleError('notes')}
        hint={`Optional. ${values.notes.length}/${NOTES_MAX} characters.`}
      >
        {(a) => (
          <textarea
            {...a}
            ref={notesRef}
            name="notes"
            rows={3}
            placeholder="Tell us about your pharmacy size and challenges"
            value={values.notes}
            onChange={setField('notes')}
            onBlur={blurField('notes')}
          />
        )}
      </FormField>

      {status === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          We couldn't send your request. Your details are still here. Check your connection and press "Submit Request" again.
        </div>
      )}

      <p role="status" className="sr-only">
        {submitting ? 'Sending your request…' : ''}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          aria-disabled={submitting}
          className={`flex-1 bg-[#C8202F] hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 min-h-[52px] ${
            submitting ? 'opacity-80 cursor-wait' : ''
          }`}
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              <span>Sending…</span>
            </>
          ) : (
            <>
              <span>Submit Request</span>
              <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleClear}
          disabled={!dirty || submitting}
          className="px-5 py-4 rounded-xl border border-gray-300 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors min-h-[52px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear form
        </button>
      </div>
    </form>
  );
};

export default ContactForm;