import { useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { useCustomerAuth } from '@/lib/auth/customerAuth';
import { unwatchOnDevice, useDeviceWatchIds, watchOnDevice } from '@/lib/stockWatch';

export interface WatchedProduct {
  productId: string;
  slug: string;
  name: string;
  inStock: boolean;
}

/**
 * "Notify me" requests. Signed-in customers keep them on their account (they follow them to any device);
 * guests keep them in this browser, the same way guest orders are remembered.
 */
export function useStockWatch() {
  const { token, isAuthenticated } = useCustomerAuth();
  const deviceIds = useDeviceWatchIds();
  const accountList = useQuery(api.stockWatches.myWatches, isAuthenticated && token ? { token } : 'skip');
  const deviceList = useQuery(api.stockWatches.statusForIds, deviceIds.length ? { ids: deviceIds } : 'skip');
  const accountWatch = useMutation(api.stockWatches.watch);
  const accountUnwatch = useMutation(api.stockWatches.unwatch);

  const fromAccount = accountList ?? [];
  const watched: WatchedProduct[] = [
    ...fromAccount,
    ...(deviceList ?? []).filter((d) => !fromAccount.some((a) => a.productId === d.productId)),
  ];

  const watch = useCallback(
    async (productId: string) => {
      watchOnDevice(productId); // always, so the notice also works after the session ends
      if (isAuthenticated && token) await accountWatch({ token, productId: productId as Id<'products'> }).catch(() => {});
    },
    [isAuthenticated, token, accountWatch],
  );

  const unwatch = useCallback(
    async (productId: string) => {
      unwatchOnDevice(productId);
      if (isAuthenticated && token) await accountUnwatch({ token, productId: productId as Id<'products'> }).catch(() => {});
    },
    [isAuthenticated, token, accountUnwatch],
  );

  const isWatching = (productId: string) => deviceIds.includes(productId) || fromAccount.some((a) => a.productId === productId);

  return { watched, watch, unwatch, isWatching, isAuthenticated };
}
