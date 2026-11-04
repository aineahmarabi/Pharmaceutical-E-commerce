'use client';

import React, { useState } from 'react';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminApi';
import { api } from '../../../../../../convex/_generated/api';
import type { Id } from '../../../../../../convex/_generated/dataModel';
import { Card } from '@/components/admin/ui/Card';
import { Input } from '@/components/admin/ui/Input';
import { Button } from '@/components/admin/ui/Button';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { useAdminToast } from '@/components/admin/ui/Toast';
import { useConfirm } from '@/components/admin/ui/ConfirmDialog';

export default function ShippingSettingsPage() {
  const { toast } = useAdminToast();
  const confirm = useConfirm();
  const zones = useAdminQuery(api.delivery.adminListZones, {});
  const createZone = useAdminMutation(api.delivery.createZone);
  const deleteZone = useAdminMutation(api.delivery.deleteZone);
  const updateZone = useAdminMutation(api.delivery.updateZone);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const saveEdit = async (zone: { _id: Id<'deliveryZones'>; isActive: boolean }) => {
    const rate = Number(editPrice);
    if (!editName.trim() || editPrice.trim() === '' || !Number.isFinite(rate) || rate < 0) {
      toast('Enter a zone name and a rate of zero or more');
      return;
    }
    setSavingEdit(true);
    try {
      await updateZone({ id: zone._id, name: editName.trim(), price: rate, isActive: zone.isActive });
      setEditingId(null);
      toast('Delivery zone updated');
    } catch {
      toast('Could not update the zone');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAdd = async () => {
    if (!name || !price) return;
    await createZone({ name, price: Number(price), isActive: true });
    setName('');
    setPrice('');
    toast('Delivery zone added');
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-p-text">Shipping and delivery</h2>
        <p className="text-sm text-p-text-subdued mt-0.5">Delivery fees customers pay at checkout, by area.</p>
      </div>

      <Card title="Delivery zones" padding="compact">
        {zones === undefined ? (
          <SkeletonLoader type="text" count={3} />
        ) : zones.length === 0 ? (
          <div className="py-8 text-center">
            <h3 className="text-base font-semibold text-p-text">No delivery zones yet</h3>
            <p className="text-sm text-p-text-subdued mt-1">Add a zone below to start charging delivery fees by area.</p>
          </div>
        ) : (
          <div className="-mx-3.5 mt-1 border-t border-p-border-subdued">
            <table className="w-full">
              <thead>
                <tr className="h-9 text-xs font-semibold text-p-text-subdued bg-p-bg border-b border-p-border-subdued">
                  <th className="text-left px-5">Zone</th>
                  <th className="text-right px-5">Rate</th>
                  <th className="px-5"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => (
                  <tr key={zone._id} className="h-12 border-b border-p-border-subdued last:border-0 text-sm">
                    {editingId === zone._id ? (
                      <>
                        <td className="px-5 py-2">
                          <input
                            aria-label="Zone name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-9 w-full rounded-md border border-p-border-input bg-p-bg-surface px-2 text-sm text-p-text"
                          />
                        </td>
                        <td className="px-5 py-2 text-right">
                          <input
                            aria-label="Rate in KES"
                            type="number"
                            min={0}
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="h-9 w-28 rounded-md border border-p-border-input bg-p-bg-surface px-2 text-right text-sm tabular-nums text-p-text"
                          />
                        </td>
                        <td className="px-5 text-right whitespace-nowrap">
                          <button onClick={() => saveEdit(zone)} disabled={savingEdit} className="mr-4 text-sm font-medium text-p-text-primary hover:underline disabled:opacity-50">
                            Save
                          </button>
                          <button onClick={() => setEditingId(null)} disabled={savingEdit} className="text-sm text-p-text-subdued hover:underline">
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 text-p-text">{zone.name}</td>
                        <td className="px-5 text-right font-medium text-p-text tabular-nums whitespace-nowrap">KES {zone.price.toLocaleString()}</td>
                        <td className="px-5 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              setEditingId(zone._id);
                              setEditName(zone.name);
                              setEditPrice(String(zone.price));
                            }}
                            className="mr-4 text-sm font-medium text-p-text-primary hover:underline"
                          >
                            Edit
                          </button>
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
                            className="text-sm text-p-critical hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Add a zone">
        <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <Input label="Zone name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kiambu" />
          <Input label="Price (KES)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          <Button variant="primary" onClick={handleAdd} disabled={!name || !price}>Add zone</Button>
        </div>
      </Card>
    </div>
  );
}
