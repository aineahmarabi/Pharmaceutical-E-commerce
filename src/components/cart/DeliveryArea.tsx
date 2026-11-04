'use client';

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Select } from '@/components/ui/Select';
import { useDeliveryZoneStore } from '@/store/delivery';
import { formatPrice } from '@/lib/utils';

/** The remembered delivery zone, re-validated against the live zone list (a deleted zone resolves to null). */
export function useSelectedZone() {
  const zones = useQuery(api.delivery.listZones);
  const { zoneId } = useDeliveryZoneStore();
  const zone = zones?.find((z) => z._id === zoneId) ?? null;
  return { zones, zone };
}

/** "Delivering to <area> · KES fee" with a Change action; a picker labelled "Choose area" when none is set. */
export function DeliveryArea({ className }: { className?: string }) {
  const { zones, zone } = useSelectedZone();
  const setZone = useDeliveryZoneStore((s) => s.setZone);
  const [editing, setEditing] = useState(false);

  if (!zones || zones.length === 0) return null;

  if (zone && !editing) {
    return (
      <div className={className}>
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <p className="text-ink">
            Delivering to <span className="font-semibold">{zone.name}</span>
            <span className="text-muted-fg"> · </span>
            <span className="tabular-nums">{formatPrice(zone.price)}</span>
          </p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 font-medium text-petrol hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40 rounded"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Select
        label="Delivering to"
        value={zone?._id ?? ''}
        onChange={(id) => {
          const z = zones.find((x) => x._id === id);
          if (z) setZone(z._id, z.name);
          setEditing(false);
        }}
        placeholder="Choose area"
        options={zones.map((z) => ({ value: z._id, label: `${z.name} (KES ${z.price})` }))}
        buttonClassName="bg-paper"
      />
    </div>
  );
}
