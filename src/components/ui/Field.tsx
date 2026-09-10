import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

const baseFieldClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-brand-navy placeholder:text-slate-400 ' +
  'focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-shadow duration-150 outline-none ' +
  'disabled:bg-slate-50 disabled:text-slate-400';

export function FormField({
  label,
  error,
  required,
  hint,
  children,
  className,
}: {
  label?: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={clsx('block', className)}>
      {label && (
        <span className="block text-xs font-semibold text-slate-600 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="block text-xs text-slate-400 mt-1">{hint}</span>}
      {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
    </label>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { error?: boolean }>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(baseFieldClass, error && 'border-red-300 focus:border-red-400 focus:ring-red-100', className)}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }>(
  ({ className, error, children, ...props }, ref) => (
    <select
      ref={ref}
      className={clsx(baseFieldClass, 'pr-8', error && 'border-red-300', className)}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={clsx(baseFieldClass, 'min-h-[84px] resize-y', error && 'border-red-300', className)}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';
