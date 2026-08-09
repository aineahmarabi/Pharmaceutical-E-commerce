'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card } from '@/components/admin/ui/Card';
import { Input } from '@/components/admin/ui/Input';
import { Button } from '@/components/admin/ui/Button';
import { useAdminToast } from '@/components/admin/ui/Toast';

type DiscountType = 'percentage' | 'fixed' | 'freeShipping';

function randomCode() {
  return Array.from({ length: 8 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
}

export default function CreateDiscountPage() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const createDiscount = useMutation(api.discounts.createDiscount);

  const [code, setCode] = useState('');
  const [type, setType] = useState<DiscountType>('percentage');
  const [value, setValue] = useState('');
  const [minimumType, setMinimumType] = useState<'none' | 'amount' | 'quantity'>('none');
  const [minimumValue, setMinimumValue] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [oncePerCustomer, setOncePerCustomer] = useState(false);
  const [startsAt, setStartsAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endsAt, setEndsAt] = useState('');
  const [saving, setSaving] = useState(false);

  const startsAtMs = new Date(startsAt).getTime();
  const endsAtMs = hasEndDate && endsAt ? new Date(endsAt).getTime() : undefined;
  const status = startsAtMs > Date.now() ? 'scheduled' : endsAtMs && endsAtMs < Date.now() ? 'expired' : 'active';

  const handleSave = async () => {
    if (!code.trim()) {
      toast('Enter a discount code');
      return;
    }
    setSaving(true);
    try {
      await createDiscount({
        code: code.trim().toUpperCase(),
        type,
        value: type === 'freeShipping' ? 0 : Number(value) || 0,
        appliesTo: 'allProducts',
        minimumType,
        minimumValue: minimumType !== 'none' ? Number(minimumValue) || 0 : undefined,
        eligibility: 'everyone',
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        oncePerCustomer,
        startsAt: startsAtMs,
        endsAt: endsAtMs,
        status,
        active: status !== 'expired',
      });
      toast('Discount created');
      router.push('/admin/discounts');
    } catch (err: any) {
      toast(err?.message ?? 'Failed to create discount');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-16">
      <PageHeader
        title="Create discount code"
        backUrl="/admin/discounts"
        primaryAction={{ label: 'Save discount', onClick: handleSave }}
      />

      <div className="max-w-[680px] space-y-5">
        <Card title="Discount code">
          <div className="flex gap-2 items-end">
            <Input containerClassName="flex-1" label="Code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. SUMMER20" />
            <Button variant="plain" onClick={() => setCode(randomCode())}>Generate code</Button>
          </div>
        </Card>

        <Card title="Value">
          <div className="space-y-3">
            {(['percentage', 'fixed', 'freeShipping'] as DiscountType[]).map((t) => (
              <label key={t} className="flex items-center gap-2 text-sm text-p-text">
                <input type="radio" name="type" checked={type === t} onChange={() => setType(t)} className="accent-[#0D9488]" />
                {t === 'percentage' ? 'Percentage' : t === 'fixed' ? 'Fixed amount' : 'Free shipping'}
              </label>
            ))}
            {type !== 'freeShipping' && (
              <Input
                label={type === 'percentage' ? 'Discount percentage' : 'Discount amount (KES)'}
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                containerClassName="max-w-[200px]"
              />
            )}
          </div>
        </Card>

        <Card title="Minimum requirements">
          <div className="space-y-3">
            {([
              ['none', 'None'],
              ['amount', 'Minimum purchase amount'],
              ['quantity', 'Minimum quantity of items'],
            ] as const).map(([val, label]) => (
              <label key={val} className="flex items-center gap-2 text-sm text-p-text">
                <input type="radio" name="minType" checked={minimumType === val} onChange={() => setMinimumType(val)} className="accent-[#0D9488]" />
                {label}
              </label>
            ))}
            {minimumType !== 'none' && (
              <Input
                type="number"
                value={minimumValue}
                onChange={(e) => setMinimumValue(e.target.value)}
                containerClassName="max-w-[200px]"
                placeholder={minimumType === 'amount' ? 'KES 0' : '0 items'}
              />
            )}
          </div>
        </Card>

        <Card title="Usage limits">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-p-text">
              <input type="checkbox" checked={!!usageLimit} onChange={(e) => setUsageLimit(e.target.checked ? '100' : '')} className="accent-[#0D9488]" />
              Limit number of times this discount can be used in total
            </label>
            {!!usageLimit && (
              <Input type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} containerClassName="max-w-[200px]" />
            )}
            <label className="flex items-center gap-2 text-sm text-p-text">
              <input type="checkbox" checked={oncePerCustomer} onChange={(e) => setOncePerCustomer(e.target.checked)} className="accent-[#0D9488]" />
              Limit to one use per customer
            </label>
          </div>
        </Card>

        <Card title="Active dates">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start date" type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            <div />
            <label className="flex items-center gap-2 text-sm text-p-text col-span-2">
              <input type="checkbox" checked={hasEndDate} onChange={(e) => setHasEndDate(e.target.checked)} className="accent-[#0D9488]" />
              Set end date
            </label>
            {hasEndDate && <Input label="End date" type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />}
          </div>
        </Card>

        <Card title="Summary" className="bg-p-bg-surface-subdued">
          <ul className="text-sm text-p-text space-y-1 list-disc list-inside">
            <li>{code || 'DISCOUNTCODE'}</li>
            <li>
              {type === 'percentage' && `${value || 0}% off all products`}
              {type === 'fixed' && `KES ${value || 0} off all products`}
              {type === 'freeShipping' && 'Free shipping on all products'}
            </li>
            <li>{minimumType === 'none' ? 'No minimum purchase requirement' : `Minimum ${minimumType === 'amount' ? `KES ${minimumValue || 0}` : `${minimumValue || 0} items`}`}</li>
            <li>All customers</li>
            <li>{usageLimit ? `Limited to ${usageLimit} uses` : 'No usage limit'}</li>
            <li>Active from {new Date(startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
