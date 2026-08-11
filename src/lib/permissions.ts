export type StaffRole = 'super_admin' | 'admin' | 'pharmacist';

export const ROLE_LABELS: Record<StaffRole, string> = {
  super_admin: 'Super admin',
  admin: 'Admin',
  pharmacist: 'Pharmacist',
};

/** Route roots each role may access. super_admin always has full access. */
const ROLE_ALLOWED_ROOTS: Record<StaffRole, string[]> = {
  super_admin: [],
  admin: [
    '/admin',
    '/admin/orders',
    '/admin/products',
    '/admin/inventory',
    '/admin/customers',
    '/admin/analytics',
    '/admin/discounts',
    '/admin/messages',
    '/admin/categories',
    '/admin/conditions',
    '/admin/brands',
    '/admin/pos',
    '/admin/settings',
  ],
  pharmacist: ['/admin', '/admin/pos', '/admin/orders', '/admin/inventory'],
};

export const ROLE_LANDING_PATH: Record<StaffRole, string> = {
  super_admin: '/admin',
  admin: '/admin',
  pharmacist: '/admin/pos',
};

export function canAccessRoute(role: StaffRole, pathname: string): boolean {
  if (role === 'super_admin') return true;
  if (pathname === '/admin/login') return true;
  if (pathname === '/admin') return true;
  return ROLE_ALLOWED_ROOTS[role].some((root) => root !== '/admin' && pathname.startsWith(root));
}
