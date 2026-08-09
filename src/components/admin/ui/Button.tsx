'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'plain';
type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ElementType;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-p-primary text-white border border-transparent shadow-[0_1px_0_rgba(0,0,0,0.05)] hover:bg-p-primary-hover hover:shadow-[0_2px_6px_-1px_rgba(13,148,136,0.4)] active:bg-p-primary-active',
  secondary: 'bg-p-bg-surface text-p-text border border-p-border-input shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-p-bg-surface-hover hover:border-p-text-subdued hover:shadow-[0_2px_4px_rgba(0,0,0,0.06)]',
  destructive: 'bg-p-critical text-white border border-transparent shadow-[0_1px_0_rgba(0,0,0,0.05)] hover:bg-[#B81900] hover:shadow-[0_2px_6px_-1px_rgba(239,68,68,0.4)]',
  plain: 'bg-transparent text-p-focus border-none px-2! hover:underline',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-9 px-4 text-sm',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md font-semibold transition-colors duration-150 cursor-pointer',
        'focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--color-p-focus)]',
        'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        loading && 'pointer-events-none',
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <>
          {Icon && <Icon size={14} />}
          {children}
        </>
      )}
    </button>
  );
}
