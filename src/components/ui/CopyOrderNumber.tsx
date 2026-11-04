'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

/** The order number as a button: one click copies it. */
export function CopyOrderNumber({ value, className }: { value: string; className?: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard API blocked (older browser or insecure page): fall back to a temporary selection.
      const el = document.createElement('textarea');
      el.value = value;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(el);
      }
    }
    setCopied(true);
    toast(`${value} copied`, 'success');
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={copy}
      title="Click to copy"
      aria-label={`Order number ${value}. Click to copy`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md font-semibold tabular-nums text-ink transition-colors hover:text-petrol focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40',
        className,
      )}
    >
      {value}
      {copied ? <Check size={14} aria-hidden="true" className="text-petrol" /> : <Copy size={14} aria-hidden="true" className="text-muted-fg" />}
    </button>
  );
}
