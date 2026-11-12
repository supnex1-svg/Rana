import React, { useId } from 'react';
import { AlertCircle } from 'lucide-react';

export interface ControlProps {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
  className: string;
}

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (props: ControlProps) => React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, error, hint, required, children }) => {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy = error ? errorId : hint ? hintId : undefined;

  const base =
    'w-full p-3.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:border-transparent min-h-[48px]';
  const state = error
    ? 'border-red-500 bg-red-50/50 focus:ring-red-500'
    : 'border-gray-300 focus:ring-[#C8202F]';

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-gray-700 mb-1">
        {label}
        {required && (
          <>
            <span className="text-[#C8202F]" aria-hidden="true">
              {' '}*
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>

      {children({
        id,
        'aria-invalid': !!error,
        'aria-describedby': describedBy,
        'aria-required': required,
        className: `${base} ${state}`,
      })}

      {error ? (
        <p id={errorId} className="mt-1.5 text-xs font-semibold text-red-700 flex items-start gap-1.5">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-gray-600">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

export default FormField;