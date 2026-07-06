import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { branding as defaultBranding } from '@/lib/config/branding';

export function useBranding() {
  const settings = useQuery(api.settings.getStoreSettings);
  
  if (!Array.isArray(settings)) {
    return defaultBranding;
  }
  
  const dynamicBranding = { ...defaultBranding };
  
  for (const setting of settings) {
    if (setting.key in dynamicBranding) {
      // @ts-ignore
      dynamicBranding[setting.key] = setting.value;
    }
  }
  
  return dynamicBranding;
}
