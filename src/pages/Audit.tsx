import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Download, Loader2, Lock, Paperclip } from 'lucide-react';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ScrollReveal';
import { trackConversion } from '../lib/analytics';

// ───────────────────────── الإعدادات ─────────────────────────
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const STORAGE_KEY = 'aljumeiyApplicants';

// عنوان السيرفر اللي بيستقبل الطلبات ويبعتها PDF على الإيميل.
// في التطوير: ضيفي VITE_API_URL=http://localhost:3000 في ملف .env (أو استخدمي proxy في vite.config.ts وسيبيها فاضية)
const API_URL = `${import.meta.env.VITE_API_URL ?? ''}/api/applications`;

// قسم "HR Workspace" بيعرض نسخ الطلبات المحفوظة في متصفح الزائر نفسه (مش مهم بعد ربط الإيميل).
// خليه false على الموقع العام.
const SHOW_HR_WORKSPACE = false;

// ───────────────────────── الحقول النصية ─────────────────────────
const TEXT_FIELDS = [
  'fullName', 'phone', 'whatsapp', 'email', 'birthDate', 'gender', 'address', 'governorate', 'landmark', 'job', 'source',
  'qualification', 'university', 'major', 'graduationYear', 'experienceYears', 'lastEmployer', 'lastTitle', 'lastSalary',
  'expectedSalary', 'availability', 'currentlyWorking', 'pharmacyYears', 'experienceDetails', 'leavingReason', 'referencePermission',
  'english', 'computer', 'systems', 'certificates', 'otherLanguages', 'portfolio',
  'shiftAbility', 'shiftWork', 'commute', 'fieldWork', 'essentialDuties', 'accommodation', 'accommodationDetails', 'safetyDiscussion', 'workConditions',
  'whyUs', 'strengths', 'development', 'problemExample', 'contactTime', 'assessment',
] as const;

type TextField = (typeof TEXT_FIELDS)[number];
type FlagField = 'accuracyConsent' | 'privacyConsent';
type RequiredKey = TextField | FlagField;

type FormState = Record<TextField, string> & {
  skills: string[];
  files: string[];
  accuracyConsent: boolean;
  privacyConsent: boolean;
};

type Application = FormState & { id: string; submittedAt: string };

const INITIAL: FormState = {
  ...(Object.fromEntries(TEXT_FIELDS.map((k) => [k, ''])) as Record<TextField, string>),
  skills: [],
  files: [],
  accuracyConsent: false,
  privacyConsent: false,
};

interface FieldDef {
  name: TextField;
  label: string;
  type?: 'text' | 'tel' | 'email' | 'date' | 'number' | 'url' | 'select' | 'textarea';
  required?: boolean;
  full?: boolean;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
  rows?: number;
}

// ───────────────────────── المحتوى ─────────────────────────
const GOVERNORATES = [
  'Cairo', 'Giza', 'Qalyubia', 'Alexandria', 'Sharqia', 'Dakahlia', 'Gharbia', 'Monufia', 'Beheira', 'Kafr El Sheikh',
  'Damietta', 'Port Said', 'Ismailia', 'Suez', 'Fayoum', 'Beni Suef', 'Minya', 'Assiut', 'Sohag', 'Qena', 'Luxor',
  'Aswan', 'Matrouh', 'Red Sea', 'New Valley', 'North Sinai', 'South Sinai',
];

const LEVELS = ['Beginner', 'Intermediate', 'Very good', 'Advanced'];

const SKILLS = [
  'Communication & customer service', 'Sales & persuasion', 'Team management', 'Problem solving', 'Time management',
  'Working under pressure', 'Inventory management', 'Stock counting & expiry control', 'Microsoft Office',
  'Excel & data analysis', 'Digital marketing', 'Report writing', 'Training & coaching', 'Negotiation', 'Field work',
];

const PERSONAL_FIELDS: FieldDef[] = [
  { name: 'fullName', label: 'Full name', required: true, placeholder: 'Full name as shown on your ID' },
  { name: 'phone', label: 'Primary phone number', required: true, type: 'tel', placeholder: '01xxxxxxxxx' },
  { name: 'whatsapp', label: 'WhatsApp number (if different)', type: 'tel' },
  { name: 'email', label: 'Email address', type: 'email', placeholder: 'name@example.com' },
  { name: 'birthDate', label: 'Date of birth', type: 'date' },
  { name: 'gender', label: 'Gender (optional)', type: 'select', options: ['Male', 'Female', 'Prefer not to say'] },
  { name: 'address', label: 'Detailed address', required: true, full: true, placeholder: 'Governorate – Area – Street' },
  { name: 'governorate', label: 'Governorate', type: 'select', options: GOVERNORATES },
  { name: 'landmark', label: 'Nearest landmark', placeholder: 'Helps us estimate your commute' },
  {
    name: 'job', label: 'Position applied for', required: true, type: 'select',
    options: [
      'Pharmacist', 'Pharmacy Assistant', 'Inventory / Supply Chain Officer', 'Pharmacy Operations Officer',
      'Call Center Agent', 'Sales & Business Development', 'Human Resources', 'Marketing / Social Media',
      'Graphic Designer / Video Editor', 'Other',
    ],
  },
  {
    name: 'source', label: 'How did you hear about this job?', type: 'select',
    options: ['Facebook', 'LinkedIn', 'Employee referral', 'Job board', 'Visit / personal acquaintance', 'Other'],
  },
];

const EDUCATION_FIELDS: FieldDef[] = [
  {
    name: 'qualification', label: 'Highest qualification', required: true, type: 'select',
    options: [
      'High school / Technical secondary', 'Diploma', 'Intermediate institute', 'Bachelor of Pharmacy',
      'Bachelor of Commerce / Business', 'Bachelor (other field)', 'Postgraduate studies',
    ],
  },
  { name: 'university', label: 'University / institute' },
  { name: 'major', label: 'Major' },
  { name: 'graduationYear', label: 'Graduation year', type: 'number', min: 1970, max: 2035 },
  {
    name: 'experienceYears', label: 'Total years of experience', required: true, type: 'select',
    options: ['No experience', 'Less than 1 year', '1–2 years', '3–5 years', '6–10 years', 'More than 10 years'],
  },
  { name: 'lastEmployer', label: 'Last employer' },
  { name: 'lastTitle', label: 'Last job title' },
  { name: 'lastSalary', label: 'Last salary (optional)', type: 'number', min: 0, placeholder: 'EGP' },
  { name: 'expectedSalary', label: 'Expected salary', required: true, type: 'number', min: 0, placeholder: 'EGP' },
  {
    name: 'availability', label: 'Notice period / availability', type: 'select',
    options: ['Available immediately', 'Within a week', 'Within two weeks', 'Within a month', 'More than a month'],
  },
  { name: 'currentlyWorking', label: 'Are you currently employed?', type: 'select', options: ['Yes', 'No'] },
  { name: 'pharmacyYears', label: 'Years of pharmacy experience (if any)', type: 'number', min: 0, max: 60 },
  {
    name: 'experienceDetails', label: 'Summary of your experience, responsibilities, and achievements',
    required: true, full: true, type: 'textarea',
    placeholder: 'Mention workplaces, duration, tasks, scope of responsibility, and your key results...',
  },
  { name: 'leavingReason', label: 'Reason for leaving your last job / seeking a new opportunity', full: true, type: 'textarea', rows: 3 },
  {
    name: 'referencePermission', label: 'May we contact your previous manager as a professional reference?', full: true, type: 'select',
    options: ['Yes', 'After my approval at a later stage', 'No', 'Not applicable'],
  },
];

const SKILL_FIELDS: FieldDef[] = [
  { name: 'english', label: 'English proficiency', type: 'select', options: LEVELS },
  { name: 'computer', label: 'Computer proficiency', type: 'select', options: LEVELS },
  { name: 'systems', label: 'Software or systems you use well', full: true, placeholder: 'Excel, POS, ERP, pharmacy software, CRM...' },
  {
    name: 'certificates', label: 'Training courses and certificates (course name, provider, year)', full: true, type: 'textarea',
    placeholder: 'Write each certificate or course on a separate line',
  },
  { name: 'otherLanguages', label: 'Other languages and your level in each', full: true },
  { name: 'portfolio', label: 'LinkedIn or portfolio link (if any)', full: true, type: 'url', placeholder: 'https://' },
];

const FIT_FIELDS: FieldDef[] = [
  {
    name: 'shiftAbility', label: 'Can you commit to the working hours set for the position?', required: true, type: 'select',
    options: ['Yes', 'Yes, with schedule preferences or constraints', 'No'],
  },
  {
    name: 'shiftWork', label: 'Are you comfortable with shift work if the job requires it?', type: 'select',
    options: ['Yes', 'Depends on the schedule', 'No', 'Not applicable'],
  },
  {
    name: 'commute', label: 'Can you travel to the workplace regularly?', type: 'select',
    options: ['Yes', 'Yes, with distance or timing constraints', 'No'],
  },
  {
    name: 'fieldWork', label: 'Does the job require travel or field visits? Does that suit you?', type: 'select',
    options: ['Suitable', 'Suitable with conditions / depending on schedule', 'Not suitable', "I don't know the job's nature yet"],
  },
  {
    name: 'essentialDuties', label: 'Can you perform the essential duties described for the position?', required: true, type: 'select',
    options: [
      'Yes, without additional arrangements', 'Yes, with suitable arrangements or accommodations',
      'I need to know the duty details first', 'No',
    ],
  },
  {
    name: 'accommodation', label: 'Do you need any workplace accommodations or arrangements to perform your duties?', type: 'select',
    options: ['No', 'Yes', 'I prefer to discuss it confidentially with HR', 'I prefer not to answer now'],
  },
  {
    name: 'accommodationDetails', label: 'If arrangements are needed, mention only their job-related nature (optional)',
    full: true, type: 'textarea', rows: 3,
    placeholder: 'Example: a suitable chair, schedule adjustments, easy access to the workplace... without mentioning any medical diagnosis',
  },
  {
    name: 'safetyDiscussion',
    label: 'Is there anything related to safely performing specific tasks in the work environment that you would like to discuss confidentially with HR?',
    full: true, type: 'select',
    options: ['No', 'Yes, I prefer to discuss it confidentially', 'I prefer not to answer now'],
  },
  { name: 'workConditions', label: 'Any additional notes about suitable working conditions?', full: true, type: 'textarea', rows: 3 },
];

const QUESTION_FIELDS: FieldDef[] = [
  { name: 'whyUs', label: 'Why do you want to join Aljumeiy Pharma?', required: true, full: true, type: 'textarea' },
  { name: 'strengths', label: 'What are your top three strengths?', full: true, type: 'textarea', rows: 3 },
  { name: 'development', label: 'Which skill are you currently working on developing?', full: true, type: 'textarea', rows: 3 },
  { name: 'problemExample', label: 'Describe a problem you faced at work and how you handled it.', full: true, type: 'textarea' },
  { name: 'contactTime', label: 'Preferred contact time', type: 'select', options: ['Morning', 'Noon', 'Evening', 'Any time'] },
  {
    name: 'assessment', label: 'Are you willing to take a test or a practical interview?', type: 'select',
    options: ['Yes', 'Depending on the nature of the test', 'No'],
  },
];

const STEP_FIELDS: FieldDef[][] = [PERSONAL_FIELDS, EDUCATION_FIELDS, SKILL_FIELDS, FIT_FIELDS, QUESTION_FIELDS];

const STEPS = [
  { tab: 'Personal Details', title: 'Personal Details & Contact', desc: 'Basic information to reach you and check that working hours suit you.' },
  { tab: 'Education & Experience', title: 'Education & Work Experience', desc: 'Your academic qualification, career path, and the nature of your previous responsibilities.' },
  { tab: 'Skills & Certificates', title: 'Skills & Certificates', desc: 'Select the skills you have, then add languages, software, and certificates.' },
  { tab: 'Job Fit & Health', title: 'Job Fit & Occupational Health Questions', desc: 'Standard questions to understand working conditions and your ability to perform the duties. This is not a medical diagnosis.' },
  { tab: 'Review & Consent', title: 'Personal Questions & Application Review', desc: 'We want to understand how you think and what motivates you before the interview.' },
];
const LAST = STEPS.length - 1;

// ───────────────────────── دوال مساعدة ─────────────────────────
const missingFields = (data: FormState, step: number): RequiredKey[] => {
  const list: RequiredKey[] = STEP_FIELDS[step].filter((f) => f.required && !data[f.name].trim()).map((f) => f.name);
  if (step === LAST) {
    if (!data.accuracyConsent) list.push('accuracyConsent');
    if (!data.privacyConsent) list.push('privacyConsent');
  }
  return list;
};

const readApps = (): Application[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const toCsv = (rows: Application[]) => {
  const keys = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const cell = (v: unknown) => `"${String(Array.isArray(v) ? v.join(' | ') : v ?? '').replace(/"/g, '""')}"`;
  return [
    keys.join(','),
    ...rows.map((r) => keys.map((k) => cell((r as unknown as Record<string, unknown>)[k])).join(',')),
  ].join('\n');
};

const download = (name: string, content: string, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// ───────────────────────── مكونات صغيرة ─────────────────────────
const INPUT_BASE =
  'w-full p-3.5 rounded-xl border text-sm font-medium bg-white text-[#171717] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8202F] focus:border-transparent transition-all';

interface FieldControlProps {
  def: FieldDef;
  value: string;
  invalid: boolean;
  onChange: (name: TextField, value: string) => void;
  variants: Variants;
}

const FieldControl = React.memo(function FieldControl({ def, value, invalid, onChange, variants }: FieldControlProps) {
  const id = `f-${def.name}`;
  const shared = {
    id,
    name: def.name,
    required: def.required,
    'aria-invalid': invalid || undefined,
    'aria-describedby': invalid ? `${id}-error` : undefined,
    className: `${INPUT_BASE} ${invalid ? 'border-[#C8202F] ring-1 ring-[#C8202F]/30' : 'border-gray-300'}`,
  };

  let control: React.ReactNode;
  if (def.type === 'select') {
    control = (
      <select {...shared} value={value} onChange={(e) => onChange(def.name, e.target.value)}>
        <option value="">Select</option>
        {def.options?.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    );
  } else if (def.type === 'textarea') {
    control = (
      <textarea
        {...shared}
        rows={def.rows ?? 4}
        value={value}
        placeholder={def.placeholder}
        onChange={(e) => onChange(def.name, e.target.value)}
      />
    );
  } else {
    control = (
      <input
        {...shared}
        type={def.type ?? 'text'}
        value={value}
        placeholder={def.placeholder}
        min={def.min}
        max={def.max}
        onChange={(e) => onChange(def.name, e.target.value)}
      />
    );
  }

  return (
    <motion.div variants={variants} className={def.full ? 'sm:col-span-2' : ''}>
      <label htmlFor={id} className="block text-xs font-bold text-gray-700 mb-1.5">
        {def.label}
        {def.required && <span className="text-[#C8202F]" aria-hidden="true"> *</span>}
      </label>
      {control}
      {invalid && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-semibold text-[#C8202F]">
          This field is required.
        </p>
      )}
    </motion.div>
  );
});

// مربع الاختيار برسم علامة الصح بأنيميشن
const CheckBox: React.FC<{ on: boolean }> = ({ on }) => {
  const reduce = useReducedMotion();
  return (
    <span
      aria-hidden="true"
      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
        on ? 'bg-[#C8202F] border-[#C8202F]' : 'bg-white border-gray-300'
      }`}
    >
      <AnimatePresence initial={false}>
        {on && (
          <motion.span
            key="tick"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: reduce ? 0 : 0.15 }}
            className="flex"
          >
            <Check size={12} strokeWidth={3} className="text-white" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

// ───────────────────────── الصفحة ─────────────────────────
export const Audit: React.FC = () => {
  const reduce = useReducedMotion();

  const [data, setData] = useState<FormState>(INITIAL);
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1);
  const [maxReached, setMaxReached] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [apps, setApps] = useState<Application[]>(readApps);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const topRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pendingFocus = useRef<string | null>(null);
  const firstRender = useRef(true);
  const honeypot = useRef<HTMLInputElement>(null); // حقل مخفي لصد البوتات

  // ─── الأنيميشن (بيتعطل لو المستخدم مفعّل reduced motion) ───
  const itemV: Variants = useMemo(
    () => ({
      hidden: { opacity: 0, y: reduce ? 0 : 14 },
      show: { opacity: 1, y: 0, transition: { duration: reduce ? 0.01 : 0.35, ease: EASE } },
    }),
    [reduce]
  );
  const staggerV: Variants = useMemo(
    () => ({
      hidden: {},
      show: { transition: { staggerChildren: reduce ? 0 : 0.05, delayChildren: reduce ? 0 : 0.04 } },
    }),
    [reduce]
  );
  const stepV: Variants = useMemo(
    () => ({
      enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 32 }),
      center: { opacity: 1, x: 0, transition: { duration: reduce ? 0.01 : 0.35, ease: EASE } },
      exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : -d * 32, transition: { duration: reduce ? 0.01 : 0.18 } }),
    }),
    [reduce]
  );

  // لما الخطوة تتغير، التاب النشطة تتوسّط في الشريط (مهم على الموبايل)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const box = tabsRef.current;
    const tab = tabRefs.current[page];
    if (!box || !tab) return;
    box.scrollTo({
      left: tab.offsetLeft - (box.clientWidth - tab.clientWidth) / 2,
      behavior: reduce ? 'auto' : 'smooth',
    });
  }, [page, reduce]);

  // ─── تعديل البيانات ───
  const clearError = (name: string) => setErrors((e) => (e.includes(name) ? e.filter((x) => x !== name) : e));

  const setText = React.useCallback((name: TextField, value: string) => {
    setData((d) => ({ ...d, [name]: value }));
    setErrors((e) => (e.includes(name) ? e.filter((x) => x !== name) : e));
  }, []);

  const setFlag = (name: FlagField, value: boolean) => {
    setData((d) => ({ ...d, [name]: value }));
    clearError(name);
  };

  const toggleSkill = (skill: string) =>
    setData((d) => ({
      ...d,
      skills: d.skills.includes(skill) ? d.skills.filter((s) => s !== skill) : [...d.skills, skill],
    }));

  // ─── التنقل ───
  const goTo = (n: number) => {
    const target = Math.max(0, Math.min(LAST, n));
    setDir(target >= page ? 1 : -1);
    setPage(target);
    setMaxReached((m) => Math.max(m, target));
    topRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  const focusPending = () => {
    const name = pendingFocus.current;
    if (!name) return;
    pendingFocus.current = null;
    document.getElementById(`f-${name}`)?.focus();
  };

  const showErrors = (step: number, missing: RequiredKey[]) => {
    setErrors(missing);
    pendingFocus.current = missing[0] ?? null;
    if (step === page) focusPending();
    else goTo(step); // الفوكس بيتم بعد ما الخطوة تظهر
  };

  // فحص الصيغة (إيميل، رابط، أرقام) بعد التأكد إن الحقول المطلوبة مليانة
  const formatOk = () => {
    const root = stepRef.current;
    if (!root) return true;
    const els = Array.from(root.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea'));
    for (const el of els) {
      if (!el.checkValidity()) {
        el.reportValidity();
        return false;
      }
    }
    return true;
  };

  const next = () => {
    const missing = missingFields(data, page);
    if (missing.length) return showErrors(page, missing);
    if (!formatOk()) return;
    setErrors([]);
    goTo(page + 1);
  };

  const back = () => {
    setErrors([]);
    goTo(page - 1);
  };

  const goToTab = (i: number) => {
    if (i === page || i > maxReached) return;
    setErrors([]);
    goTo(i);
  };

  const finishSubmit = async () => {
    if (sending) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, website: honeypot.current?.value ?? '' }),
      });
      const json = await res.json().catch(() => ({} as { id?: string; error?: string }));
      if (!res.ok) throw new Error(json.error || 'Something went wrong. Please try again.');

      const id: string = json.id || `AJ-${Date.now().toString().slice(-8)}`;

      if (SHOW_HR_WORKSPACE) {
        const app: Application = { ...data, id, submittedAt: new Date().toLocaleString('en-GB') };
        const updated = [app, ...apps];
        setApps(updated);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          /* لو التخزين مقفول منكسرش الصفحة */
        }
      }

      setSubmittedId(id);
      topRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    } catch (err) {
      // TypeError = مشكلة اتصال (السيرفر مش شغال أو النت قاطع)
      setSendError(
        err instanceof Error && err.name !== 'TypeError'
          ? err.message
          : 'We could not reach the server. Please check your connection and try again.'
      );
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (page < LAST) return next(); // Enter في الخطوات الأولى = التالي
    for (let s = 0; s <= LAST; s++) {
      const missing = missingFields(data, s);
      if (missing.length) return showErrors(s, missing);
    }
    if (!formatOk()) return;
    void finishSubmit();
  };

  const startNew = () => {
    setData(INITIAL);
    setPage(0);
    setDir(1);
    setMaxReached(0);
    setErrors([]);
    setSendError(null);
    setSubmittedId(null);
  };

  // بعد ما الخطوة تظهر نركّز على أول حقل ناقص (لو في)
  const handleStepAnimated = (definition: unknown) => {
    if (definition === 'center') focusPending();
  };

  // ─── أجزاء العرض ───
  const renderGrid = (list: FieldDef[]) => (
    <motion.div variants={staggerV} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {list.map((def) => (
        <FieldControl
          key={def.name}
          def={def}
          value={data[def.name]}
          invalid={errors.includes(def.name)}
          onChange={setText}
          variants={itemV}
        />
      ))}
    </motion.div>
  );

  const renderNotice = (content: React.ReactNode) => (
    <motion.div
      variants={itemV}
      className="bg-red-50 border-l-4 border-[#C8202F] rounded-lg px-4 py-3 text-xs sm:text-sm text-gray-800 leading-relaxed"
    >
      {content}
    </motion.div>
  );

  const renderConsent = (name: FlagField, text: string) => {
    const on = data[name];
    const bad = errors.includes(name);
    return (
      <label
        className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#C8202F]/50 ${
          bad ? 'border-[#C8202F] bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        <input
          id={`f-${name}`}
          type="checkbox"
          className="sr-only"
          checked={on}
          onChange={(e) => setFlag(name, e.target.checked)}
          aria-required="true"
          aria-invalid={bad || undefined}
        />
        <CheckBox on={on} />
        <span>
          {text} <span className="text-[#C8202F]" aria-hidden="true">*</span>
          {bad && <span className="block mt-1 text-xs font-semibold text-[#C8202F]" role="alert">Please tick this box to continue.</span>}
        </span>
      </label>
    );
  };

  const renderSkills = () => (
    <motion.div variants={itemV} role="group" aria-labelledby="skills-label">
      <p id="skills-label" className="text-xs font-bold text-gray-700 mb-3">Professional skills (select all that apply)</p>
      <motion.div variants={staggerV} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SKILLS.map((skill) => {
          const on = data.skills.includes(skill);
          return (
            <motion.label
              key={skill}
              variants={itemV}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs sm:text-sm font-semibold leading-snug cursor-pointer select-none transition-colors focus-within:ring-2 focus-within:ring-[#C8202F]/50 ${
                on ? 'bg-red-50 border-[#C8202F] text-[#C8202F]' : 'bg-gray-50 border-gray-200 text-gray-800 hover:border-gray-300'
              }`}
            >
              <input type="checkbox" className="sr-only" checked={on} onChange={() => toggleSkill(skill)} />
              <CheckBox on={on} />
              <span>{skill}</span>
            </motion.label>
          );
        })}
      </motion.div>
    </motion.div>
  );

  const renderAttachments = () => (
    <motion.div variants={itemV}>
      <p className="text-xs font-bold text-gray-700 mb-1.5">Attach CV or certificates (optional)</p>
      <label
        htmlFor="f-attachments"
        className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-300 text-sm font-semibold text-gray-700 cursor-pointer hover:border-[#C8202F] hover:text-[#C8202F] transition-colors focus-within:ring-2 focus-within:ring-[#C8202F]/50"
      >
        <Paperclip size={16} aria-hidden="true" />
        <span>Choose files</span>
        <input
          id="f-attachments"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          className="sr-only"
          onChange={(e) => {
            const names = Array.from(e.target.files ?? []).map((f) => f.name);
            setData((d) => ({ ...d, files: names }));
          }}
        />
      </label>
      <p className="mt-2 text-xs text-gray-500">
        Only the names of the selected files are included with your application.
      </p>
      {data.files.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {data.files.map((name) => (
            <li key={name} className="text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
              {name}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );

  const renderReview = () => {
    const pairs: [string, string][] = [
      ['Name', data.fullName],
      ['Phone', data.phone],
      ['Email', data.email],
      ['Position', data.job],
      ['Qualification', data.qualification],
      ['Years of experience', data.experienceYears],
      ['Expected salary', data.expectedSalary ? `${data.expectedSalary} EGP` : ''],
      ['Skills', data.skills.join(', ')],
      ['Experience', data.experienceDetails],
      ['Workplace arrangements', data.accommodation],
    ];
    return (
      <motion.div variants={itemV} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-sm font-extrabold text-[#171717] mb-3">Summary of key details</h3>
        <dl className="space-y-2">
          {pairs.map(([k, v]) => (
            <div key={k} className="text-xs sm:text-sm leading-relaxed">
              <dt className="inline font-bold text-gray-900">{k}: </dt>
              <dd className="inline text-gray-700 break-words">{v || '—'}</dd>
            </div>
          ))}
        </dl>
      </motion.div>
    );
  };

  const renderStep = () => {
    const header = (
      <motion.div variants={itemV} className="flex items-center gap-4 mb-2">
        <span className="w-10 h-10 rounded-xl bg-red-50 text-[#C8202F] font-black flex items-center justify-center text-sm shrink-0">
          {String(page + 1).padStart(2, '0')}
        </span>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#171717]">{STEPS[page].title}</h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">{STEPS[page].desc}</p>
        </div>
      </motion.div>
    );

    return (
      <motion.div variants={staggerV} initial="hidden" animate="show" className="space-y-6">
        {header}

        {page === 0 && renderGrid(PERSONAL_FIELDS)}

        {page === 1 && renderGrid(EDUCATION_FIELDS)}

        {page === 2 && (
          <>
            {renderSkills()}
            {renderGrid(SKILL_FIELDS)}
            {renderAttachments()}
          </>
        )}

        {page === 3 && (
          <>
            {renderNotice(
              <>
                <b>Important privacy note:</b> Do not mention diagnoses, sensitive medical details, or medications. We only
                need to know whether any job requirements or supportive arrangements are needed to perform the job&rsquo;s
                duties safely.
              </>
            )}
            {renderGrid(FIT_FIELDS)}
            {renderNotice(
              <>
                These answers will not be used for automatic exclusion, and you are not required to disclose a medical
                diagnosis. Any occupational fitness assessment, if required by the nature of the role, is carried out
                separately and appropriately by a qualified party.
              </>
            )}
          </>
        )}

        {page === 4 && (
          <>
            {renderGrid(QUESTION_FIELDS)}
            <motion.div variants={itemV} className="rounded-2xl border border-gray-200 bg-gray-50 p-5 space-y-3">
              <h3 className="text-sm font-extrabold text-[#171717]">Declaration of accuracy and consent</h3>
              {renderConsent(
                'accuracyConsent',
                'I declare that the information I entered is accurate to the best of my knowledge, and I agree to its use and to being contacted about job opportunities at Aljumeiy Pharma.'
              )}
              {renderConsent(
                'privacyConsent',
                'I understand that my data will be used for recruitment purposes only, and that any sensitive job-related information I provide is optional and treated confidentially.'
              )}
            </motion.div>
            {renderNotice(
              <>
                <b>Before submitting:</b> Review your phone number and email, and make sure your experience and skills are
                complete. A summary of your data is shown below before saving.
              </>
            )}
            {renderReview()}
          </>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen text-left bg-white text-gray-900 leading-relaxed dir-ltr">
      <SEO
        title="Careers | Join the Aljumeiy Pharma Team"
        description="Apply to join the Aljumeiy Pharma team. Complete our short application form covering your details, experience, skills, and job fit."
      />

      {/* Hero Section - نفس هيدر الـ Home */}
      <section className="bg-[#171717] text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden opacity-20" aria-hidden="true">
          <img src="/images/Home/hero.webp" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#171717] via-[#171717]/90 to-[#171717]/70 z-0" />

        {/* توهج هادي بيتحرك */}
        <motion.div
          aria-hidden="true"
          className="absolute -top-24 right-1/4 w-96 h-96 bg-[#C8202F]/15 blur-3xl rounded-full pointer-events-none z-0"
          animate={reduce ? undefined : { y: [0, -24, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal direction="up" className="max-w-3xl space-y-5">
            <span className="bg-[#C8202F] text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase inline-block shadow-md">
              Join Our Team
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
              Start Your Career Journey With Us
            </h1>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-medium">
              Fill in the details below accurately. We use your answers to understand your experience and skills and how well
              they fit the role. Our recruitment team will contact you when you move to the next stage.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-gray-200 text-xs font-semibold px-4 py-2 rounded-full">
                <Lock size={14} className="text-[#C8202F]" aria-hidden="true" />
                Your data is confidential and used for recruitment only
              </span>
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-gray-200 text-xs font-semibold px-4 py-2 rounded-full">
                <Check size={14} className="text-[#C8202F]" strokeWidth={3} aria-hidden="true" />
                5 simple steps
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Application Section */}
      <section className="py-16 sm:py-24 bg-gray-50/80 flex-grow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div ref={topRef} className="scroll-mt-24" />

            {submittedId ? (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200/80 p-8 sm:p-12 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduce ? 0.01 : 0.4, ease: EASE }}
                  className="space-y-4"
                >
                  <div className="relative w-24 h-24 mx-auto">
                    {!reduce && (
                      <motion.span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full bg-green-300/50"
                        initial={{ scale: 0.6, opacity: 0.8 }}
                        animate={{ scale: 1.8, opacity: 0 }}
                        transition={{ duration: 1.4, repeat: 2, ease: 'easeOut' }}
                      />
                    )}
                    <motion.div
                      className="relative w-24 h-24 rounded-full bg-green-100 text-green-600 flex items-center justify-center shadow-inner"
                      initial={{ scale: reduce ? 1 : 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    >
                      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <motion.path
                          d="M5 12.5l4.5 4.5L19 7.5"
                          initial={{ pathLength: reduce ? 1 : 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: reduce ? 0 : 0.25, duration: reduce ? 0 : 0.5 }}
                        />
                      </svg>
                    </motion.div>
                  </div>
                  <h2 className="text-2xl font-black text-[#171717]" role="status">Application Submitted Successfully!</h2>
                  <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto font-medium">
                    Thank you for your interest in joining the Aljumeiy Pharma team. Please keep the application number shown below.
                  </p>
                  <p className="inline-block bg-gray-100 text-[#171717] font-black tracking-wider px-5 py-2.5 rounded-xl">{submittedId}</p>
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={startNew}
                      className="border border-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-xl min-h-[48px] hover:bg-gray-50 transition-colors"
                    >
                      Submit another application
                    </button>
                  </div>
                </motion.div>
              </div>
            ) : (
              <>
                {/* التابات */}
                <div
                  ref={tabsRef}
                  className="relative flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  aria-label="Application steps"
                >
                  {STEPS.map((s, i) => {
                    const active = i === page;
                    const reached = i <= maxReached;
                    const done = i < page;
                    return (
                      <button
                        key={s.tab}
                        ref={(el) => {
                          tabRefs.current[i] = el;
                        }}
                        type="button"
                        onClick={() => goToTab(i)}
                        disabled={!reached}
                        aria-current={active ? 'step' : undefined}
                        className={`relative shrink-0 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold border whitespace-nowrap transition-colors ${
                          active
                            ? 'border-[#C8202F] text-white'
                            : reached
                            ? 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                            : 'bg-white border-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="step-pill"
                            className="absolute inset-0 rounded-full bg-[#C8202F]"
                            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 32 }}
                          />
                        )}
                        <span className="relative z-10 inline-flex items-center gap-1.5">
                          {done && <Check size={14} strokeWidth={3} aria-hidden="true" />}
                          {i + 1}. {s.tab}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* شريط التقدم */}
                <div
                  className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-6"
                  role="progressbar"
                  aria-label="Application progress"
                  aria-valuemin={1}
                  aria-valuemax={STEPS.length}
                  aria-valuenow={page + 1}
                >
                  <motion.div
                    className="h-full bg-[#C8202F] rounded-full"
                    initial={false}
                    animate={{ width: `${((page + 1) / STEPS.length) * 100}%` }}
                    transition={{ duration: reduce ? 0.01 : 0.5, ease: EASE }}
                  />
                </div>

                {/* الفورم */}
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-200/80 p-6 sm:p-10"
                >
                  <p className="sr-only" role="status" aria-live="polite">
                    Step {page + 1} of {STEPS.length}: {STEPS[page].title}
                  </p>

                  {/* حقل فخ للبوتات: المستخدم الحقيقي مش بيشوفه */}
                  <input
                    ref={honeypot}
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute left-[-9999px] h-0 w-0 opacity-0"
                  />

                  <AnimatePresence mode="wait" custom={dir}>
                    <motion.section
                      key={page}
                      ref={stepRef}
                      custom={dir}
                      variants={stepV}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      onAnimationComplete={handleStepAnimated}
                    >
                      {renderStep()}
                    </motion.section>
                  </AnimatePresence>

                  {sendError && (
                    <div
                      role="alert"
                      className="mt-8 bg-red-50 border-l-4 border-[#C8202F] rounded-lg px-4 py-3 text-sm font-semibold text-[#C8202F]"
                    >
                      {sendError}
                    </div>
                  )}

                  <div className="flex justify-between gap-3 mt-10 pt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={back}
                      disabled={sending}
                      className={`inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-800 font-semibold px-6 py-3.5 rounded-xl min-h-[48px] hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed max-sm:flex-1 ${
                        page === 0 ? 'invisible' : ''
                      }`}
                    >
                      <ArrowLeft size={18} aria-hidden="true" />
                      <span>Back</span>
                    </button>

                    {page < LAST ? (
                      <button
                        key="next"
                        type="button"
                        onClick={next}
                        className="group inline-flex items-center justify-center gap-2 bg-[#C8202F] hover:bg-red-700 text-white font-bold px-8 py-3.5 rounded-xl min-h-[48px] shadow-lg hover:shadow-xl transition-all active:scale-95 focus:ring-4 focus:ring-red-200 outline-none max-sm:flex-1"
                      >
                        <span>Next</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                      </button>
                    ) : (
                      <button
                        key="submit"
                        type="submit"
                        disabled={sending}
                        className="group inline-flex items-center justify-center gap-2 bg-[#C8202F] hover:bg-red-700 text-white font-black px-8 py-3.5 rounded-xl min-h-[48px] shadow-lg hover:shadow-xl transition-all active:scale-95 uppercase tracking-wider text-sm focus:ring-4 focus:ring-red-200 outline-none disabled:opacity-70 disabled:cursor-wait max-sm:flex-1"
                      >
                        {sending ? (
                          <>
                            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Application</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
          </ScrollReveal>

          {/* HR Workspace (نسخة تجريبية محلية) */}
          {SHOW_HR_WORKSPACE && (
            <ScrollReveal direction="up" className="mt-10">
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-[#C8202F] uppercase tracking-widest">HR Workspace · Local Demo</span>
                    <h2 className="text-lg font-extrabold text-[#171717] mt-1.5">Applications saved on this device</h2>
                    <p className="text-xs text-gray-500 mt-1 max-w-xl">
                      Preview only: applications are stored locally in this browser, not in a shared database.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={!apps.length}
                      onClick={() => download('aljumeiy-applicants.csv', '\ufeff' + toCsv(apps), 'text/csv;charset=utf-8')}
                      className="inline-flex items-center gap-2 border border-gray-300 text-gray-800 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Download size={16} aria-hidden="true" />
                      Export CSV
                    </button>
                    <button
                      type="button"
                      disabled={!apps.length}
                      onClick={() => download('aljumeiy-applicants.json', JSON.stringify(apps, null, 2), 'application/json;charset=utf-8')}
                      className="inline-flex items-center gap-2 border border-gray-300 text-gray-800 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Download size={16} aria-hidden="true" />
                      JSON copy
                    </button>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {apps.length === 0 ? (
                    <p className="py-6 text-center text-sm text-gray-500">No saved applications yet.</p>
                  ) : (
                    <AnimatePresence initial={false}>
                      {apps.map((a) => (
                        <motion.div
                          key={a.id}
                          layout={!reduce}
                          initial={{ opacity: 0, y: reduce ? 0 : -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: reduce ? 0.01 : 0.3, ease: EASE }}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-gray-200 bg-gray-50 rounded-xl p-4"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-[#171717] break-words">{a.fullName || '—'}</p>
                            <p className="text-xs text-gray-500 mt-1 break-words">
                              {a.job || '—'} · {a.phone || ''} · {a.submittedAt || ''}
                            </p>
                          </div>
                          <span className="self-start sm:self-center text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-[#C8202F] shrink-0">
                            {a.id}
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>

              <p className="text-center text-[11px] text-gray-500 mt-5 leading-relaxed">
                Aljumeiy Pharma · Human Resources
              </p>
            </ScrollReveal>
          )}
        </div>
      </section>
    </div>
  );
};

export default Audit;