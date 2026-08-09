'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Globe, Trash2 } from 'lucide-react';
import { api } from '../../../../../../convex/_generated/api';
import { Card } from '@/components/admin/ui/Card';
import { Input } from '@/components/admin/ui/Input';
import { Button } from '@/components/admin/ui/Button';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { useAdminToast } from '@/components/admin/ui/Toast';
import { useConfirm } from '@/components/admin/ui/ConfirmDialog';

export default function ShippingSettingsPage() {
  const { toast } = useAdminToast();
  const confirm = useConfirm();
  const zones = useQuery(api.delivery.adminListZones);
  const createZone = useMutation(api.delivery.createZone);
  const deleteZone = useMutation(api.delivery.deleteZone);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleAdd = async () => {
    if (!name || !price) return;
    await createZone({ name, price: Number(price), isActive: true });
    setName('');
    setPrice('');
    toast('Delivery zone added');
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-p-text">Shipping and delivery</h1>

      <Card title="Delivery zones">
        {zones === undefined ? (
          <SkeletonLoader type="text" count={3} />
        ) : zones.length === 0 ? (
          <EmptyState icon={Globe} heading="No delivery zones yet" body="Add a zone to start charging delivery fees by area." />
        ) : (
          <div className="space-y-3 mb-5">
            {zones.map((zone) => (
              <div key={zone._id} className="flex items-center justify-between py-2 border-b border-p-border-subdued last:border-0">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-p-icon-subdued" />
                  <span className="text-sm text-p-text">{zone.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-p-text">KES {zone.price.toLocaleString()}</span>
                  <button
                    onClick={async () => {
                      const ok = await confirm({
                        title: 'Delete delivery zone',
                        message: `Remove "${zone.name}"? Orders already placed are unaffected, but customers won't be able to select this zone anymore.`,
                        confirmLabel: 'Delete',
                        destructive: true,
                      });
                      if (ok) {
                        await deleteZone({ id: zone._id });
                        toast('Delivery zone deleted');
                      }
                    }}
                    className="text-p-critical hover:bg-p-critical-subdued rounded p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end pt-4 border-t border-p-border-subdued">
          <Input label="Zone name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kiambu" />
          <Input label="Price (KES)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          <Button variant="primary" onClick={handleAdd}>Add zone</Button>
        </div>
      </Card>
    </div>
  );
}
