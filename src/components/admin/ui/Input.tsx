'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
  helpText?: string;
  error?: string;
  containerClassName?: string;
}

const fieldBase =
  'w-full rounded-lg px-3 text-sm text-p-text bg-p-bg-surface border transition-colors placeholder:text-p-text-subdued ' +
  'focus:outline-none focus:ring-2 focus:ring-p-focus/30 disabled:opacity-50 disabled:pointer-events-none';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helpText, error, id, containerClassName, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-p-text mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
        className={cn(
          fieldBase,
          'h-9',
          error ? 'border-p-critical focus:border-p-critical focus:ring-p-critical/30' : 'border-p-border-input focus:border-p-focus'
        )}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-[#B91C1C]">{error}</p>
      ) : helpText ? (
        <p id={`${inputId}-help`} className="mt-1 text-xs text-p-text-subdued">{helpText}</p>
      ) : null}
    </div>
  );
});

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helpText?: string;
  error?: string;
  containerClassName?: string;
}>(function Textarea({ label, helpText, error, id, containerClassName, className, ...props }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-p-text mb-1">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
        className={cn(
          fieldBase,
          'py-2 resize-y',
          error ? 'border-p-critical focus:border-p-critical focus:ring-p-critical/30' : 'border-p-border-input focus:border-p-focus',
          className
        )}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-[#B91C1C]">{error}</p>
      ) : helpText ? (
        <p id={`${inputId}-help`} className="mt-1 text-xs text-p-text-subdued">{helpText}</p>
      ) : null}
    </div>
  );
});
