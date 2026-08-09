import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const DEFAULT_NAME = 'Administrator';

export function useAdminName() {
  const setting = useQuery(api.settings.getStoreSetting, { key: 'adminDisplayName' });
  const name = (setting?.value as string) || DEFAULT_NAME;
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = words.length === 0
    ? 'A'
    : words.length === 1
      ? words[0].slice(0, 2).toUpperCase()
      : (words[0][0] + words[1][0]).toUpperCase();
  return { name, initials, loading: setting === undefined };
}
