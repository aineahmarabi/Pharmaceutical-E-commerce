import { branding as defaultBranding } from '@/lib/config/branding';
import { useStoreSettings } from '@/hooks/useStoreSettings';

export function useBranding() {
  const settings = useStoreSettings();

  // Not known yet: show no contact details or logo rather than the placeholder defaults.
  if (!settings) {
    return { ...defaultBranding, phone: '', whatsapp: '', logo: '', loaded: false };
  }

  const dynamicBranding = { ...defaultBranding, loaded: true };
  for (const setting of settings) {
    if (setting.key in dynamicBranding) {
      (dynamicBranding as Record<string, unknown>)[setting.key] = setting.value;
    }
  }
  return dynamicBranding;
}
