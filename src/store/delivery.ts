import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DeliveryZoneStore {
  zoneId: string | null;
  zoneName: string | null;
  setZone: (zoneId: string, zoneName: string) => void;
  clearZone: () => void;
}

export const useDeliveryZoneStore = create<DeliveryZoneStore>()(
  persist(
    (set) => ({
      zoneId: null,
      zoneName: null,
      setZone(zoneId, zoneName) {
        set({ zoneId, zoneName });
      },
      clearZone() {
        set({ zoneId: null, zoneName: null });
      },
    }),
    { name: 'pharmacare-delivery-zone' }
  )
);
