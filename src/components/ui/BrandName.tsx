import React from 'react';
import { cn } from '@/lib/utils';

function splitBrandName(name: string): [string, string] {
  const match = name.slice(1).match(/[A-Z]/);
  if (!match || match.index === undefined) return [name, ''];
  const splitAt = match.index + 1;
  return [name.slice(0, splitAt), name.slice(splitAt)];
}

export function BrandName({ name, className, accentClassName }: { name: string; className?: string; accentClassName?: string }) {
  const [first, second] = splitBrandName(name);
  if (!second) return <span className={className}>{name}</span>;
  return (
    <span className={className}>
      {first}
      <span className={cn('text-petrol', accentClassName)}>{second}</span>
    </span>
  );
}
