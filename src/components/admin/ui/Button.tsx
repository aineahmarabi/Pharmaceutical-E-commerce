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
  primary: 'bg-p-primary text-white border border-transparent hover:bg-p-primary-hover active:bg-p-primary-active',
  secondary: 'bg-p-bg-surface text-p-text border border-p-border-input hover:bg-p-bg-surface-hover active:bg-p-bg-surface-active',
  destructive: 'bg-p-critical text-white border border-transparent hover:bg-[#DC2626] active:bg-[#B91C1C]',
  plain: 'bg-transparent text-p-text-primary border border-transparent px-2! hover:bg-p-bg-surface-hover hover:underline',
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
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer',
        'transition-[background-color,border-color,transform] duration-100 active:scale-[0.97]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p-focus focus-visible:ring-offset-2 focus-visible:ring-offset-p-bg-surface',
        'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        loading && 'pointer-events-none',
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" aria-label="Loading" />
      ) : (
        <>
          {Icon && <Icon size={14} />}
          {children}
        </>
      )}
    </button>
  );
}
